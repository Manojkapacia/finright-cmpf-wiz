interface TitleSubtitleBlockProps {
  title: string;
  subtitle?: string;
}

export const TitleSubtitleBlock: React.FC<TitleSubtitleBlockProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center d-flex flex-column align-items-center justify-content-center" style={{ gap: '0.625rem' /* 10px in rem */ }}>
      <div
        style={{
          fontSize: '1.5rem', // 24px
          fontWeight: 600,
          letterSpacing: '0px',
          lineHeight: '100%',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '1rem', // 16px
            fontWeight: 400,
            letterSpacing: '0px',
            lineHeight: '100%',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};





import { useEffect, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
interface LoaderBarProps {
  duration?: number;              // Time (in seconds) to reach 85%
  titleText?: string;             // Title above the loader
  footerText?: string;            // Static footer text below loader
  apiDone?: boolean;              // Flag to complete loader
}

export const LoaderBar: React.FC<LoaderBarProps> = ({
  duration = 1,
  titleText = "Verifying OTP",
  footerText = "Creating Account...",
  apiDone = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setProgress(0); // Reset on mount

    const interval = 100; // 100ms
    const step = 85 / (duration * 1000 / interval); // steps to reach 85%

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85 && !apiDone) {
          setIsPaused(true);
          return prev;
        }

        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }

        if (apiDone && prev >= 85) {
          return prev + 3;
        }

        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, apiDone]);

  useEffect(() => {
    if (apiDone && isPaused) {
      setIsPaused(false); // resume progress when apiDone
    }
  }, [apiDone, isPaused]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center pb-3 pt-1"
      style={{
        height: "100%",
        textAlign: "center",
        // marginTop: "0.5rem",
      }}
    >
      {/* Title */}
      <div
        className="text-white"
        style={{
          fontSize: "1.25rem",
          fontWeight: 400,
          lineHeight: "100%",
          marginBottom: "1rem",
        }}
      >
        {titleText}
      </div>

      {/* Progress Bar */}
      <div
        className="w-100"
        style={{
          height: "6px",
          backgroundColor: "#ffffff50",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            transition: "width 0.3s linear",
            animation: progress < 100 ? "pulse 1.5s infinite ease-in-out" : "none",
          }}
        />
      </div>

      {/* Footer Text */}
      <div
        className="text-white"
        style={{
          fontWeight: 400,
          fontSize: "0.875rem",
          lineHeight: "100%",
          marginTop: "1rem",
        }}
      >
        {footerText}
      </div>

      {/* Pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.85; }
            50% { opacity: 1; }
            100% { opacity: 0.85; }
          }
        `}
      </style>
    </div>
  );
};


interface EPFLoaderBarProps {
  duration?: number; // time to reach 85%
  apiCompleted?: boolean; // parent tells when API is done
  textChange?: boolean;
}

const messages = [
  // "Calling EPF office...",
  "Connecitng with EPFO server...",
  "Looking through Files...",
  "Dusting old records...",
  "Collecting details...",
  // "Connecting to EPFO..."
];

export const EPFLoaderBar: React.FC<EPFLoaderBarProps> = ({
  duration = 10, // seconds to simulate long process before apiCompleted
  apiCompleted,
  textChange
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [internalDone, setInternalDone] = useState(false);

  useEffect(() => {
    let interval:any;

    if (progress < 85 && !internalDone) {
      const step = 85 / (duration * 10); // assuming 100ms interval
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + step;
          if (next >= 85) {
            clearInterval(interval);
            return 85;
          }
          return next;
        });
      }, 300);
    }

    return () => clearInterval(interval);
  }, [duration, internalDone]);

  // Advance messages every 2s
  useEffect(() => {
    if (messageIndex < messages.length - 1) {
      const msgInterval = setInterval(() => {
        setMessageIndex((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(msgInterval);
    }
  }, [messageIndex]);

  // When API completes, finish the bar
  useEffect(() => {
    if (apiCompleted) {
      setInternalDone(true);
      const finish = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(finish);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(finish);
    }
  }, [apiCompleted]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center py-3"
      style={{
        height: "100%",
        textAlign: "center",
        marginTop: "0.5rem",
      }}
    >
      {/* Title */}
      <div
        className="text-white"
        style={{
          fontSize: "1.125rem",
          fontWeight: 400,
          lineHeight: "100%",
          marginBottom: "1rem",
        }}
      >
        {textChange ? "Refreshing your data" : "Verifying with EPFO..."}
      </div>

      {/* Progress Bar */}
      <div
        className="w-100"
        style={{
          height: "6px",
          backgroundColor: "#ffffff50",
          borderRadius: "1rem",
          overflow: "hidden",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            transition: "width 0.3s linear",
            animation: progress < 100 ? "pulse 1.5s infinite ease-in-out" : "none",
          }}
        />
      </div>

      {/* Footer Message */}
      <div
        className="text-white mt-1"
        style={{
          fontWeight: 400,
          fontSize: "0.875rem",
          lineHeight: "100%",
          minHeight: "1rem",
        }}
      >
        {messages[messageIndex]}
      </div>

      {/* Subtle animation */}
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}
      </style>
    </div>
  );
};


import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

interface PFInfoSliderProps {
  initialIndex?: number; // optional
}

