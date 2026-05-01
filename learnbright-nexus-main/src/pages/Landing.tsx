import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, BarChart3, Shield, Zap, Database } from "lucide-react";
import { IntroAnimation } from "@/components/IntroAnimation";
import { Starfield } from "@/components/Starfield";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Database, title: "Real-time Database", desc: "Instant updates across devices powered by Lovable Cloud." },
  { icon: BarChart3, title: "Visual Analytics", desc: "Beautiful charts to visualize student data instantly." },
  { icon: Sparkles, title: "AI Recommendations", desc: "Smart learning paths suggested for every student." },
  { icon: Shield, title: "Secure Auth", desc: "Email-verified accounts with row-level security." },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized React + Vite for blazing performance." },
  { icon: GraduationCap, title: "Built for Education", desc: "Crafted specifically for academic data management." },
];

const Landing = () => {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("introSeen"));
  const { user } = useAuth();

  const finishIntro = () => {
    sessionStorage.setItem("introSeen", "1");
    setShowIntro(false);
  };

  return (
    <>
      <AnimatePresence>{showIntro && <IntroAnimation onComplete={finishIntro} />}</AnimatePresence>

      <div className="min-h-screen relative overflow-hidden hero-bg">
        <Starfield />
        {/* Floating orbs */}
        <div className="float-orb w-[500px] h-[500px] bg-primary/30 -top-40 -left-40" />
        <div className="float-orb w-[400px] h-[400px] bg-accent/30 top-1/3 -right-20" style={{ animationDelay: "2s" }} />
        <div className="float-orb w-[350px] h-[350px] bg-primary-glow/30 bottom-0 left-1/3" style={{ animationDelay: "4s" }} />

        {/* Nav */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl">Smart Dashboard</span>
          </div>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button variant="default" className="gradient-bg border-0 shadow-glow hover:opacity-90">
              {user ? "Open Dashboard" : "Sign In"}
            </Button>
          </Link>
        </nav>

        {/* Hero */}
        <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Student Management</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6"
          >
            The future of <br />
            <span className="gradient-text">student data.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            A premium full-stack dashboard with real-time CRUD, beautiful analytics,
            secure authentication, and AI recommendations — all wrapped in a cinematic UI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="gradient-bg border-0 text-lg px-8 h-14 shadow-glow hover:scale-105 transition-transform">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="glass text-lg px-8 h-14 border-2">
              Learn More
            </Button>
          </motion.div>
        </section>

        {/* Features */}
        <section className="relative z-10 container mx-auto px-6 pb-24">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-center mb-16"
          >
            Everything you need.
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-3xl p-8 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="relative z-10 container mx-auto px-6 py-8 text-center text-sm text-muted-foreground border-t border-border/50">
          Built with React, Tailwind, Three.js, Express & Postgres — © {new Date().getFullYear()} Smart Dashboard
        </footer>
      </div>
    </>
  );
};

export default Landing;
