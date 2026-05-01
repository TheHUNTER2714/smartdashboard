import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Starfield } from "@/components/Starfield";
import { TechBackground } from "@/components/TechBackground";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password, fullName });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg relative overflow-hidden">
      <TechBackground />
      <Starfield />
      <div className="float-orb w-[400px] h-[400px] bg-primary/30 -top-20 -left-20" />
      <div className="float-orb w-[400px] h-[400px] bg-accent/30 -bottom-20 -right-20" style={{ animationDelay: "2s" }} />

      <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all hover:-translate-x-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10 shadow-elegant"
        style={{ perspective: 1000 }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(var(--primary)/0.6), hsl(var(--accent)/0.6), hsl(var(--primary-glow)/0.6), hsl(var(--primary)/0.6))",
            filter: "blur(14px)",
            opacity: 0.4,
            zIndex: -1,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px hsl(var(--primary)/0.5)",
                "0 0 50px hsl(var(--primary)/0.9)",
                "0 0 20px hsl(var(--primary)/0.5)",
              ],
              rotate: [0, 8, -8, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4"
          >
            <GraduationCap className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">Smart Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sign in or create an account
          </p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email-in">Email</Label>
                <Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw-in">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="pw-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 shadow-glow h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="name-up">Full Name</Label>
                <Input id="name-up" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email-up">Email</Label>
                <Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="pw-up">Password</Label>
                <Input id="pw-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 shadow-glow h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Auth;
