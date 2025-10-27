import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { BiSupport } from 'react-icons/bi';
import ContactUsManager from '../common/ContactUsManager';
import { decryptData, encryptData } from '../common/encryption-decryption';
import { get, login, post, put } from '../common/api';
import { CalendlySlider } from '../dashboard/Models/CalendlySliderModel';
import moment from 'moment';
import { CompleteProfileButton, PFLoadingCard, PFSuccessCard } from '../../helpers/helpers';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import VerifyEpfoPassbookModel from '../user-registeration/Onboarding2.0/models/VerifyEpfoPassbookModel';
import EmployementStatusModel from '../dashboard/Models/employementStatusModel';
import { trackClarityEvent } from '../../helpers/ms-clarity';
import MESSAGES from '../constant/message';
import { useLocation, useNavigate } from 'react-router-dom';
import ToastMessage from '../common/toast-message';
import { formatToISO } from '../../helpers/dates-convertor';
import { ZohoLeadApi } from '../common/zoho-lead';
import LoaderPayment from '../user-registeration/Onboarding2.0/common/loaderPayment';
import CallBookedSlider from '../dashboard/Models/CallBookedModel';
import UrgentProfile from "../../assets/suport-profile.png";
import BookingFaildSlider from '../dashboard/Models/bookingFaildSlider';

interface BookCalendryProps {
  paymentResponse: {
    order_id: string;
    order_amount: number;
    payment_completion_time: string;
    cf_payment_id: string;
    payment_currency: string;
    assigneeName?: string;
    date?: string;
    time?: string;
  };
  hasActiveBooking: boolean;
}

