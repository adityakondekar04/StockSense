// apps/web/src/components/landing/Navbar.tsx
// Minimalist navigation bar for the Landing Page and standalone Methodology Page

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowDown } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: "The Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Methodology", href: "/methodology", isExternalRoute: true },
  ];

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/95 backdrop-blur-sm border-b border-[#ebebeb] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none rounded py-1 px-0.5"
            aria-label="StockSense home"
          >
            <img src="/logo.svg" alt="StockSense" className="w-6 h-6 rounded" />
            <span className="font-heading text-sm font-semibold text-[#171717] tracking-tight">
              StockSense
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) =>
              link.isExternalRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-medium transition-colors py-1 ${
                    location.pathname === link.href
                      ? "text-[#171717] font-semibold"
                      : "text-[#525252] hover:text-[#171717]"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className="text-xs font-medium text-[#525252] hover:text-[#171717] transition-colors py-1"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sign In */}
            <Link
              to="/login"
              className="text-xs font-medium text-[#525252] hover:text-[#171717] px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>

            {/* Primary Action Button -> Scrolls to Working Section (#how-it-works) */}
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollClick(e, "#how-it-works")}
              className="inline-flex items-center gap-1.5 bg-[#171717] hover:bg-[#2b2b2b] text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-1 active:scale-[0.98]"
            >
              <span>Explore StockSense</span>
              <ArrowDown className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Right Bar: Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#525252] hover:bg-[#f0f0f0] focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ebebeb] bg-[#fafafa] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) =>
              link.isExternalRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-[#525252] hover:text-[#171717] hover:bg-[#f5f5f5] rounded transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className="px-3 py-2 text-xs font-medium text-[#525252] hover:text-[#171717] hover:bg-[#f5f5f5] rounded transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          <div className="pt-2 border-t border-[#ebebeb] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-medium text-[#171717] bg-white border border-[#ebebeb] rounded-full"
            >
              Sign In
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollClick(e, "#how-it-works")}
              className="w-full flex items-center justify-center gap-1.5 bg-[#171717] text-white py-2 rounded-full text-xs font-medium"
            >
              <span>Explore StockSense</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
