import React from 'react';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import './../App.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ToastMessage from '../common/toast-message';
import LoadingCard from '../common/loading-card';
import MoreForYouSlider from '../common/MoreForYouSlider';
import { login } from '../../components/common/api';

interface FormData {
    uan: string;
    password: string;
}
const LoginForm11: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", content: "" });
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
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

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const onSubmit = async (data: FormData) => {
        setMessage({ type: "", content: "" });
        const uanToUse = data.uan?.length === 12 ? data.uan : data.uan;
        if (uanToUse && data.password) {
            try {
                setLoading(true);
                const result = await login(uanToUse, data.password.trim(), "");
                if (result.status === 400) {
                    setMessage({ type: "error", content: result.message });
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setMessage({ type: "success", content: result.message });
                        setTimeout(() => {
                            navigate("/form11/otp-submit", {
                                state: {
                                    uan: uanToUse,
                                    password: data.password.trim()
                                }
                            });
                            setLoading(false);
                        }, 1000);
                    }, 3000);
                }
            } catch (error: any) {
                setMessage({ type: "error", content: error?.status === 401 ? "Invalid Credentials" : error?.message });
                setTimeout(() => {
                    setLoading(false);
                }, 3000);
            }
        }
    };


    return (
        <>
            {message.type && <ToastMessage message={message.content} type={message.type} />}
            <div className="container-fluid px-2">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff' }}>
                        <Header />
                        <CoustomCard />
                        {loading ? (
                            <LoadingCard
                                show={loading}
                                // apiPromise={apiPromise}
                                onClose={() => setLoading(false)}
                            />
                        ) : (
                            <>
                                <p className="mt-4 ms-2 mb-0" style={{ fontSize: '0.8rem', color: '#000000' }}>Enter your UAN and EPFO portal Password</p>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="card w-100 border-0 mt-4" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }} >
                                        <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
                                            <label className="mb-0 me-2 ms-1" style={{ fontSize: '0.8rem' }}>
                                                UAN
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                maxLength={12}
                                                className="form-control custom-input"
                                                style={{ maxWidth: '60%' }}
                                                placeholder="Enter UAN"
                                                onInput={(e) => {
                                                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 12);

                                                }}
                                                {...register("uan", {
                                                    required: "UAN is required",
                                                    pattern: {
                                                        value: /^\d{12}$/, // Only 12 digits allowed
                                                        message: "UAN must be exactly 12 digits",
                                                    },
                                                })}
                                            />
                                        </div>
                                    </div>
                                    {errors.uan && <span className="text-danger ms-3">{errors.uan.message}</span>}

                                    <div className="card w-100 border-0 mt-2" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }} >
                                        <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
                                            <label className="mb-0 me-2 ms-1" style={{ fontSize: '0.8rem' }}>
                                                Password
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control custom-input"
                                                style={{ maxWidth: '60%' }}
                                                placeholder="Enter Password"
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
                                    </div>
                                    <div style={{ paddingLeft: '1rem' }}>
                                        {errors.password && <span className="text-danger">{errors.password.message}</span>}
                                    </div>
                                    <p className="mt-4 mb-0 ms-2" style={{ fontSize: '0.8rem' }}>
                                        Not sure about your UAN or Password?{' '}
                                        <span style={{ color: '#2463EB', cursor: 'pointer' }}>Click here</span>
                                    </p>

                                    <button className="btn mt-4 w-100" style={{ backgroundColor: "#07115B", color: "#FFFFFF", cursor: 'pointer', fontSize: "1rem", fontWeight: "700", paddingTop: "0.8rem", paddingBottom: "0.8rem" }}>
                                        Continue
                                    </button>
                                </form>
                            </>
                        )}

                        <div>
                            <p className={`section-title mb-1 py-2 mt-2`}>More for you!</p>
                            <span className="underline" style={{ marginTop: "-0.6rem" }}></span>
                            <MoreForYouSlider />
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginForm11;