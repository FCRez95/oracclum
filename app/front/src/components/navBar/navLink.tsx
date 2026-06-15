"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      href={href}
      className={`font-title text-text-on-primary no-underline text-base px-small md:px-small py-small transition-colors text-content
        ${isActive ? 'border-b-3 border-border-highlight font-bold' : ''}`}
    >
      {children}
    </Link>
  );
}