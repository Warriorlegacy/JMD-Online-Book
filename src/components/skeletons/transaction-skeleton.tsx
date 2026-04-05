import { memo } from "react";
import { motion } from "framer-motion";

export const TransactionSkeleton = memo(function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="glass-panel rounded-[28px] p-5 space-y-3 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <motion.div
                className="h-4 w-20 bg-gradient-to-r from-white/10 to-white/5 rounded"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="h-3 w-24 bg-gradient-to-r from-white/5 to-white/3 rounded"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
            </div>
            <motion.div
              className="h-6 w-16 bg-gradient-to-r from-amber-400/20 to-amber-400/10 rounded-full"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <motion.div
              className="h-3 w-12 bg-gradient-to-r from-white/5 to-white/3 rounded"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
            <motion.div
              className="h-4 w-24 bg-gradient-to-r from-amber-400/20 to-amber-400/10 rounded"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
});