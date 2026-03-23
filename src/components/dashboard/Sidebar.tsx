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
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/plans/new", icon: Plus, label: "Nuova Operazione", exact: true },
  { href: "/plans", icon: FolderOpen, label: "Le mie Operazioni", exact: true },
  { href: "/plans/compare", icon: GitCompareArrows, label: "Confronta", exact: false },
  { href: "/payments", icon: CreditCard, label: "Pagamenti", exact: false },
  { href: "/settings", icon: Settings, label: "Impostazioni", exact: false },
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
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-[#7B61FF] to-[#00C2FF] text-white font-semibold shadow-lg shadow-[#7B61FF]/20"
                  : "text-[#1A1A24]/50 hover:text-[#7B61FF] hover:bg-white/60"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive ? "bg-white/20" : "bg-[#7B61FF]/[0.06]"
                )}
              >
                <item.icon
                  className={cn(
                    "w-3.5 h-3.5",
                    isActive ? "text-white" : "text-[#1A1A24]/40"
                  )}
                />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1A1A24]/[0.06]" />

      {/* Bottom section */}
      <div className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#1A1A24]/40 hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 w-full transition-all duration-150"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#1A1A24]/[0.04]">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Esci
        </button>
      </div>
    </>
  );
}

function LogoBlock() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
      >
        <Building2 className="w-4.5 h-4.5 text-white" />
      </div>
      <div>
        <span className="text-base font-extrabold tracking-tight text-[#1A1A24]">
          Impresius
        </span>
        <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#1A1A24]/30">
          Pro Platform
        </span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { isOpen, close } = useMobileSidebar();

  return (
    <>
      {/* Desktop sidebar — glass */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40 glass-sidebar">
        <div
          className="h-16 flex items-center px-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(26,26,36,0.06)" }}
        >
          <LogoBlock />
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#1A1A24]/20 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}

      {/* Mobile drawer — glass */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-72 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl glass-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className="h-14 flex items-center justify-between px-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(26,26,36,0.06)" }}
        >
          <LogoBlock />
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-[#1A1A24]/40 hover:text-[#7B61FF] hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNavigate={close} />
      </aside>
    </>
  );
}
