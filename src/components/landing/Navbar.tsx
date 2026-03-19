"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Funzionalità" },
  { href: "#how-it-works", label: "Come Funziona" },
  { href: "#pricing", label: "Prezzi" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10, 14, 30, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">Impresius</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Accedi
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              Inizia Gratis →
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden py-4 space-y-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-all">
                Accedi
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
