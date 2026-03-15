import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

function signAccessToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function signRefreshToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
}

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body ?? {};
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Tüm alanlar zorunlu." });
  }

  const existing = await query<{ id: string }>(
    "select id from users where email = $1",
    [email]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Bu e-posta zaten kayıtlı." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await query<{ id: string; email: string; username: string; role: string }>(
    "insert into users (email, username, password_hash) values ($1,$2,$3) returning id,email,username,role",
    [email, username, passwordHash]
  );

  return res.status(201).json({ user: created.rows[0] });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "E-mail ve şifre zorunlu." });
  }

  const result = await query<{
    id: string;
    email: string;
    username: string;
    password_hash: string;
    role: string;
  }>("select id,email,username,password_hash,role from users where email = $1", [email]);

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Geçersiz e-mail veya şifre." });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Geçersiz e-mail veya şifre." });
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token bulunamadı" });
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
    const user = await query<{ id: string; email: string; username: string; role: string }>(
      "select id,email,username,role from users where id = $1",
      [decoded.userId]
    );
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }
    const u = user.rows[0];
    const newAccessToken = signAccessToken({
      userId: u.id,
      email: u.email,
      role: u.role,
    });
    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ message: "Geçersiz refresh token" });
  }
}

export async function getProfile(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const r = await query<{ id: string; email: string; username: string; role: string }>(
    "select id,email,username,role from users where id = $1",
    [req.user.userId]
  );
  if (r.rows.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  return res.json(r.rows[0]);
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { username } = req.body ?? {};
  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ message: "Kullanıcı adı zorunlu." });
  }
  const trimmed = username.trim();
  const existing = await query<{ id: string }>(
    "select id from users where username = $1 and id != $2",
    [trimmed, req.user.userId]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Bu kullanıcı adı zaten kullanılıyor." });
  }
  const r = await query<{ id: string; email: string; username: string; role: string }>(
    "update users set username = $1, updated_at = now() where id = $2 returning id, email, username, role",
    [trimmed, req.user.userId]
  );
  if (r.rows.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  return res.json(r.rows[0]);
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ message: "Mevcut şifre zorunlu." });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalı." });
  }
  const r = await query<{ password_hash: string }>(
    "select password_hash from users where id = $1",
    [req.user.userId]
  );
  if (r.rows.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  const ok = await bcrypt.compare(currentPassword, r.rows[0].password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Mevcut şifre hatalı." });
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  await query("update users set password_hash = $1, updated_at = now() where id = $2", [
    newHash,
    req.user.userId,
  ]);
  return res.json({ message: "Şifre güncellendi." });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Çıkış başarılı" });
}

