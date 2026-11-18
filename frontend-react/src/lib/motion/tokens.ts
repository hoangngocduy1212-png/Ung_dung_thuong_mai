/**
 * TECHSTORE MONOLITH — MOTION DESIGN SYSTEM TOKENS
 * Crafted according to Emil Kowalski's Design Engineering Principles & Swiss Industrial Minimalism.
 * 
 * Rules:
 * - UI animations must stay under 300ms (drawers/modals up to 400ms).
 * - Always use custom easing curves (never default CSS linear/ease-in).
 * - Nothing animates from scale(0) — always scale(0.95) combined with opacity.
 * - Tactile active states on buttons (scale: 0.97).
 */

export const MOTION_DURATION = {
  instant: 0.1,    // 100ms - micro feedbacks, toggles
  fast: 0.16,      // 160ms - button hover/press, badges
  normal: 0.22,    // 220ms - dropdowns, tooltips, cards
  moderate: 0.3,   // 300ms - modal entrances, tab crossfades
  deliberate: 0.4, // 400ms - drawers, page section reveals
} as const;

export const MOTION_EASING = {
  // Monolith Custom Deceleration — starts fast, lands with high precision
  easeOut: [0.23, 1, 0.32, 1] as const,
  // Natural on-screen movement & transitions
  easeInOut: [0.77, 0, 0.175, 1] as const,
  // Drawer / Sheet curve (inspired by Apple/Ionic)
  easeDrawer: [0.32, 0.72, 0, 1] as const,
} as const;

export const MOTION_SPRINGS = {
  // Snappy tactile feedback (buttons, switches, toggles)
  tactile: {
    type: 'spring',
    stiffness: 450,
    damping: 30,
    mass: 0.8,
  } as const,
  // Responsive modal / card entrance
  responsive: {
    type: 'spring',
    stiffness: 350,
    damping: 26,
    mass: 1,
  } as const,
  // Gentle expansive movement (drawers, notifications)
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 24,
    mass: 1.1,
  } as const,
  // Pop bounce for badges & celebration elements (subtle 0.15 bounce)
  pop: {
    type: 'spring',
    stiffness: 400,
    damping: 18,
  } as const,
} as const;

export const MOTION_DISTANCE = {
  micro: 4,      // Subtle nudge for icons, badges
  compact: 8,    // Tooltips, small dropdowns
  standard: 12,  // Standard cards, list items
  prominent: 20, // Hero typography, major headers
} as const;

export const MOTION_SCALE = {
  press: 0.975,       // Tactile button depression
  cardHover: 1.015,   // Micro-elevation for product cards
  modalInitial: 0.96, // Natural dialog entrance
  popInitial: 0.85,   // Pill badge pop
} as const;

export const MOTION_STAGGER = {
  tight: 0.03,  // Dense product grids, table rows
  normal: 0.05, // Standard card grids, feature lists
  relaxed: 0.08,// Major page sections, staggered hero text
} as const;
