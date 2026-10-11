// apps/web/src/pages/LoginPage.tsx
// Minimalist split-screen Sign In page with Left Product Visual Showcase & Sliding Animations

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";
import { AuthProductShowcase } from "../components/auth/AuthProductShowcase";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col justify-between text-[#171717] dark:text-[#f5f5f5] selection:bg-[#171717] selection:text-white dark:selection:bg-[#f5f5f5] dark:selection:text-[#0a0a0a] transition-colors duration-150 overflow-x-hidden">
      <style>{`
        @keyframes authSlideLeft {
          0% { opacity: 0; transform: translateX(-28px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes authSlideRight {
          0% { opacity: 0; transform: translateX(28px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .auth-panel-left {
          animation: authSlideLeft 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .auth-panel-right {
          animation: authSlideRight 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Top Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl w-full mx-auto border-b border-[#ebebeb] dark:border-[#262626]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#737373]">Need an account?</span>
          <Link
            to="/signup"
            className="font-medium text-[#171717] dark:text-[#f5f5f5] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Split-Screen Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Sliding Product Visual Showcase */}
          <div className="lg:col-span-7 auth-panel-left flex">
            <AuthProductShowcase />
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5 auth-panel-right flex items-center">
            <div className="w-full bg-white dark:bg-[#141414] rounded-2xl border border-[#ebebeb] dark:border-[#262626] p-7 sm:p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              {/* Brand Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2.5 mb-1">
                  <img src="/logo.svg" alt="StockSense" className="w-6 h-6 rounded" />
                  <span className="font-heading text-sm font-semibold tracking-tight text-[#171717] dark:text-[#f5f5f5]">
                    StockSense
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5]">
                  Sign in to Console
                </h1>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                  Access live inventory telemetry, empirical replenishment models, and role-based
                  authority.
                </p>
              </div>

              {/* 1-Click Role Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
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
                          ? "bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5] font-semibold"
                          : "bg-[#fafafa] dark:bg-[#0a0a0a] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:border-[#d4d4d4] dark:hover:border-[#404040]"
                      }`}
                    >
                      <span className="text-[11px] font-bold">{d.label}</span>
                      <span
                        className={`text-[9px] line-clamp-1 mt-0.5 ${
                          selectedRole === d.role
                            ? "text-[#d4d4d4] dark:text-[#525252]"
                            : "text-[#737373]"
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
                <div className="bg-[#fff1f2] dark:bg-[#4c0519]/40 border border-[#fecdd3] dark:border-[#881337] rounded p-2.5 text-xs text-[#9f1239] dark:text-[#fda4af] flex items-center gap-2">
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
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@stocksense.health"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                    >
                      Password
                    </label>
                    <span className="text-[11px] font-mono text-[#737373]">demo enabled</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
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
                      className="w-3.5 h-3.5 rounded border-[#d4d4d4] dark:border-[#404040] text-[#171717] accent-[#171717] dark:accent-[#f5f5f5]"
                    />
                    <span>Persist session</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] dark:bg-[#f5f5f5] dark:hover:bg-[#e5e5e5] text-white dark:text-[#0a0a0a] font-medium py-2.5 px-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-1 disabled:opacity-60 text-xs sm:text-sm"
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
              <div className="pt-2 border-t border-[#ebebeb] dark:border-[#262626] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#737373]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#171717] dark:text-[#f5f5f5]" />
                <span>Role permissions validated deterministically</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] font-mono text-[#737373] border-t border-[#ebebeb] dark:border-[#262626]">
        StockSense · Role-Based Access Control
      </footer>
    </div>
  );
};

export default LoginPage;
