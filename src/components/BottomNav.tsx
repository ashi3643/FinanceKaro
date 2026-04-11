"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Home, BookOpen, Calculator, ShieldAlert, Trophy } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  if (pathname?.includes("/learn/")) {
    const parts = pathname.split("/");
    if (parts.length > 3) return null;
  }

  const basePath = `/${locale}`;
  const navItems = [
    { name: t("home"), href: basePath, icon: Home },
    { name: t("learn"), href: `${basePath}/learn`, icon: BookOpen },
    { name: t("calculate"), href: `${basePath}/calculate`, icon: Calculator },
    { name: t("scamRadar"), href: `${basePath}/scam-radar`, icon: ShieldAlert },
    { name: t("rankings"), href: `${basePath}/rankings`, icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[420px] bg-surface/90 backdrop-blur-md border-t border-border px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-accent" : "text-muted hover:text-text"
              }`}
            >
              <item.icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(5,150,105,0.4)]" : ""} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
