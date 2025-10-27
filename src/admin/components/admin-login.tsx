import { useState, useEffect, useCallback } from "react";
import './style/admin-login.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ValidationError from '../../components/common/validate-error';
import ToastMessage from '../../components/common/toast-message';
import MESSAGES from '../../components/constant/message';
import { post } from "../../components/common/api";
import { CircularLoading } from "../../components/user-registeration/Loader";
import { encryptData } from "../../components/common/encryption-decryption";

function AdminLogin() {
    interface FormErrors {
        username?: string;
        password?: string;
        userName?: string;
        mobileNumber?: string;
    }
    const otpLength = 6;
    const [seconds, setSeconds] = useState(60);
    const [formData, setFormData] = useState<any>({ username: "", password: "", type: "ops user", userName: "", mobileNumber: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [, setIsFormValid] = useState(false);
    const [showMobilePassword, setShowMobilePassword] = useState(false);
    const [message, setMessage] = useState({ type: "", content: "" });
    const [isloading, ] = useState(false);
    const [otpValues, setOtpValues] = useState<any>(Array(otpLength).fill(""));
    const [otpStage, setOtpStage] = useState(false);

    const navigate = useNavigate();


    const validateField = useCallback((field: any, value: any) => {
        if (field === "password") {
            if (!value) return MESSAGES.required.requiredField("Password");
            if (value.length < 8) return MESSAGES.error.password.length;
            if (!/[A-Z]/.test(value)) return MESSAGES.error.password.upperCase;
            if (!/[a-z]/.test(value)) return MESSAGES.error.password.lowerCase;
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return MESSAGES.error.password.specialCharacter;
        }

        return "";
    }, []);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    useEffect(() => {
        const isFormComplete = formData.username.trim() !== "" && formData.password.trim() !== "";
        const hasNoErrors = Object.values(errors).every((err) => !err);

        setIsFormValid(isFormComplete && hasNoErrors);
    }, [formData, errors]);

    useEffect(() => {
        if (message.type) {
          const timer = setTimeout(() => {
            setMessage({ type: "", content: "" });
          }, 3000); // auto-clear after 4 seconds
      
          return () => clearTimeout(timer);
        }
      }, [message]);

      useEffect(() => {
        let timer: any;
      
        if (otpStage && seconds > 0) {
          timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
          }, 1000);
        }
      
        return () => clearInterval(timer);
      }, [otpStage, seconds]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.userName || formData.mobileNumber.length !== 10) {
          // setMessage({ type: "error", content: "Enter valid credentials" });
          setErrors((prev) => ({
            ...prev,
            mobileNumber: "Password must have 10 digits",
          }));
          return;
        }

        setErrors((prev) => ({ ...prev, mobileNumber: "" }));
      try {
        const result = await post("ops-login", {
          userName: formData.userName,
          mobileNumber: formData.mobileNumber,
          type: formData.type,
        });

        if (result.success) {
          localStorage.setItem("opsMobileNumber", encryptData(formData?.mobileNumber));
          localStorage.setItem("isLoggedIn", encryptData("true"));
          navigate("/operation/uan-list", { state: { type: formData.type } });
          setMessage({ type: "success", content: "Logged in successfully" });
        } else {
          setMessage({ type: "error", content: result.message || "Login failed" });
        }
      } catch (error: any) {

        const apiMessage =
          error?.response?.data?.message ||
          "Invalid credentials";
        setMessage({ type: "error", content: apiMessage });
      }

    };

    const handleOtpChange = (value: any, index: any) => {
        if (!/^\d*$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value.slice(-1);
        setOtpValues(newOtpValues);
        if (value && index < otpLength - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleBackspace = (e: any, index: any) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };
      
      const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericValue = rawValue.replace(/\D/g, "");
      
        // If non-numeric input is detected
        if (/\D/.test(rawValue)) {
          setErrors((prev) => ({ ...prev, mobileNumber: "Allow only numeric value" }));
        } else {
          // Clear numeric error immediately if valid input
          setErrors((prev) => ({ ...prev, mobileNumber: "" }));
        }
      
        // Always update numeric value if 10 or fewer digits
        if (numericValue.length <= 10) {
          setFormData((prev: any) => ({ ...prev, mobileNumber: numericValue }));
        }
      };
      
      const handleOpsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      
        if (!otpStage) {
          if (!formData.userName || formData.mobileNumber.length !== 10) {
            setErrors((prev) => ({
              ...prev,
              mobileNumber: "Password must have 10 digits",
            }));
            return;
          }
  
          setErrors((prev) => ({ ...prev, mobileNumber: "" }));
      
          try {
            const result = await post("ops-login", {
              userName: formData.userName,
              mobileNumber: formData.mobileNumber,
              type: formData.type,
            });
          
            if (result.success) {
              setOtpStage(true);
              setSeconds(60);
              setMessage({ type: "success", content: result.message || "OTP sent successfully" });
            } else {
              setMessage({ type: "error", content: result.message || "Login failed" });
            }
          } catch (error: any) {
          
            const apiMessage =
            error?.response?.data?.message ||
              "Failed to generate OTP";
            setMessage({ type: "error", content: apiMessage });
          }
          
        } else {
          // Handle OTP submission
          const enteredOtp = otpValues.join("");
          if (enteredOtp.length !== otpLength) return;
      
          try {
            const response = await post("ops-confirm-otp", {
              // userName: formData.userName,
              type: formData?.type,
              mobileNumber: formData?.mobileNumber,
              otp: enteredOtp,
            });
      
            if (response.status === 200) {
              setMessage({ type: "success", content: "Logged in successfully" });
              setTimeout(() => {
                navigate("/operation/uan-list");
                localStorage.setItem("opsMobileNumber", encryptData(formData?.mobileNumber));
                localStorage.setItem("opsType", encryptData(response?.data?.type));
                localStorage.setItem("isLoggedIn", encryptData("true"));
            }, 2000);
            } else {
              setMessage({ type: "error", content: response?.message || "Invalid OTP" });
            }
          } catch (error: any) {
            const apiMessage =
              error?.response?.data?.message
            "OTP verification failed";
            setMessage({ type: "error", content: apiMessage });
          }
        }
      };

      const handleResendOtp = async () => {
        setSeconds(60);
        setOtpValues(Array(otpLength).fill(""));
      
        try {
          const result = await post("ops-login", {
            userName: formData.userName,
            mobileNumber: formData.mobileNumber,
            type: formData.type,
          });
      
          if (result.success) {
            setMessage({ type: "success", content: result.message || "OTP sent successfully" });
            return; 
          }
      
          setMessage({ type: "error", content: result.message || "OTP resend failed" });
        } catch (error: any) {
          const errorMsg = error?.result?.message || "Failed to generate OTP";
          setMessage({ type: "error", content: errorMsg });
        }
      };
      
      

      const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes > 0
          ? `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`
          : `${remainingSeconds} sec`;
      };
      
    // const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const toggleMobilePasswordVisibility = () => setShowMobilePassword((prev) => !prev);

    return (
        <>
            {isloading ? (
                <CircularLoading />
            ) : (
                <div className="container">
                    {message.type && <ToastMessage message={message.content} type={message.type} />}
                    <div className="row mx-2 d-flex justify-content-center align-items-center vh-100">
                        <div className="col-md-5">
                            <div className="pfRiskheading text-center">PF Risk Assessment</div>
                            <div className="pfRiskSubHeading text-center">
                                Operation Login
                            </div>

                            <div className="row mt-lg-3">
                                <div className="col-md-12">
                                    <div className="labelHeading">Select Role:</div>
                                    <select
                                        className="form-select mt-2"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">-- Select Role --</option>
                                        <option value="admin">Admin</option>
                                        <option value="ops user">Operations User</option>
                                    </select>
                                </div>
                            </div>

                  {formData.type === "admin" && (
                    <form onSubmit={handleSubmit}>
                      <div className="row mt-2 mt-lg-4">
                        <div className="col-md-12">
                          <div className="labelHeading">Username:</div>
                          <input
                            className="form-control mt-2"
                            type="text"
                            placeholder="Enter username"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            autoComplete="off"
                            required
                          />
                          <ValidationError message={errors.userName} />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="row mt-lg-3">
                        <div className="col-md-12">
                          <div className="labelHeading">Password:</div>
                          <div className="position-relative">
                            <input
                              className="form-control mt-2"
                              type={showMobilePassword ? "text" : "password"}
                              inputMode="numeric"
                              pattern="\d*"
                              placeholder="Enter your password"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleMobileChange}
                              autoComplete="off"
                              required
                            />
                            <span
                              className="position-absolute top-50 end-0 translate-middle-y me-3"
                              style={{ cursor: 'pointer', zIndex: 1 }}
                              onClick={toggleMobilePasswordVisibility}
                            >
                              {showMobilePassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                          </div>
                          <ValidationError message={errors.mobileNumber} />
                        </div>
                      </div>
                      <br />
                      <div className="row my-2 mt-lg-4">
                        <div className="col-md-12">
                          <button type="submit" className="btn col-12 pfRiskButtons" disabled={!(formData.userName && formData.mobileNumber.length > 0 && formData.mobileNumber.length <= 10)}>
                            Login
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {formData.type === "ops user" && (
                    <form onSubmit={handleOpsSubmit}>
                      {/* Username Field */}
                      <div className="row mt-2 mt-lg-4">
                        <div className="col-md-12">
                          <div className="labelHeading">Username:</div>
                          <input
                            className="form-control mt-2"
                            type="text"
                            placeholder="Enter username"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            autoComplete="off"
                            disabled={otpStage}
                            required
                          />
                          <ValidationError message={errors.userName} />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="row mt-lg-3">
                        <div className="col-md-12">
                          <div className="labelHeading">Password:</div>
                          <div className="position-relative">
                            <input
                              className="form-control mt-2"
                              type={showMobilePassword ? "text" : "password"}
                              inputMode="numeric"
                              pattern="\d*"
                              placeholder="Enter your password"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleMobileChange}
                              autoComplete="off"
                              disabled={otpStage}
                              required
                            />
                            <span
                              className="position-absolute top-50 end-0 translate-middle-y me-3"
                              style={{ cursor: 'pointer', zIndex: 1 }}
                              onClick={toggleMobilePasswordVisibility}
                            >
                              {showMobilePassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                          </div>
                          <ValidationError message={errors.mobileNumber} />
                        </div>
                      </div>

                      {/* OTP Fields - Only if OTP stage is active */}
                      {otpStage && (
                        <>
                          <div className="row mt-lg-3">
                            <div className="col-12">
                              <div className="labelHeading">Enter OTP:</div>
                              <div className="d-flex">
                                {Array.from({ length: otpLength }).map((_, index) => (
                                  <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="number"
                                    maxLength={1}
                                    autoComplete="off"
                                    className="text-center mx-1 mt-2"
                                    style={{
                                      width: "3.125rem",
                                      height: "3.125rem",
                                      fontSize: "1rem",
                                      borderRadius: "8px",
                                      border: "1px solid #ccc",
                                    }}
                                    value={otpValues[index]}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleBackspace(e, index)}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div
                            className="mt-2"
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
                        </>
                        
                      )}

                      {/* Submit Button */}
                      <div className="row my-2 mt-5">
                        <div className="col-md-12">
                          <button
                            type="submit"
                            className="btn col-12 pfRiskButtons"
                            disabled={
                              !otpStage
                                ? !(formData.userName && formData.mobileNumber.length > 0 && formData.mobileNumber.length <= 10)
                                : seconds <= 0 || otpValues.some((digit: any) => digit === "")
                            }
                          >
                            {otpStage ? "Submit OTP" : "Generate OTP"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminLogin;
