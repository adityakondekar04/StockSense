// apps/web/src/pages/LoginPage.tsx
// Minimalist, modern editorial Sign In page with Role-Based Access Control (RBAC)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Boxes,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sun,
  Moon,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("storekeeper@stocksense.health");
  const [password, setPassword] = useState("inventory2026");
  const [selectedRole, setSelectedRole] = useState<UserRole>("STOREKEEPER");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoRoles = [
    {
      role: "STOREKEEPER" as UserRole,
      label: "Storekeeper",
      email: "storekeeper@stocksense.health",
      pass: "inventory2026",
      desc: "Full operational reorders & anomaly overrides",
    },
    {
      role: "ADMIN" as UserRole,
      label: "Administrator",
      email: "admin@stocksense.health",
      pass: "admin2026",
      desc: "Policy control, user administration & audit logs",
    },
    {
      role: "ANALYST" as UserRole,
      label: "Analyst",
      email: "analyst@stocksense.health",
      pass: "analyst2026",
      desc: "Data ingestion & forecast stress tests",
    },
    {
      role: "VIEWER" as UserRole,
      label: "Auditor",
      email: "auditor@stocksense.health",
      pass: "auditor2026",
      desc: "Read-only inspection of formulas & logs",
    },
  ];

  const handleSelectRole = (roleItem: typeof demoRoles[0]) => {
    setSelectedRole(roleItem.role);
    setEmail(roleItem.email);
    setPassword(roleItem.pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate("/recommendations");
    } else {
      setError(result.error || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col justify-between text-[#171717] dark:text-[#f5f5f5] selection:bg-[#171717] selection:text-white dark:selection:bg-[#f5f5f5] dark:selection:text-[#0a0a0a] transition-colors duration-150">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-5xl w-full mx-auto border-b border-[#ebebeb] dark:border-[#262626]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f] transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373] dark:text-[#8e8e8e]">Need an account?</span>
            <Link
              to="/signup"
              className="font-medium text-[#171717] dark:text-[#f5f5f5] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#ebebeb] dark:border-[#262626] p-7 sm:p-9 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            {/* Brand Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-[#171717] dark:bg-[#f5f5f5] flex items-center justify-center text-white dark:text-[#0a0a0a]">
                  <Boxes className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="font-heading text-sm font-semibold tracking-tight text-[#171717] dark:text-[#f5f5f5]">
                  StockSense
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#a3a3a3] border border-[#ebebeb] dark:border-[#262626]">
                  S-02
                </span>
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5]">
                Sign in
              </h1>
              <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                Access the replenishment console with empirical mathematical models and role-based authority.
              </p>
            </div>

            {/* 1-Click Role Switcher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#171717] dark:text-[#f5f5f5]" />
                  SELECT ROLE TO AUTO-FILL:
                </span>
                <span className="text-[10px] text-[#737373]">1-Click Demo</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {demoRoles.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleSelectRole(d)}
                    className={`p-2 rounded text-left transition-all border text-xs font-mono flex flex-col justify-between ${
                      selectedRole === d.role
                        ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5] font-semibold"
                        : "bg-[#fafafa] dark:bg-[#191919] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:border-[#d4d4d4] dark:hover:border-[#404040]"
                    }`}
                  >
                    <span className="text-[11px] font-bold">{d.label}</span>
                    <span
                      className={`text-[9px] line-clamp-1 mt-0.5 ${
                        selectedRole === d.role
                          ? "text-[#d4d4d4] dark:text-[#525252]"
                          : "text-[#737373] dark:text-[#8e8e8e]"
                      }`}
                    >
                      {d.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#fff1f2] dark:bg-[#2b1114] border border-[#fecdd3] dark:border-[#52171f] rounded p-2.5 text-xs text-[#9f1239] dark:text-[#fca5a5] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]"
                >
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373] dark:text-[#a3a3a3]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@stocksense.health"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]"
                  >
                    Password
                  </label>
                  <span className="text-[11px] font-mono text-[#737373] dark:text-[#8e8e8e]">
                    demo enabled
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373] dark:text-[#a3a3a3]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#525252] dark:text-[#a3a3a3] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#d4d4d4] dark:border-[#404040] text-[#171717] dark:text-[#f5f5f5] accent-[#171717] dark:accent-[#f5f5f5]"
                  />
                  <span>Persist session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] text-white dark:bg-[#f5f5f5] dark:hover:bg-white dark:text-[#0a0a0a] font-medium py-2.5 px-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] focus:ring-offset-1 disabled:opacity-60 text-xs sm:text-sm"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Enter Replenishment Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Micro Footnote */}
            <div className="pt-2 border-t border-[#ebebeb] dark:border-[#262626] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#737373] dark:text-[#8e8e8e]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#171717] dark:text-[#f5f5f5]" />
              <span>Role permissions validated deterministically</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] font-mono text-[#737373] dark:text-[#8e8e8e] border-t border-[#ebebeb] dark:border-[#262626]">
        StockSense · Role-Based Access Control · VORTEXA 3.0 S-02
      </footer>
    </div>
  );
};

export default LoginPage;
