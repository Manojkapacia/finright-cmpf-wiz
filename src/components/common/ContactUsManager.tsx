// src/components/common/ContactUsManager.tsx
import React, { useEffect, useState } from "react";
import ContactUsSlider from "./../dashboard/Models/contactUsModel";
import ConnectWithExpertSlider from "./../dashboard/Models/ConnectWithExpertSlider";
import { CalendlySlider } from "./../dashboard/Models/CalendlySliderModel";
import CallBookedSlider from "./../dashboard/Models/CallBookedModel";
import SupportModalPage from "./../user-registeration/supportUser";
import UrgentProfile from "./../../assets/suport-profile.png"; // adjust path if needed
import { decryptData } from "./encryption-decryption"; // adjust path
import { formatToISO } from "../../helpers/dates-convertor";
import { ZohoLeadApi } from "./zoho-lead";
import PaymentABTestSlider from "../dashboard/Models/paymentABTestSlider";
import { handleCalendlyBooking } from "../../helpers/calendryBooking";
import { useNavigate } from "react-router-dom";
import BookingFaildSlider from "../dashboard/Models/bookingFaildSlider";

interface ContactUsManagerProps {
  trigger?: React.ReactNode; // optional custom button design
}

const ContactUsManager: React.FC<ContactUsManagerProps> = ({ trigger }) => {
  const [showContact, setShowContact] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showCalendlySlider, setShowCalendlySlider] = useState(false);
  const [showBookedSlider, setShowBookedSlider] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState<string | null>(null);

  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  const [bookedDate, setBookedDate] = useState<string | null>(null);
  const [bookedTime, setBookedTime] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [isBookingRes, setIsBookingRes] = useState(false);
  const [showPaymentABTestSlider, setShowPaymentABTestSlider] = useState(false);
  const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false)
  const navigate = useNavigate()

  interface ZohoUpdateLeadParams {
    tag?: string;
    status?: string | null;
    intent?: string | null;
    intentStatus?: "Scheduled" | "Not Scheduled" | null;
    callDate?: string | null;
    callTime?: string | null;
  }

  useEffect(() => {
    if (isBookingRes) {
      zohoUpdateLead({
        intentStatus: "Scheduled",
        callDate: bookedDate,
        callTime: bookedTime
      })
    }
  }, [isBookingRes]);

  // ✅ Listen for global open event
  useEffect(() => {
    const openHandler = () => {
      setShowContact(true);
      setShowExpert(false);
      setShowEscalationModal(false);
    };

    window.addEventListener("open-contact-us", openHandler);
    return () => window.removeEventListener("open-contact-us", openHandler);
  }, []);

  // ✅ Get mobile number from localStorage
  const mobileNumber =
    decryptData(localStorage.getItem("user_mobile") || "") || "";

  // --- Handlers ---
  const handleOpenContact = () => {
    setShowContact(true);
    setShowExpert(false);
    setShowEscalationModal(false);
  };

  const handleOpenExpert = () => {
    setShowContact(false);
    setShowExpert(true);
  };

  const handleRaiseEscalation = () => {
    setShowContact(false);
    setShowEscalationModal(true);
  };

  const showToast = (type: string, content: string) => {
    console.log("Toast:", type, content);
  };

  const handleCalendlyEvent = async () => {;
    await handleCalendlyBooking({
          setBookedDate,
          setBookedTime,
          setAssigneeName,
          setShowBookedSlider,
          setShowPaymentABTestSlider,
          setLastName,
          setCalendlyLink,
          setShowCalendlySlider,
          setShowExpert,
          navigate,
          setShowBookingFaildSlider
        });
  };


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

  return (
    <>
      {/* Trigger button (default if not provided) */}
      {trigger ? (
        <div onClick={handleOpenContact}>{trigger}</div>
      ) : (
        <button onClick={handleOpenContact} className="btn btn-outline-dark">
          Contact Us
        </button>
      )}

      {/* Contact Us Slider */}
      <ContactUsSlider
        show={showContact}
        onClose={() => setShowContact(false)}
        onConnectExpert={handleOpenExpert}
        onRaiseEscalation={handleRaiseEscalation}
      />

      {/* Expert Slider */}
      {showExpert && (
        <ConnectWithExpertSlider
          show={showExpert}
          onClose={() => setShowExpert(false)}
          onBookCall={() => handleCalendlyEvent()}
        />
      )}

      {/* Escalation Modal */}
      {showEscalationModal && (
        <SupportModalPage
          onClose={() => setShowEscalationModal(false)}
          showToast={showToast}
        />
      )}

      {/* Calendly Slider */}
      {calendlyLink && (
        <CalendlySlider
          show={showCalendlySlider}
          onClose={() => setShowCalendlySlider(false)}
          calendlyLink={calendlyLink}
          prefillName={lastName || ""}
          assigneeName={assigneeName || ""}
          registeredMobileNumber={mobileNumber}
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
        profileImage={UrgentProfile}
      />

      <PaymentABTestSlider
        show={showPaymentABTestSlider}
        onClose={() => setShowPaymentABTestSlider(false)}
      />
      <BookingFaildSlider
          show={showBookingFaildSlider}
          onClose={() => setShowBookingFaildSlider(false)}
          onBookCall={handleCalendlyEvent}
        />
    </>
  );
};

export default ContactUsManager;
