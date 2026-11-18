import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { MOTION_DURATION, MOTION_EASING, MOTION_SPRINGS } from './tokens';

/**
 * Cart Badge with Tactile Pop Animation on count update
 */
export const CartBadgePulse: React.FC<{ count: number; className?: string }> = ({
  count,
  className = '',
}) => {
  const [prevCount, setPrevCount] = useState(count);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (count !== prevCount) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 350);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  if (count <= 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isPulsing ? [1, 1.35, 1] : 1,
        opacity: 1,
      }}
      transition={MOTION_SPRINGS.pop}
      className={`bg-[#FF5C00] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs select-none ${className}`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

/**
 * Shimmer Skeleton Loader (Monolith Industrial Metallic Sweep)
 */
export const ShimmerSkeleton: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = 'h-4 w-full rounded', style }) => {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{
          translateX: ['100%', '-100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: 'linear',
        }}
      />
    </div>
  );
};

/**
 * Micro Success Confirmation for Add-To-Cart feedback
 */
export const AddToCartFeedback: React.FC<{ isVisible: boolean; message?: string }> = ({
  isVisible,
  message = 'Đã thêm vào giỏ hàng',
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASING.easeOut }}
          className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold tracking-wide border border-neutral-700/60"
        >
          <div className="w-5 h-5 rounded-full bg-[#FF5C00] flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
