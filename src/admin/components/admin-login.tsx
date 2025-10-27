import { useState, useEffect, useCallback } from "react";
import './style/admin-login.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ValidationError from '../../components/common/validate-error';
import ToastMessage from '../../components/common/toast-message';
import MESSAGES from '../../components/constant/message';
// import Loader from './../../components/common/loader';
import { adminLogin } from "../../components/common/api";
import { CircularLoading } from "../../components/user-registeration/Loader";
// import { toast } from "react-toastify";

function AdminLogin() {
    interface FormErrors {
        username?: string;
        password?: string;
    }
    const [formData, setFormData] = useState<any>({ username: "", password: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: "", content: "" });
    const [isloading, setIsLoading] = useState(false);

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
        setFormData((prev:any) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    useEffect(() => {
        const isFormComplete = formData.username.trim() !== "" && formData.password.trim() !== "";
        const hasNoErrors = Object.values(errors).every((err) => !err);

        setIsFormValid(isFormComplete && hasNoErrors);
    }, [formData, errors]);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const newErrors = {
            username: validateField("username", formData.username),
            password: validateField("password", formData.password),
        };
    
        setErrors(newErrors);
    
        if (Object.values(newErrors).every((err) => !err)) {
            try {
                setIsLoading(true); // Show loader
    
                const result = await adminLogin('/admin/login', formData);
                setIsLoading(false); // Hide loader after request completion
    
                if (result.status === 400 || result.status === 401) {
                    setMessage({ type: "error", content: result.message });


                    // if (result.message.toLowerCase().includes("password expired")) {
                    //     // Show toast for expired password
                    //     setMessage({ type: "error", content: "Your password has expired." });
                    //     toast.error("Your password has expired. Redirecting to dashboard...");
                    //     setTimeout(() => {
                    //       navigate("/dashboard");
                    //     }, 2000);
                    //   } else {
                    //     // Handle normal 400 error
                    //     setMessage({ type: "error", content: result.message });
                    //   }
                    
                    // Stay on the same page by NOT navigating anywhere
                    return; 
                } else {
                    setMessage({ type: "success", content: result.message });
                    localStorage.setItem("admin_logged_in", "yes");
    
                    setTimeout(() => {
                        navigate("/operation/view-details");
                    }, 2000);
                }
            } catch (error: any) {
                setIsLoading(false); // Stop loader before displaying error
    
                let errorMessage = "Invalid username or password. Please try again.";
                if (!error.response) {
                    errorMessage = "Network error. Please check your internet connection and try again.";
                } else if (error.response.status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                } else if (error.response.status === 404) {
                    errorMessage = "Server not found. Please contact support.";
                }
    
                setMessage({ type: "error", content: errorMessage });
            }
        }
    };
    
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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

                            <form onSubmit={handleSubmit}>
                                <div className="row mt-2 mt-lg-4">
                                    <div className="col-md-12">
                                        <div className="d-flex justify-content-between">
                                            <div className="labelHeading">Username:</div>
                                        </div>
                                        <input
                                            className="form-control mt-2"
                                            type="text"
                                            placeholder="Enter username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            required
                                        />
                                        <ValidationError message={errors.username} />
                                    </div>
                                </div>
                                <div className="row mt-lg-3">
                                    <div className="col-md-12">
                                        <div className="labelHeading">Password:</div>
                                        <div className="position-relative">
                                            <input
                                                className="form-control mt-2"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your EPFO password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                autoComplete="off"
                                                required
                                            />
                                            <span
                                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                                style={{ cursor: 'pointer', zIndex: 1 }}
                                                aria-label="Toggle password visibility"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                        <ValidationError message={errors.password} />
                                    </div>
                                </div>
                                <br />
                                <div className="row my-2 mt-lg-4">
                                    <div className="col-md-12">
                                        <button type="submit" className="btn col-12 pfRiskButtons" disabled={!isFormValid}>
                                            Login
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminLogin;
