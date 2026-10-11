// apps/web/src/pages/SignupPage.tsx
// Minimalist, modern editorial Sign Up page with Role-Based Access Control (RBAC)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STOREKEEPER");
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("Community Pharmacy");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemoFill = () => {
    setFullName("Dr. Aditi Sharma");
    setEmail("aditi@citycare-pharmacy.in");
    setRole("STOREKEEPER");
    setFacilityName("CityCare Community Pharmacy");
    setFacilityType("Community Pharmacy");
    setPassword("securestock2026");
    setConfirmPassword("securestock2026");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !facilityName.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setError("Please confirm acknowledgment of the decision-support policy.");
      return;
    }

    setIsLoading(true);
    const result = await signup({
      name: fullName,
      email,
      password,
      role,
      facilityName,
      facilityType,
    });
    setIsLoading(false);

    if (result.success) {
      navigate("/recommendations");
    } else {
      setError(result.error || "Failed to create account.");
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

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#737373]">Already registered?</span>
          <Link
            to="/login"
            className="font-medium text-[#171717] dark:text-[#f5f5f5] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg">
          {/* Main Card */}
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#ebebeb] dark:border-[#262626] p-7 sm:p-9 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            {/* Brand Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2.5 mb-1">
                <img src="/logo.svg" alt="StockSense" className="w-6 h-6 rounded" />
                <span className="font-heading text-sm font-semibold tracking-tight text-[#171717] dark:text-[#f5f5f5]">
                  StockSense
                </span>
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5]">
                Create account
              </h1>
              <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                Provision adaptive replenishment intelligence and configure role permissions.
              </p>
            </div>

            {/* Quick Demo Fill Banner */}
            <div className="bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#262626] rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#525252] dark:text-[#a3a3a3]">
                <Sparkles className="w-4 h-4 text-[#171717] dark:text-[#f5f5f5] shrink-0" />
                <span className="leading-snug">Evaluating live? Pre-fill sample profile in one click.</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="shrink-0 text-xs font-mono font-medium text-[#171717] dark:text-[#f5f5f5] bg-white dark:bg-[#141414] hover:bg-[#fafafa] dark:hover:bg-[#262626] border border-[#ebebeb] dark:border-[#333333] px-2.5 py-1 rounded transition-colors"
              >
                Auto-fill
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-[#fff1f2] dark:bg-[#4c0519]/40 border border-[#fecdd3] dark:border-[#881337] rounded p-2.5 text-xs text-[#9f1239] dark:text-[#fda4af] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Aditi Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                  </div>
                </div>

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
                      placeholder="aditi@pharmacy.in"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Operational Role Selection (RBAC) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]">
                  Operational Role (RBAC)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "STOREKEEPER" as UserRole, label: "Storekeeper", sub: "Operational orders" },
                    { id: "ADMIN" as UserRole, label: "Admin", sub: "Full governance" },
                    { id: "ANALYST" as UserRole, label: "Analyst", sub: "Data & stress tests" },
                    { id: "VIEWER" as UserRole, label: "Auditor", sub: "Read-only inspection" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2 rounded text-left border text-xs transition-all flex flex-col justify-between ${
                        role === r.id
                          ? "bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5] font-semibold"
                          : "bg-white dark:bg-[#0f0f0f] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:border-[#d4d4d4]"
                      }`}
                    >
                      <span className="font-medium text-[11px]">{r.label}</span>
                      <span
                        className={`text-[9px] line-clamp-1 mt-0.5 ${
                          role === r.id ? "text-[#d4d4d4] dark:text-[#525252]" : "text-[#737373]"
                        }`}
                      >
                        {r.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facility Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="facilityName"
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Facility / Store Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="facilityName"
                      type="text"
                      required
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="City Community Pharmacy"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="facilityType"
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Facility Category
                  </label>
                  <select
                    id="facilityType"
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full py-2 px-3 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                  >
                    <option value="Community Pharmacy">Community Pharmacy</option>
                    <option value="Primary Health Centre">Primary Health Centre (PHC)</option>
                    <option value="Hospital Supply Store">Hospital Supply Store</option>
                    <option value="Small / Medium Retailer">Small / Medium Retailer</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Password
                  </label>
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
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-[#171717] dark:text-[#e5e5e5]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f0f] border border-[#ebebeb] dark:border-[#262626] rounded text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Policy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#525252] dark:text-[#a3a3a3] select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-[#d4d4d4] dark:border-[#404040] text-[#171717] accent-[#171717] dark:accent-[#f5f5f5]"
                  />
                  <span className="leading-tight">
                    I acknowledge that StockSense provides deterministic inventory decision support and that
                    rules decide while AI advises.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] dark:bg-[#f5f5f5] dark:hover:bg-[#e5e5e5] text-white dark:text-[#0a0a0a] font-medium py-2.5 px-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-1 disabled:opacity-60 text-xs sm:text-sm"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Launch Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footnote */}
            <div className="pt-2 border-t border-[#ebebeb] dark:border-[#262626] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#737373]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#171717] dark:text-[#f5f5f5]" />
              <span>Continuous review (s, Q) replenishment policy</span>
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

export default SignupPage;
