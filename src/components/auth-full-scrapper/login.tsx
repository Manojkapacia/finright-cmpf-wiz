import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles/login-uan.module.css"
import { DataEncryption } from "../../features/user-registration/helpers/ExportingText"
import { CustomButtonArrow, CustomOutlinedButtonWithIcons } from "../../helpers/helpers"
import { useEffect, useRef, useState } from "react";
import thumbPrimary from "./../../assets/thumbPrimary.svg";
import thumbSuccess from "./../../assets/thumbSuccess.svg";
import thumbError from "./../../assets/thumbError.svg";
import { ExtractMobile } from "../common/extract-mobile";
import { login } from "../common/api";
import { setClarityTag } from "../../helpers/ms-clarity";
import { useForm } from "react-hook-form";
import ToastMessage from "../common/toast-message";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { decryptData } from "../common/encryption-decryption";
// import { ZohoLeadApi } from "../common/zoho-lead";
// import { decryptData } from "../common/encryption-decryption";


const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { type = 'full', currentUan,dashboard} = location.state || {}

  const [loading, setLoading] = useState(false);

  const [color, setColor] = useState("#004B9A");
  const [imageSrc, setImageSrc] = useState(thumbPrimary);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const intervalRef = useRef<any>(null);
  const [breakCount, setBreakCount] = useState(0);
  const [, setBreakCount2] = useState(0);
  const [mobile_number, setMobileNumber] = useState()

  interface FormData {
    uan: string;
    password: string;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(()=>{
    const user_mobile = decryptData(localStorage.getItem('user_mobile'));
    setMobileNumber(user_mobile);
  },[]);

  // const zohoUpdateLead = async (status: any, intent: any) => {
  //     const rawData = decryptData(localStorage.getItem("lead_data"));
  //     const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
  //     const userName = decryptData(localStorage.getItem("user_name"))
  
  //     const newUser = rawData ? JSON.parse(rawData) : null;
  //     const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
  //     const user = existUser || newUser;
  
  //     if (!user) {
  //       return;
  //     }
  
  //     if (user) {
  //       const zohoReqData = {
  //         Last_Name: userName || user?.Last_Name,
  //         Mobile: user?.Mobile,
  //         Email: user?.Email,
  //         Wants_To: user?.Wants_To,
  //         Lead_Status: user?.Lead_Status,
  //         Lead_Source: user?.Lead_Source,
  //         Campaign_Id: user?.Campaign_Id,
  //         CheckMyPF_Status: status,
  //         CheckMyPF_Intent: intent
  //       };
  //       ZohoLeadApi(zohoReqData);
  //     }
  //   }

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


  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: FormData) => {
    setClarityTag("BUTTON_LOGIN", "Login UAN and Password");
    const uanToUse = currentUan?.length === 12 ? currentUan : data.uan;
    if (uanToUse && data.password) {
      try {
        setLoading(true);
        startProgress();
        const result = await login(uanToUse, data.password.trim(),mobile_number);
        if (result.status === 400) {
          setMessage({ type: "error", content: result.message });
          setColor('#FF0000');
          setImageSrc(thumbError);
          setTimeout(() => {
            setLoading(false);
          }, 1500);

        } else {
          setColor('green');
          setImageSrc(thumbSuccess);
          setTimeout(() => {
            const messageMobile = ExtractMobile(result.message)
            navigate("/submit-otp-scrapper", { state: { uan:uanToUse , password: data.password.trim(), mobile_number, messageMobile, type, dashboard} });
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


  useEffect(() => {
    const height = window.innerHeight;
    if (height > 700) {
      setBreakCount(3);
    } else if (height > 650) {
      setBreakCount(2);
    }
    else if (height > 600) {
      setBreakCount(1);
    }
  }, []);

  useEffect(() => {
    const height = window.innerHeight;
    if (height > 700) {
      setBreakCount2(2);
    } else if (height > 600) {
      setBreakCount2(1);
    }
  }, []);

  const handleConnectNow = () => {
    navigate('/how-can-help', {state: {currentUan}})
  }
  const [isMobile, setIsMobile] = useState(window.innerWidth < 550);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 550);
    };

    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
                <span>Verifying Credentials, Please Wait...</span>
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
          //  minHeight: "calc(90vh - 40px)", // subtract navbar height
          height: "100vh",
          position: "fixed",
          paddingTop: "1.4rem",
          paddingBottom: "1.2rem",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <div className="user-register-text text-start ">
          {/* <p className="title fw-semibold text-dark text-center">Connect Your EPFO Account</p> */}
          {/* <p className="subtitle fw-semibold pe-2 ps-2 text-center">
                 Link your EPFO passbook to get insights to your PF fund
               </p> */}
          <p
            className={`title text-dark text-start ${isMobile ? "mt-5" : ""}`}
            style={{ fontSize: "1.69rem", fontWeight: "500" }}
          >
            Verify with EPFO Password
          </p>

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
            {!isMobile && (
              [...Array(breakCount)].map((_, idx) => (
                <br key={idx} />
              ))
            )}

            <div className={`input-group px-2 ${isMobile ? "mt-4" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
              <label className="input-label" style={{ fontSize: "1rem", fontWeight: 400 }}>UAN</label>
              {currentUan?.length === 12 ? (

                <span style={{ fontSize: "1.2rem", fontWeight: 600 }}>{currentUan}</span>

              ) : (
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
              )}
              {errors.uan && <span className="text-danger">{errors.uan.message}</span>}
            </div>

            <div className="input-group mt-2 px-2 position-relative mb-3">
             {currentUan?.length !== 12 && <label className="input-label d-block" style={{ fontSize: "1rem", fontWeight: 400 }}>Enter Password</label>}

              <div className="position-relative w-100">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter EPFO Password"
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

            {!isMobile && (
              [...Array(breakCount)].map((_, idx) => (
                <br key={idx} />
              ))
            )}
            {/* <div className="d-flex justify-content-center mt-2">
                   <CustomButton name="Login" />
                 </div>
     
                 <div className="text-center mt-2">
                   <DataEncryption />
                 </div> */}
            <div className={`d-flex flex-column align-items-center w-100 mb-2 ${isMobile ? "mt-5" : ""}`} style={{ maxWidth: "22rem" }}>
              <CustomButtonArrow name="Verify" />
              <div className="text-center">
                <DataEncryption />
              </div>
              {/* <p className="fw-semibold mt-2" style={{ fontSize: "0.9rem" }}>
                     Or
                   </p> */}

              {isMobile && (<p className="help-text text-center mb-1" style={{ fontSize: "0.75rem", color: "#858585",  marginTop: currentUan?.length !== 12 ? "5rem" : "6rem",}}>
                Need quick help on PF Withdrawal or Transfer ?
              </p>)}
              {!isMobile && (<p className="text-center mb-1" style={{ fontSize: "0.75rem", color: "#858585", marginTop: currentUan?.length !== 12 ? "3rem" : "5rem"}}>
                Need quick help on PF Withdrawal or Transfer ?
              </p>)}
              <CustomOutlinedButtonWithIcons name="Connect Now" onClick={handleConnectNow} />

            </div>

          </form>

        </div>
      </div>
    </>
  );
};

export default Login;
