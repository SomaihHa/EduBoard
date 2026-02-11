import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { GraduationCap, Loader2, BookOpen, Users } from "lucide-react";
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

  // Redirect if already logged in
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">EduFine</h1>
          <p className="text-slate-400 mt-1">Smart Quran Learning</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />

                {/* Role selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl border transition-all ${
                      selectedRole === "student"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-700/30 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("teacher")}
                    className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl border transition-all ${
                      selectedRole === "teacher"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-700/30 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Teacher
                  </button>
                </div>
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
