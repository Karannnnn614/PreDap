import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion variants for the PreDAP landing page.
 *
 * Entrance motion is subtle and confident: a 28px rise over 0.7s on a custom
 * ease-out curve, with staggered children. Pair `stagger` on a container with
 * `fadeInUp` / `fadeIn` on its children.
 *
 * Usage:
 *   <motion.div variants={stagger} initial="hidden" whileInView="visible"
 *               viewport={viewportOnce}>
 *     <motion.h2 variants={fadeInUp}>…</motion.h2>
 *   </motion.div>
 */

export const easeOut = [0.16, 1, 0.3, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/** Standard viewport config — animate once, when 15% is in view. */
export const viewportOnce = { once: true, amount: 0.15, margin: "-60px" } as const;