const BookCalendry: React.FC<BookCalendryProps> = ({ paymentResponse, hasActiveBooking }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastName, setLastName] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [showCalendlySlider, setShowCalendlySlider] = useState(false);
  const [bookedDate, setBookedDate] = useState(paymentResponse?.date || "");
  const [bookedTime, setBookedTime] = useState(paymentResponse?.time || "");
  const [amountCurrency, setAmountCurrency] = useState(`${paymentResponse?.order_amount} ${paymentResponse?.payment_currency}` || "");
  const [transactionId, setTransactionId] = useState(paymentResponse?.cf_payment_id || "");
  const [paymentDate, setPaymentDate] = useState(paymentResponse?.payment_completion_time || "");
  const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false)

  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isOtpBypassEnabled, setIsOtpBypassEnabled] = useState(false);
  const [processedUanNumber, setProcessedUanNumber] = useState("");
  const [isEpfoLoading, setEpfoLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState("idle");
  const [credentials, setCredentials] = useState({ uan: "", password: "" });
  // const [mobile_number,] = useState("");
  const [apiDone, setApiDone] = useState(false);
  const [showEmploymentStatusModal, setShowEmploymentStatusModal] = useState(false);
  const [selectedModalData, setSelectedModalData] = useState<ModalData | null>(null);
  const { processedUan, type, name, selectedTags } = location.state || {};

  const stateSelectedTags = selectedTags || decryptData(localStorage.getItem("selected_tags"));
  const stateName = name || decryptData(localStorage.getItem("user_name"));
  const userMobile = decryptData(localStorage.getItem("user_mobile"));
  const [detailsStatus, setDetailsStatus] = useState<string>("");
  const [caseNumber, setCaseNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingRes, setIsBookingRes] = useState(false);
  const [lastAuthSource, setLastAuthSource] = useState<'uanpws' | 'pws' | null>(null);
  const [showBookedSlider, setShowBookedSlider] = useState(false);

  interface ModalData {
    mobile_number: any;
    processedUan: string;
    currentEmploymentUanData: any;
    type: string;
    partialPassbook: any;
    uanLinkedPhoneNumber?: any;
  }

  interface ZohoUpdateLeadParams {
    tag?: string;
    status?: string | null;
    intent?: string | null;
    intentStatus?: "Scheduled" | "Not Scheduled" | null;
    callDate?: string | null;
    callTime?: string | null;
    checkMyPFStatus?: string | null;
  }

  useEffect(() => {
    if (isBookingRes) {
      zohoUpdateLead({
        intentStatus: "Scheduled",
        callDate: bookedDate,
        callTime: bookedTime,
      })
    }
  }, [isBookingRes]);

  const handleVerifyFromUanPws = (uan: string, password: string) => {
    setLastAuthSource('uanpws');
    handleVerify(uan, password);
  };

  const handleVerifyFromPws = (uan: string, password: string) => {
    setLastAuthSource('pws');
    handleVerify(uan, password);
  };

  const zohoUpdateLead = async (
    {
      intent,
      intentStatus,
      callDate,
      callTime,
      status,
      checkMyPFStatus
    }: ZohoUpdateLeadParams) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
    const userBalance = decryptData(localStorage.getItem("user_balance"));

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if (userBalance > 50000 && intent !== undefined && intent !== null && intent.trim() !== "") {
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
        Lead_Status: status && status.trim() !== "" ? status : user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        // CheckMyPF_Status: checkMyPFStatus ? checkMyPFStatus : user?.CheckMyPF_Status,
        CheckMyPF_Status: checkMyPFStatus && checkMyPFStatus.trim() !== "" ? (checkMyPFStatus === "Full Report"
          ? "Full Report" // always update if Full Report
          : !existUser // only update "other statuses" if it's a new user
            ? checkMyPFStatus
            : user?.CheckMyPF_Status // keep old if existing user
        )
          : user?.CheckMyPF_Status,
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


  useEffect(() => {
    const getToggleValue = async () => {
      try {
        const response = await get("/data/toggle/keys");
        const otpByPassToggle = response?.allTogglers?.find((item: any) => item.type === "otp-bypass");
        setIsOtpBypassEnabled(otpByPassToggle?.isEnabled || false);
      } catch (err) { }
    };
    getLeadDetails();
    getToggleValue();
    if (!hasActiveBooking) {
      handleCalendlyEvent();
    }
  }, []);

  const getLeadDetails = async () => {
    setIsSubmitting(true);
    setProcessedUanNumber(decryptData(localStorage.getItem("user_uan")));
    try {
      const userMobile = decryptData(localStorage.getItem("user_mobile"));
      const cleanMobile = userMobile?.replace(/^\+91/, "");
      const searchRes = await post("data/searchLead", { mobile: cleanMobile });
      const lastName = searchRes?.data?.Last_Name;
      const status = searchRes?.data?.Lead_Status;
      setCaseNumber(searchRes?.data?.Case_Number);

      setDetailsStatus(status);
      if (lastName && lastName?.toLowerCase() !== "new lead") {
        setLastName(lastName);
      } else {
        const userName = decryptData(localStorage.getItem("user_name")) || "";
        const cleanedName = userName.replace(/^(mr|mrs|ms|mr.)\.?/i, "").trim();
        setLastName(cleanedName);
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error fetching lead details:", error);
    }
  };

  useEffect(() => {
    setAmountCurrency(`${paymentResponse?.order_amount} ${paymentResponse?.payment_currency}` || "");
    setTransactionId(paymentResponse?.cf_payment_id || "");
    setPaymentDate(paymentResponse?.payment_completion_time || "");
    if (hasActiveBooking) {
      setBookedDate(paymentResponse?.date || "");
      setBookedTime(paymentResponse?.time || "");
    }
  }, [hasActiveBooking, paymentResponse]);

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleCalendlyEvent = async () => {
    const calendlyToggle = decryptData(localStorage.getItem("calendlyToggle") || "") || "";
    const userMobile = decryptData(localStorage.getItem("user_mobile"));
    const bookingRes: any = await post("calendly/check-user-booking", { mobile: userMobile });

    if (bookingRes?.hasActiveBooking && bookingRes?.data) {
      setBookedDate?.(bookingRes.data.date);
      setBookedTime?.(bookingRes.data.time);
      setAssigneeName?.(bookingRes.data.assigneeName);
      setShowBookedSlider?.(true);
      return;
    }

    if(bookingRes?.data?.callbookingStatus?.Assigned_To===null){
      setShowBookingFaildSlider?.(true); 
      return;
    }

    if (calendlyToggle === true) {
      navigate("/booking", { state: { prevRoute: "/payment-initiate" } });
      return;
    }
    try {
      const assigned = "ChinmayDas";
      setAssigneeName(assigned);

      const userRes: any = await post("get-assigned-user", { assignedTo: assigned });
      const link = userRes?.data?.calendlyLink;

      if (link) {
        setCalendlyLink(link);
        setShowCalendlySlider(true);
      } else {
        console.log("No Calendly link found for this user");
      }
    } catch (err) {
      console.error("Error fetching booking or Calendly link:", err);
    }
  };

  const goToLoginPage = () => {
    setLastAuthSource('pws');
    setShowModal({ show: true, type: "verifyEpfoPassbook" });
  };

  const handleVerify = async (uan: any, password: any, setShowModal1?: React.Dispatch<React.SetStateAction<{ show: boolean; type: string }>>) => {
    localStorage.removeItem("otpStartTime");
    setMessage({ type: "", content: "" })
    localStorage.setItem("user_pass", encryptData(password))
    const uanToUse = processedUanNumber?.length === 12 ? processedUanNumber : uan;
    localStorage.setItem("user_uan", encryptData(uanToUse))
    if (uanToUse && password) {
      try {
        setEpfoLoading(true)
        setCredentials({ uan: uanToUse, password: password })
        const uanLinkedPhoneNumber = decryptData(localStorage.getItem("uanLinkedPhoneNumber"));
        const mobileToSend = uanLinkedPhoneNumber ? uanLinkedPhoneNumber : userMobile;
        const oldMobileNumber = uanLinkedPhoneNumber ? userMobile : "";
        const payload = {
          uan: uanToUse,
          password: password.trim(),
          mobile_number: mobileToSend,
          oldMobileNumber,
        };
        const result = await login(payload.uan, payload.password, payload.mobile_number, payload.oldMobileNumber);
        if (result.status === 400) {
          setEpfoLoading(false)
          setScrapingStatus("idle");
          setMessage({ type: "error", content: result.message });
          setTimeout(() => {
            setEpfoLoading(false)
          }, 2000);
        }

        // 🕒 POLLING STARTS HERE
        let retries = 0;
        const maxRetries = 60; // ~3 minutes if interval is 4s
        const pollInterval = 3000;
        let modalTimeout: ReturnType<typeof setTimeout> | null = null;

        if (isOtpBypassEnabled) {
          modalTimeout = setTimeout(() => {
            setShowModal({ show: false, type: "verifyEpfoPassbook" });
            if (setShowModal1) {
              setShowModal1({ show: false, type: "verifyEpfoPassbook" });
            }
            setScrapingStatus("in-progress");
            setEpfoLoading(false);
          }, 10000); // 10 seconds
        }
        const pollStatus = async () => {
          try {
            const loginStatusResponse = await get(`/auth/login-status?uan=${uanToUse}`);
            if (loginStatusResponse?.data?.status === "success") {
              if (modalTimeout) clearTimeout(modalTimeout);
              setTimeout(async () => {
                setEpfoLoading(false)
                if (isOtpBypassEnabled) {
                  setApiDone(true)
                  setShowModal({ show: false, type: "verifyEpfoPassbook" });
                  handleByPassOtp(uanToUse)
                } else {
                  trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_SENT);
                  setMessage({ type: "success", content: loginStatusResponse?.data?.message });
                  setApiDone(true)
                  setShowModal({ show: true, type: "verifyEpfoPassbookOtp" });
                  // if (!currentUanData?.rawData?.isScrappedFully) {
                  // }
                }
              }, 2000);
            } else if (loginStatusResponse?.data?.status === "failed") {
              if (loginStatusResponse?.data?.message === "Either UAN or Password is incorrect") {
                setShowModal({
                  show: true,
                  type: "verifyEpfoPassbook",
                  disableAutoVerification: true,
                  lastAuthSource: lastAuthSource || "pws",
                });
              }
              if (modalTimeout) clearTimeout(modalTimeout);
              setScrapingStatus("idle");
              setMessage({ type: "error", content: loginStatusResponse?.data?.message || MESSAGES.error.generic });
              setTimeout(() => {
                setEpfoLoading(false);
              }, 3000);
              if (loginStatusResponse?.data?.statusCode >= 500) {
                // navigate("/epfo-down")
                setMessage({ type: "error", content: loginStatusResponse?.data?.message || "EPFO servers are not responding, Please try again later!!" });
                return;
              }
            } else {
              // Still pending or processing
              if (++retries < maxRetries) {
                setTimeout(pollStatus, pollInterval);
              } else {
                setMessage({ type: "error", content: MESSAGES.error.generic });
                setTimeout(() => setEpfoLoading(false), 2000);
              }
            }
          } catch (err: any) {
            if (modalTimeout) clearTimeout(modalTimeout);
            setMessage({ type: "error", content: err?.message });
            setTimeout(() => {
              setEpfoLoading(false);
            }, 3000);
            // navigate("/epfo-down")
          }
        };

        // Start first poll
        pollStatus();
      } catch (error: any) {
        console.log(error)
        setEpfoLoading(false)
        setMessage({ type: "error", content: error?.message });
        setShowModal({ show: false, type: "verifyEpfoPassbookOtp" });

        if (error.status >= 500) {
          // navigate("/epfo-down")
          setMessage({ type: "error", content: error?.message || "EPFO servers are not responding, Please try again later!!" });
        }
      }
    }
  };


  const handleByPassOtp = async (uan: any) => {

    setShowModal({ show: false, type: "verifyEpfoPassbook" });

    try {
      setScrapingStatus("in-progress"); // Start scraping

      // Update password
      await put('auth/update-profile', { uan, password: credentials.password });

      // Fetch data by UAN
      const responseUan = await get('/data/fetchByUan/' + uan);
      // setCurrentUanData(responseUan);

      if (responseUan?.rawData?.data?.error?.trim()) {
        const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
        setMessage({ type: "error", content: errorMsg });
        setScrapingStatus("idle");
        setTimeout(() => navigate("/login-uan"), 5000);
        return;
      }

      // Save session data
      localStorage.setItem("is_logged_in_user", encryptData("true"));
      localStorage.setItem("user_uan", encryptData(uan));
      // localStorage.setItem("user_mobile", encryptData(mobile_number));
      const isPartialScrape = decryptData(localStorage.getItem("isPartialScrape"))

      // Validate fetched data
      if (!responseUan?.rawData?.data?.home ||
        !responseUan?.rawData?.data?.serviceHistory?.history ||
        !responseUan?.rawData?.data?.passbooks ||
        !responseUan?.rawData?.data?.profile ||
        !responseUan?.rawData?.data?.claims) {
        setMessage({ type: "error", content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!" });
        setScrapingStatus("idle");
        return;
      }

      setScrapingStatus("complete"); // Done
      zohoUpdateLead({
        status: "Details received - Full", checkMyPFStatus: "Full Report"
      })
      if (typeof type === 'undefined' || type?.toLowerCase() === 'full') {
        if (!isPartialScrape) {
          const employmentDataSet = [{
            establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
            currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            userEmpHistoryCorrect: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            userStillWorkingInOrganization: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
            isFromFullScrapper: true
          }];

          trackClarityEvent(MESSAGES.ClarityEvents.FULL_REPORT_GENERATED);
          setShowEmploymentStatusModal(true);
          setSelectedModalData({
            mobile_number: userMobile,
            processedUan: uan,
            currentEmploymentUanData: employmentDataSet,
            type: "newui",
            partialPassbook: false
          });
        } else {
          // setShowModal({ show: true, type: 'kycContinue' });
          try {
            const uanProfile = responseUan?.profileData?.data;
            const empDetails = responseUan?.rawData?.data?.home?.currentEstablishmentDetails;
            const uanLinkedPhoneNumber = decryptData(localStorage.getItem("uanLinkedPhoneNumber"))
            const dataToSend: any = {
              type: "full",
              uan: uan,
              userMobileNumber: (uanProfile?.phoneNumber || "").toString().replace(/^91/, ""),
              establishment_name: empDetails?.establishmentName,
              currentOrganizationMemberId: empDetails?.memberId,
              userEmpHistoryCorrect: !!empDetails?.memberId,
              userStillWorkingInOrganization: !!empDetails?.memberId,
              serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
              isFromFullScrapper: true,
              uanLinkedPhoneNumber: uanLinkedPhoneNumber ? uanLinkedPhoneNumber : ""
            };

            const withdrawabilityCheckUpReportResponse = await post("withdrawability-check", dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
              trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
              navigate("/dashboard", { state: { mobile_number: userMobile, processedUan: uan, type: "full" } });
            } else {
              navigate(0);
            }
          } catch (e) {
            navigate(0);
          }
        }
      }
    } catch (error: any) {
      console.error("Scraping error", error);
      setScrapingStatus("idle");

      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        setMessage({
          type: "error",
          content: "Unable to connect to server. Please check your connection or try again later."
        });
        return;
      }

      switch (error.status) {
        case 503:
          if (error?.errorCode === "SCRAPPER_DOWN") {
            zohoUpdateLead({
              status: "", checkMyPFStatus: "EPFO down"
            })
            setMessage({
              type: "error",
              content: "Service is temporarily unavailable. Please try again later.",
            });
          } else if (error?.errorCode === "NETWORK_ERROR") {
            setMessage({
              type: "error",
              content: "Unable to connect to the service. Please check your connection.",
            });
          } else {
            // navigate("/epfo-down");
            return;
          }
          break;

        case 500:
          setMessage({
            type: "error",
            content: "An internal server error occurred. Please try again later.",
          });
          break;

        case 400:
          setMessage({
            type: "error",
            content: MESSAGES.error.invalidOtpServer
          });
          break;

        default:
          setMessage({
            type: "error",
            content: error.message || MESSAGES.error.generic
          });
      }
    }
  };

  return (
    <>
      {isSubmitting ? (
        <LoaderPayment
        />
      ) : (
        <div style={{ minHeight: '94vh', backgroundColor: '#E6ECFF', paddingTop: '2rem' }}>
          <div className="container">
            {message.type && <ToastMessage message={message.content} type={message.type} />}
            <div className="row">
              <div className="col-md-4 offset-md-4">

                {/* Back Button */}
                <button onClick={handleBackClick} className="btn p-0 mb-4 d-flex align-items-center"
                  style={{ fontSize: '1rem', color: '#000', background: 'none', border: 'none', gap: '0.45rem', cursor: 'pointer', fontWeight: '500' }}>
                  <FaArrowLeft size={16} />
                  <span>Back to PF report</span>
                </button>

                {/* Success Icon */}
                <motion.div className="position-relative d-flex align-items-center justify-content-center mb-3 mt-2 mx-auto"
                  style={{ width: "4.375rem", height: "4.375rem" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="position-absolute rounded-circle"
                    style={{ width: "5.5rem", height: "5.5rem", backgroundColor: "#34A85333" }} />
                  <div className="position-absolute rounded-circle"
                    style={{ width: "4.3rem", height: "4.3rem", backgroundColor: "#34A85333" }} />
                  <div className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "3.125rem", height: "3.125rem", backgroundColor: "#34A853", zIndex: 2 }}>
                    <FaCheck size={"1rem"} color="#ffffff" />
                  </div>
                </motion.div>

                <div className="mt-3 mb-2">
                  {scrapingStatus === 'in-progress' && (
                    <PFLoadingCard text="We are updating your details..." />
                  )}

                  {scrapingStatus === 'complete' && (
                    <PFSuccessCard />
                  )}
                </div>
                {/* Header */}
                <div className="text-center mb-3">
                  <p className="fw-semibold mb-2" style={{ fontSize: '1.13rem', color: '#000', fontWeight: '500' }}>
                    {hasActiveBooking ? "Call Scheduled" : "Case Initiated"}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.81rem' }}>
                    {hasActiveBooking
                      ? "Call successfully scheduled, please be available as per the scheduled time"
                      : "Amazing! you have taken the first step towards getting your claim settled"}
                  </p>
                </div>

                <div className="card shadow-sm mb-3" style={{ border: 'none', borderRadius: '0.9rem', backgroundColor: '#f8fcfc' }}>
                  <div className="card-body p-4">

                    {/* Case Details */}
                    {transactionId ? <div className="mb-4">
                      <p className="fw-medium mb-2" style={{ fontSize: '0.81rem', fontWeight: '500' }}>Your Case Details</p>
                      <div style={{ fontSize: "0.81rem" }}>
                        {[
                          ["Case ID", caseNumber],
                          ["Amount", amountCurrency || ""],
                          ["Transaction ID", transactionId || ""],
                          ["Date - Time", moment(paymentDate).format("DD-MM-YYYY HH:mm:ss") || ""],
                        ].map(([label, value], index) => (
                          <div key={index} style={{ display: "flex", padding: "0.5rem 0", borderBottom: "1px solid #EAEAEA" }}>
                            <div style={{ minWidth: "9.5rem", fontWeight: 500 }}>{label}</div>
                            <div style={{ flex: 1 }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div> :
                      <p className="text-center mt-2" style={{ fontSize: "1rem", fontWeight: "700", color: "#FD5C5C" }}>For Transaction details please reach out to Support</p>
                    }


                    {/* Conditional Block */}
                    {hasActiveBooking || bookedDate?.length > 0 ? (
                      <>
                        <p className="text-center mt-2" style={{ fontSize: "1rem", fontWeight: "700", color: "#2463EB" }}>Call Scheduled</p>
                        <div style={{ fontSize: "0.81rem" }}>
                          {[
                            ["Date", bookedDate || "-"],
                            ["Time", bookedTime || "-"],
                          ].map(([label, value], index) => (
                            <div key={index} style={{ display: "flex", padding: "0.5rem 0", borderBottom: "1px solid #EAEAEA" }}>
                              <div style={{ minWidth: "9.5rem", fontWeight: 500 }}>{label}</div>
                              <div style={{ flex: 1 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        {(detailsStatus && detailsStatus.toLowerCase() !== "details received - full") && (

                          <div className="mt-3 text-center">
                            <p
                              className="mb-2"
                              style={{
                                fontSize: '0.95rem',
                                color: '#858585',
                                lineHeight: '1.2'
                              }}> Our experts are ready </p>
                            <p
                              style={{
                                fontSize: '0.9rem',
                                color: '#FD5C5C',
                                fontWeight: '700'
                              }}
                            >Complete your profile for Next step</p>

                            <div
                              className="card border-0 shadow-sm mt-3"
                              style={{
                                padding: "0.625rem",
                                paddingBottom: "1rem",
                                borderRadius: "1rem",
                                display: "flex",
                                backgroundColor: "#fff",
                                flexDirection: "column",
                                gap: "0.25rem",
                              }}
                            >
                              <div className="d-flex justify-content-end align-items-center mb-1">
                                <BsExclamationTriangleFill
                                  style={{
                                    color: "#FF3B30",
                                    fontSize: "var(--fs-title-card-title)",
                                    marginRight: "0.25rem",
                                  }}
                                />
                                <span
                                  className="text-end"
                                  style={{
                                    color: "#FF3B30",
                                    fontSize: "var(--fs-title-card-title)",
                                  }}
                                >
                                  20% Profile Complete
                                </span>
                              </div>

                              <div
                                style={{
                                  height: "0.5rem",
                                  width: "100%",
                                  backgroundColor: "#E5E5E5",
                                  borderRadius: "1rem",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: "25%",
                                    height: "100%",
                                    backgroundColor: "#FF3B30",
                                    borderRadius: "1rem 0 0 1rem",
                                  }}
                                ></div>
                              </div>

                              <div className="text-center">
                                <p
                                  style={{
                                    fontSize: "var(--fs-title-card-title)",
                                    fontWeight: 400,
                                    lineHeight: "1.25rem",
                                    marginBottom: 0,
                                  }}
                                >
                                  Ensure your PF withdrawals are protected
                                </p>
                              </div>

                              <CompleteProfileButton text="Complete Profile Now"
                                onClick={goToLoginPage}
                              />
                            </div>
                          </div>
                        )}
                      </>

                    ) : (
                      <>
                        <p className="text-center mb-2" style={{ fontSize: '0.95rem', color: '#858585', lineHeight: '1.2' }}>
                          Your case Plan of action is ready
                        </p>
                        <div className="text-center">
                          <p style={{ fontSize: '0.9rem', color: '#FD5C5C', fontWeight: '700' }}>
                            Book a call Now to take the next step
                          </p>
                        </div>
                        <button onClick={handleCalendlyEvent}
                          className="btn w-100 text-white"
                          style={{ backgroundColor: '#122A7B', fontSize: '1rem', fontWeight: '500', padding: '0.75rem', borderRadius: '0.5rem', border: 'none' }}>
                          Book a Call Now
                        </button>
                      </>

                    )}

                    {/* Contact Us */}
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <div>
                        <p className="mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>Facing issues? we are</p>
                        <p className="mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>there for you</p>
                      </div>
                      <ContactUsManager
                        trigger={
                          <div className="d-flex align-items-center gap-2 px-2 py-1 fw-medium"
                            style={{ fontSize: "0.75rem", border: "1px solid rgba(133, 133, 133, 0.5)", borderRadius: "5px", cursor: "pointer" }}>
                            <div className="d-flex align-items-center justify-content-center"
                              style={{ backgroundColor: "#B2F2E7", borderRadius: "50%", padding: "4px" }}>
                              <BiSupport size={14} color="#000" />
                            </div>
                            <span style={{ color: "#000" }}>Contact Us</span>
                          </div>
                        }
                      />
                    </div>

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
                          setIsBookingRes(true);
                        }}
                      />
                    )}
                    <CallBookedSlider
                      show={showBookedSlider}
                      onClose={() => setShowBookedSlider(false)}
                      bookedDate={bookedDate || ""}
                      bookedTime={bookedTime || ""}
                      assignedExpert={assigneeName || "PF Expert"}
                      profileImage={UrgentProfile}
                    />

                    <BookingFaildSlider
                      show={showBookingFaildSlider}
                      onClose={() => setShowBookingFaildSlider(false)}
                      onBookCall={handleCalendlyEvent}
                    />

                    {showModal.show && showModal.type === "verifyEpfoPassbook" && (
                      <VerifyEpfoPassbookModel
                        setShowModal={setShowModal}
                        processedUan={processedUanNumber || processedUan}
                        onVerify={handleVerify}
                        onVerifyFromUanPws={handleVerifyFromUanPws}
                        onVerifyFromPws={handleVerifyFromPws}
                        lastAuthSource={lastAuthSource || undefined}
                        disableAutoVerification={(showModal as any)?.disableAutoVerification}
                        noUanFound={!(processedUanNumber || processedUan)}
                        onEmploymentStatusSuccess={(data: any) => {
                          setSelectedModalData({
                            mobile_number: data?.mobile_number,
                            uanLinkedPhoneNumber: data?.uanLinkedPhoneNumber,
                            processedUan: data?.processedUan,
                            currentEmploymentUanData: data?.currentEmploymentUanData,
                            type: data?.type,
                            partialPassbook: data?.partialPassbook,
                          });
                          setShowEmploymentStatusModal(true);
                          setShowModal({ show: false, type: "verifyEpfoPassbook" });
                        }}
                        epfoLoading={isEpfoLoading}
                        selectedTags={stateSelectedTags}
                        name={stateName}
                        apiDone={apiDone}
                      />
                    )}

                    {showEmploymentStatusModal && selectedModalData && (
                      <EmployementStatusModel
                        setShowModal={setShowEmploymentStatusModal}
                        modalData={selectedModalData}
                      />
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      )}
    </>
  );
};

export default BookCalendry;

