import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, post } from '../../components/common/api';
import { decryptData, encryptData } from '../../components/common/encryption-decryption';
import { ZohoLeadApi } from '../../components/common/zoho-lead';
import { trackClarityEvent } from '../../helpers/ms-clarity';
import MESSAGES from '../../components/constant/message';
import ToastMessage from '../../components/common/toast-message';
import { TermsConditionsModal } from '../../components/user-registeration/Onboarding2.0/common/helpers';
import LoaderCard from '../../components/user-registeration/Onboarding2.0/common/loader-card';



const OTPPage = () => {
  const initialTime = 60;
  const [seconds, setSeconds] = useState(initialTime);
  const [otp, setOtp] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState({ type: '', content: '' })
  const [isAgreed, setIsAgreed] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const location = useLocation();
  const [mobileNumber, setMobileNumber] = useState("");
  const [onboardingFetched, setOnboardingFetched] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [, setGenerateOtpResult] = useState<any>(null);
  const [, setApiFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [noUanFound, setNoUanFound] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const navigate = useNavigate();

  const isPaymentPage = location.pathname === "/payment-auth/otp";

  useEffect(() => {

    const {mobile_number, getLoginUrl } = location.state || {}
    const appendMobileNumber = "+91" + mobile_number;
    setLoginUrl(getLoginUrl);
    const logedInUrlByUser = decryptData(localStorage.getItem("getLoginUrl"));
    if (logedInUrlByUser) {
      navigate(logedInUrlByUser);
      localStorage.clear();
      return;
    }

    setMobileNumber(appendMobileNumber);
    fetchOnboarding(appendMobileNumber);

    generateOtp(appendMobileNumber);
    console.log(logedInUrlByUser);

  }, []);


  useEffect(() => {
    if (onboardingFetched && mobileNumber) {
      searchLeadByMobile(mobileNumber);
    }
  }, [onboardingFetched]);

  const fetchOnboarding = async (userMobile: any) => {
    try {
      const res = await post("auth/onboarding-data", { mobile_number: userMobile });
      if (res?.success) {
        if (!res?.data?.uan || res?.data?.uan.length === 0) {
          setNoUanFound(true);
        }
        setSelectedOption(res?.data?.onboardingData?.selectedOption);
      }
    } catch (err) {
      console.error("Failed to load onboarding data:", err);
    } finally {
      // Mark onboarding as fetched (success or fail)
      setOnboardingFetched(true);
    }
  };

  const onVerify = async (otpValue = otp) => {
    if (!isAgreed) {
      setMessage({ type: "error", content: "Please accept Terms & Conditions before proceeding." });
      return;
    }
    setShowLoader(true);
    setMessage({ type: '', content: '' })
    setActiveIndex(activeIndex + 1);
    // setIsLoading(true)

    try {
      // verify OTP
      const response = await post('/auth/confirmOtpFixpf', {
        mobile_number: mobileNumber,
        otp: otpValue
      });
      if (response && response.success) {
        setSeconds(0);
        localStorage.removeItem("otpStartTime");
        setSeconds(initialTime);
        setMessage({ type: "success", content: "OTP verified successfully!" });
        trackClarityEvent(MESSAGES.ClarityEvents.RETURNING_USER_SIGN_IN);
        if (!isPaymentPage) {
          localStorage.setItem("isCallBookingUrl", encryptData("true"));
        }
        localStorage.setItem("getLoginUrl", encryptData(loginUrl))
        localStorage.setItem("user_mobile", encryptData(mobileNumber))
        // call zoho API
        zohoUpdateLead("Authenticated user")
        setApiFinished(true);
        if (isPaymentPage && response.message.toLowerCase() === 'user already registered') {
          localStorage.setItem("isPaymentPage", encryptData("true"));
          localStorage.setItem("user_uan", encryptData(response.data));
          localStorage.setItem("is_logged_in_user", encryptData("true"));
          navigate('/payment-initiate');
        }
        else if (response.message.toLowerCase() === 'user already registered') {
          localStorage.setItem("is_logged_in_user", encryptData("true"))
          localStorage.setItem("user_uan", encryptData(response.data))
          navigate('/dashboard', { state: { mobile_number: mobileNumber, processedUan: response.data, noUanFound } })
        } else if (response.message.toLowerCase() === 'bulk updated user') {
          // call fetch data by UAN api 
          const responseUan = await get('/data/fetchByUan/' + response.data);
          if (!responseUan) {
            // setIsLoading(false);
            setShowLoader(false);
            setActiveIndex(activeIndex + 1);
            setMessage({ type: "error", content: MESSAGES.error.generic });
          } else {
            // setIsLoading(false);
            if (!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
              setMessage({ type: "error", content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!" });
              setTimeout(() => {
                navigate("/epfo-down");
              }, 3000);
              return
            }

            const employmentDataSet = [{
              establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
              currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
              userEmpHistoryCorrect: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
              userStillWorkingInOrganization: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
              serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
              isFromFullScrapper: true
            }]

            localStorage.setItem("user_uan", encryptData(response.data))
            zohoUpdateLead("Full Report")
            navigate("/employment-status", { state: { mobile_number: mobileNumber, processedUan: response.data, currentEmploymentUanData: employmentDataSet, type: 'full' } });
          }
        } else {
          // await post('lead/knowlarity-lead', { mobileNumber, tag: "Authenticated user" });
          setTimeout(() => {
            navigate("/enter-name", { state: { mobile_number: mobileNumber } })
            setShowLoader(false);
            setActiveIndex(activeIndex + 1);
          }, 2000)
        }
      } else {
        setShowLoader(false);
        setActiveIndex(activeIndex + 1);
        setMessage({
          type: "error",
          content: response.message || "Incorrect OTP. Please try again.",
        });
      }
    } catch (error) {
      setShowLoader(false);
      setActiveIndex(activeIndex + 1);
      setMessage({
        type: "error",
        content: "Something went wrong. Please try again later.",
      });
    }
  }
  const zohoUpdateLead = async (status: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user?.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user?.CheckMyPF_Intent;

      if (intent.includes("1lakh")) {
        intent = intent.replace(/1lakh/gi, "").trim();
      }

      if (!intent.includes("50K")) {
        intent = intent.length ? `${intent} 50K` : "";
      }

      user.CheckMyPF_Intent = intent;
    }

    if (!user) {
      return;
    }

    if (user) {
      const zohoReqData = {
        Last_Name: user?.Last_Name || 'New Lead',
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: newUser && newUser !== "" ? status : user?.CheckMyPF_Status,
        CheckMyPF_Intent:
          user.CheckMyPF_Intent === "Scheduled"
            ? "Scheduled"
            : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "",
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      await ZohoLeadApi(zohoReqData);
    }
  }



  const searchLeadByMobile = async (mobileNumber: any) => {
    const isUserAlreadyExist = await post('data/searchLead', { mobile: mobileNumber });
    if (isUserAlreadyExist.success) {
      const zohodata = {
        Last_Name: isUserAlreadyExist?.data?.Last_Name,
        Mobile: isUserAlreadyExist?.data?.Mobile,
        Email: isUserAlreadyExist?.data?.Email,
        Wants_To: isUserAlreadyExist?.data?.Wants_To,
        Lead_Status: isUserAlreadyExist?.data?.Lead_Status,
        Lead_Source: isUserAlreadyExist?.data?.Lead_Source,
        Campaign_Id: isUserAlreadyExist?.data?.Campaign_Id,
        CheckMyPF_Status: isUserAlreadyExist?.data?.CheckMyPF_Status,
        CheckMyPF_Intent: isUserAlreadyExist?.data?.CheckMyPF_Intent,
        Total_PF_Balance: isUserAlreadyExist?.data?.Total_PF_Balance,
        Case_Number: isUserAlreadyExist?.data?.Case_Number,
        Call_Schedule: isUserAlreadyExist?.data?.Call_Schedule
      }
      localStorage.setItem("tag_value",isUserAlreadyExist?.data?.Tag?.length > 0 ? encryptData(isUserAlreadyExist?.data?.Tag[0].name) : null)
      localStorage.setItem("case_number", encryptData(isUserAlreadyExist?.data?.Case_Number));
      localStorage.setItem("existzohoUserdata", encryptData(JSON.stringify(zohodata)));
    } else {
      const zohodata = {
        Last_Name: "New Lead",
        Mobile: mobileNumber,
        Email: "",
        Wants_To: "CheckMyPF",
        Lead_Status: "Open",
        Lead_Source: "",
        Campaign_Id: "",
        CheckMyPF_Status: "Authenticated user",
        CheckMyPF_Intent: selectedOption ? selectedOption : "None",
        Total_PF_Balance: "",
        Call_Schedule: ""
      }
      // fetchToggle();
      localStorage.setItem("lead_data", encryptData(JSON.stringify(zohodata)))
    }
  }

  useEffect(() => {
    const storedTime = localStorage.getItem("otpStartTime");

    if (storedTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(storedTime, 10)) / 1000);
      const remainingTime = Math.max(initialTime - elapsedTime, 0);
      setSeconds(remainingTime);
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem("otpStartTime");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerKey]); // <- now useEffect will re-run whenever timerKey changes


  const generateOtp = async (mobileNumber: any) => {
    try {
      setShowLoader(true);
      const response = await post("auth/generateOtpFixMyPf", { mobile_number: mobileNumber });
      setShowLoader(false);
      setSeconds(initialTime);
      trackClarityEvent(MESSAGES.ClarityEvents.FINRIGHT_OTP_TRIGGERED)
      setGenerateOtpResult(response);
    } catch (error) {
      setShowLoader(false);
      setMessage({
        type: "error",
        content: "Oops!! something went wrong, Please try again later!!",
      });
      window.location.href = MESSAGES.CHEKC_MY_PF_URL
    }
  };


  const handleResendOtp = async () => {
    setOtp("")
    setShowLoader(true);
    localStorage.setItem("otpStartTime", Date.now().toString());
    setTimerKey((prev) => prev + 1); // <-- trigger useEffect re-run

    try {
      const response = await post('/auth/generateOtpFixMyPf', { mobile_number: mobileNumber });
      if (response && response.success) {
        trackClarityEvent(MESSAGES.ClarityEvents.FINRIGHT_RESEND_OTP);
        setGenerateOtpResult(response);
      } else {
        setMessage({ type: 'error', content: MESSAGES.error.general });
      }
    } catch (error) {
      setMessage({ type: 'error', content: MESSAGES.error.general });
    } finally {
      setShowLoader(false);
    }
  };

  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      const sanitized = value.replace(/\D/g, "").slice(-1);
      const newOtp = otp.slice(0, index) + sanitized + otp.slice(index + 1);
      if (message.type) setMessage({ type: "", content: "" });
      setOtp(newOtp);

      // ✅ Auto-focus next input if a digit is entered
      if (sanitized && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }

      // ✅ Auto-move cursor back when digit is removed
      if (!sanitized && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }

      // ✅ Trigger verification only when 6 digits entered
      if (newOtp.length === 6 && sanitized) {
        if (!isAgreed) {
          setMessage({
            type: "error",
            content: "Please accept Terms & Conditions before proceeding.",
          });
          return;
        }
        if (seconds > 0) {
          setTimeout(() => {
            onVerify(newOtp);
          }, 500);
        } else {
          setMessage({
            type: "error",
            content: "OTP expired! Please resend and try again.",
          });
        }
      }
    },
    [otp, isAgreed, seconds]
  );

  useEffect(() => {
    if (isAgreed && otp.length === 6) {
      if (seconds > 0) {
        onVerify(otp);
      } else {
        setMessage({
          type: "error",
          content: "OTP expired! Please resend and try again.",
        });
      }
    }
  }, [isAgreed]);





  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {showLoader && (
        <div
          className="fixed-top w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            left: 0,
            top: 0
          }}
        >
          <LoaderCard />
        </div>
      )}
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div
            className="col-12 col-md-4 offset-md-4 p-0 "
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Main Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                padding: "40px 24px",
                maxWidth: "400px",
                margin: "0 auto",
                minHeight: "calc(100vh - 49px)",
              }}
            >
              {/* Title */}
              <span
                style={{
                  fontFamily: "Poppins",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#000000",
                  textAlign: "center",
                }}
              >
                Enter OTP
              </span>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#111627",
                  textAlign: "center",
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                  marginBottom: "30px",
                }}
              >
                OTP sent to number {location.state?.mobile_number} via
                <br />
                WhatsApp and SMS
              </p>

              {/* OTP Input Fields */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "32px",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  width: "100%",   
                  marginTop: "3.5rem",
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && inputRefs.current[index - 1]) {
                        inputRefs.current[index - 1].focus();
                      }
                    }}
                    disabled={seconds === 0}
                    style={{
                      minWidth: "40px",        // ensures it never gets too small
                      maxWidth: "55px",     
                      height: "48px",
                      border: "none",
                      borderBottom: "2px solid #4255CB",
                      fontSize: "24px",
                      fontWeight: "600",
                      textAlign: "center",
                      outline: "none",
                      backgroundColor: "transparent",
                      color: seconds <= 0 ? "#999999" : "#111827",
                      cursor: seconds === 0 ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderBottomColor = "#2E61E1";
                    }}
                  />
                ))}
              </div>

              {/* Countdown Timer */}
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: "#00124F",
                  marginBottom: "36px",
                  textAlign: "center",
                }}
              >
                {seconds > 0 ? (
                  <>
                    Waiting for OTP? Resend in:{" "}
                    <span style={{ color: "#111827", fontWeight: "700" }}>
                      {seconds} secs
                    </span>
                  </>
                ) : (
                  <>
                  <span style={{ color: "#111827", fontWeight: "400" }}>
                    OTP Expired :
                  </span>
                  <button
                    onClick={handleResendOtp}
                    style={{
                      marginLeft: "8px",
                      color: "#6366f1",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                     Resend OTP
                  </button>
                  </>
                )}
              </p>


              {/* Terms and Conditions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  maxWidth: "100%",
                }}
              >
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    marginTop: "2px",
                    accentColor: "#6366f1",
                    cursor: "pointer",
                  }}
                />
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    color: "#00124F",
                    fontFamily: "Poppins",
                  }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    style={{
                      color: "#6366f1",
                      textDecoration: "none",
                    }}
                    onClick={() => setShowTermsModal(true)}
                  >
                    Terms & Conditions and Privacy Policy
                  </a>{" "}
                  of Finright Technologies
                  <br />
                  <br />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "400",
                      color: "#00124F",
                      fontFamily: "Poppins",
                    }}
                  >
                    I consent to Finright to receiving and processing Contact details
                    and EPfO passbook details for 6 months or the service period,
                    whichever comes first.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsConditionsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );

};

export default OTPPage;