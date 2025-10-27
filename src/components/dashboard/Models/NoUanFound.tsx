import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Lottie from "lottie-react";
import fingerprintAnimation from "../../../assets/OTPMicroAnimation.json"
import { LoaderBar } from "../../user-registeration/Onboarding2.0/common/helpers";
import { get, post } from "../../common/api";
import { decryptData, encryptData } from "../../common/encryption-decryption";
import { useLocation } from "react-router-dom";
import ToastMessage from "../../common/toast-message";
 

interface NoUanFoundProps {
  show: boolean;
  onClose: () => void;
  oldMobileNumber: string;
  onEmploymentStatusSuccess: (data: any) => void;
  onManualUANPwsClick?: () => void;
  onToast?: (msg: { type: string; content: string }) => void;
}

const NoUanFound = ({ show, onClose, oldMobileNumber, onEmploymentStatusSuccess, onManualUANPwsClick, onToast }: NoUanFoundProps) => {
  const location = useLocation();
  const {processedUan } = location.state || {};
  const [NewMobile, setNewMobile] = useState("");
  const [buttonText, setButtonText] = useState("Change");
  const [buttonEnabled, setButtonEnabled] = useState(true); // initially true if mobile exists
  const [seconds, setSeconds] = useState(60);

  const [showOtpSlide, setShowOtpSlide] = useState(false);
  const [isMobileSubmitting, setIsMobileSubmitting] = useState(false);   // loader for generating OTP
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);     // loader for verifying OTP
  const [otp, setOtp] = useState("");
  const [, setOtpButtonEnabled] = useState(false);
  const [localProcessedUan, setProcessedUan] = useState(processedUan || "");
  const userUan = decryptData(localStorage.getItem("user_uan")) || processedUan;
  const [message, setMessage] = useState({ type: "", content: "" });

  // Helper to always provide +91 prefixed mobile for external calls/navigation
  const formatWithCountryCode = (m?: string) => {
    if (!m) return "";
    return m.startsWith("+91") ? m : `+91${m}`;
  };
  const formattedMobile = useMemo(() => formatWithCountryCode(NewMobile), [NewMobile]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    setOtp(value);
    setOtpButtonEnabled(value.length === 6 && seconds > 0);
  };


  useEffect(() => {
    if (show) {
      let cleanedNumber = oldMobileNumber || "";
      if (cleanedNumber.startsWith("+91")) {
        cleanedNumber = cleanedNumber.slice(3);
      }
      setNewMobile(cleanedNumber);
      setButtonText("Change");
      setButtonEnabled(cleanedNumber.length > 0);
      setShowOtpSlide(false);
      setIsMobileSubmitting(false);
    }
  }, [show, oldMobileNumber]);

  useEffect(() => {
    let timer: any;
    if (showOtpSlide && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpSlide, seconds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, ""); // allow only numbers
    setNewMobile(numericValue);

    // enable button only if 10 digits AND text is "Proceed"
    if (buttonText === "Proceed") {
      setButtonEnabled(numericValue.length === 10);
    }
  };

  const handleButtonClick = async () => {
    setOtp("");
    if (buttonText === "Change") {
      setNewMobile("");
      setButtonText("Proceed");
      setButtonEnabled(false);
    } else if (buttonText === "Proceed" && buttonEnabled) {
      try {
        setIsMobileSubmitting(true);
        // 🔽 Call your API here
        const response = await post("auth/generateOtpFixMyPf", { mobile_number: oldMobileNumber, uanLinkedPhoneNumber: formattedMobile });
        if(response?.success){
          setIsMobileSubmitting(false);
          setShowOtpSlide(true);
          setSeconds(60); // reset timer
          const m = { type: "success", content: response?.message};
          if (onToast) onToast(m); else setMessage(m);
        } else {
          setIsMobileSubmitting(false);
          const m = { type: "error", content: "Failed to send OTP. Please try again." };
          if (onToast) onToast(m); else setMessage(m);
        }
      } catch (err) {
        setIsMobileSubmitting(false);
        const m = { type: "error", content: "Unable to send OTP due to a technical issue. Please try again." };
        if (onToast) onToast(m); else setMessage(m);
      }
    }
  };

  const handleVerifyOtp = async () => {
    setIsOtpVerifying(true);
    try {
      // call your verify OTP API here
      const response = await post('/auth/confirmOtpFixpf', {
        mobile_number: oldMobileNumber,
        uanLinkedPhoneNumber: formattedMobile,
        otp: otp
      });
      if(response?.success){
        startAgainUserOnboarding();
      } else {
        const m = { type: "error", content: "Invalid OTP. Please try again." };
        if (onToast) onToast(m); else setMessage(m);
        setIsOtpVerifying(false);
      }
    } catch (error) {
      const m = { type: "error", content: "Something went wrong while verifying OTP. Please try again." };
      if (onToast) onToast(m); else setMessage(m);
      setIsOtpVerifying(false);
    } finally {
      // setIsOtpVerifying(false);
    }
  };

  const startAgainUserOnboarding = async () => {
        // If no UAN, fetch
        let finalUan = localProcessedUan || userUan;
        if (!finalUan) {
          try {
            const response = await post("surepass/fetchUanByMobile", { mobile_number: oldMobileNumber, uanLinkedPhoneNumber: formattedMobile });
            if (response?.success && Array.isArray(response.data) && response.data.length) {
              const uan = response.data[0].uan;
              const empName = response.data[0]?.employment_history?.[0]?.name || response?.getAdvancePassbookData?.data?.profile?.fullName || "";
              if(uan){
                localStorage.setItem("uanLinkedPhoneNumber", encryptData(formattedMobile));
                if ((response?.data?.length && response.data[0]?.employment_history?.length) || (response?.getAdvancePassbookData?.data?.serviceHistory?.history?.length)) {
                  const responseUan = await get('/data/fetchByUan/' + uan);
                  const hasEmploymentHistory = !!response?.data[0]?.employment_history?.length;
                  const hasPassbookHistory = !!response?.getAdvancePassbookData?.data?.serviceHistory?.history?.length;
                  const isGetAdvancePassbook = hasPassbookHistory;
                  let normalizedHistory = [];
      
                  if (hasEmploymentHistory) {
                    // Use employment_history directly
                    normalizedHistory = response.data[0].employment_history;
                  } else if (hasPassbookHistory) {
      
                    // Normalize passbook data to resemble employment_history
                    normalizedHistory = [{
                      establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
                      currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
                      userEmpHistoryCorrect: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
                      userStillWorkingInOrganization: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
                      serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
                      isFromFullScrapper: true
                    }]
                  }

                  localStorage.setItem("user_uan", encryptData(uan));
                  localStorage.setItem("isPartialScrape", encryptData(true));
                  setProcessedUan(uan);
                  finalUan = uan;

                  if (empName) {
                    localStorage.setItem("user_name", encryptData(empName));
                  }

                  onEmploymentStatusSuccess({
                    mobile_number: oldMobileNumber,
                    uanLinkedPhoneNumber: formattedMobile,
                    processedUan: response.data[0]?.uan,
                    currentEmploymentUanData: normalizedHistory,
                    type: 'partial',
                    newUIEnabled: true,
                    partialPassbook: isGetAdvancePassbook.toString(),
                  });
                  setIsOtpVerifying(false);
                  setShowOtpSlide(false);
                }
              }         
            } else {
              localStorage.setItem("service_history", JSON.stringify(true));
              if(response.status === 422){
                const m = { type: "error", content: "No UAN found for this mobile number." };
                if (onToast) onToast(m); else setMessage(m);
              }else{
                const m = { type: "error", content: "We are not able to fetch UAN due to technical issues, please change mobile number or enter UAN manually" };
                if (onToast) onToast(m); else setMessage(m);
              }
            }
            // set user as logged in
            localStorage.setItem("is_logged_in_user", encryptData("true"))
          } catch (error) {
            // set user as logged in
            setShowOtpSlide(false);
            setIsOtpVerifying(false);
            localStorage.setItem("is_logged_in_user", encryptData("true"))
            const m = { type: "error", content: "We are not able to fetch UAN due to technical issues, please change mobile number or enter UAN manually" };
            if (onToast) onToast(m); else setMessage(m);
          }
        }
        setShowOtpSlide(false);
        setIsOtpVerifying(false);
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`
      : `${remainingSeconds} sec`;
  };

  const handleResendOtp = async () => {
    if (seconds === 0) {
      setIsMobileSubmitting(true);
      setOtp("")
      // generateOtp(mobile);
      const response = await post("auth/generateOtpFixMyPf", { mobile_number: oldMobileNumber, uanLinkedPhoneNumber: formattedMobile});
      if(response?.success){
        setSeconds(60); // reset timer
      }
    }
    setIsMobileSubmitting(false);
  };
  return (
    <>
        {!onToast && message.type && <ToastMessage message={message.content} type={message.type} />}
        <AnimatePresence>
          {show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              // onClick={onClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 1049,
              }}
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="position-fixed d-flex flex-column"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
                borderTopLeftRadius: "1.25rem",
                borderTopRightRadius: "1.25rem",
                minHeight: "45vh",
                maxHeight: "90vh",
                maxWidth: "31.25rem",
                margin: "0 auto",
                width: "100%",
                padding: "1.25rem",
                zIndex: 1050,
                backgroundColor: "#4255CB",
                color: "#ffffff",
                boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
              }}
              role="dialog"
              aria-modal="true"
            >
              {/* Close */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={onClose}
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  X close
                </button>
              </div>

              {/* Content */}
              {!isMobileSubmitting && !showOtpSlide && (
                <div
                  className="text-center px-3 flex-grow-1"
                  style={{ overflowY: "auto" }}
                >
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      marginTop: "0.3rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No UAN Found
                  </p>

                  <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                    No UAN found linked to This number
                  </p>

                  {/* Input + Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#ffffff",
                      borderRadius: "999px",
                      padding: "0.25rem 0.3rem 0.1rem 0.3rem",
                      gap: "0.5rem",
                      width: "16rem",
                      margin: "0 auto",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter Mobile Number"
                      className="custom-input"
                      value={NewMobile}
                      onChange={handleInputChange}
                      maxLength={10}
                      disabled={buttonText === "Change"}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        fontSize: "1rem",
                        color: "#222",
                        border: "none",
                        borderRadius: "999px",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                    <style>
                      {`
                       .custom-input::placeholder {
                        font-size: 0.7rem;
                        color: #888;
                       }
                     `}
                    </style>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={handleButtonClick}
                      disabled={!buttonEnabled}
                      style={{
                        borderRadius: "999px",
                        border: "none",
                        padding: "0.5rem 1.1rem",
                        backgroundColor:
                          buttonText === "Proceed"
                            ? buttonEnabled
                              ? "#34A853"
                              : "#BCC2E6"
                            : "#BCC2E6",
                        color:
                          buttonText === "Proceed"
                            ? buttonEnabled
                              ? "#fff"
                              : "#00124F"
                            : "#00124F",
                        fontSize: "0.8125rem",
                        cursor: buttonEnabled ? "pointer" : "not-allowed",
                      }}
                    >
                      {buttonText}
                    </button>
                  </div>

                  <p style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                    Add your Aadhaar linked mobile number to fetch your EPF details
                  </p>

                  <p style={{ marginBottom: "1rem" }}>Or</p>

                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill"
                    style={{
                      borderColor: "rgba(255,255,255,0.45)",
                      padding: "0.7rem 1.5rem",
                      fontSize: "1rem",
                      width: "16rem",
                    }}
                  onClick={() => {
                    if (onManualUANPwsClick) onManualUANPwsClick();
                  }}
                  >
                    Add UAN details Manually
                  </button>
                </div>
              )}



              {/* OTP Section */}
              {/* OTP Section */}
              {!isMobileSubmitting && showOtpSlide && !isOtpVerifying && (
                <div
                  className="text-center d-flex flex-column justify-content-center align-items-center"
                  style={{
                    flex: 1,
                    padding: "1rem 0",
                  }}
                >
                  <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Enter OTP</p>
                  <p style={{ fontSize: "1.13rem", marginBottom: "0.3rem" }}>
                    OTP sent to number {NewMobile}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#ffffff",
                      borderRadius: "999px",
                      padding: "0.25rem 0.3rem 0.1rem 0.3rem",
                      gap: "0.5rem",
                      width: "16rem",
                      margin: "0 auto",
                    }}
                  >

                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      maxLength={6}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        fontSize: "1rem",
                        color: "#222",
                        border: "none",
                        borderRadius: "999px",
                        outline: "none",
                        width: "100%",
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={handleVerifyOtp}
                      disabled={!(otp.length === 6 && seconds > 0)}
                      style={{
                        borderRadius: "999px",
                        border: "none",
                        padding: "0.5rem 1.1rem",
                        backgroundColor: otp.length === 6 && seconds > 0 ? "#34A853" : "#BCC2E6",
                        color: otp.length === 6 && seconds > 0 ? "#fff" : "#00124F",
                        fontSize: "0.8125rem",
                        cursor: otp.length === 6 && seconds > 0 ? "pointer" : "not-allowed",
                      }}
                    >
                      Proceed
                    </button>

                  </div>

                  <div
                    className="text-white text-center"
                    style={{
                      fontWeight: 400,
                      fontSize: "0.875rem",
                      lineHeight: "100%",
                      marginTop: "0.5rem",
                    }}
                  >
                    {seconds > 0 ? (
                      <>
                        Waiting for OTP? Resend in :
                        <span className="ms-1" style={{ fontWeight: 700 }}>
                          {formatTime()}
                        </span>
                      </>
                    ) : (
                      <>
                        OTP Expired :
                        <span
                          className="fw-bold ms-1"
                          style={{ fontWeight: 700, cursor: "pointer" }}
                          onClick={handleResendOtp}
                        >
                          Resend OTP
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Fingerprint Loader */}
              {(isMobileSubmitting || isOtpVerifying) && (
                <>
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '7.25rem',
                      height: '7.25rem',
                    }}
                  >
                    <Lottie
                      animationData={fingerprintAnimation}
                      loop
                      autoplay
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <LoaderBar
                    duration={1}
                    titleText= {isMobileSubmitting ? "Verifying Mobile Number" : "Verifying OTP"}
                    footerText="Creating Account..."
                  />
                </>
              )}
            </motion.div>
          </>
      )}
        </AnimatePresence>
  {/* )} */}
    </>
  );
};

export default NoUanFound;

