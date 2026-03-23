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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-navbar" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-[#1A1A24] tracking-tight">
              Impresius
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#1A1A24]/60 hover:text-[#7B61FF] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#1A1A24]/70 hover:text-[#7B61FF] transition-colors px-4 py-2"
            >
              Accedi
            </Link>
            <Link
              href="/register"
              className="btn-glass-primary text-sm px-5 py-2.5 hover:scale-105 active:scale-95 transition-transform"
            >
              Inizia Gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-[#1A1A24]/60 hover:text-[#7B61FF] hover:bg-white/40 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[#1A1A24]/[0.06]">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#1A1A24]/60 hover:text-[#7B61FF] hover:bg-white/40 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-[#1A1A24]/70 border border-[#1A1A24]/10 hover:border-[#7B61FF]/30 transition-all"
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="btn-glass-primary flex-1 text-center py-2.5 text-sm"
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
