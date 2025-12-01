"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/add-debt", label: "Quick add" },
  { href: "/friends", label: "Friends" },
  { href: "/account", label: "Account" },
];

export function AppTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabs" aria-label="Experience toggle">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(tab.href);

        return (
          <Link key={tab.href} href={tab.href} className={`tab ${isActive ? "active" : ""}`}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
