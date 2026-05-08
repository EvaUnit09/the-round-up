"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Analyst dashboard" },
  { href: "/intelligence-demo", label: "Email preview" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-2 flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
