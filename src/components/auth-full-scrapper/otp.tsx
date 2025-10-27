
import {
  PoweredBy,
  UserRegisterTextContent,
  UserRegistrationSubmitButton,
} from "../../features/user-registration/helpers/ExportingText";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { get, login, post, put } from "../common/api";
import ToastMessage from "../common/toast-message";
import otpPrimary from '../../assets/otpPrimary.svg';
import otpSuccess from '../../assets/otpSuccess.svg';
import otpError from '../../assets/otpError.svg';
import MESSAGES from "../constant/message";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import styles from "./styles/login-uan.module.css"
import { decryptData, encryptData } from "../common/encryption-decryption";
import { setClarityTag } from "../../helpers/ms-clarity";
import { ZohoLeadApi } from "../common/zoho-lead";

const ScrapperOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { uan, password, mobile_number, messageMobile, type, dashboard} = location.state || {};

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [timer, setTimer] = useState(45);
  const [otpTimer, setOtpTimer] = useState(300);
  const [showLoaderMsg, setShowLoaderMsg] = useState<any>('');
  const isMessageActive = useRef(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);
  const [color, setColor] = useState("#004B9A");
  const [imageSrc, setImageSrc] = useState(otpPrimary);
  const [, setZohoUserID] = useState<any>();

  const otpRefs = useRef<Array<HTMLInputElement | null>>([...Array(6)].map(() => null));

  

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Toast Message Auto Clear
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

  const formatTime = () => {
    const minutes = Math.floor(otpTimer / 60);
    const remainingSeconds = otpTimer % 60;

    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`;
    } else if (minutes > 0 && remainingSeconds === 0) {
      return `${minutes}:00 min`;
    } else {
      return `${remainingSeconds} sec`;
    }
  };

  const resendOtp = async (event: any) => {
    setClarityTag("BUTTON_RESEND_OTP", "Login UAN and Password");
    setColor("#004B9A");
    setImageSrc(otpPrimary);
    startProgress();
    setOtp(Array(6).fill(""));
    event.preventDefault();

    if (uan && password) {
      try {
        setIsLoading(true);
        setShowLoaderMsg('Resending OTP, Please Wait...');
        const result = await login(uan, password.trim(), mobile_number);

        if (result.status === 400) {
          setColor("#FF0000");
          setImageSrc(otpError);
          setShowLoaderMsg('Something went wrong, please try again');
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({ type: "error", content: result.message });
        } else {
          setColor("green");
          setImageSrc(otpSuccess);
          setShowLoaderMsg("OTP sent successfully");
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({ type: "success", content: result.message });
          setTimer(45);
        }
      } catch (error: any) {
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
          console.warn('Server Connection Error:', {
            error: error.message,
            code: error.code
          });
          setColor("#FF0000");
          setImageSrc(otpError);
          setShowLoaderMsg('Server connection failed. Please check your connection.');
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({
            type: "error",
            content: "Unable to connect to server. Please check your connection or try again later."
          });
          return;
        }

        setColor("#FF0000");
        setImageSrc(otpError);
        setShowLoaderMsg('Something went wrong, please try again');
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);

        // Handle specific status codes
        switch (error.status) {
          case 503:
            const errorCode = error?.errorCode;
            if (errorCode === "SCRAPPER_DOWN") {
              setMessage({
                type: "error",
                content: "Service is temporarily unavailable. Please try again later.",
              });
            } else if (errorCode === "NETWORK_ERROR") {
              setMessage({
                type: "error",
                content: "Unable to connect to the service. Please check your connection.",
              });
            } else {
              navigate("/epfo-down");
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
              content: error.message || "Invalid request. Please try again."
            });
            break;

          default:
            setMessage({
              type: "error",
              content: error.message || MESSAGES.error.generic
            });
        }
      }
    }
  }

  const handleOtpChange = useCallback((value: any, index: any, data: any) => {
    console.log(data)
    if (/^[0-9]$/.test(value)) {
      const newOtp: any = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Automatically focus the next input
      if (index < 5 && value) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  }, [otp]);

  const handleBackspace = (e: any, index: any) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index] === "" && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          newOtp[index - 1] = "";
          setOtp(newOtp);
          prevInput.focus();
        }
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const startProgress = () => {
    setProgress(0);
    setImageSrc(otpPrimary);
    setColor("#004B9A");
    setOtpTimer(300)
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 200);
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  };


  const zohoUpdateLead = async (status:any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"))
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user.CheckMyPF_Intent;
    
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
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: status === "Full Report" ? "Full Report" : existUser && existUser !== "" ? user?.CheckMyPF_Status : status,
        CheckMyPF_Intent: user?.CheckMyPF_Intent,
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const verifyOtp = async (e: any) => {
    setClarityTag("BUTTON_OTP_VERIFY", "Login UAN and Password");
    e.preventDefault();
    if (otp.every((digit) => digit)) {
      try {
        await put('auth/update-profile', { uan, password });

        startProgress();
        setIsLoading(true);
        setShowLoaderMsg(<span>Verifying OTP, Please Wait...</span>);
        // call submit API
        const result = await post("auth/submit-otp", { otp: otp.join(''), type, uan, password, mobile_number});

        if (result?.status === 400) {
          setColor('#FF0000');
          setImageSrc(otpError);
          setShowLoaderMsg('Invalid OTP.');
          setOtp(Array(6).fill(""));
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({ type: "error", content: result.message });
          return;
        }

        // call fetch data by UAN api 
        const responseUan = await get('/data/fetchByUan/' + uan);
        

        if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
          const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
          // toast.error(errorMsg);
          setMessage({ type: "error", content: errorMsg });
          setColor('#FF0000');
          setImageSrc(otpError);
          setTimeout(() => {
            if(dashboard){
              navigate("/dashboard", {state: {uan}});
            }
            else{
              // window.location.href = MESSAGES.CHEKC_MY_PF_URL;
              // localStorage.clear()
              navigate("/login-uan");
            }
          }, 5000);
          return;
        }

        // return
        setColor("green");
        setImageSrc(otpSuccess);
        setShowLoaderMsg('Verified Successfully!!');
        localStorage.setItem("is_logged_in_user", encryptData("true"))
        localStorage.setItem("user_uan", encryptData(uan))
        localStorage.setItem("user_mobile", encryptData(mobile_number))


        if (!responseUan) {
          setIsLoading(false);
          zohoUpdateLead("EPFO down")
          setMessage({ type: "error", content: MESSAGES.error.generic });
        } else {
          setIsLoading(false);
          const employementDataSet = [{
            establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
            currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            userEmpHistoryCorrect: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
            userStillWorkingInOrganization: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
            serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
            isFromFullScrapper: true
          }]
          zohoUpdateLead("Full Report")
          if (type.toLowerCase() === 'full') {
            navigate("/employment-status", { state: { mobile_number, processedUan: uan, currentEmploymentUanData: employementDataSet, type } });
          } else {
            navigate("/kyc-details", { state: { processedUan: uan, mobile_number, currentUanData: responseUan, currentEmploymentUanData: employementDataSet, type } });
          }
        }
      } catch (error: any) {
        setIsLoading(false)
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
          console.warn('Server Connection Error:', {
            error: error.message,
            code: error.code
          });
          setColor('#FF0000');
          setImageSrc(otpError);
          setShowLoaderMsg('Server connection failed. Please check your connection.');
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({
            type: "error",
            content: "Unable to connect to server. Please check your connection or try again later."
          });
          return;
        }

        setColor('#FF0000');
        setImageSrc(otpError);
        setShowLoaderMsg('Something went wrong, please try again');
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
        setOtp(Array(6).fill(""));
        setTimer(0);

        // Handle specific status codes
        switch (error.status) {
          case 503:
            // Handle service unavailable
            const errorCode = error?.errorCode;
            if (errorCode === "SCRAPPER_DOWN") {
              setMessage({
                type: "error",
                content: "Service is temporarily unavailable. Please try again later.",
              });
            } else if (errorCode === "NETWORK_ERROR") {
              setMessage({
                type: "error",
                content: "Unable to connect to the service. Please check your connection.",
              });
            } else {
              // Only navigate to epfo-down for 503 without error code (EPFO down)
              navigate("/epfo-down");
            }
            break;

          case 500:
            // Handle internal server error
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
    } else {
      setColor('#FF0000');
      setImageSrc(otpError);
      setShowLoaderMsg('Invalid OTP.');
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      setOtp(Array(6).fill(""));
      setMessage({ type: "error", content: MESSAGES.error.invalidOtp });
    }
  };

  return (
    <>
      {isLoading && (
        <div className={`${styles.loaderoverlay} vh-100`}>
          <div className={`${styles.loadercontainer}`}>
            <div style={{ position: "relative", width: "9rem", height: "9rem" }}>
              <CircularProgressbar
                value={progress}
                strokeWidth={5}
                styles={buildStyles({
                  pathColor: color,
                  trailColor: "#d6d6d6",
                  strokeLinecap: "round",
                })}
              />
              <img
                className="loader-img"
                src={imageSrc}
                alt="Loading..."
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "6rem",
                  height: "3rem",
                }}
              />
            </div>
            <p className="loader-text">
              {showLoaderMsg} <span style={{ color: '#304DFF' }}>{formatTime()}</span>
            </p>
          </div>
        </div>
      )}
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {!isLoading &&
        <div className="to-margin-top min-vh-100 d-flex flex-column"
          style={{
            position: "fixed", // Fixes the container in place
            left: 0,
            width: "100%", // Ensures full width
          }}
        >
          <div className=" otp-container d-flex flex-column align-items-center gap-2 py-4 flex-grow-1">
            <UserRegisterTextContent />
            <div className="d-flex flex-column align-items-center gap-3 py-3">

              <div
                className="text-black text-center fw-bold p-2"
                style={{
                  width: '325px',
                  height: '29px'
                }}
              >
                Enter OTP
              </div>

              <div
                className="text-center text-secondary"
                style={{
                  fontWeight: '400',
                  fontSize: '16px',
                  width: '385px'
                }}
              >
                OTP sent to your mobile number {messageMobile}
              </div>

              <div className="d-flex justify-content-center gap-2">
                {otp.map((data: any, index: any) => (
                  <input
                    key={index}
                    type="number"
                    ref={(el: any) => {
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
                      width: '50px',
                      height: '50px',
                      borderRadius: '5px',
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
                  fontSize: '16px',
                  width: '280px'
                }}
              >
                {timer > 1 ? (
                  <>
                    Waiting for OTP? Resend in :
                    <span className="fw-bold ms-1" style={{ color: "#304DFF" }}>
                      {timer} sec
                    </span>
                  </>
                ) : (
                  <>
                    OTP Expired :
                    <span className="fw-bold ms-1" style={{ color: "#304DFF", cursor: "pointer" }} onClick={resendOtp}>
                      Resend OTP
                    </span>
                  </>
                )}
              </div>

              <div className="mb-2"></div>
            </div>
          </div>

          <div className="d-flex justify-content-center mb-2">
            <UserRegistrationSubmitButton disabled={otp.includes("") || timer < 1} onClick={verifyOtp} />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <PoweredBy />
          </div>
          <br /><br /><br />
        </div>
      }
    </>
  );
};

export default ScrapperOtp;