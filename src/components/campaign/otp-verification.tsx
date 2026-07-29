"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, ArrowRight, Shield, Check, AlertTriangle, Clock, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { useTranslation } from "@/lib/use-dictionary";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface OtpVerificationProps {
  onVerified: (token: string, email: string) => void;
}

type Step = "email" | "otp" | "verifying" | "verified" | "error" | "duplicate";

// ═══════════════════════════════════════════════════════════════════════════
// OTP VERIFICATION GATE
// ═══════════════════════════════════════════════════════════════════════════

export function OtpVerificationGate({ onVerified }: OtpVerificationProps) {
  const { locale } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Send OTP email
  const handleSendOtp = useCallback(async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(locale === "ka" ? "გთხოვთ, შეიყვანოთ სწორი ელ-ფოსტა" : "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error || (locale === "ka" ? "ამ ელ-ფოსტით განაცხადი უკვე მიღებულია." : "An application with this email has already been submitted."));
        } else if (res.status === 429) {
          setError(locale === "ka" ? "გთხოვთ, ცოტა ხანში სცადოთ. კოდის გაგზავნის ლიმიტი ამოწურულია." : "Please try again later. OTP request limit reached.");
        } else {
          setError(data.error || (locale === "ka" ? "კოდის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან." : "Failed to send code. Please try again."));
        }
        setIsLoading(false);
        return;
      }

      setMaskedEmail(data.maskedEmail || email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => `${a}${"*".repeat(Math.min(b.length, 4))}${c}`));
      setCountdown(data.expiresIn || 600);
      setCanResend(false);
      setStep("otp");
      setError("");

      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError(locale === "ka" ? "ქსელის შეცდომა. გთხოვთ, სცადოთ თავიდან." : "Network error. Please try again.");
    }
    setIsLoading(false);
  }, [email, locale]);

  // Resend OTP
  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setCanResend(false);
    setOtpCode(["", "", "", "", "", ""]);
    setError("");
    await handleSendOtp();
  }, [canResend, handleSendOtp]);

  // Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setError(locale === "ka" ? "გთხოვთ, შეიყვანოთ 6-ნიშნა კოდი" : "Please enter the 6-digit code");
      return;
    }

    setStep("verifying");
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otpCode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "duplicate_application") {
          setStep("duplicate");
        } else if (data.error === "invalid_or_expired_code") {
          setError(locale === "ka" ? "კოდის ვადა გაუვიდა ან არასწორია. გთხოვთ, მოითხოვოთ ახალი კოდი." : "Code expired or invalid. Please request a new code.");
          setStep("otp");
        } else if (data.error === "invalid_code") {
          setError(locale === "ka" ? "არასწორი კოდი. გთხოვთ, სცადოთ თავიდან." : "Incorrect code. Please try again.");
          setStep("otp");
        } else {
          setError(locale === "ka" ? "ვერიფიკაცია ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან." : "Verification failed. Please try again.");
          setStep("otp");
        }
        return;
      }

      setStep("verified");
      setTimeout(() => {
        onVerified(data.token, data.email);
      }, 1200);
    } catch {
      setError(locale === "ka" ? "ქსელის შეცდომა. გთხოვთ, სცადოთ თავიდან." : "Network error. Please try again.");
      setStep("otp");
    }
  }, [otpCode, email, locale, onVerified]);

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").split("").slice(0, 6);
      const newCode = [...otpCode];
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d;
      });
      setOtpCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOtp();
    }
  };

  // Handle email keydown
  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendOtp();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20">
      <Container>
        <AnimatePresence mode="wait">
          {/* STEP 1: Email Input */}
          {step === "email" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <FadeIn direction="up">
                <div className="p-8 md:p-10 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] shadow-xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                      <Mail size={32} className="text-[var(--color-accent)]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">
                      {locale === "ka" ? "განაცხადის დაწყება" : "Start Application"}
                    </h1>
                    <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
                      {locale === "ka"
                        ? "გთხოვთ, შეიყვანოთ თქვენი ელ-ფოსტა განაცხადის დასაწყებად. ჩვენ გამოგიგზავნით დამადასტურებელ კოდს."
                        : "Please enter your email to start the application. We'll send you a verification code."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--color-fg-primary)]">
                        {locale === "ka" ? "ელ-ფოსტა" : "Email"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        onKeyDown={handleEmailKeyDown}
                        placeholder={locale === "ka" ? "თქვენი ელ-ფოსტა" : "your@email.com"}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]/50 transition-all"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600">
                        {locale === "ka"
                          ? "თუ არ მოგივიდათ კოდი, გთხოვთ შეამოწმოთ სპამის (Spam) საქაღალდე."
                          : "If you don't receive the code, please check your Spam folder."}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="xl"
                      className="w-full gap-2"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {locale === "ka" ? "იგზავნება..." : "Sending..."}
                        </span>
                      ) : (
                        <>
                          {locale === "ka" ? "კოდის გაგზავნა" : "Send Code"}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                    >
                      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{error}</p>
                    </motion.div>
                  )}
                </div>
              </FadeIn>
            </motion.div>
          )}

          {/* STEP 2: OTP Input */}
          {step === "otp" && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <FadeIn direction="up">
                <div className="p-8 md:p-10 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] shadow-xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                      <KeyRound size={32} className="text-[var(--color-accent)]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">
                      {locale === "ka" ? "დამადასტურებელი კოდი" : "Verification Code"}
                    </h1>
                    <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
                      {locale === "ka"
                        ? `6-ნიშნა კოდი გაიგზავნა ${maskedEmail}-ზე`
                        : `A 6-digit code has been sent to ${maskedEmail}`}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-6">
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-11 h-12 md:w-12 md:h-14 text-center text-xl font-bold rounded-xl border transition-all ${
                          digit
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-fg-primary)]"
                            : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-[var(--color-fg-primary)]"
                        } focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]/50`}
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {/* Countdown & Resend */}
                  <div className="text-center mb-4">
                    {canResend ? (
                      <button
                        onClick={handleResend}
                        className="text-sm text-[var(--color-accent)] hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <RefreshCw size={14} />
                        {locale === "ka" ? "კოდის ხელახლა გაგზავნა" : "Resend Code"}
                      </button>
                    ) : (
                      <p className="text-xs text-[var(--color-fg-tertiary)] flex items-center justify-center gap-1">
                        <Clock size={12} />
                        {locale === "ka" ? "კოდის ვადა: " : "Code expires in: "}
                        <span className="font-medium">{formatTime(countdown)}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2 mb-4">
                    <Shield size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600">
                      {locale === "ka"
                        ? "თუ არ მოგივიდათ კოდი, გთხოვთ შეამოწმოთ სპამის (Spam) საქაღალდე."
                        : "If you don't receive the code, please check your Spam folder."}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="xl"
                    className="w-full gap-2"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpCode.join("").length !== 6}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {locale === "ka" ? "მოწმდება..." : "Verifying..."}
                      </span>
                    ) : (
                      <>
                        {locale === "ka" ? "დადასტურება" : "Verify"}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                    >
                      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{error}</p>
                    </motion.div>
                  )}
                </div>
              </FadeIn>
            </motion.div>
          )}

          {/* STEP 3: Verifying */}
          {step === "verifying" && (
            <motion.div
              key="verifying-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="p-8 md:p-10 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                  <span className="w-8 h-8 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                </div>
                <p className="text-lg font-medium text-[var(--color-fg-primary)]">
                  {locale === "ka" ? "კოდის მოწმდება..." : "Verifying code..."}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4.5: Duplicate Application */}
          {step === "duplicate" && (
            <motion.div
              key="duplicate-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <FadeIn direction="up">
                <div className="p-8 md:p-10 rounded-3xl border border-amber-200 bg-amber-50/50 shadow-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                      <AlertTriangle size={32} className="text-amber-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-900">
                      {locale === "ka" ? "განაცხადი უკვე მიღებულია" : "Application Already Submitted"}
                    </h1>
                    <p className="mt-4 text-sm text-amber-700 leading-relaxed">
                      {locale === "ka"
                        ? "ამ ელ-ფოსტით განაცხადი უკვე მიღებულია. თითოეულ ელ-ფოსტაზე მხოლოდ ერთი განაცხადის წარდგენაა შესაძლებელი."
                        : "We have already received an application associated with this email address. Each email address can submit only one application."}
                    </p>
                    <p className="mt-3 text-sm text-amber-600/80">
                      {locale === "ka"
                        ? "თუ ფიქრობთ, რომ შეცდომაა ან გჭირდებათ დახმარება, გთხოვთ დაგვიკავშირდეთ."
                        : "If you believe this is an error or need assistance, please contact the BTA LAB team."}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link href="/entrepreneur-support">
                        <Button variant="secondary" size="lg">
                          {locale === "ka" ? "უკან დაბრუნება" : "Go Back"}
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="primary" size="lg" className="gap-2">
                          <MessageCircle size={18} />
                          {locale === "ka" ? "დაგვიკავშირდით" : "Contact Us"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </motion.div>
          )}

          {/* STEP 5: Verified Success */}
          {step === "verified" && (
            <motion.div
              key="verified-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="p-8 md:p-10 rounded-3xl border border-green-500/20 bg-green-500/5 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="text-lg font-medium text-green-600">
                  {locale === "ka" ? "წარმატებული დადასტურება!" : "Verified Successfully!"}
                </p>
                <p className="mt-1 text-sm text-green-500/80">
                  {locale === "ka" ? "გადაგამისამართებთ..." : "Redirecting..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
