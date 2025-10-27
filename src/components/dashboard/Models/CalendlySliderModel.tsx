import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { post } from "../../common/api";


declare global {
  interface Window {
    Calendly: any;
  }
}

interface CalendlySliderProps {
  show: boolean;
  onClose: () => void;
  calendlyLink: string;
  prefillName?: string;
  assigneeName?: string;
  registeredMobileNumber?: string;
  onBookingConfirmed: (data: {
    date: string;
    time: string;
    assigneeName: string;
    profileImage?: string;
  }) => void;
}

export const CalendlySlider: React.FC<CalendlySliderProps> = ({
  show,
  onClose,
  calendlyLink,
  prefillName,
  assigneeName,
  registeredMobileNumber,
  onBookingConfirmed
}) => {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  // Load Calendly script + CSS once

  // Add a state to track script load
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Inject CSS
    if (!document.getElementById("calendly-css")) {
      const link = document.createElement("link");
      link.id = "calendly-css";
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    // Inject script
    if (!document.getElementById("calendly-script")) {
      const script = document.createElement("script");
      script.id = "calendly-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => {
        console.log("Calendly script loaded ✅");
        setScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      // Script already exists
      setScriptLoaded(true);
    }
  }, []);

  // Initialize Calendly only after script is ready
  useEffect(() => {
    if (show && calendlyLink && widgetRef.current && scriptLoaded && window.Calendly) {
      widgetRef.current.innerHTML = "";
      // const cleanMobile = registeredMobileNumber?.replace(/^\+91/, "") || "";

      window.Calendly.initInlineWidget({
        url: calendlyLink,
        parentElement: widgetRef.current,
        prefill: {
          name: prefillName || "",
          // customAnswers: {
          //   // 👉 Calendly needs a custom field mapped to "Mobile"
          //   // You must configure a custom question in Calendly with a unique ID (like a1)
          //   a1: cleanMobile, 
          // },
        },
        utm: {},
      });

      const handleCalendlyEvent = async (e: any) => {
        if (e.data?.event === "calendly.event_scheduled") {
          const { event, invitee } = e.data.payload;
          try {
            await post("calendly/book", {
              eventUri: event.uri,
              inviteeUri: invitee.uri,
              assigneeName,
              registeredMobileNumber,
            });
            // fetch booking from DB
            setTimeout(async () => {
              const bookingRes: any = await post("calendly/check-user-booking", {
                mobile: registeredMobileNumber,
              });
  
              if (bookingRes?.hasActiveBooking && bookingRes?.data) {
                onBookingConfirmed({
                  date: bookingRes?.data?.date,
                  time: bookingRes?.data?.time,
                  assigneeName: bookingRes?.data?.assigneeName,
                });
                onClose();
              }
            }, 3000);
          } catch (err) {
            console.error("Error saving booking:", err);
          }
        }
      };

      window.addEventListener("message", handleCalendlyEvent);
      return () => window.removeEventListener("message", handleCalendlyEvent);
    }
  }, [show, calendlyLink, prefillName, assigneeName, registeredMobileNumber, scriptLoaded, onClose, onBookingConfirmed]);


  if (!show) return null;

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg p-4 rounded-top"
            style={{
              zIndex: 1050,
              maxWidth: "31rem",
              height: "87vh",
              overflowY: "auto",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <button
              className="btn btn-light position-absolute top-0 end-0 m-2"
              onClick={onClose}
              style={{ zIndex: 2000 }}
            >
              ×
            </button>
            <div ref={widgetRef} style={{ width: "100%", height: "100%" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
