// Modal Component - VerifyEpfoPassbookOtpModal.tsx
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { FaCheck } from "react-icons/fa6";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { EPFLoaderBar } from "../common/helpers";
import Lottie from "lottie-react";
import fingerprintAnimation from "../../../../assets/OTPMicroAnimation.json"
import slideLogo from "../../../../assets/logoImage.png"

const initialTime = 45;

interface VerifyEpfoPassbookOtpModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<any>>;
  onVerifyOtp: (otp: string) => void;
  onResendOtp: () => void;
  onRetryLogin: (uan: string, password: string) => void;
  epfoLoading: boolean;
  apiDone?: boolean;
  mobileNumber?: string;
  credentials?: any
}

const VerifyEpfoPassbookOtpModal: React.FC<VerifyEpfoPassbookOtpModalProps> = ({
  setShowModal,
  onVerifyOtp,
  onResendOtp,
  onRetryLogin,
  epfoLoading,
  apiDone,
  mobileNumber,
  credentials
}) => {
  const [seconds, setSeconds] = useState(initialTime);
  const [otp, setOtp] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [resendOtpClicked, setResendOtpClicked] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
  }, [timerKey]); 
  

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`
      : `${remainingSeconds} sec`;
  };

 
  const handleResendOtp = () => {
    localStorage.setItem("otpStartTime", Date.now().toString());
    setTimerKey(45); 
    setResendOtpClicked(true);
    onResendOtp()
  };
 
  const handleRetry = async () => {
    setOtp("") 
    setResendOtpClicked(false);
    await onRetryLogin(credentials?.uan, credentials?.password)
    localStorage.setItem("otpStartTime", Date.now().toString());
    setSeconds(initialTime);
    setTimerKey(45);
  };  

  const onVerify = (otp: any) => {
    if (otp.length === 6) {
      onVerifyOtp(otp);
    }
  };

  const handleOtpChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setOtp(sanitized);
    setTimeout(() => {
      if (sanitized.length === 6 && seconds > 0) {
        onVerify(sanitized); 
      }
    }, 500);
  }, [seconds]);

  

  return (
    <div className="position-relative text-center">
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100 shadow-lg"
        style={{
          zIndex: 1050,
          maxWidth: "500px",
          height: '45vh',
          backgroundColor: "#304DFF",
          color: "#ffffff",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
        initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 10 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
      >
        {epfoLoading ?
        <div className="px-4 py-4" style={{ height: "45vh" }}>
           <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ width: '7.25rem', height: '7.25rem' }}
                >
                  <Lottie
                    animationData={fingerprintAnimation}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
         <div className="mb-auto mt-5">
           <EPFLoaderBar duration={12} apiCompleted={apiDone} />
         </div>
         </div>     
        : (
        <motion.div
          className="d-flex flex-column align-items-center justify-content-center px-4 py-4 text-center"
          style={{ height: "100%" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mt-4"
                  style={{ width: '4.5rem', height: '4.5rem', }}
                >
                  <img
                    src={slideLogo}
                    alt="uan-member-logo"
                    className="img-fluid rounded-circle border border-3"
                  />
                  {/* <Lottie
                    animationData={fingerprintAnimation}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  /> */}
                </div>

          <div
            className="d-flex align-items-center justify-content-center mt-3"
            style={{ fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", gap: "0.25rem" }}
            onClick={() => setShowModal({ show: false, type: "" })}
          >
            <FiChevronsLeft /> Skip for now <FiChevronsRight />
          </div>
          {/* <div style={{ flexGrow: 1 }} /> */}

          <div  className="mt-auto" style={{ fontSize: "1.125rem", fontWeight: 400, marginBottom: "0.5rem" }}>
            OTP sent to number {mobileNumber}
          </div>

          <div className="d-flex align-items-center justify-content-center">
            <input
              type="text"
              className="form-control"
              maxLength={6}
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              style={{
                width: "14.5rem",
                borderRadius: "6.25rem",
                padding: "0.625rem 1.875rem",
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: 400,
                marginRight: "0.75rem",
              }}
              placeholder="Enter OTP"
            />

            <button
              className={`btn ${seconds === 0 || otp.length !== 6 ? 'disabled' : 'clickeffect'}`}
              onClick={onVerify}
              disabled={seconds == 0 || otp.length !== 6}
              style={{
                border: 'none',
                backgroundColor: seconds === 0 || otp.length !== 6 ? '#ccc' : '#34A853',
                borderRadius: '50%',
                width: '2.5rem',
                height: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaCheck size={20} color="white" />
            </button>
          </div>

          <div className="text-center mb-auto" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ffffff", marginTop: "0.5rem" }}>
            {seconds > 0 ?
              <>
                Waiting for OTP?
                <span className="ms-1" style={{ fontWeight: 700 }}>
                  {formatTime()}
                </span><br/>
                {!resendOtpClicked ?
                  <>
                    <span className="fw-bold ms-1" style={{ fontWeight: 700, cursor: "pointer" }} onClick={handleResendOtp}>
                      Resend
                    </span><br />
                  </> : " "
                }
              </>
              :
              <span className="fw-bold ms-1" style={{ fontWeight: 700, cursor: "pointer" }} onClick={handleRetry}>
                Retry
              </span>
            }
            {/* {seconds > 0 ? (
              <>Waiting for OTP? Resend in : <span className="ms-1" style={{ fontWeight: 700, color: '#000000' }}>{formatTime()}</span></>
            ) : (
              <>OTP Expired : <span className="fw-bold ms-1" style={{ fontWeight: 700, cursor: "pointer", color: '#000000' }} onClick={handleResendOtp}>Resend OTP</span></>
            )} */}
          </div>
        </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEpfoPassbookOtpModal;