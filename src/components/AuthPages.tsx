import React, { useState } from "react";
import { Mail, Lock, User, Sparkles, AlertCircle, ArrowLeft, Chrome, ArrowRight, ShieldCheck, Eye, EyeOff, Check, X } from "lucide-react";
import { 
  auth, 
  googleProvider, 
  syncUserProfile, 
  seedDefaultUserData 
} from "../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";

interface AuthPagesProps {
  onAuthSuccess: (user: { name: string; email: string }) => void;
  onBackToLanding: () => void;
  theme: 'light' | 'dark';
  initialView?: 'signin' | 'signup' | 'forgot';
  expiredMessage?: string | null;
}

export default function AuthPages({ onAuthSuccess, onBackToLanding, theme, initialView = 'signin', expiredMessage }: AuthPagesProps) {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    setView(initialView);
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [initialView]);

  // Password validation checks for Sign Up page
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length > 0) {
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
  }

  let strengthLabel = "None";
  let strengthColor = "bg-zinc-300 dark:bg-zinc-800";
  let strengthTextColor = "text-zinc-500";
  if (password.length > 0) {
    if (score <= 2) {
      strengthLabel = "Weak";
      strengthColor = "bg-rose-500";
      strengthTextColor = "text-rose-500";
    } else if (score === 3) {
      strengthLabel = "Medium";
      strengthColor = "bg-amber-500";
      strengthTextColor = "text-amber-500 font-semibold";
    } else {
      strengthLabel = "Strong";
      strengthColor = "bg-emerald-500";
      strengthTextColor = "text-emerald-500 font-extrabold";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (view === 'signup') {
      if (!name.trim()) {
        setError('Full name is required.');
        setIsSubmitting(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email address.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must include at least one uppercase letter.');
        setIsSubmitting(false);
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must include at least one number.');
        setIsSubmitting(false);
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError('Password must include at least one special character.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const profile = await syncUserProfile(userCredential.user, name.trim(), 'email');
        onAuthSuccess({ name: profile.fullName, email: profile.email });
      } catch (err: any) {
        console.error("Firebase Sign Up Error", err);
        if (err.code === "auth/email-already-in-use") {
          setError("This email address is already in use by another account.");
        } else if (err.code === "auth/invalid-email") {
          setError("The email address provided is not in a valid format.");
        } else if (err.code === "auth/weak-password") {
          setError("The password selected is too weak.");
        } else {
          setError(err.message || "Registration failed. Please verify credentials and try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (view === 'signin') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email format.');
        setIsSubmitting(false);
        return;
      }
      if (!password) {
        setError('Password field is empty.');
        setIsSubmitting(false);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await syncUserProfile(userCredential.user, undefined, 'email');
        onAuthSuccess({ name: profile.fullName, email: profile.email });
      } catch (err: any) {
        console.error("Firebase Sign In Error", err);
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          setError("Invalid email address or incorrect password. Please try again.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many failed attempts. Temporary lockout active. Try again later or reset password.");
        } else {
          setError(err.message || "Authentication failed. Please verify credentials.");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (view === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setError('Specify a valid email address.');
        setIsSubmitting(false);
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email.trim());
        setForgotSuccess(true);
      } catch (err: any) {
        console.error("Firebase Password Reset Error", err);
        setError(err.message || "Could not process password reset request. Please verify email and try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuthSuccess({ name: result.user.displayName || "Google User", email: result.user.email || "" });
    } catch (err: any) {
      console.error("Google Auth Error", err);
      if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup blocked by the browser. Please allow popups for this page or try standard Email authentication.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Sign-in process cancelled. Please try again.");
      } else {
        setError(err.message || "Google Authentication failed. Please ensure third-party cookies and popups are active.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden w-full transition-colors duration-300
      ${theme === 'dark' 
        ? 'bg-[#030307] text-zinc-100' 
        : 'bg-slate-50 text-slate-900'
      }
    `} id="premium-auth-system-container">
      
      {/* Animated FLOATING blur gradient blobs - Premium SaaS aesthetic */}
      <style>{`
        @keyframes float1 {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-30px) translateX(30px) scale(1.15); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px) translateX(0px) scale(1.1); }
          50% { transform: translateY(40px) translateX(-35px) scale(0.9); }
          100% { transform: translateY(0px) translateX(0px) scale(1.1); }
        }
        @keyframes float3 {
          0% { transform: translateY(0px) translateX(0px) scale(0.95); }
          50% { transform: translateY(-25px) translateX(-20px) scale(1.05); }
          100% { transform: translateY(0px) translateX(0px) scale(0.95); }
        }
        .animate-blob-1 {
          animation: float1 12s ease-in-out infinite;
        }
        .animate-blob-2 {
          animation: float2 16s ease-in-out infinite;
        }
        .animate-blob-3 {
          animation: float3 14s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-600/20 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[60%] h-[60%] bg-gradient-to-tr from-blue-600/20 to-teal-500/10 rounded-full blur-[140px] pointer-events-none animate-blob-2" />
      <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-blob-3" />

      {/* Back Link to Landing */}
      <button 
        onClick={onBackToLanding}
        className={`absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer z-50
          ${theme === 'dark' 
            ? 'bg-zinc-950/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20' 
            : 'bg-white/60 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }
        `}
        id="auth-back-to-landing-btn"
      >
        <ArrowLeft size={13} />
        <span>Return</span>
      </button>

      {/* Structured grid encompassing Hero text & the centered login card */}
      <div className="flex flex-col items-center justify-center relative z-20 w-full max-w-md mx-auto space-y-8">
        
        {/* PREMIUM HERO BANNER SECTION (Nova AI Brand Credentials) */}
        <div className="text-center w-full px-4" id="auth-hero-branding-panel">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[11px] font-mono font-semibold tracking-wider uppercase border bg-indigo-500/5 text-indigo-400 border-indigo-500/20 animate-pulse">
            <Sparkles size={11} />
            <span>Productivity Redefined</span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-2 font-black transition-colors duration-300
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            Nova <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">AI</span>
          </h1>
          
          <p className={`text-sm font-semibold tracking-wide uppercase font-mono
            ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
          `}>
            "Your AI Productivity Companion"
          </p>
          
          <p className={`text-xs mt-2.5 font-light leading-relaxed max-w-sm mx-auto
            ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}
          `}>
            "Plan smarter. Prioritize better. Never miss what matters."
          </p>
        </div>

        {/* AUTH GLASSMORPHISM CARD - Centered Perfectly */}
        <div 
          className={`w-full p-8 md:p-10 rounded-[28px] border backdrop-blur-2xl transition-all duration-300 group
            ${theme === 'dark' 
              ? 'bg-zinc-950/65 border-white/10 shadow-2xl shadow-purple-950/15 hover:border-white/20 hover:shadow-purple-900/10' 
              : 'bg-white/70 border-slate-200/90 shadow-xl shadow-slate-200/50 hover:border-slate-300 hover:shadow-slate-300/60'
            }
          `}
          id="premium-auth-card"
        >
          {/* Company Branding Logo (Glowing Badge at top) */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold tracking-tight text-xl text-white shadow-lg relative overflow-hidden transition-transform duration-300 group-hover:scale-105
              ${theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 shadow-purple-500/20' 
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 shadow-indigo-600/25'
              }
            `}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>N</span>
            </div>
            
            <h2 className={`text-2xl font-extrabold tracking-tight mt-4 text-center
              ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}
            `}>
              {view === 'signin' && 'Welcome Back'}
              {view === 'signup' && 'Create Your Account'}
              {view === 'forgot' && 'Reset Security Node'}
            </h2>
            
            <p className={`text-xs text-center mt-1.5 max-w-[280px] mx-auto leading-relaxed
              ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}
            `}>
              {view === 'signin' && 'Sign in to continue your productivity journey.'}
              {view === 'signup' && 'Start achieving more with AI-powered productivity.'}
              {view === 'forgot' && 'Provide your registered email to request recovery.'}
            </p>
          </div>

          {/* Validation Warnings */}
          {error && (
            <div className={`mb-5 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-fade-in
              ${theme === 'dark' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-rose-50 border-rose-200 text-rose-600'
              }
            `} id="validation-error-alert">
              <AlertCircle size={15} className="shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {expiredMessage && !error && (
            <div className={`mb-5 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-fade-in
              ${theme === 'dark' 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : 'bg-amber-50 border-amber-200 text-amber-700'
              }
            `} id="expired-session-alert">
              <AlertCircle size={15} className="shrink-0 animate-bounce" />
              <span className="font-medium">{expiredMessage}</span>
            </div>
          )}

          {forgotSuccess && view === 'forgot' && (
            <div className={`mb-5 p-4 rounded-xl border text-xs leading-relaxed animate-fade-in
              ${theme === 'dark' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }
            `} id="forgot-success-alert">
              <div className="flex items-center gap-2 font-bold mb-1">
                <ShieldCheck size={15} />
                <span>Reset Request Generated</span>
              </div>
              <p className="opacity-90 font-mono text-[11px]">
                A secure reset token has been scheduled for '{email || "your address"}'. Please check your inbox within 5 minutes.
              </p>
            </div>
          )}

          {/* Core Auth Forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Sign Up only) */}
            {view === 'signup' && (
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-mono uppercase tracking-wider font-semibold
                  ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
                `}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-semibold tracking-tight transition-all focus:outline-none focus:ring-1
                      ${theme === 'dark' 
                        ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500 focus:ring-purple-500 focus:border-purple-500 focus:bg-zinc-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                      }
                    `}
                    id="signup-fullname-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-mono uppercase tracking-wider font-semibold
                ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
              `}>Email Coordinates</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@nova.ai"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-semibold tracking-tight transition-all focus:outline-none focus:ring-1
                    ${theme === 'dark' 
                      ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500 focus:ring-purple-500 focus:border-purple-500 focus:bg-zinc-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                    }
                  `}
                  id="auth-email-coordinate-input"
                  required
                />
              </div>
            </div>

            {/* Password fields */}
            {view !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={`text-[11px] font-mono uppercase tracking-wider font-semibold
                    ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
                  `}>Password</label>
                  
                  {view === 'signin' && (
                    <button 
                      type="button"
                      onClick={() => { setView('forgot'); setError(''); }}
                      className="text-[11px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                      id="forgot-password-trigger-link"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} id="password-lock-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-xs font-semibold tracking-tight transition-all focus:outline-none focus:ring-1
                      ${theme === 'dark' 
                        ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500 focus:ring-purple-500 focus:border-purple-500 focus:bg-zinc-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                      }
                    `}
                    id="auth-password-secure-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none
                      ${theme === 'dark' ? 'text-zinc-450 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}
                    `}
                    title={showPassword ? "Hide Password" : "Show Password"}
                    id="password-visibility-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password strength & requirements checklist (Sign Up only) */}
                {view === 'signup' && password.length > 0 && (
                  <div 
                    className={`mt-2.5 p-3.5 rounded-2xl border backdrop-blur-md animate-fade-in text-[11px] font-sans space-y-3
                      ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}
                    `} 
                    id="password-strength-panel"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}>Strength Indicator:</span>
                        <span className={`text-[10px] font-mono tracking-wide font-black ${strengthTextColor}`}>
                          {strengthLabel.toUpperCase()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full transition-all duration-300 rounded-full ${score >= 1 ? strengthColor : 'bg-transparent'} w-1/3`} />
                        <div className={`h-full transition-all duration-300 rounded-full ${score >= 3 ? strengthColor : 'bg-transparent'} w-1/3`} />
                        <div className={`h-full transition-all duration-300 rounded-full ${score >= 4 ? strengthColor : 'bg-transparent'} w-1/3`} />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                        Security Checklist
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                        {[
                          { met: hasMinLength, label: "Min 8 characters" },
                          { met: hasUppercase, label: "One uppercase letter" },
                          { met: hasNumber, label: "One number" },
                          { met: hasSpecial, label: "One special character" }
                        ].map((req, rid) => (
                          <div key={rid} className="flex items-center gap-1.5 min-w-0">
                            {req.met ? (
                              <Check size={11} className="text-emerald-500 shrink-0 font-bold" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-zinc-450/30 flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-650 rounded-full" />
                              </div>
                            )}
                            <span className={`truncate leading-none ${req.met ? 'text-emerald-500 font-semibold transition-colors duration-200' : 'text-zinc-500 font-normal transition-colors duration-200'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Sign Up only) */}
            {view === 'signup' && (
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-mono uppercase tracking-wider font-semibold
                  ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}
                `}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} id="confirm-password-lock-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-xs font-semibold tracking-tight transition-all focus:outline-none focus:ring-1
                      ${theme === 'dark' 
                        ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500 focus:ring-purple-500 focus:border-purple-500 focus:bg-zinc-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
                      }
                    `}
                    id="signup-confirm-password-secure-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none
                      ${theme === 'dark' ? 'text-zinc-450 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}
                    `}
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                    id="confirm-password-visibility-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Primary Action Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 mt-6 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] hover:brightness-105 active:scale-[0.99]'}
                ${theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow-purple-950/20' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-indigo-600/20'
                }
              `}
              id="auth-primary-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Configuring Session...</span>
                </>
              ) : (
                <>
                  <span>
                    {view === 'signin' && 'Sign In'}
                    {view === 'signup' && 'Create Account'}
                    {view === 'forgot' && 'Send Reset Password Instructions'}
                  </span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>

            {/* CONTINUE WITH GOOGLE ACCENTS (Signin & Signup only) */}
            {view !== 'forgot' && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className={`flex-grow border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-150'}`} />
                  <span className={`flex-shrink mx-3 text-[10px] font-mono uppercase tracking-wider
                    ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}
                  `}>Or secure via SSO</span>
                  <div className={`flex-grow border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-150'}`} />
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]
                    ${theme === 'dark' 
                      ? 'bg-zinc-900/50 border-white/10 text-zinc-100 hover:bg-zinc-900 hover:border-white/20 hover:shadow-lg hover:shadow-zinc-950/40' 
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-350 shadow-sm hover:shadow-md'
                    }
                  `}
                  id="sso-google-btn"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}

          </form>

          {/* Footer Switching Links */}
          <div className={`mt-8 pt-6 border-t text-center text-xs font-semibold transition-colors duration-200
            ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}
          `}>
            {view === 'signin' && (
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { setView('signup'); setError(''); }} 
                  className="text-indigo-500 font-extrabold hover:underline cursor-pointer"
                  id="auth-go-to-signup-footer-btn"
                >
                  Create Account
                </button>
              </p>
            )}

            {view === 'signup' && (
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}>
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { setView('signin'); setError(''); }} 
                  className="text-indigo-500 font-extrabold hover:underline"
                  id="auth-go-to-signin-footer-btn"
                >
                  Sign In
                </button>
              </p>
            )}

            {view === 'forgot' && (
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}>
                Remembered credentials?{" "}
                <button 
                  type="button" 
                  onClick={() => { setView('signin'); setError(''); }} 
                  className="text-indigo-500 font-extrabold hover:underline"
                  id="auth-go-to-signin-from-forgot-footer-btn"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Footprint badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-zinc-500/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
          <span>Security Protocol ACTIVE v2.4</span>
        </div>

      </div>

    </div>
  );
}
