import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { decryptData } from "../../common/encryption-decryption";
import { useNavigate } from "react-router-dom";
import { get, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface ManuallyEnterUanPwsProps {
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
  // If true, open the slider directly on the password step
  openPasswordStep?: boolean;
}

interface FormData {
  uan: string;
  password: string;
}

const ManuallyEnterUanPws = ({ show, processedUan, onClose, onVerify, autoLogin, defaultPassword, disableAutoVerification, openPasswordStep }: ManuallyEnterUanPwsProps) => {

   const [showPassword, setShowPassword] = useState(false);
    const [, setotpSuccessiveEnable] = useState<boolean | null>(null);
    const [, setTextChange] = useState(false);
    // step control: false -> show UAN input, true -> show password step
    const [showPasswordStep, setShowPasswordStep] = useState(!!openPasswordStep);
    const navigate = useNavigate();
    const {
      register,
      handleSubmit,
      formState: { errors },
      getValues,
      watch,
      trigger,
      clearErrors,
      setValue,
    } = useForm<FormData>({ mode: "onSubmit", defaultValues: { uan: "", password: "" } });
    const watchUan = watch("uan") || "";
    const watchPassword = watch("password") || "";
    // Button color logic: green after user starts typing any password character
    const hasAnyPasswordInput = watchPassword.length > 0;
  
    // Prevent background scroll while modal is open
    useEffect(() => {
      getToggleValue()
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);

    // Prefill UAN from processedUan if provided, else from localStorage, and normalize to 12 digits
    useEffect(() => {
      const stored = decryptData(localStorage.getItem("user_uan"));
      const candidate = processedUan || stored || "";
      const digitsOnly = String(candidate).replace(/\D/g, "").slice(0, 12);
      if (digitsOnly) {
        setValue("uan", digitsOnly, { shouldDirty: true, shouldTouch: true });
      }
    }, [processedUan, setValue]);
  
    const hasAutoFired = useRef(false);
    useEffect(() => {
      if (autoLogin && !hasAutoFired.current && processedUan && defaultPassword) {
        hasAutoFired.current = true;
        onVerify(processedUan, defaultPassword);
      }
    }, [autoLogin, processedUan, defaultPassword, onVerify]);
  
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

          {/* Step 1: Enter UAN */}
          {!showPasswordStep && (
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
            <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Enter UAN number</p>

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
                type="text"
                placeholder="Enter UAN Number"
                className="custom-input"
                {...register("uan", {
                  required: "UAN is required",
                  pattern: { value: /^\d{12}$/, message: "UAN must be exactly 12 digits" },
                })}
                value={watchUan}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setValue("uan", v, { shouldDirty: true, shouldTouch: true });
                  clearErrors("uan");
                }}
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
              {/* Optional: UAN inline error */}
              <button
                type="button"
                className="btn btn-sm"
                onClick={async () => {
                  if (/^\d{12}$/.test(watchUan)) {
                    setShowPasswordStep(true);
                  } else {
                    await trigger("uan");
                  }
                }}
                style={{
                  flexShrink: 0,
                  borderRadius: "999px",
                  border: "none",
                  padding: "0.5rem 1.1rem",
                  background: /^\d{12}$/.test(watchUan) ? "#34A853" : "#BCC2E6",
                  color: /^\d{12}$/.test(watchUan) ? "#fff" : "#00124F",
                  fontSize: "0.8125rem",
                  cursor: /^\d{12}$/.test(watchUan) ? "pointer" : "not-allowed",
                }}
              >
                Proceed
              </button>
            </div>
            {errors.uan && <span className="mt-1">{errors.uan.message}</span>}
          </div>
          )}

          {/* Step 2: Verify & fetch details */}
          {showPasswordStep && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", 
              alignItems: "center", 
              textAlign: "center",
              width: "100%"
            }}
          >
            <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Verify & fetch details</p>

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
                placeholder="Enter EPFO password"
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
                onClick={handleSubmit(() => {
                  const values = getValues();
                  // Prefer the UAN the user has in the form, allowing edits over prefilled value
                  const uanToSend = values.uan || processedUan;
                  onVerify(uanToSend, values.password);
                })}
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
            {errors.password && <span className="mt-1 mb-0">{errors.password.message}</span>}
            <p style={{ fontSize: "1rem", marginBottom: "0.4rem", marginTop: "0.4rem" }}>
              Verify using EPFO password
            </p>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700 }} onClick={() => navigate("/forgot-password", { state: { currentUan: processedUan || watchUan } })}>Forgot password?</p>
          </div>
          )}
        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default ManuallyEnterUanPws;


