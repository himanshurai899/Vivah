'use client';
import type React from 'react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

type GradientBackgroundProps = React.ComponentProps<'div'> & {
  gradients?: string[];
  animationDuration?: number;
};

const DARK_GRADIENTS = [
  "linear-gradient(135deg, #0F0612 0%, #1a0a2e 40%, #0d1a2e 100%)",
  "linear-gradient(135deg, #130820 0%, #1e0a3c 35%, #0a1628 100%)",
  "linear-gradient(135deg, #0F0612 0%, #1c1040 45%, #08141e 100%)",
  "linear-gradient(135deg, #0a0416 0%, #15082a 40%, #0e1a26 100%)",
  "linear-gradient(135deg, #0F0612 0%, #1a0a2e 40%, #0d1a2e 100%)",
];

export function GradientBackground({
  children,
  className = '',
  gradients = DARK_GRADIENTS,
  animationDuration = 12,
}: GradientBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className={cn('w-full relative overflow-hidden', className)}>
      {/* Dark-mode animated gradient */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            key="dark-gradient"
            className="absolute inset-0"
            style={{ background: gradients[0] }}
            animate={{ background: gradients }}
            transition={{ duration: animationDuration, repeat: Infinity, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Light-mode ivory base — always behind */}
      {!isDark && mounted && (
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ background: '#FAFAF8' }}
        />
      )}

      {/* Subtle noise texture overlay (both modes) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.04 : 0.025,
          mixBlendMode: 'overlay',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
