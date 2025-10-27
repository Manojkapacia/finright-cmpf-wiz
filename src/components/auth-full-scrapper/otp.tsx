
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
import { UrgentHelpCard } from "../dashboard/Dashboard2.o/UrgentHelpCard";
import UrgentProfile from "../../assets/suport-profile.png"
import { FaExclamationCircle } from "react-icons/fa";
import { ZohoLeadApi } from "../common/zoho-lead";
import { trackClarityEvent } from "../../helpers/ms-clarity";

const ScrapperOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { uan, password, mobile_number, type, dashboard } = location.state || {};

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
  const [showUrgentHelpCard, setShowUrgentHelpCard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds
  const otpRefs = useRef<Array<HTMLInputElement | null>>([...Array(6)].map(() => null));
  const [isScrapperBypassEnabled, setIsScrapperBypassEnabled] = useState(false)
  const [resendOtpClicked, setResendOtpClicked] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) return; // stop when timer hits 0

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 15) {
      setShowUrgentHelpCard(true);
    }
  }, [timeLeft]);

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

  const formatTime = (sec: any) => {
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;

    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`;
    } else if (minutes > 0 && remainingSeconds === 0) {
      return `${minutes}:00 min`;
    } else {
      return `${remainingSeconds} sec`;
    }
  };

  const resendOtp = async (event: any) => {
    setResendOtpClicked(true)
    setShowUrgentHelpCard(true);
    setColor("#004B9A");
    setImageSrc(otpPrimary);
    startProgress();
    setOtp(Array(6).fill(""));
    event.preventDefault();

    if (uan && password) {
      try {
        setIsLoading(true);
        setShowLoaderMsg('Resending OTP, Please Wait...');
        const result = await post("/auth/resend-scrapper-otp", { uan, mobile_number });

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

  const retryLogin = async (event: any) => {
    setResendOtpClicked(false)
    setShowUrgentHelpCard(true);
    setColor("#004B9A");
    setImageSrc(otpPrimary);
    startProgress();
    setOtp(Array(6).fill(""));
    event.preventDefault();

    if (uan && password) {
      try {
        setIsLoading(true);
        setShowLoaderMsg('Verifying credentials, Please Wait...');
        const result = await login(uan, password.trim(), mobile_number);

        if (result.status === 400) {
          setColor("#FF0000");
          setImageSrc(otpError);
          setShowLoaderMsg('Something went wrong, please try again');
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({ type: "error", content: result.message });
        } 

        // 🕒 POLLING STARTS HERE
        let retries = 0;
        const maxRetries = 60; // ~3 minutes if interval is 4s
        const pollInterval = 3000;

        const pollStatus = async () => {
          try {
            const loginStatusResponse = await get(`/auth/login-status?uan=${uan}`);

            if (loginStatusResponse?.data?.status === "success") {
              setColor("green");
              setImageSrc(otpSuccess);
              setShowLoaderMsg("OTP sent successfully");
              setTimeout(() => {
                setIsLoading(false);
              }, 3000);
              setMessage({ type: "success", content: "OTP sent successfully to your registered mobile number" });
              setTimer(45);
            } else if (loginStatusResponse?.data?.status === "failed") {
              setMessage({ type: "error", content: loginStatusResponse?.data?.message || MESSAGES.error.generic });
              setColor('#FF0000');
              setImageSrc(otpError);
              setTimeout(() => {
                setIsLoading(false);
              }, 3000);
              if (loginStatusResponse?.data?.statusCode >= 500) {
                navigate("/epfo-down")
              }
            } else {
              // Still pending or processing
              if (++retries < maxRetries) {
                setTimeout(pollStatus, pollInterval);
              } else {
                // setMessage({ type: "error", content: MESSAGES.error.generic });
                setColor("#FF0000");
                setImageSrc(otpError);
                setTimeout(() => setIsLoading(false), 500);
                navigate("/epfo-down")
              }
            }
          } catch (err:any) {
            setMessage({ type: "error", content: err?.message });
            setColor('#FF0000');
            setImageSrc(otpError);
            setTimeout(() => {
              setIsLoading(false);
            }, 3000);
            navigate("/epfo-down")
          }
        };

        // Start first poll
        pollStatus();        
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

  const zohoUpdateLead = async (status: any) => {
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
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const getToggleValue = async () => {
    try {
      const response = await get("/data/toggle/keys");
      const scrapperBypassToggle = response?.allTogglers?.find((item: any) => item.type === "scrapper-toggle")
      setIsScrapperBypassEnabled(scrapperBypassToggle.isEnabled)
    } catch (err) { }
  }

  useEffect(() => {
    getToggleValue()
  }, [])

  const verifyOtp = async (e: any) => {
    e.preventDefault();
    if (otp.every((digit) => digit)) {
      const payload = {
        otp: otp.join(''),
        type,
        uan,
        password,
        mobile_number,
      };
      try {
        await put('auth/update-profile', { uan, password });
        if (isScrapperBypassEnabled) {
          navigate("/dashboard", {
            state: {
              processedUan: uan,
              type, // 'full' or 'kyc'
              mobile_number,
              payload,
            }
          });
        } else {
          startProgress();
          setIsLoading(true);
          setShowLoaderMsg(<span>Verifying OTP, Please Wait...</span>);
          // call submit API
          const result = await post("auth/submit-otp", { otp: otp.join(''), type, uan, password, mobile_number });
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
          try {
            console.log(uan)
            const responseUan = await get('/data/fetchByUan/' + uan);
            console.log(responseUan)
            if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
              const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
              // toast.error(errorMsg);
              setMessage({ type: "error", content: errorMsg });
              setColor('#FF0000');
              setImageSrc(otpError);
              setTimeout(() => {
                if (dashboard) {
                  navigate("/dashboard", { state: { uan } });
                }
                else {
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
            trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_VERIFIED);
            localStorage.setItem("is_logged_in_user", encryptData("true"))
            localStorage.setItem("user_uan", encryptData(uan))
            localStorage.setItem("user_mobile", encryptData(mobile_number))


            if (!responseUan) {
              setIsLoading(false);
              zohoUpdateLead("EPFO down")
              setMessage({ type: "error", content: MESSAGES.error.generic });
            } else {
              setIsLoading(false);
              if (!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
                setColor('#FF0000');
                setImageSrc(otpError);
                setShowLoaderMsg('EPFO servers are down or not responding. Redirecting...');
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
              zohoUpdateLead("Full Report")
              if (type.toLowerCase() === 'full') {
                trackClarityEvent(MESSAGES.ClarityEvents.FULL_REPORT_GENERATED);
                navigate("/employment-status", { state: { mobile_number, processedUan: uan, currentEmploymentUanData: employmentDataSet, type } });
              } else {
                navigate("/kyc-details", { state: { processedUan: uan, mobile_number, currentUanData: responseUan, currentEmploymentUanData: employmentDataSet, type: "null" } });
              }
            }
          } catch (error) {
            console.log(error)
          }

        }
      } catch (error: any) {
        console.log(error)
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

  // const handleCallBackClick = () => {
  //   navigate("/epfo-down", {
  //     state: {
  //       checkMyPFStatus: "EPFO Down"
  //     }
  //   });
  // };

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
              {showLoaderMsg} <span style={{ color: '#304DFF' }}>{formatTime(otpTimer)}</span>
            </p>
          </div>
        </div>
      )}
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {!isLoading &&
        // <div className="to-margin-top min-vh-100 d-flex flex-column"
        <div className={`to-margin-top ${!showUrgentHelpCard ? "min-vh-100" : ""}d-flex flex-column`}
          style={{
            position: `${!showUrgentHelpCard ? 'fixed' : 'relative'}`, // Fixes the container in place
            left: 0,
            // backgroundColor: "#F7F9FF",
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
                OTP sent to registered mobile number
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
                {timer > 1 ?
                  <>
                    Waiting for OTP?
                    <span className="fw-bold ms-1" style={{ color: "#304DFF" }}>
                      {formatTime(timer)}
                    </span><br/>
                    {!resendOtpClicked ?
                      <>                        
                        <span className="fw-bold ms-1" style={{ color: "#304DFF", cursor: "pointer" }} onClick={resendOtp}>
                          Resend
                        </span><br />
                      </> : " "
                    }                    
                  </>
                  :
                  <span className="fw-bold ms-1" style={{ color: "#304DFF", cursor: "pointer" }} onClick={retryLogin}>
                    Retry
                  </span>
                }
              </div>
            </div>
          </div>
          {showUrgentHelpCard && (
            <>
              <center>
                <div
                  className="card border-0 shadow-sm p-3"
                  style={{
                    backgroundColor: "#FEE6E6",
                    borderRadius: "1rem",
                    padding: "0.625rem",
                    maxWidth: "345px",
                    display: "flex",
                    marginTop: "-1.2rem",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.75rem", // gap between icon and text
                  }}
                >
                  <FaExclamationCircle color="#FF0000" className="fs-4" style={{ flexShrink: 0 }} />

                  <div style={{ display: "flex", flexDirection: "column", textAlign: "start" }}>
                    <span
                      style={{
                        color: "#FF0000",
                        fontSize: "0.875rem", // 14px
                        fontWeight: 600,
                        lineHeight: "100%",
                      }}
                    >
                      Not getting OTP?
                    </span>

                    <span
                      className="mt-2"
                      style={{
                        fontSize: "0.8125rem", // 13px
                        fontWeight: 400,
                        lineHeight: "100%",
                      }}
                    >
                      EPFO servers are facing very high fail rates right now. We recommend trying again after 30 mins
                    </span>
                  </div>
                </div>
              </center>
              {/* <UrgentHelpCard imageUrl={UrgentProfile} onCallBackClick={handleCallBackClick} bgcolor={false} /> */}
              <UrgentHelpCard imageUrl={UrgentProfile} bgcolor={false} />
            </>
          )}
          <div className="d-flex justify-content-center mb-2">
            <UserRegistrationSubmitButton disabled={otp.includes("") || timer < 1} onClick={verifyOtp} />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <PoweredBy />
          </div>
          {!showUrgentHelpCard && (
            <>
              <br /><br /><br />
            </>)}
        </div>
      }
    </>
  );
};

export default ScrapperOtp;