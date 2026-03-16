"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Menu } from "lucide-react";
import { useMobileSidebar } from "./MobileSidebarContext";

export function DashboardHeader({ title }: { title: string }) {
  const [userName, setUserName] = useState("");
  const { toggle } = useMobileSidebar();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || "");
      }
    });
  }, []);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
        </div>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </header>
  );
}
