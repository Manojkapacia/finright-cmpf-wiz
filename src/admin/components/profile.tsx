import moment from "moment";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from 'react-bootstrap-icons';
import { useForm } from "react-hook-form";
import { BsCheck2Circle, BsXLg } from "react-icons/bs";
import { get, login, post } from "../../components/common/api";
 import ToastMessage from "../../components/common/toast-message";
interface ProfileProps {
    jsonData: any; 
    profileData: any; 
    onBack: () => void;
    onDataUpdate: (updatedJson: any, updatedProfile: any) => void;
  }

  const Profile: React.FC<ProfileProps> = ({ jsonData, profileData, onBack, onDataUpdate }) => {
    const [showLoader, setShowLoader] = useState(false);
  const [loaderText, setLoaderText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<"login" | "otp">("login");
  const [otpInput, setOtpInput] = useState("");
  const [showMessage, setShowMessage] = useState("");
  const [passwordFromForm, setPasswordFromForm] = useState("");
  const [dataToDisplay, setDataToDisplay] = useState(jsonData);
const [profileToDisplay, setProfileToDisplay] = useState(profileData);
   const [toastMessage, setToastMessage] = useState<{ content: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);


  const passwordAvailable =  dataToDisplay?.meta?.password ||"";
  const [OTPBypassEnabled, setIsOtpBypassEnabled] = useState(false);
  const UAN = dataToDisplay?.data?.profile?.UAN;
  const mobile_number = dataToDisplay?.data?.profile?.phone;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: "onChange", defaultValues: { uan: UAN, password: "" } });

    useEffect(() => {
        (async () => {
          try {
            const { allTogglers = [] } = await get("/data/toggle/keys");
            const toggle = allTogglers.find((t: any) => t.type === "otp-bypass");
            setIsOtpBypassEnabled(toggle?.isEnabled == true ? true : false); 
           
          } catch {
            setIsOtpBypassEnabled(false);          
          }
        })();
      }, [])
  const handleRefresh = async () => {
    setShowMessage("");

    if (passwordAvailable) {     
     await handleLoginAndStatusFlow(UAN, dataToDisplay.meta.password, mobile_number);

    }else {
      setIsModalOpen(true);
      setModalStage("login");
    }
  };

  const handleLoginSubmit = async (data: any) => {
    await handleLoginAndStatusFlow(UAN, data.password.trim(), mobile_number);
  };
  const handleOtpSubmit = async () => {
    setLoaderText("Verifying OTP...");
    setShowLoader(true);
    try {
      const passwordToUse = passwordAvailable
        ? dataToDisplay.meta.password
        : passwordFromForm;
      const result = await post("auth/submit-otp", {
        otp: otpInput,
        type: " ", 
        uan :UAN,// UAN : UAN
        password: passwordToUse,
        mobile_number,
      });
      if(result?.status === 400){
        setShowLoader(false);
        setIsModalOpen(false);
        setToastMessage({ content: "Invalid OTP. Try again.", type: "error" });
        return;
      }
     await handleByPassOtp(UAN)
      setIsModalOpen(false);
    } catch (err: any) {
      setShowLoader(false);
      setToastMessage({ content: "Invalid OTP. Try again.", type: "error" });
    }
  };
  


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOtpInput("");
    setShowMessage("");
    setPasswordFromForm("");
    reset({ uan: UAN, password: "" });
  };

  const handleLoginAndStatusFlow = async (
    uan: string,
    password: string,
    mobile_number: string,
  ) => {
    setShowMessage("");
    setLoaderText(OTPBypassEnabled ? "Please wait...Verifying & updating details" : "Please wait...verifying credentials");
    setShowLoader(true);
  
    try {
      const result = await login(uan, password.trim(), mobile_number);
  
      if (result?.status === 400) {
        setToastMessage({ content: "Invalid credentials. Please try again.", type: "error" });
        setShowLoader(false);
        return;
      }
  
      let retries = 0;
      const maxRetries = 60;
      const pollInterval = 3000;
  
      const checkLoginStatus = async (): Promise<boolean> => {
        try {
          const loginStatusResponse = await get(`/auth/login-status?uan=${uan}`);
          if (loginStatusResponse?.data?.status === "success") {
            if (OTPBypassEnabled) {
              setIsModalOpen(false);
              await handleByPassOtp(uan);
            } else {
              setPasswordFromForm(password.trim());
              setIsModalOpen(true);
              setModalStage("otp");
            }
            return true;
          } else if (loginStatusResponse?.data?.status === "failed") {
            setToastMessage({ content: loginStatusResponse?.data?.message || "Login failed", type: "error" });
            return true;
          }
          return false;
        } catch (err) {
          console.error("Error checking login status:", err);
          return false;
        }
      };
  
      let isComplete = await checkLoginStatus();
      while (!isComplete && retries < maxRetries) {
        await new Promise((r) => setTimeout(r, pollInterval));
        isComplete = await checkLoginStatus();
        retries++;
      }
  
      if (!isComplete) {
        setToastMessage({ content: "Request timed out. Please try again.", type: "error" });
      }
  
      setShowLoader(false);
    } catch (err: any) {
      console.error("Login error:", err);
      setToastMessage({ content: err?.message || "Login failed. Please try again.", type: "error" });
      setShowLoader(false);
    }
  };
  

   const handleByPassOtp = async (uan:any) => {
      try {
          const responseUan = await get('/data/fetchByUan/' + uan); 
          setDataToDisplay(responseUan.rawData);  
          setProfileToDisplay(responseUan.profileData);  
          onDataUpdate?.(responseUan.rawData, responseUan.profileData);          
  
          if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
            const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
             setToastMessage({ content: errorMsg, type: "error" });
            return;
          }
     
          if (!responseUan) {
            setShowLoader(false);
            setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });
          } else {
            setShowLoader(false);
            if(!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
            setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });          
              return
            }
          }
          setShowLoader(false);
          setToastMessage({
            content: "Profile updated successfully!",
            type: "success",
          });
        } catch (error: any) {
          setShowLoader(false)
          if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
            console.warn('Server Connection Error:', {
              error: error.message,
              code: error.code
            });
            setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });

    }
}
   }


    return (
        <>
        {showLoader ? (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
            <div className="text-center p-4 bg-white rounded shadow">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">{loaderText}</p>
            </div>
        </div>
         ):(
            <>
        <div className="container">
            {toastMessage && (
                <ToastMessage
                    message={toastMessage.content}
                    type={toastMessage.type}
                />
            )}
            <div className="row">
                <div className="col-md-8 offset-md-2 mt-5">

                    <div className="card mt-3">
                        <div className="d-flex justify-content-between align-items-center mt-2 ms-2">
                            {/* <button className="btn" style={{
                                color: '#ffffff',
                                backgroundColor: '#2f6870'
                            }} onClick={onBack}>Back</button> */}
                            <button className="btn p-0 d-flex align-items-center" onClick={onBack}>
                                <ArrowLeft size={20} className="me-1" /> Back
                            </button>
                            <h3 className="text-center flex-grow-1">Profile</h3>
                            <span
                                style={{
                                    cursor: "pointer",
                                    color: "#007bff",
                                    textDecoration: "underline",
                                    fontSize: "0.9rem",
                                }}
                                onClick={handleRefresh}
                            >
                                Refresh
                            </span>
                            <div style={{ width: '3.1rem' }}></div>
                        </div>
                        <div className="card-body">
                            <p><strong>UAN:</strong> {dataToDisplay?.data?.profile?.UAN}</p>
                            <p><strong>Full Name:</strong> {dataToDisplay?.data?.profile?.fullName}</p>
                            <p><strong>Phone:</strong> {dataToDisplay?.data?.profile?.phone}</p>
                            <p><strong>Email:</strong> {dataToDisplay?.data?.profile?.email}</p>
                            <p>
                                <strong>Payment Status:</strong> {profileToDisplay?.isPaymentDone ? (
                                <span style={{ color: "green" }}>
                                    <BsCheck2Circle /> Done
                                </span>
                                ) : (
                                    <span style={{ color: "red" }}>
                                    <BsXLg /> Pending
                                    </span>
                                )}
                            </p>
                            <p><strong>Payment Processed At:</strong> {profileToDisplay?.paymentProcessedAt ? moment(profileToDisplay?.paymentProcessedAt).format("DD-MM-YYYY HH:MM:SS") : 'Not Initiated Yet!!'}</p>

                            <div className="accordion" id="accordionExample">
                                {/* Accordion Item 1 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingOne">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseOne"
                                            aria-expanded="true"
                                            aria-controls="collapseOne"
                                        >
                                            <strong>BasicDetails:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseOne"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingOne"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Full Name:</strong> {dataToDisplay.data.profile.basicDetails?.fullName}</p>
                                            <p><strong>DOB:</strong> {dataToDisplay.data.profile.basicDetails?.dateOfBirth}</p>
                                            <p><strong>Gender:</strong> {dataToDisplay.data.profile.basicDetails?.gender}</p>
                                            <p><strong>Father's / Husband Name:</strong> {dataToDisplay.data.profile.basicDetails?.fatherHusbandName}</p>
                                            <p><strong>Relation:</strong> {dataToDisplay.data.profile.basicDetails?.relation}</p>
                                            <p><strong>Physically Handicapped:</strong> {dataToDisplay.data.profile.basicDetails?.physicallyHandicapped}</p>
                                            <p><strong>International Worker:</strong> {dataToDisplay.data.profile.basicDetails?.internationalWorker}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Item 2 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingTwo">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseTwo"
                                            aria-expanded="true"
                                            aria-controls="collapseTwo"
                                        >
                                            <strong>KYC Details:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseTwo"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingTwo"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Aadhar Card:</strong> {dataToDisplay.data.profile.kycDetails?.aadhaar}</p>
                                            <p><strong>Pan Card:</strong> {dataToDisplay.data.profile.kycDetails?.pan}</p>
                                            <p><strong>Bank Account:</strong> {dataToDisplay.data.profile.kycDetails?.bankAccountNumber}</p>
                                            <p><strong>IFSC Code:</strong> {dataToDisplay.data.profile.kycDetails?.bankIFSC}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Item 3 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingThree">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseThree"
                                            aria-expanded="true"
                                            aria-controls="collapseThree"
                                        >
                                            <strong>KYC Verification Details:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseThree"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingThree"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Bio Metric Status:</strong> {dataToDisplay.data.profile?.kycVerificationDetails?.bioMetricVerificationStatus}</p>
                                            <p><strong>Demo Graphic Verification Status:</strong> {
                                                dataToDisplay.data.profile?.kycVerificationDetails?.demographicVerificationStatus !== undefined &&
                                                    dataToDisplay.data.profile?.kycVerificationDetails?.demographicVerificationStatus !== null ?
                                                    dataToDisplay.data.profile?.kycVerificationDetails?.demographicVerificationStatus : "N"
                                            }</p>
                                            <p><strong>OTP Based Verification Status:</strong> {dataToDisplay.data.profile?.kycVerificationDetails?.otpBasedVerificationStatus}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalStage === "login" ? "User Login" : "Enter OTP"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <div className="modal-body">
                <div className="row justify-content-center align-items-center">
                  <div className="col-md-12">
                    {showLoader ? (
                      <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3">{loaderText}</p>
                      </div>
                    ) : (
                      <>
                        {modalStage === "login" ? (
                          <form onSubmit={handleSubmit(handleLoginSubmit)}>
                            <div className="mb-3">
                              <label className="form-label">UAN Number</label>
                              <input
                                type="text"
                                className="form-control"
                                disabled
                                {...register("uan")}
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Password</label>
                              <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                {...register("password", {
                                  required: "Password is required.",
                                  minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters long.",
                                  },
                                  validate: {
                                    upperCase: (value) =>
                                      /[A-Z]/.test(value) || "At least one uppercase required.",
                                    lowerCase: (value) =>
                                      /[a-z]/.test(value) || "At least one lowercase required.",
                                    specialChar: (value) =>
                                      /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Special character required.",
                                  },
                                })}
                              />
                              {errors.password && (
                                <span className="text-danger">{errors.password.message}</span>
                              )}
                            </div>

                            <div className="text-center mt-4">
                              <button type="submit" className="btn btn-primary px-4" disabled={!isValid}>
                                {OTPBypassEnabled ? "Submit" : "Continue"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="mb-3">
                              <label className="form-label">OTP</label>
                              <input
                                type="text"
                                className="form-control"
                                value={otpInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,6}$/.test(value)) {  // only allow up to 6 digits
                                      setOtpInput(value);
                                    }
                                  }}
                                placeholder="Enter OTP"
                              />
                               {otpInput && otpInput.length !== 6 && (
      <small className="text-danger">OTP must be exactly 6 digits</small>
    )}
                            </div>

                            <div className="text-center mt-4">
                              <button className="btn btn-success px-4" onClick={handleOtpSubmit}  disabled={otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)}>
                                Submit OTP
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {showMessage && (
                      <p className="text-center text-danger mt-3">{showMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
        </>
    )}
    </>
    )
}

export default Profile;