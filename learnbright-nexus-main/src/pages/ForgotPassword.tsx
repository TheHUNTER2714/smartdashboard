import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Loader2, Mail } from "lucide-react";
import { TechBackground } from "@/components/TechBackground";
import { Starfield } from "@/components/Starfield";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSent(true);
      if (res.resetUrl) setDevLink(res.resetUrl);
      toast.success("If that email exists, a reset link has been sent.");
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
        <ArrowLeft className="w-4 h-4" /> Back to Sign In
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10 shadow-elegant"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 shadow-glow">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold gradient-text">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email-fp">Email</Label>
              <Input id="email-fp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 shadow-glow h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-2" /> Send reset link</>}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <Mail className="w-12 h-12 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Check your inbox for a reset link. The link expires in 1 hour.
            </p>
            {devLink && (
              <div className="glass rounded-lg p-3 text-xs text-left">
                <p className="font-medium mb-1 text-primary">Dev mode (no email server):</p>
                <a href={devLink} className="break-all underline hover:text-primary">{devLink}</a>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
