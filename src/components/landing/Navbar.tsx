"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2 } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgb(37_99_235/0.35)]">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gradient">Impresius</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Funzionalit&agrave;
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Come Funziona
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Prezzi
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Accedi
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Inizia Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-3 animate-scale-in">
            <a href="#features" className="block text-sm font-medium text-slate-600 py-2.5 px-2 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Funzionalit&agrave;
            </a>
            <a href="#how-it-works" className="block text-sm font-medium text-slate-600 py-2.5 px-2 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Come Funziona
            </a>
            <a href="#pricing" className="block text-sm font-medium text-slate-600 py-2.5 px-2 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Prezzi
            </a>
            <div className="flex gap-3 pt-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">Accedi</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="gradient" className="w-full" size="sm">Registrati</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
