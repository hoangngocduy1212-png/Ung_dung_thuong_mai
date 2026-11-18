import type { Variants } from 'motion/react';
import { MOTION_DURATION, MOTION_EASING, MOTION_DISTANCE, MOTION_SCALE } from './tokens';

/**
 * Standard subtle vertical reveal (enters from 12px below)
 */
export const fadeSlideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: MOTION_DISTANCE.standard,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.normal,
      ease: MOTION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -MOTION_DISTANCE.compact,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * Standard subtle vertical reveal from above (for topbars, alerts, menus)
 */
export const fadeSlideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -MOTION_DISTANCE.compact,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -MOTION_DISTANCE.compact,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * Stagger Container for Product Grids & Lists
 */
export const createStaggerContainer = (staggerDelay = 0.05, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
});

export const staggerContainerVariants: Variants = createStaggerContainer();

/**
 * Stagger Child Item for Cards and Table Rows
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: MOTION_DISTANCE.standard,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: MOTION_DURATION.normal,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * Dropdown Menu Variants (Origin-aware scaling from top)
 */
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: MOTION_SCALE.modalInitial,
    y: -4,
    transformOrigin: 'top right',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transformOrigin: 'top right',
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: MOTION_SCALE.modalInitial,
    y: -2,
    transition: {
      duration: MOTION_DURATION.instant,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * Modal Dialog Overlay and Body Variants
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_DURATION.fast, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATION.fast, ease: 'easeIn' },
  },
};

export const modalDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: MOTION_SCALE.modalInitial,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.moderate,
      ease: MOTION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * Side Drawer Variants (Right to Left sliding)
 */
export const drawerRightVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: MOTION_DURATION.moderate,
      ease: MOTION_EASING.easeDrawer,
    },
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
};

/**
 * List Item deletion and re-order animation
 */
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    scale: 0.96,
    marginBottom: 0,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    scale: 1,
    transition: {
      duration: MOTION_DURATION.normal,
      ease: MOTION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    marginBottom: 0,
    overflow: 'hidden',
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASING.easeOut,
    },
  },
};