const slides = [
  {
    text: "90% of those with 3+ jog changes face PF issues",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  },
  {
    text: "Contribution just 1800 Rs per month, but having a monthly salary more than 15000 Rs increases chances of your PF withdrawal getting rejected",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  },
  {
    text: "Provident Fund can form up to 20% of your total assets. Keep it error-free for easy access when you need it most",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  },
  {
    text: "1 in 3 PF claims are getting rejected due to a hidden issues or wrong claim application. Get your PF account checked before applying claim",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  },
  {
    text: "You earn interest even after your contributions stop, ensure your interest gets credited on time",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  },
  {
    text: "Navigating through EPFO withdrawal process can be tedious; We help you understand and process and apply correct claims",
    bgColor: "#ecf2fe",
    iconColor: "#2463EB",
  }
];
export const PFInfoSlider: React.FC<PFInfoSliderProps> = ({ initialIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<"left" | "right">("left");

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("left");
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setDirection("left");
      setActiveIndex((prev) => (prev + 1) % slides.length);
    },
    onSwipedRight: () => {
      setDirection("right");
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Animation variants
  const variants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "left" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "left" ? -300 : 300,
      opacity: 0,
    }),
  };

  const currentSlide = slides[activeIndex];

  return (
    <div
      {...handlers}
      className="d-flex flex-column align-items-center"
      style={{
        width: "100%",
        overflow: "hidden",
        // paddingBottom: "2rem", // space for indicator
        position: "relative",
      }}
    >
      {/* Card container with fixed height */}
      <div style={{ width: "100%", height: "6.9rem", position: "relative" }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              borderRadius: "0.625rem",
              padding: "1rem",
              gap: "1rem",
              display: "flex",
              alignItems: "center",    
              justifyContent: "center", 
              backgroundColor: currentSlide.bgColor,
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Icon */}
            <div
              style={{
                color: currentSlide.iconColor,
                fontSize: "1.25rem",
                flexShrink: 0,
                // marginRight: "0.5rem",
                // marginTop: "0.125rem",
              }}
            >
              <FaExclamationCircle />
            </div>

            {/* Text */}
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "#000000",
                overflowY: "auto", // scroll if needed
                maxHeight: "100%",
                lineHeight: "1.4",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                flex: 1,
              }}
            >
              {currentSlide.text}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators below the card */}
      <div className="d-flex justify-content-center mt-3" style={{ gap: "0.5rem" }}>
        {slides.map((_, index) => {
          const isActive = index === activeIndex;
          let width = isActive ? "2.75rem" : "0.3125rem";

          return (
            <div
              key={index}
              style={{
                width,
                height: "0.3125rem",
                borderRadius: "100rem",
                backgroundColor: "#BCC2E6",
                transition: "width 0.3s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};


// export const PFInfoReminderCard: React.FC<PFInfoReminderCardProps> = ({ activeIndex }) => {
//   const cards = [
//     {
//       bgColor: "#fee6e6",
//       iconColor: "#FF0000",
//       text: "90% of those with 3+ job switches face PF account issues",
//     },
//     {
//       bgColor: "#ecf2fe",
//       iconColor: "#2463EB",
//       text: (
//         <>
//           Provident Fund can form up to 20% of your total assets. <br />
//           Keep it error-free for easy access when you need it most
//         </>
//       ),
//     },
//   ];

//   const validIndex = activeIndex >= 0 && activeIndex < cards.length ? activeIndex : 0;

//   return (
//     <div className="d-flex flex-column align-items-center" style={{ width: "100%" }}>
//       {/* Card */}
//       <div
//         style={{
//           borderRadius: "0.625rem", // 10px
//           padding: "0.625rem", // 10px
//           gap: "0.9375rem", // 15px
//           display: "flex",
//           alignItems: "center",
//           backgroundColor: cards[validIndex].bgColor,
//           width: "100%",
//         }}
//       >
//         {/* Icon */}
//         <div style={{ color: cards[validIndex].iconColor, fontSize: "1.25rem" }}>
//           <FaExclamationCircle />
//         </div>

//         {/* Text */}
//         <div
//           style={{
//             fontSize: "0.875rem",
//             fontWeight: 400,
//             color: "#000000",
//           }}
//         >
//           {cards[validIndex].text}
//         </div>
//       </div>

//       {/* Dots */}
//       <div className="d-flex justify-content-center mt-2" style={{ gap: "0.5rem" }}>
//         {cards.map((_, i) => (
//           <div
//             key={i}
//             style={{
//               width: validIndex === i ? "2.75rem" : "0.3125rem", // 44px or 5px
//               height: "0.3125rem", // 5px
//               borderRadius: "100rem",
//               backgroundColor: "#BCC2E6",
//               transition: "width 0.3s ease",
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };


import React from 'react';
// import MESSAGES from '../../../constant/message';

interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  // type = 'button',
  // className = '',
  disabled = false,
}) => {
  return (
    <button
      // type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '1rem 2rem',
        borderRadius: '0.625rem',       // 10px = 0.625rem
        fontWeight: 700,
        fontSize: '1rem',               // 16px = 1rem
        lineHeight: '1',
        letterSpacing: '0',
        backgroundColor: '#FFFFFF',
        color: '#00124F',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.625rem',                // 10px = 0.625rem
        width: '100%',
        border:"none"
      }}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} clickeffect`}
    >
      {label}
    </button>
  );
};


interface TermsConditionsModalProps {
  open: boolean;
  onClose: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Terms & Conditions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <iframe
              src="https://www.finright.in/terms-conditions"
              style={{ width: "100%", height: "30rem", border: "none" }}
              title="Terms and Conditions"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

