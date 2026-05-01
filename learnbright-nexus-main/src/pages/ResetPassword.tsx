import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { TechBackground } from "@/components/TechBackground";
import { Starfield } from "@/components/Starfield";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error("Missing reset token"); return; }
    const parsed = z.string().min(6, "Min 6 characters").max(72).safeParse(password);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      toast.success("Password updated! Redirecting…");
      setTimeout(() => navigate("/auth"), 1500);
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

      <Link to="/auth" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all hover:-translate-x-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10 shadow-elegant"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 shadow-glow">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold gradient-text">Set a new password</h1>
        </div>

        {done ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Password changed successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pw-new">New password</Label>
              <Input id="pw-new" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pw-confirm">Confirm password</Label>
              <Input id="pw-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading || !token} className="w-full gradient-bg border-0 shadow-glow h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4 mr-2" /> Update password</>}
            </Button>
            {!token && <p className="text-xs text-destructive text-center">Missing or invalid reset token in URL.</p>}
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
