import { post } from "../components/common/api";
import { decryptData } from "../components/common/encryption-decryption";
import { NavigateFunction } from 'react-router-dom';


interface HandleCalendlyEventParams {
    zohoIntent?: any;
    paymentStatus?: string | null;
    // zohopaymentTag?: string | null;
    setBookedDate?: (date: string) => void;
    setBookedTime?: (time: string) => void;
    setAssigneeName?: (name: string) => void;
    setShowBookedSlider?: (val: boolean) => void;
    setShowPaymentABTestSlider?: (val: boolean) => void;
    setShowInitialCallSlider?: (val: boolean) => void;
    setShowAfterInitialCallbooking?: (val: boolean) => void;
    setShowAdvancePaidCallBooking?: (val: boolean) => void;
    setLastName?: (name: string) => void;
    setCalendlyLink: (link: string) => void;
    setShowCalendlySlider?: (val: boolean) => void; // Make it optional with ?
    setShowExpert?: (val: boolean) => void;
    navigate: NavigateFunction;
    setShowBookingFaildSlider?: (val: boolean) => void;
  }

export const handleCalendlyBooking = async ({
  zohoIntent,
  paymentStatus,
//   zohopaymentTag,
  setBookedDate,
  setBookedTime,
  setAssigneeName,
  setShowBookedSlider,
  setShowPaymentABTestSlider,
  setShowInitialCallSlider,
  setShowAfterInitialCallbooking,
  setShowAdvancePaidCallBooking,
  setLastName,
  setCalendlyLink,
  setShowCalendlySlider,
  setShowExpert,
  navigate,
  setShowBookingFaildSlider,
}: HandleCalendlyEventParams) => {
  const userMobile = decryptData(localStorage.getItem("user_mobile"));

  try {
    const bookingRes: any = await post("calendly/check-user-booking", { mobile: userMobile });
    console.log("bookingRes", bookingRes.data.callbookingStatus.Assigned_To);

    if (bookingRes?.hasActiveBooking && bookingRes?.data) {
      setBookedDate?.(bookingRes.data.date);
      setBookedTime?.(bookingRes.data.time);
      setAssigneeName?.(bookingRes.data.assigneeName);
      setShowBookedSlider?.(true);
      return;
    }
    const calendlyToggle = decryptData(localStorage.getItem("calendlyToggle") || "") || "";
    const zohoPaymentTag = bookingRes?.data?.callbookingStatus?.Tag?.find((tag:any) => tag?.name.toLowerCase() === "paid initiation")?.name;
    const convertedContact = bookingRes?.data?.callbookingStatus?.Converted_Contact;
    
    if (zohoIntent) {
      if (zohoPaymentTag?.toLowerCase() !== "paid initiation" && (!paymentStatus || paymentStatus === "unpaid")) {
        if (bookingRes?.data?.callbookingStatus?.showPaymentSlider) {
          setShowPaymentABTestSlider?.(true);
        } else {
          setShowInitialCallSlider?.(true);
        }
        return;
      }

      if (convertedContact===null && (zohoPaymentTag?.toLowerCase() === "paid initiation" || paymentStatus?.toLowerCase() === "initialpayment")) {
        setShowAfterInitialCallbooking?.(true);        
        return;
      }

      if (convertedContact|| paymentStatus?.toLowerCase() === "fullpayment") {
        setShowAdvancePaidCallBooking?.(true);        
        return;
      }
    }

    if(bookingRes?.data?.callbookingStatus?.Assigned_To===null){
      setShowBookingFaildSlider?.(true); 
      console.log("showBookingFaildSlider", setShowBookingFaildSlider);
      return;
    }

    if (calendlyToggle === true) {
      navigate("/booking", { state: { prevRoute: "/dashboard" } });
      return;
    }

    // Determine assignee
    const assignedTo = bookingRes?.data?.callbookingStatus?.Assigned_To;
    const userName = decryptData(localStorage.getItem("user_name")) || "";
    const cleanedName = userName.replace(/^(mr|mrs|ms|mr.)\.?/i, "").trim();
    setLastName?.(cleanedName);

    async function waitForAssignee() {
      let assignee = assignedTo;
      while (!assignee || assignee.trim().length === 0) {
        await new Promise((r) => setTimeout(r, 200));
        assignee = bookingRes?.data?.callbookingStatus?.Assigned_To;
      }
      return assignee;
    }

    const currentZohoTag = zohoPaymentTag || paymentStatus;
    let finalAssignee: string;
 
    if ((currentZohoTag ?? "").toLowerCase() === "paid initiation" || ["initialpayment", "fullpayment"].includes(paymentStatus?.toLowerCase() || "")) {
      finalAssignee = "ChinmayDas";
    } else {
      finalAssignee = await waitForAssignee();
    }

    setAssigneeName?.(finalAssignee);

    const userRes: any = await post("get-assigned-user", { assignedTo: finalAssignee });
    const link = userRes?.data?.calendlyLink;

    if (link) {
      setCalendlyLink?.(link);
      setShowInitialCallSlider?.(false);
      setShowAfterInitialCallbooking?.(false);
      setShowAdvancePaidCallBooking?.(false);
      setShowExpert?.(false);
      setShowCalendlySlider?.(true); // You may need to pass setShowSlider from parent
    } else {
      console.log("No Calendly link found for this user");
    }
  } catch (err) {
    console.error("Error fetching booking or Calendly link:", err);
  }
};
