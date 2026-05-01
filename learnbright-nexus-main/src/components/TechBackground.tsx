import { motion } from "framer-motion";

/**
 * "Aurora Cyber" animated background — flowing aurora ribbons, perspective grid floor,
 * neon nodes connected by energy lines, drifting hex glyphs, and ambient orbs.
 * Pure CSS + framer-motion. Sits behind content (z = -10), pointer-events-none.
 */
export const TechBackground = () => {
  const glyphs = ["{ }", "</>", "01", "fn()", "=>", "[ ]", "AI", "★", "#", "λ", "∑", "→"];
  const nodes = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: ((i * 37) % 95) + 2,
    y: ((i * 59) % 88) + 5,
    size: 4 + (i % 3) * 2,
    delay: (i * 0.3) % 4,
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, hsl(var(--primary)/0.18), transparent 55%), radial-gradient(ellipse at 80% 100%, hsl(var(--accent)/0.18), transparent 55%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Aurora ribbons */}
      <motion.div
        className="absolute -inset-[20%] opacity-50 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, transparent 0%, hsl(var(--primary)/0.5) 15%, transparent 30%, hsl(var(--primary-glow)/0.4) 50%, transparent 65%, hsl(var(--accent)/0.4) 80%, transparent 100%)",
          filter: "blur(80px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Second aurora layer (counter-rotating) */}
      <motion.div
        className="absolute -inset-[20%] opacity-30 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0%, hsl(var(--primary-glow)/0.5) 25%, transparent 50%, hsl(var(--accent)/0.5) 75%, transparent 100%)",
          filter: "blur(100px)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(600px) rotateX(60deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, black 10%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 90%)",
        }}
      />

      {/* Animated grid (top half) */}
      <motion.div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-glow)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)/0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Neon nodes */}
      {nodes.map((n) => (
        <motion.div
          key={n.id}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.size,
            height: n.size,
            background: "hsl(var(--primary))",
            boxShadow: "0 0 12px hsl(var(--primary)), 0 0 24px hsl(var(--primary-glow)/0.8)",
          }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3 + (n.id % 3), repeat: Infinity, delay: n.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Sweeping scanline */}
      <motion.div
        className="absolute left-0 right-0 h-32 opacity-30"
        style={{
          background:
            "linear-gradient(180deg, transparent, hsl(var(--primary)/0.6), transparent)",
          filter: "blur(8px)",
        }}
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--primary)/0.25)" }}
        animate={{ x: ["10%", "60%", "20%", "10%"], y: ["10%", "40%", "60%", "10%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-[460px] h-[460px] rounded-full blur-3xl"
        style={{ background: "hsl(var(--accent)/0.25)" }}
        animate={{ x: ["0%", "-30%", "10%", "0%"], y: ["0%", "-20%", "-40%", "0%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating glyphs */}
      {glyphs.map((c, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-xs md:text-sm select-none"
          style={{
            left: `${(i * 13 + 5) % 95}%`,
            top: `${(i * 19 + 11) % 90}%`,
            color: "hsl(var(--primary)/0.55)",
            textShadow: "0 0 10px hsl(var(--primary)/0.7)",
          }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 7 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        >
          {c}
        </motion.span>
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, hsl(var(--background)/0.7) 100%)",
        }}
      />
    </div>
  );
};
