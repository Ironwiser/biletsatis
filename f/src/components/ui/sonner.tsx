"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white/70",
          actionButton:
            "group-[.toast]:bg-white/15 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-white/70",
          success: "group-[.toaster]:border-emerald-500/30",
          error: "group-[.toaster]:border-red-500/30",
        },
      }}
      position="bottom-right"
      {...props}
    />
  );
};

export { Toaster };
