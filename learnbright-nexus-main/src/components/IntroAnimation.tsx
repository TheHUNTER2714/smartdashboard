import { motion } from "framer-motion";
import { GraduationCap, Star } from "lucide-react";

/**
 * Cinematic logo intro with orbiting stars + radial burst + glowing logo reveal.
 */
export const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  // 8 orbiting stars
  const stars = Array.from({ length: 8 });

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6 } }}
      onAnimationComplete={() => setTimeout(onComplete, 2600)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Radial gradient burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 1.5], opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.5), transparent 70%)" }}
      />

      <div className="float-orb w-96 h-96 bg-primary/40 top-1/4 left-1/4" />
      <div className="float-orb w-96 h-96 bg-accent/40 bottom-1/4 right-1/4" style={{ animationDelay: "1s" }} />

      {/* Orbiting stars */}
      <div className="absolute w-[400px] h-[400px]">
        {stars.map((_, i) => {
          const angle = (i / stars.length) * 360;
          return (
            <motion.div
              key={i}
              initial={{ rotate: angle, scale: 0, opacity: 0 }}
              animate={{ rotate: angle + 360, scale: 1, opacity: [0, 1, 1, 0] }}
              transition={{
                rotate: { duration: 4, ease: "linear", repeat: Infinity },
                scale: { delay: 0.5 + i * 0.08, duration: 0.4 },
                opacity: { delay: 0.5 + i * 0.08, duration: 3, times: [0, 0.1, 0.8, 1] },
              }}
              className="absolute top-1/2 left-1/2 origin-left"
              style={{ width: 200, height: 0 }}
            >
              <Star className="absolute -top-2 right-0 w-4 h-4 text-primary fill-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </motion.div>
          );
        })}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px hsl(var(--primary)/0.5)",
              "0 0 100px hsl(var(--primary)/1)",
              "0 0 20px hsl(var(--primary)/0.5)",
            ],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="w-32 h-32 rounded-3xl gradient-bg flex items-center justify-center"
        >
          <GraduationCap className="w-16 h-16 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-5xl md:text-7xl font-display font-bold gradient-text"
        >
          Smart Dashboard
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-muted-foreground tracking-[0.3em] uppercase text-xs"
        >
          ★ Manage · Visualize · Excel ★
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
