import { motion } from "framer-motion";

const ReaderCharacterMotion = ({
  className = "",
  imageClassName = "",
  size = "medium",
  showGlow = true,
  showBadge = false,
  dark = true,
}) => {
  const sizeClasses = {
    small: "max-w-[180px]",
    medium: "max-w-[280px]",
    large: "max-w-[420px]",
    full: "max-w-full",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto ${sizeClasses[size] || sizeClasses.medium} ${className}`}
    >
      {showGlow && (
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-8 rounded-full bg-[#c97b6b]/25 blur-3xl"
        />
      )}

      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, -1, 0.8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative rounded-[1.7rem] border p-3 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl ${
          dark
            ? "border-white/10 bg-white/[0.045]"
            : "border-slate-200 bg-white/80"
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.35rem] bg-[#201a30]">
          <motion.img
            src="/images/readnest-character.png"
            alt="Reader character reading a book"
            draggable="false"
            className={`w-full object-contain object-center ${imageClassName}`}
            animate={{
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {showBadge && (
            <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-800 shadow-lg">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Focus Mode
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReaderCharacterMotion;
