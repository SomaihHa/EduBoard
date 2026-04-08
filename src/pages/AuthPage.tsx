import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2, BookOpen, Users, ArrowRight } from "lucide-react";
import EduBoardLogo from "@/components/EduBoardLogo";
import { toast } from "@/hooks/use-toast";

const AuthPage = () => {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "Account created! Signing you in..." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Left Hero Section */}
      <div className="relative flex-1 flex flex-col justify-between p-8 lg:p-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-teal-950/30" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal-500/8 rounded-full blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10">
          <EduBoardLogo size="large" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto py-16 lg:py-0">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            AI-Powered Education
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Learn with
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Confidence.
            </span>
            <br />
            Recite with
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
              Excellence.
            </span>
          </h1>
          <p className="mt-8 text-lg text-white/50 max-w-md leading-relaxed">
            Smart Quran recitation, AI-powered writing labs, and intelligent lecture tools — all in one platform.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex items-center gap-6 text-white/30 text-xs uppercase tracking-widest">
          <span>Recitation</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span>Writing</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span>Lectures</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span>AI Tools</span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center p-8 lg:p-12 bg-[#111111] lg:border-l border-white/5">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-white/40 text-sm mb-8">
            {isLogin
              ? "Sign in to continue your learning journey"
              : "Join EduBoard and start learning today"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                  />
                </div>

                {/* Role selector */}
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("student")}
                      className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        selectedRole === "student"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("teacher")}
                      className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        selectedRole === "teacher"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Teacher
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 mt-8 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
           </button>
          </p>

          <p className="text-center text-white/20 mt-6 text-xs tracking-wide">
            Powered by <span className="text-emerald-400/60 font-medium">Somaih Hameed</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
