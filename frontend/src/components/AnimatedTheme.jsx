import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * AnimatedTheme — wraps page content and crossfades on theme change.
 * Uses the `theme` string as the React `key` so AnimatePresence
 * triggers an exit/enter cycle whenever the user picks a new theme.
 *
 * - `initial={false}` prevents a double entrance on first mount
 *   (child components handle their own entrance animations).
 * - `useReducedMotion()` disables the crossfade for accessibility.
 */
export default function AnimatedTheme({ theme, children }) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.18;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
