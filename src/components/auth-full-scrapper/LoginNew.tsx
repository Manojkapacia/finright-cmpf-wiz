import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles/login-uan.module.css"
import { DataEncryption } from "../../features/user-registration/helpers/ExportingText"
import { CustomButton, CustomOutlinedButtonWithIcons } from "../../helpers/helpers"
import { useEffect, useRef, useState } from "react";
import thumbPrimary from "./../../assets/thumbPrimary.svg";
import thumbSuccess from "./../../assets/thumbSuccess.svg";
import thumbError from "./../../assets/thumbError.svg";
import { get, login, put } from "../common/api";
import { useForm } from "react-hook-form";
import ToastMessage from "../common/toast-message";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { decryptData, encryptData } from "../common/encryption-decryption";
import MESSAGES from "../constant/message";
import { ZohoLeadApi } from "../common/zoho-lead";
import { ExtractMobile } from "../common/extract-mobile";
import { trackClarityEvent } from "../../helpers/ms-clarity";

const LoginNew = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { type = 'full', currentUan, mobile_number } = location.state || {}

  const [loading, setLoading] = useState(false);

  const [color, setColor] = useState("#004B9A");
  const [imageSrc, setImageSrc] = useState(thumbPrimary);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [breakCount, setBreakCount] = useState(0);
  const [breakCount2, setBreakCount2] = useState(0);
  const [credentials, setCredentials] = useState({ uan: "", password: ""});
  const [isOtpBypassEnabled, setIsOtpBypassEnabled] = useState(false)
  const isMessageActive = useRef(false);

  const intervalRef = useRef<any>(null);
  interface FormData {
    uan: string;
    password: string;
  }

  useEffect(() => {
    if (message.type) {
      isMessageActive.current = true; // Set active state when a message is displayed
      const timer = setTimeout(() => {
          setMessage({ type: "", content: "" });
          isMessageActive.current = false; // Reset active state
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const LoginMessages = {
    required: {
      requiredField: (field: string) => `${field} is required`,
    },
    error: {
      password: {
        length: "Password must be at least 8 characters long",
        upperCase: "Password must contain at least one uppercase letter",
        lowerCase: "Password must contain at least one lowercase letter",
        specialCharacter: "Password must include at least one special character",
      },
    },
  };

  const getToggleValue = async () => {
    try {
      const allToggles = await get("/data/toggle/keys");
      const otpByPassToggle = allToggles?.find((item:any) => item.type === "otp-bypass")
      console.log(otpByPassToggle)
      setIsOtpBypassEnabled(otpByPassToggle.isEnabled)
    } catch (err) {
    }
  }

  useEffect(() => {
    const height = window.innerHeight;
    if (height > 700) {
      setBreakCount(3);
    }else if(height > 650){
      setBreakCount(2);
    }
     else if (height > 600) {
      setBreakCount(1);
    }

    // get toggle value for otp
    getToggleValue()
  }, []);

  useEffect(() => {
    const height = window.innerHeight;
    if (height > 700) {
      setBreakCount2(2);
    }else if(height > 600){
      setBreakCount2(1);
    }   
  }, []);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: FormData) => {    
    setMessage({ type: "", content: "" });
    if (data) {
      try {
        setLoading(true);
        startProgress();
        setCredentials({uan: data.uan, password: data.password})
        const result = await login(data.uan, data.password.trim(), mobile_number);
        if (result.status === 400) {
          setMessage({ type: "error", content: result.message });
          setColor('#FF0000');
          setImageSrc(thumbError);
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        } else {
          setColor('green');
          setImageSrc(thumbSuccess);
          trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_SENT);
          setTimeout(() => {
            // segregate function call / navigation basis on toggle value for OTP
            if(isOtpBypassEnabled) {
              handleByPassOtp()
            } else {
              const messageMobile = ExtractMobile(result.message)
              navigate("/submit-otp-scrapper", { state: { uan: data.uan, password: data.password.trim(), mobile_number, messageMobile, type } });
            }
            setLoading(false);
          }, 1500);
        }
      } catch (error: any) {
        setMessage({ type: "error", content: error?.status === 401 ? "Invalid Credentials" : error?.message });
        setColor('#FF0000');
        setImageSrc(thumbError);
        setTimeout(() => {
          setLoading(false);
        }, 3000);
        if (error.status >= 500) {
          navigate("/epfo-down")
        }
      }
    }
  };

  const startProgress = () => {
    setProgress(0);
    setImageSrc(thumbPrimary);
    setColor("#004B9A");

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 100);
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

  const handleByPassOtp = async () => {
    try {
        // to update the password
        await put('auth/update-profile', { uan: credentials.uan, password: credentials.password });

        // call fetch data by UAN api 
        const responseUan = await get('/data/fetchByUan/' + credentials.uan);        

        if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
          const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
          setMessage({ type: "error", content: errorMsg });
          setColor('#FF0000');
          setImageSrc(thumbError);
          setTimeout(() => {
            navigate("/login-uan");
          }, 5000);
          return;
        }

        // return
        setColor("green");
        setImageSrc(thumbSuccess);
        localStorage.setItem("is_logged_in_user", encryptData("true"))
        localStorage.setItem("user_uan", encryptData(credentials.uan))
        localStorage.setItem("user_mobile", encryptData(mobile_number))


        if (!responseUan) {
          setLoading(false);
          zohoUpdateLead("EPFO down")
          setMessage({ type: "error", content: MESSAGES.error.generic });
        } else {
          setLoading(false);
          if(!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
            setMessage({ type: "error", content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!" });          
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
            navigate("/employment-status", { state: { mobile_number, processedUan: credentials.uan, currentEmploymentUanData: employmentDataSet, type } });
          } else {
            navigate("/kyc-details", { state: { processedUan: credentials.uan, mobile_number, currentUanData: responseUan, currentEmploymentUanData: employmentDataSet, type } });
          }
        }
      } catch (error: any) {
        setLoading(false)
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
          console.warn('Server Connection Error:', {
            error: error.message,
            code: error.code
          });
          setColor('#FF0000');
          setImageSrc(thumbError);
          setMessage({type: "error", content: 'Server connection failed. Please check your connection.'});
          setTimeout(() => {
            setLoading(false);
          }, 3000);
          setMessage({
            type: "error",
            content: "Unable to connect to server. Please check your connection or try again later."
          });
          return;
        }

        setColor('#FF0000');
        setImageSrc(thumbError);
        setMessage({type: "error", content: 'Something went wrong, please try again'});
        setTimeout(() => {
          setLoading(false);
        }, 3000);

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
  };

  return (
    <>
      {loading && (
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
                className={`${styles.loaderimg}`}
                src={imageSrc}
                alt="Loading..."
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "6rem",
                  height: "6rem",
                }}
              />
            </div>
            <p className={`${styles.loadertext}`}>
              {imageSrc === thumbPrimary &&
                <span>
                  {isOtpBypassEnabled
                    ? 'Verifying and Fetching Details, Please Wait...'
                    : 'Verifying Details, Please Wait...'}
                </span>              
              }
              {imageSrc === thumbSuccess &&
                <span>Success!</span>
              }
              {imageSrc === thumbError &&
                <span>Login Failed</span>
              }
            </p>
          </div>
        </div>
      )}
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      <div
        className="to-margin-top d-flex flex-column align-items-center gap-2"
        style={{
          // minHeight: "calc(100vh - 40px)", // subtract navbar height
          position: "fixed",
          paddingTop: "1.4rem",
          paddingBottom: "1.2rem",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <div className="user-register-text text-center p-2">
          <p className="title fw-semibold text-dark text-center">Connect Your EPFO Accounttttt</p>
          {/* <p className="subtitle fw-semibold pe-2 ps-2 text-center">
            Link your EPFO passbook to get insights to your PF fund
          </p> */}
        </div>

        <div className=" w-100 px-3" style={{ maxWidth: "400px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <div className="text-center">
              <img
                src={Epf_Member_Logo}
                alt="uan-member-logo"
                className="img-fluid rounded-circle border border-3"
                style={{ width: "100px", height: "100px" }}
              />
            </div> */}
             {[...Array(breakCount2)].map((_, idx) => (
        <br key={idx} />
      ))}

            <div className="input-group px-2 mt-2">
              <label className="input-label" style={{ fontSize: "1rem", fontWeight: 400 }}>Your UAN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter Epfo Number"
                className={`input-box ${currentUan?.length === 12 ? "text-secondary opacity-1 cursor-not-allowed" : ""}`}

                autoComplete="off"
                maxLength={12}
                value={currentUan?.length === 12 ? currentUan : watch("uan")}
                readOnly={currentUan?.length === 12}
                onInput={(e) => {
                  if (!currentUan || currentUan.length !== 12) {
                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 12);
                  }
                }}
                {...register("uan", {
                  required: "UAN is required",
                  pattern: {
                    value: /^\d{12}$/,
                    message: "UAN must be exactly 12 digits",
                  },
                })}
              />
              {errors.uan && <span className="text-danger">{errors.uan.message}</span>}
            </div>

            <div className="input-group mt-2 px-2 position-relative mb-3">
              <label className="input-label d-block" style={{ fontSize: "1rem", fontWeight: 400 }}>Enter Password</label>

              <div className="position-relative w-100">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Epfo Password"
                  className="input-box pe-5"
                  {...register("password", {
                    validate: (value) => {
                      if (!value) return LoginMessages.required.requiredField("Password");
                      if (value.length < 8) return LoginMessages.error.password.length;
                      if (!/[A-Z]/.test(value)) return LoginMessages.error.password.upperCase;
                      if (!/[a-z]/.test(value)) return LoginMessages.error.password.lowerCase;
                      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return LoginMessages.error.password.specialCharacter;
                      return true;
                    },
                  })}
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: 'pointer' }}
                  onClick={togglePasswordVisibility}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
                <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{ cursor: 'pointer' }}>
                  <i className="fa fa-eye-slash"></i>
                </span>
              </div>
              {errors.password && <span className="text-danger">{errors.password.message}</span>}

              <div className="text-end labelSubHeading w-100 mt-1">
                <span style={{ cursor: 'pointer', color: "#304DFF" }}
                  onClick={() => navigate("/forgot-password", { state: { currentUan } })}>
                  Forgot Password
                </span>
              </div>
            </div>

            {[...Array(breakCount)].map((_, idx) => (
            <br key={idx} />
              ))}
            {/* <div className="d-flex justify-content-center mt-2">
              <CustomButton name="Login" />
            </div>

            <div className="text-center mt-2">
              <DataEncryption />
            </div> */}
            <div className="d-flex flex-column align-items-center w-100 mb-2" style={{ maxWidth: "22rem" }}>

              <CustomButton name="Login" />
              <div className="text-center">
                <DataEncryption />
              </div>
              <p className="fw-semibold mt-2" style={{ fontSize: "0.9rem" }}>
                Or
              </p>

              <p className="text-center mb-1" style={{ fontSize: "1rem", color: "#858585", marginTop: "-1rem" }}>
                Get in touch with PF expert
              </p>
              <CustomOutlinedButtonWithIcons name="Connect Now" />
            </div>

          </form>
          
        </div>
      </div>
    </>
  );
};

export default LoginNew;
