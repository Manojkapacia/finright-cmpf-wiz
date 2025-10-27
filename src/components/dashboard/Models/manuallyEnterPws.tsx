import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { decryptData } from "../../common/encryption-decryption";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { get } from "../../common/api";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface ManuallyEnterPwsProps {
  show: boolean;
  processedUan: string;
  onClose: () => void;
  onVerify: (uan: string, password: string) => void;
  autoLogin?: boolean;
  defaultPassword?: string;
  disableAutoVerification?: boolean;
  currentUanData?: any;
  emptyPageData?: any;
  selectedTags?: string[];
  name?: string;
  apiDone?: boolean;
}

interface FormData {
  uan: string;
  password: string;
}

const ManuallyEnterPws = ({ show, processedUan, onClose, onVerify, autoLogin, defaultPassword, disableAutoVerification }: ManuallyEnterPwsProps) => {

   const [showPassword, setShowPassword] = useState(false);
    const [, setotpSuccessiveEnable] = useState<boolean | null>(null);
    const [, setTextChange] = useState(false);
    const navigate = useNavigate();
    const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    clearErrors,
  } = useForm<FormData>({ mode: "onSubmit", defaultValues: { uan: "", password: "" } });
  const passwordValue = watch("password") || "";
  const hasAnyPasswordInput = passwordValue.length > 0;
  
    // Prevent background scroll while modal is open
    useEffect(() => {
      getToggleValue()
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);
  
    const hasAutoFired = useRef(false);
    useEffect(() => {
      if (autoLogin && !hasAutoFired.current && processedUan && defaultPassword) {
        hasAutoFired.current = true;
        onVerify(processedUan, defaultPassword);
      }
    }, [autoLogin, processedUan, defaultPassword, onVerify]);
  
    const handleManualVerify = () => {
      const values = getValues();
      const uanToSend = processedUan || values?.uan;
      onVerify(uanToSend, values?.password);
    };
  
    const hasVerifiedOnce = useRef(false);
  
  useEffect(() => {
    const savedPassword = decryptData(localStorage.getItem("password"));
  
  
    if (!disableAutoVerification && !hasVerifiedOnce.current && savedPassword && processedUan) {
      hasVerifiedOnce.current = true;
      setTextChange(true);
      onVerify(processedUan, savedPassword);
    }
  }, [processedUan, onVerify]);
  
  const getToggleValue = async () => {
    try {
      const response = await get("/data/toggle/keys");
      const otpSuccessiveToggal = response?.allTogglers?.find((item:any) => item.type === "epfo_status");
      setotpSuccessiveEnable(otpSuccessiveToggal?.isEnabled);
    } catch (err) { }
  }
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
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
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute", // make it float on top-right
              top: "1rem",
              right: "1rem",
              color: "#fff",
              background: "transparent",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            X close
          </button>

          {/* Content */}

          {/* Show when having UAN number */}

          {processedUan && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // vertical center
              alignItems: "center", // horizontal center
              textAlign: "center",
              width: "100%"
            }}
          >
            <p style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>Complete your profile</p>
            <p style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>
             Fetch your EPF account details
            </p>

            {/* Input + Button Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                borderRadius: "999px",
                padding: "0.25rem 0.3rem",
                gap: "0.5rem",
                width: "100%",
                maxWidth: "16rem",
                boxSizing: "border-box",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter EPFO Password"
                className="custom-input"
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
                {...register("password", {
                  validate: (value) => {
                    if (!value) return "Password is required";
                    if (value.length < 8) return "Minimum 8 characters required";
                    if (!/[A-Z]/.test(value)) return "Include an uppercase letter";
                    if (!/[a-z]/.test(value)) return "Include a lowercase letter";
                    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) return "Include a special character";
                    return true;
                  },
                  onChange: () => clearErrors("password"),
                }) }
              />
              <style>
                {`
                  .custom-input::placeholder {
                    font-size: 0.7rem;
                    color: #888;
                  }
                `}
              </style>
               <div
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ marginRight: "0.1rem", cursor: "pointer" }}
            >
              {showPassword ? <FaEye color="#122A7B" /> : <FaEyeSlash color="#122A7B" />}
            </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleSubmit(handleManualVerify)}
                style={{
                  flexShrink: 0,
                  borderRadius: "999px",
                  border: "none",
                  padding: "0.5rem 1.1rem",
                  background: hasAnyPasswordInput ? "#34A853" : "#BCC2E6",
                  color: hasAnyPasswordInput ? "#fff" : "#00124F",
                  fontSize: "0.8125rem",
                  cursor: hasAnyPasswordInput ? "pointer" : "not-allowed",
                }}
              >
                Proceed
              </button>
            </div>
            
            {errors.password && <span className="mt-1">{errors.password.message}</span>}
            <p style={{ fontSize: "1.13rem", marginBottom: "0.1rem", marginTop: "0.4rem" }}>
              Enter EPFO password to fetch details
            </p>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700 }} onClick={() => navigate("/forgot-password", { state: { currentUan: processedUan } })}>Forgot password?</p>
          </div>
          )}
        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default ManuallyEnterPws;


