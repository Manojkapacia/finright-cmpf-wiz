import { FaCheck } from "react-icons/fa";
import './../../../App.css'
import { LoaderBar, TitleSubtitleBlock, TermsConditionsModal, PFInfoSlider } from "./common/helpers";
import { useCallback, useEffect, useState } from "react";
import { identifyUser, trackClarityEvent } from "../../../helpers/ms-clarity";
import MESSAGES from "../../constant/message";
import { decryptData, encryptData } from "../../common/encryption-decryption";
import { get, post } from "../../common/api";
import { useNavigate } from "react-router-dom";
import { ZohoLeadApi } from "../../common/zoho-lead";
import ToastMessage from "../../common/toast-message";
import fingerprintAnimation from "../../../assets/OTPMicroAnimation.json"
import Lottie from "lottie-react";
import slideLogo from "../../../assets/logoImage.png"

const initialTime = 60;
const FinrightOtp = () => {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(initialTime);
  const [otp, setOtp] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState({ type: '', content: '' })
  const [mobileNumber, setMobileNumber] = useState<any>();
  const [, setZohoUserID] = useState<any>();
  const [timerKey, setTimerKey] = useState(0);
  const [, setGenerateOtpResult] = useState<any>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [apiFinished, setApiFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [extractedMobile, setExtractedMobile] = useState("");
  const [extractedLeadSource, setExtractedLeadSource] = useState("");
  const [extractedCampaignId, setExtractedCampaignId] = useState("");
  const [onboardingFetched, setOnboardingFetched] = useState(false);
  const [noUanFound, setNoUanFound] = useState(false);
  // const [showPaymentSlider, setShowPaymentSlider] = useState(false);

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
    let extractedCampaignId: any;
    let extractedLeadSource: any;
    let extractedMobile: any;

    const queryParams = new URLSearchParams(window.location.search);
    const encodedMobileNumber = queryParams.get("mobile_number");
    const encodedCampaignId = queryParams.get("campaign_id");
    const encodedLeadSource = queryParams.get("lead_source");
    extractedMobile = encodedMobileNumber ? atob(encodedMobileNumber) : "";
    extractedCampaignId = encodedCampaignId ? atob(encodedCampaignId) : "";
    extractedLeadSource = encodedLeadSource ? atob(encodedLeadSource) : "Organic";
    const appendMobileNumber = "+91" + extractedMobile;
    setExtractedMobile(extractedMobile);
    setExtractedLeadSource(extractedLeadSource);
    setExtractedCampaignId(extractedCampaignId);

    setMobileNumber(appendMobileNumber);
    fetchOnboarding(appendMobileNumber);

    if (appendMobileNumber) {
      identifyUser(appendMobileNumber);
    }

    generateOtp(appendMobileNumber);
  }, []);


  useEffect(() => {
    if (onboardingFetched  && extractedMobile) {
      searchLeadByMobile(extractedMobile, extractedLeadSource, extractedCampaignId);
    }
  }, [onboardingFetched]);

  const fetchOnboarding = async (userMobile: any) => {
    try {
      const res = await post("auth/onboarding-data", { mobile_number: userMobile });
      if (res?.success) {
        if(!res?.data?.uan || res?.data?.uan.length=== 0){
          setNoUanFound(true);
        }
        setSelectedOption(res?.data?.onboardingData?.selectedOption);
      } 
    } catch (err) {
      console.error("Failed to load onboarding data:", err);
    } finally {
      // Mark onboarding as fetched (success or fail)
      setOnboardingFetched(true);
    }
  };
  

  // useEffect(() => {
  //   async function tryAutoFill() {
  //     const code = await getOtpFromSms();
  //     if (code && code.length === 6) {
  //       setOtp(code); // Autofill OTP
  //     }
  //   }
  
  //   tryAutoFill();
  // }, []); 
  
  const onVerify = async (otpValue = otp) => {
    setShowLoader(true);
    setMessage({ type: '', content: '' })
    setActiveIndex(activeIndex + 1);
    // setIsLoading(true)
    setSeconds(0)
    localStorage.removeItem("otpStartTime");
    setSeconds(initialTime);

    try {
      // verify OTP
      const response = await post('/auth/confirmOtpFixpf', {
        mobile_number: mobileNumber,
        otp: otpValue
      });
      if (response && response.success) {
        trackClarityEvent(MESSAGES.ClarityEvents.RETURNING_USER_SIGN_IN);
        localStorage.setItem("user_mobile", encryptData(mobileNumber))
        // call zoho API
        zohoUpdateLead("Authenticated user")
        setApiFinished(true);
        if (response.message.toLowerCase() === 'user already registered') {
          localStorage.setItem("is_logged_in_user", encryptData("true"))
          localStorage.setItem("user_uan", encryptData(response.data))
          navigate('/dashboard', { state: { mobile_number: mobileNumber, processedUan: response.data, noUanFound } })
        } else if (response.message.toLowerCase() === 'bulk updated user') {
          // call fetch data by UAN api 
          const responseUan = await get('/data/fetchByUan/' + response.data);
          if (!responseUan) {
            // setIsLoading(false);
            setShowLoader(false);
            setActiveIndex(activeIndex + 1);
            setMessage({ type: "error", content: MESSAGES.error.generic });
          } else {
            // setIsLoading(false);
            if (!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
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

            localStorage.setItem("user_uan", encryptData(response.data))
            zohoUpdateLead("Full Report")
            navigate("/employment-status", { state: { mobile_number: mobileNumber, processedUan: response.data, currentEmploymentUanData: employmentDataSet, type: 'full' } });
          }
        } else {
          // await post('lead/knowlarity-lead', { mobileNumber, tag: "Authenticated user" });
          setTimeout(()=>{
            navigate("/enter-name", { state: { mobile_number: mobileNumber } })
            setShowLoader(false);
            setActiveIndex(activeIndex + 1);
          },2000)
        }
      } else {
        setShowLoader(false);
        setActiveIndex(activeIndex + 1);
        setMessage({ type: 'error', content: response.message || MESSAGES.error.general })
      }
    } catch (error) {
      setShowLoader(false);
      setActiveIndex(activeIndex + 1);
      setMessage({ type: 'error', content: MESSAGES.error.general })
    }
  }
  const zohoUpdateLead = async (status: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user?.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user?.CheckMyPF_Intent;

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
        Last_Name: user?.Last_Name || 'New Lead',
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: newUser && newUser !== "" ? status : user?.CheckMyPF_Status,
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      await ZohoLeadApi(zohoReqData);
      // if(showPaymentSlider && zohoRes?.data?.data?.[0]?.details?.id.length){
      //   await post("lead/addTags", { leadId: zohoRes?.data?.data?.[0]?.details?.id, tags: ["A/B Test"] , mobileNumber: user?.Mobile});
      // }
    }
  }



  const searchLeadByMobile = async (mobileNumber: any, leadSource: any, campaignId: any) => {
    const isUserAlreadyExist = await post('data/searchLead', { mobile: mobileNumber });
    if (isUserAlreadyExist.success) {
      const zohodata = {
        Last_Name: isUserAlreadyExist?.data?.Last_Name,
        Mobile: isUserAlreadyExist?.data?.Mobile,
        Email: isUserAlreadyExist?.data?.Email,
        Wants_To: isUserAlreadyExist?.data?.Wants_To,
        Lead_Status: isUserAlreadyExist?.data?.Lead_Status,
        Lead_Source: isUserAlreadyExist?.data?.Lead_Source,
        Campaign_Id: isUserAlreadyExist?.data?.Campaign_Id,
        CheckMyPF_Status: isUserAlreadyExist?.data?.CheckMyPF_Status,
        CheckMyPF_Intent: isUserAlreadyExist?.data?.CheckMyPF_Intent,
        Total_PF_Balance: isUserAlreadyExist?.data?.Total_PF_Balance,
        Case_Number: isUserAlreadyExist?.data?.Case_Number,
        Call_Schedule: isUserAlreadyExist?.data?.Call_Schedule
      }
      // fetchToggle();
      localStorage.setItem("case_number", encryptData(isUserAlreadyExist?.data?.Case_Number));
      localStorage.setItem("existzohoUserdata", encryptData(JSON.stringify(zohodata)));
    } else {
      const zohodata = {
        Last_Name: "New Lead",
        Mobile: mobileNumber,
        Email: "",
        Wants_To: "CheckMyPF",
        Lead_Status: "Open",
        Lead_Source: leadSource || "",
        Campaign_Id: campaignId || "",
        CheckMyPF_Status: "Authenticated user",
        CheckMyPF_Intent: selectedOption ? selectedOption : "None",
        Total_PF_Balance: "",
        Call_Schedule: ""
      }
      // fetchToggle();
      localStorage.setItem("lead_data", encryptData(JSON.stringify(zohodata)))
    }
  }

  // const fetchToggle = async () => {
  //   try {
  //     const res = await put("calendly/update-toggle", {key:"showPaymentSlider"});
  //     if(res?.enablePaymentSlider){
  //       setShowPaymentSlider(true);
  //     }
  //     localStorage.setItem("showPaymentSlider", encryptData(res?.isEnable));
  //   } catch (err) {
  //     console.error("Error fetching toggle:", err);
  //   }
  // };
  useEffect(() => {
    const storedTime = localStorage.getItem("otpStartTime");
  
    if (storedTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(storedTime, 10)) / 1000);
      const remainingTime = Math.max(initialTime - elapsedTime, 0);
      setSeconds(remainingTime);
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
  }, [timerKey]); // <- now useEffect will re-run whenever timerKey changes
  
  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`
      : `${remainingSeconds} sec`;
  };

  const generateOtp = async (mobileNumber: any) => {
      try {
        const response = await post("auth/generateOtpFixMyPf", { mobile_number: mobileNumber });
        trackClarityEvent(MESSAGES.ClarityEvents.FINRIGHT_OTP_TRIGGERED)
        setGenerateOtpResult(response);
      } catch (error) {
        setMessage({
          type: "error",
          content: "Oops!! something went wrong, Please try again later!!",
        });
        window.location.href = MESSAGES.CHEKC_MY_PF_URL
      }
    };


  const handleResendOtp = async () => {
    setOtp("")
    setShowLoader(true);
    localStorage.setItem("otpStartTime", Date.now().toString());
    setTimerKey((prev) => prev + 1); // <-- trigger useEffect re-run
  
    try {
      const response = await post('/auth/generateOtpFixMyPf', { mobile_number: mobileNumber });
      if (response && response.success) {
        trackClarityEvent(MESSAGES.ClarityEvents.FINRIGHT_RESEND_OTP);
        setGenerateOtpResult(response);
      } else {
        setMessage({ type: 'error', content: MESSAGES.error.general });
      }
    } catch (error) {
      setMessage({ type: 'error', content: MESSAGES.error.general });
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleOtpChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setOtp(sanitized);
  
    if (sanitized.length === 6 && seconds > 0) {
      setTimeout(() => {
        onVerify(sanitized); // ← Pass directly
      }, 500);
    }
  }, [seconds]);




  return (
    <>
          {message.type && <ToastMessage message={message.content} type={message.type} />}

    <div className="container-fluid p-0 responsive-height">
      <div className="row g-0" style={{ height: "100%" }}>
        <div
          className="col-md-4 offset-md-4 d-flex flex-column"
          style={{
            backgroundColor: "#FFFFFF",
            height: "100%",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div className="d-flex flex-column flex-grow-1">
            {/* Title remains at top */}
            <div className="pt-5">
              {activeIndex === 0 ? (
                <TitleSubtitleBlock
                  title="Is Your PF Withdrawable?"
                  subtitle="CheckMyPF - Check now relax later"
                />
              ) : (
                <TitleSubtitleBlock
                  title="Getting Started.."
                />
              )}
            </div>

            {/* Card centered in remaining space */}
            <div className="d-flex flex-grow-1 justify-content-center align-items-center px-4" style={{paddingBottom:"45vh"}}>
              {/* <PFInfoReminderCard activeIndex={activeIndex} /> */}
              <PFInfoSlider initialIndex={activeIndex} />
            </div>
          </div>


          <div
            className="position-fixed bottom-0 start-50 d-flex flex-column"
            style={{
              transform: 'translateX(-50%)',
              borderTopLeftRadius: '1.25rem', // 20px
              borderTopRightRadius: '1.25rem',
              height: '45vh', // 280px
              maxWidth: '31.25rem', // 500px
              width: '100%',
              padding: '1.25rem', // 20px
              gap: '0.625rem', // 10px
              zIndex: 1050,
              backgroundColor: '#4255CB'
            }}
          >
            {/* SVG Icon */}
              {/* <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{ width: '7.25rem', height: '7.25rem' }}
              >
                {showLoader ? (
                  <Lottie
                    animationData={fingerprintAnimation}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <div className="text-center">
                    <img
                      src={slideLogo}
                      alt="uan-member-logo"
                      className="img-fluid rounded-circle border border-3"
                      style={{ width: "5.5rem", height: "5.5rem" }}
                    />
                  </div>
                )}

              </div> */}
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: showLoader ? '7.25rem' : '4.5rem',
                  height: showLoader ? '7.25rem' : '4.5rem',
                }}
              >
                {showLoader ? (
                  <Lottie
                    animationData={fingerprintAnimation}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <div className="mt-5">
                    <img
                      src={slideLogo}
                      alt="uan-member-logo"
                      className="img-fluid rounded-circle border border-3"
                    />
                  </div>
                )}
              </div>


            {/* Middle Section */}
            {showLoader ? (
              <LoaderBar
                duration={1}
                titleText="Verifying OTP"
                footerText="Creating Account..."
                apiDone={apiFinished}
              />
             

            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 pb-3" 
              style={{
                marginTop: showLoader ? '0' : '2.75rem',
                // height: showLoader ? '7.25rem' : '4.5rem',
              }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    lineHeight: '100%',
                    marginBottom: '0.5rem',
                  }}
                >
                  OTP sent to number {mobileNumber}
                </div>

                {/* Input + Check Button */}
                <div className="d-flex align-items-center justify-content-center">
                      <input
                        type="tel" // ← show numeric keyboard on mobile
                        autoComplete="one-time-code"
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
                        inputMode="numeric" 
                        pattern="[0-9]*"     
                      />


                      <button
                        className={`btn ${seconds === 0 || otp.length !== 6 ? '' : 'clickeffect'}`}
                        onClick={() => onVerify()}
                        disabled={seconds === 0 || otp.length !== 6}
                        style={{
                          border: 'none',
                          backgroundColor: seconds === 0 || otp.length !== 6 ? '#ccc' : '#34A853',
                          borderRadius: '50%',
                          width: '2.5rem',
                          height: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: seconds === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <FaCheck size={20} color="white" />
                      </button>

                </div>

                {/* Countdown */}
                <div
                  className="text-white text-center"
                  style={{
                    fontWeight: 400,
                    fontSize: '0.875rem',
                    lineHeight: '100%',
                    marginTop: '0.5rem',
                  }}
                >
                  {seconds > 0 ? (
                    <>
                      Waiting for OTP? Resend in :
                      <span className="ms-1" style={{ fontWeight: 700 }}>
                        {formatTime()}
                      </span>
                    </>
                  ) : (
                    <>
                      OTP Expired :
                      <span className="fw-bold ms-1" style={{ fontWeight: 700, cursor: "pointer"}} onClick={handleResendOtp}>
                        Resend OTP
                      </span>
                    </>
                  )}
        
                </div>
              </div>
            )}

            {/* Bottom Terms & Conditions */}
            <div
              className="text-center text-white pb-3" 
              style={{
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: '100%',
                // marginTop: '0.75rem',
              }}
            >
                <p style={{ marginBottom: 0 }}>By Log in, you agree to our</p>
                <p
                  style={{
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                  }}
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms & Conditions
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
    <TermsConditionsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
};

export default FinrightOtp;
