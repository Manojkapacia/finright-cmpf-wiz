import {
  PoweredBy,
  UserRegisterTextContent,
  UserRegistrationSubmitButton,
} from "../../features/user-registration/helpers/ExportingText";
import { CircularLoading } from "./Loader";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { post } from "../common/api";
import "../styles/UserRegisteration.css"
import { decryptData, encryptData } from "../common/encryption-decryption";
import ToastMessage from "../common/toast-message";
import { setClarityTag } from "../../helpers/ms-clarity";
import { ZohoLeadApi } from "../common/zoho-lead";
import MESSAGES from "../constant/message";

const initialTime = 60;

const EnterOtp = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [seconds, setSeconds] = useState(initialTime);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([...Array(6)].map(() => null));
  const [message, setMessage] = useState({ type: '', content: '' })
  const [generateOtpResult, setGenerateOtpResult] = useState<any>(null);
  const isMessageActive = useRef(false);
  const [mobileNumber, setMobileNumber] = useState<any>();
  const [, setZohoUserID] = useState<any>();

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (message.type) {
      isMessageActive.current = true;
      const timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
        isMessageActive.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // formating timer
  useEffect(() => {
    const storedTime = localStorage.getItem("otpStartTime");
    if (storedTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(storedTime, 10)) / 1000);
      const remainingTime = Math.max(initialTime - elapsedTime, 0);
      setSeconds(remainingTime);
    } else {
      localStorage.setItem("otpStartTime", Date.now().toString());
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
  }, [initialTime]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`
      : `${remainingSeconds} sec`;
  };

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
    let extractedCampaignId: any;
    let extractedLeadSource: any;
    let extractedMobile: any;

    const queryParams = new URLSearchParams(window.location.search);
    const encodedMobileNumber = queryParams.get("mobile_number");
    const encodedCampaignId = queryParams.get("campaign_id");
    const encodedLeadSource = queryParams.get("lead_source");
    extractedMobile = encodedMobileNumber ? atob(encodedMobileNumber) : "";
    extractedCampaignId = encodedCampaignId ? atob(encodedCampaignId) : "";
    extractedLeadSource = encodedLeadSource ? atob(encodedLeadSource) : "Organic";
    const appendMobileNumber = "+91" + extractedMobile;
    searchLeadByMobile(extractedMobile, extractedLeadSource, extractedCampaignId)
    setMobileNumber(appendMobileNumber)
    generateOtp(appendMobileNumber);
  }, []);

  const searchLeadByMobile = async(mobileNumber:any, leadSource:any, campaignId: any) => {
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
          CheckMyPF_Intent : isUserAlreadyExist?.data?.CheckMyPF_Intent,
          Total_PF_Balance: isUserAlreadyExist?.data?.Total_PF_Balance
        }
        
        localStorage.setItem("existzohoUserdata", encryptData(JSON.stringify(zohodata)));
      } else {
        const zohodata = {
          Last_Name: "New Lead",
          Mobile: mobileNumber,
          Email: "",
          Wants_To: "CheckMyPF",
          Lead_Status: "Open",
          Lead_Source: leadSource || "",
          Campaign_Id: campaignId || "",
          CheckMyPF_Status: "Authenticated user",
          CheckMyPF_Intent: "None",
          Total_PF_Balance: ""
        }
        localStorage.setItem("lead_data", encryptData(JSON.stringify(zohodata)))
      }
  }

  const generateOtp = async (mobileNumber: any) => {
    
    setClarityTag("BUTTON_CONTINUE", "select UAN list");
    try {
      setIsLoading(true);
      const response = await post("auth/generateOtpFixMyPf", { mobile_number: mobileNumber });
      setGenerateOtpResult(response);
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false);
      setMessage({
        type: "error",
        content: "Oops!! something went wrong, Please try again later!!",
      });
      window.location.href = MESSAGES.CHEKC_MY_PF_URL
    }
  };

  const zohoUpdateLead = async () => {
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
        CheckMyPF_Status: newUser && newUser !== "" ? "Authenticated user" : user?.CheckMyPF_Status,
        CheckMyPF_Intent: user?.CheckMyPF_Intent,
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const handleOtpChange = useCallback((value: string, index: number, data: any) => {
    console.log(data)
    if (/^[0-9]$/.test(value)) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = value;

        // Move to next input
        if (index < 5 && value) {
          otpRefs.current[index + 1]?.focus();
        }

        return newOtp;
      });
    }
  }, []);

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        if (newOtp[index] === "" && index > 0) {
          newOtp[index - 1] = "";
          otpRefs.current[index - 1]?.focus();
        } else {
          newOtp[index] = "";
        }
        return newOtp;
      });
    }
  };

  const handleResendOtp = async () => {
    setClarityTag("BUTTON_RESEND_OTP", "enter otp secreen after select Uan");
    setSeconds(60);
    setOtp(Array(6).fill(""));

    try {
      setIsLoading(true)
      const response = await post('/auth/generateOtpFixMyPf', { mobile_number: mobileNumber });
      if (response && response.success) {
        setIsLoading(false)
        setGenerateOtpResult(response);
      } else {
        setIsLoading(false);
        setMessage({ type: 'error', content: MESSAGES.error.general })
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', content: MESSAGES.error.general })
    }
  };

  const verifyOtp = async () => {
    setClarityTag("BUTTON_OTP_VERIFY", "enter otp secreen after select Uan");
    setIsLoading(true)
    setSeconds(0)

    localStorage.removeItem("otpStartTime");
    setSeconds(initialTime);

    try {
      // verify OTP
      const response = await post('/auth/confirmOtpFixpf', { mobile_number: mobileNumber, otp: otp.join('') });
      if (response && response.success) {        
        localStorage.setItem("is_logged_in_user", encryptData("true"))
        localStorage.setItem("user_mobile", encryptData(mobileNumber))
        // call zoho API
        zohoUpdateLead()
        
        if(response.message.toLowerCase() === 'user already registered') {
          navigate('/dashboard', { state: { mobile_number: mobileNumber, processedUan: response.data } })
        } else {
          // Delay Knowlarity API call by 5 minutes
        setTimeout(async () => {
          try {
            await post('lead/knowlarity-lead', { mobileNumber, tag: "Authenticated user" });
          } catch (error) {
            console.error("Error calling Knowlarity API after 5 minutes:", error);
          }
        }, 5 * 60 * 1000);
          navigate("/searching-uan", { state: { mobile_number: mobileNumber }})
        }
      } else {
        setIsLoading(false);
        setMessage({ type: 'error', content: response.message || MESSAGES.error.general })
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', content: MESSAGES.error.general })
    }
  }

  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {isLoading && <CircularLoading />}
      {!isLoading &&
        <div className="to-margin-top min-vh-100 d-flex flex-column gap-3 py-4 "
          style={{
            position: "fixed",
            left: 0,
            width: "100%"
          }}
        >
          <div className=" d-flex flex-column align-items-center flex-grow-1">
            <UserRegisterTextContent />
            <br />

            <div className="d-flex flex-column align-items-center gap-3 py-3">
              <div
                className="text-black text-center fw-bold p-2"
                style={{
                  width: '20.3125rem', // 325px -> rem
                  height: '1.8125rem' // 29px -> rem
                }}
              >
                Enter OTP
              </div>

              <div
                className="text-center text-secondary"
                style={{
                  fontWeight: '400',
                  fontSize: '1rem', // 16px ->rem
                  width: '24.0625rem' // 385px -> rem
                }}
              >
                {generateOtpResult?.message}
              </div>
              <div className="d-flex justify-content-center gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="number"
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    id={`otp-input-${index}`}
                    maxLength={1}
                    value={otp[index]}
                    autoComplete="off"
                    onChange={(e) => handleOtpChange(e.target.value, index, data)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    className="text-center border-0 border-bottom border-dark"
                    style={{
                      width: '3.125rem', //50px->rem
                      height: '3.125rem', //50px
                      borderRadius: '0.3125rem', //5px
                      boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                      borderBottomWidth: '2.5px',
                      backgroundColor: '#FFFFFF',
                      appearance: "none",
                    }}
                  />
                ))}
              </div>
              <div
                className="text-center"
                style={{
                  fontWeight: '400',
                  fontSize: '1rem',//16px->rem
                  width: '18.75rem' //300px->rem
                }}
              >
                {seconds > 0 ? (
                  <>
                    Waiting for OTP? Resend in :
                    <span className="fw-bold ms-1" style={{ color: "#304DFF" }}>
                      {formatTime()}
                    </span>
                  </>
                ) : (
                  <>
                    OTP Expired :
                    <span className="fw-bold ms-1" style={{ color: "#304DFF", cursor: "pointer" }} onClick={handleResendOtp}>
                      Resend OTP
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-auto  mb-2">
            <UserRegistrationSubmitButton disabled={otp.includes("") || seconds === 0} onClick={verifyOtp} />
          </div>
          <div className="d-flex justify-content-center  mb-3">
            <PoweredBy />
          </div>
          <br /><br />
        </div>
      }
    </>
  );
};

export default EnterOtp;