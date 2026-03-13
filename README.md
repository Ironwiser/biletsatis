## biletsatis

Bu proje, `pratik` projesindeki teknoloji ve klasör düzeni baz alınarak hazırlanmıştır:

- Backend: `b/` (Node.js + Express + TypeScript + PostgreSQL + JWT)
- Frontend: `f/` (React + Vite + TypeScript + MUI + Tailwind + React Query + React Router)

### Çalıştırma (lokal)

#### 1) PostgreSQL

Bir PostgreSQL veritabanı hazırla ve `DATABASE_URL` olarak ver.

Örnek:

- `postgresql://postgres:password@localhost:5432/biletsatis`

#### 2) Backend

```bash
cd b
npm install
cp .env.example .env.development
npm run dev
```

Backend varsayılan port: `3000`

#### 3) Frontend

```bash
cd f
npm install
npm run dev
```

Frontend varsayılan port: Vite çıktısında yazar (genelde `5173`).

