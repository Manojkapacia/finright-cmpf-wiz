import React, { useEffect, useState } from "react";
import { decryptData } from "../../common/encryption-decryption";
import { CalendlySlider } from "./../Models/CalendlySliderModel";
import CallBookedSlider from "../Models/CallBookedModel";
import { motion } from "framer-motion";
import { formatToISO } from "../../../helpers/dates-convertor";
import { ZohoLeadApi } from "../../common/zoho-lead";
import { handleCalendlyBooking } from "../../../helpers/calendryBooking";
import { useNavigate } from "react-router-dom";
import BookingFaildSlider from "../Models/bookingFaildSlider";

interface UrgentHelpCardProps {
  imageUrl: string;
  bgcolor?: boolean;
}

interface ZohoUpdateLeadParams {
  tag?: string;
  status?: string | null;
  intent?: string | null;
  intentStatus?: "Scheduled" | "Not Scheduled" | null;
  callDate?: string | null;
  callTime?: string | null;
}

export const UrgentHelpCard: React.FC<UrgentHelpCardProps> = ({ imageUrl, bgcolor }) => {
  const [showCalendlySlider, setShowCalendlySlider] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  const [showBookedSlider, setShowBookedSlider] = useState(false);
  const [bookedDate, setBookedDate] = useState<string | null>(null);
  const [bookedTime, setBookedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingRes, setIsBookingRes] = useState(false);
  const [showBookingFaildSlider, setShowBookingFaildSlider] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isBookingRes) {
      zohoUpdateLead({
        intentStatus: "Scheduled",
        callDate: bookedDate,
        callTime: bookedTime
      })
    }
  }, [isBookingRes]);

  useEffect(() => {
    const isCallBookingUrl = decryptData(localStorage.getItem("isCallBookingUrl"));
    if (isCallBookingUrl === "true") {
      handleCalendlyEvent();
    }
  }, []);

    const zohoUpdateLead = async (
      {
        intent,
        intentStatus,
        callDate,
        callTime,
      }: ZohoUpdateLeadParams) => {
      const rawData = decryptData(localStorage.getItem("lead_data"));
      const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
      const userName = decryptData(localStorage.getItem("user_name"));
      const userBalance = decryptData(localStorage.getItem("user_balance"));
  
      const newUser = rawData ? JSON.parse(rawData) : null;
      const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
      const user = existUser || newUser;
      if(userBalance > 50000 && intent !== undefined && intent !== null && intent.trim() !== ""){
        intent = `${intent} 50K`;
      }
  
      if (!user) {
        return;
      }
  
      if (user) {
        const zohoReqData = {
          Last_Name: userName || user?.Last_Name,
          Mobile: user?.Mobile,
          Email: user?.Email,
          Wants_To: user?.Wants_To,
          Lead_Status: user?.Lead_Status,
          Lead_Source: user?.Lead_Source,
          Campaign_Id: user?.Campaign_Id,
          CheckMyPF_Status: user?.CheckMyPF_Status,
          CheckMyPF_Intent:
          user.CheckMyPF_Intent === "Scheduled"
            ? "Scheduled"
            : (intentStatus === "Scheduled" ? "Scheduled" : "Not Scheduled"),
        Call_Schedule: intentStatus === "Scheduled" && callDate && callTime
          ? formatToISO(callDate, callTime)
          : user.Call_Schedule || "",
          Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
        };
        ZohoLeadApi(zohoReqData);
      }
    }
  
  const handleCalendlyEvent = async () => {
    // const paymentStatus = await checkpaymentStatus();
    if (isLoading) return;
    setIsLoading(true);
    try {
      await handleCalendlyBooking({
        setBookedDate,
        setBookedTime,
        setAssigneeName,
        setShowBookedSlider,
        setLastName,
        setCalendlyLink,
        setShowCalendlySlider,
        setShowBookingFaildSlider,
        navigate
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="px-5"
        style={{
          backgroundColor: bgcolor ? "#F7F9FF" : "null",
          borderRadius: "1rem",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header text */}
        <div
          className="mb-2"
          style={{
            fontSize: "0.8125rem", // 13px
            fontWeight: 500,
            lineHeight: "100%",
            letterSpacing: 0,
            textAlign: "center",
          }}
        >
          Need Urgent help with PF issues?
        </div>

        {/* Inner Card */}
        <center>
          <div
            style={{
              backgroundColor: "#FFCA62",
              borderRadius: "1rem",
              height: "222px",
              width: "266px",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "visible",
            }}
          >
            {/* Left Side Texts */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.5rem 0.5rem",
                gap: "0.75rem", // ~12px
                zIndex: 2,
                height: "110%" // Added to ensure proper spacing
              }}
            >
              <div
                className="text-start"
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  lineHeight: "120%",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap", // prevent line break
                }}
              >
                Claim Support
              </div>
              <div
                className="text-start"
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  lineHeight: "140%",
                }}
              >
                Professional <br /> Advise
              </div>
              <div
                className="text-start"
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  lineHeight: "140%",
                }}
              >
                Maximise <br /> Withdrawal
              </div>
            </div>

            {/* Right Side Image */}
            <img
              src={imageUrl}
              alt="Profile"
              style={{
                position: "absolute",
                top: "-17%",
                right: "-8%",
                height: "117%",
                objectFit: "contain",
                zIndex: 1,
              }}
            />
          </div>
        </center>

        {/* Call Back Button */}
        <center>
          <motion.button
            className="clickeffect"
            onClick={handleCalendlyEvent}
            disabled={isLoading}
            style={{
              backgroundColor: "#2463EB", // always blue
              color: "#FFFFFF",
              width: "11rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.625rem",
              borderRadius: "0.3125rem",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            whileTap={{ scale: 0.95 }}       // 👈 adds click animation
            transition={{ duration: 0.1 }}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                  aria-hidden="true"
                ></span>
                Please wait...
              </>
            ) : (
              "Connect with an Expert"
            )}
          </motion.button>

          <p
            className="text-center mt-2 mb-0"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              lineHeight: "100%",
              color: "#2463EB",
            }}
          >
            Book a call with PF expert
          </p>
        </center>

      </div>

      <BookingFaildSlider
          show={showBookingFaildSlider}
          onClose={() => setShowBookingFaildSlider(false)}
          onBookCall={handleCalendlyEvent}
        />

      {/* Calendly Slider */}
      {calendlyLink && (
        <CalendlySlider
          show={showCalendlySlider}
          onClose={() => setShowCalendlySlider(false)}
          calendlyLink={calendlyLink}
          prefillName={lastName || ""}
          assigneeName={assigneeName || ""}
          registeredMobileNumber={decryptData(localStorage.getItem("user_mobile") || "")}
          onBookingConfirmed={(dbData) => {
            setBookedDate(dbData.date);
            setBookedTime(dbData.time);
            setAssigneeName(dbData.assigneeName);
            setShowBookedSlider(true);
            setIsBookingRes(true);
          }}
        />
      )}

      {/* Booked Slider */}
      <CallBookedSlider
        show={showBookedSlider}
        onClose={() => setShowBookedSlider(false)}
        bookedDate={bookedDate || ""}
        bookedTime={bookedTime || ""}
        assignedExpert={assigneeName || "PF Expert"}
        profileImage={imageUrl}
      />
    </>
  );
};








