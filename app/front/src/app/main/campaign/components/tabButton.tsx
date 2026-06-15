"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface TabButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function TabButton({ href, children }: TabButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href;

  return (
    <button
      className={`text-text-on-primary py-extra-small text-content rounded-full w-[80px] ${isActive ? "bg-bg-primary" : "bg-bg-navbar dark:hover:bg-bg-primary/10 hover:bg-bg-navbar/85 cursor-pointer border-1 border-bg-primary"}`}
      onClick={() => router.push(href)}
    >
      {children}
    </button>
  );
}