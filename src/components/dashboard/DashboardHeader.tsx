"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Menu } from "lucide-react";
import { useMobileSidebar } from "./MobileSidebarContext";

export function DashboardHeader({ title }: { title: string }) {
  const [userName, setUserName] = useState("");
  const [initials, setInitials] = useState("");
  const { toggle } = useMobileSidebar();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "";
        setUserName(name);
        // Generate initials
        const parts = name.split(/[\s@]+/);
        setInitials(
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase()
        );
      }
    });
  }, []);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{userName}</p>
        </div>
        <div className="w-9 h-9 icon-gradient rounded-full flex items-center justify-center shadow-[0_2px_6px_rgb(37_99_235/0.3)]">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
      </div>
    </header>
  );
}
