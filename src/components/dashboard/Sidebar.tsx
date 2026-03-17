"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "./MobileSidebarContext";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Plus,
  FolderOpen,
  GitCompareArrows,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plans/new", icon: Plus, label: "Nuova Operazione" },
  { href: "/plans", icon: FolderOpen, label: "Le mie Operazioni" },
  { href: "/plans/compare", icon: GitCompareArrows, label: "Confronta" },
  { href: "/payments", icon: CreditCard, label: "Pagamenti" },
  { href: "/settings", icon: Settings, label: "Impostazioni" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href) &&
              !navItems.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href) &&
                  pathname.startsWith(other.href)
              ));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "sidebar-nav-item",
                isActive
                  ? "sidebar-nav-item-active"
                  : "sidebar-nav-item-inactive"
              )}
            >
              <div className={cn(
                "icon-container icon-container-sm rounded-lg",
                isActive
                  ? "bg-blue-600/10"
                  : "bg-slate-100"
              )}>
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-600" : "text-slate-500"
                )} />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item sidebar-nav-item-inactive hover:!bg-red-50 hover:!text-red-600 w-full"
        >
          <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
            <LogOut className="w-4 h-4 text-slate-400" />
          </div>
          Esci
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { isOpen, close } = useMobileSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 flex-col z-40">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgb(37_99_235/0.35)]">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-extrabold text-gradient leading-tight">Impresius</span>
              <span className="text-[0.6rem] font-medium text-slate-400 uppercase tracking-[0.12em]">Pro Platform</span>
            </div>
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/80 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={close}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgb(37_99_235/0.35)]">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-extrabold text-gradient leading-tight">Impresius</span>
              <span className="text-[0.6rem] font-medium text-slate-400 uppercase tracking-[0.12em]">Pro Platform</span>
            </div>
          </Link>
          <button onClick={close} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <SidebarContent onNavigate={close} />
      </aside>
    </>
  );
}
