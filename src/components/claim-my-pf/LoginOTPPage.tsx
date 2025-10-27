import { FaCheck } from "react-icons/fa6";
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from './configs/axios';
// import { AxiosError } from "axios";
import { ClaimOverlay, FinalOtpOverlay, OTPOverlay } from "./Ovelay";

interface LocationState {
  userId?: string;
  uanData?: any;
  selectedAmount?: any

}

const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

const TIMER_KEY = "login-otp-timer-start";
const DURATION_SEC = 5 * 60; // 5 minutes
const LoginOTPPage = () => {
  const location = useLocation();
  const state = location.state as LocationState || {};
  const [userId] = useState<string>(state.userId || '');
  const [selectedAmount] = useState(state.selectedAmount)
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  // const [isVerifiedAdhar, setIsVerifiedAdhar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'verified' | null>(null);
  const [adharverificationStatus, setAdharVerificationStatus] = useState<'verifying' | 'verified' | null>(null);
  const [claimStatus, setClaimStatus] = useState<'loading' | 'ready' | null>(null);
  const [showAadhaarOtp, setShowAadhaarOtp] = useState(false);
  const [finalOtp, setFinalOtp] = useState('');
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [finalOtpError, setFinalOtpError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  let globalFormValues: any = null;

  const navigate = useNavigate()
  // currentUanData?.reportData?.withdrawableAmount


  const triggerAddressSubmission = async () => {
    // console.log("triggerAddressSubmission");
    try {
      if (!globalFormValues) {
        console.error('No form values available for address submission.');
        navigate('/claim-epfo/update-kyc-page', {
          state: { userId, uanData: state.uanData, selectedAmount },
        });
        return;
      }

      const submitAddressResponse = await axios.post('claim/submit-amount-and-address', {
        userId: userId,
        amount: selectedAmount.toString(),
        locality: globalFormValues.addrLine1 || 'NA',
        street: globalFormValues.addrLine2 || 'NA',
        city: globalFormValues.city || 'NA',
        state: globalFormValues.state || 'NA',
        district: globalFormValues.district || 'NA',
        pinCode: globalFormValues.pinCode || 'NA',
      });

      if (submitAddressResponse?.data?.success) {
        // console.log('Address submitted');

        await delay(2000);

        const getFinalOtpResponse = await axios.post('claim/get-final-otp', { userId });
        if (getFinalOtpResponse?.data?.success) {
          localStorage.removeItem("login-otp-timer-start");
          startOtpTimer(handleOtpComplete);         
           // console.log('Final OTP triggered');
        } else {
          // console.log('Final OTP not triggered');
        }
      } else {
        // console.log('Address not submitted');
      }
    } catch (error) {
      // const err = error as AxiosError<any>;
      // console.error('Error in triggerAddressSubmission:', err?.response?.data?.message || err.message || error);
    }
  };
  const submitLoginOtpForm = async () => {
    if (!otp || otp.length !== 6) {
      return;
    }
    const showServerDownAlert = () => {
      // alert("Server down, Pleae! try again after some time.");
      setClaimStatus(null);
      setVerificationStatus(null);
      setLoading(false);
      navigate('/claim-epfo/error-page', {
        state: { uanData:state.uanData},
      });
    };
    setLoading(true);
    setVerificationStatus("verifying");

    try {
      // Verify OTP first
      const otpResponse = await axios.post('claim/submit-login-otp', { userId, otp });
      // console.log("otpResponse", otpResponse)
      if (!otpResponse.data.success) {
        if (otpResponse.data.message === 'Invalid OTP entered') {
          setOtp("")
          setInvalidOtp(true);
          setVerificationStatus(null);
          setLoading(false);
          return;
        }
        showServerDownAlert();
        return;
      }
    localStorage.removeItem(TIMER_KEY);
    startOtpTimer(handleOtpComplete);
    // alert("OTP Submitted. Timer Reset.");
      // Show 'verified' status
      setVerificationStatus('verified');
      // Wait for 2 seconds before proceeding
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear verification status and stop loading
      setVerificationStatus(null);
      setLoading(false);
      setIsVerified(true);
      setClaimStatus('loading');
      await delay(1000);
      const clickViewProfileResponse = await axios.post('claim/click-view-profile', {
        userId,
      });
      globalFormValues = clickViewProfileResponse?.data?.formValues; // Save formValues here
      // console.log('clickViewProfileResponse: ', clickViewProfileResponse);


      // Begin claim process
      await delay(2000);
      await axios.post('claim/click-claim-button', { userId });
      // console.log(epfoClickResponse?.data?.success ? 'EPFO Clicked-click-claim' : 'EPFO Not Clicked-click-claim');

      await axios.post('claim/submit-account-number', {
        userId,
        uan: state?.uanData?.rawData?.data?.profile?.UAN,
      });
      // console.log(accountNumberResponse?.data?.success ? 'EPFO Clicked-accountnumber response' : 'EPFO Not Clicked');

      await delay(2000);

      const agreementAcceptedResponse = await axios.post('claim/accept-agreement-after-account-number', { userId });
      if (!agreementAcceptedResponse?.data?.success) {
        // console.log('Agreement not accepted');
        setClaimStatus(null);
        showServerDownAlert()
        return;
      }
      // console.log('Agreement accepted');

      await delay(2500);

      const pfAdvanceResponse = await axios.post('claim/select-pf-advance-option', { userId });
      if (!pfAdvanceResponse?.data?.success) {
        // console.log('PF Advance not selected');
        setClaimStatus(null)
        showServerDownAlert();
        return;
      }
      // console.log('PF Advance selected');

      await delay(3000);

      const serviceOptionResponse = await axios.post('claim/select-service-option', { userId });
      if (!serviceOptionResponse?.data?.success) {
        // console.log('Service not selected');
        setClaimStatus(null);
        showServerDownAlert()
        return;
      }
      // console.log('Service selected');

      await delay(2000);

      const purposeSelectionResponse = await axios.post('claim/select-purpose-for-advance', { userId });
      if (!purposeSelectionResponse?.data?.success) {
        // console.log('Purpose for Advance not selected');
        setClaimStatus(null);
        showServerDownAlert();
        return;
      }
      // console.log('Purpose for Advance selected');

      await delay(2000);
      await triggerAddressSubmission();

      setClaimStatus('ready'); // All done
      setTimeout(() => {
        setClaimStatus(null);
        setShowAadhaarOtp(true); // Aadhaar overlay
      }, 2000);

    } catch (error: any) {
      // const err = error as AxiosError<any>;
      // console.error('Error in OTP submission:', err);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Invalid OTP entered"
      ) {
        // alert("Invalid OTP. Please try again.");
        setOtp("")
        setInvalidOtp(true);
        setVerificationStatus(null);
      } else {
        showServerDownAlert();
        setClaimStatus(null);
        setVerificationStatus(null);
      }
    } finally {
      setLoading(false);
    }
  };


  const submitFinalOtpForm = async () => {
    if (!finalOtp || finalOtp.length !== 6) return;

    setLoading(true);
    setAdharVerificationStatus('verifying');
    setFinalOtpError(false); // reset error

    try {
      await delay(5000);
      const response = await axios.post('claim/submit-final-otp', {
        userId,
        otp: finalOtp,
      });
      // console.log("response", response)
      await delay(5000);

      if (response.data?.success) {
        setAdharVerificationStatus('verified');
        await delay(3000);
        localStorage.removeItem(TIMER_KEY);
        navigate("/claim-epfo/final-page");
      } else {
        setAdharVerificationStatus(null);
        if (response.data.message === 'Invalid Aadhaar OTP entered') {
          setFinalOtp("")
          setFinalOtpError(true); // show error message
        }
      }
    } catch (err) {
      setAdharVerificationStatus(null);
      setFinalOtp("")
    } finally {
      setLoading(false);
    }
  };


  // login otp timer
  const startOtpTimer = (onComplete: () => void): void => {
    // Save start time if not exists
    let startTime = localStorage.getItem(TIMER_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(TIMER_KEY, startTime);
    }

    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start new interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - parseInt(startTime!)) / 1000);
      const remaining = DURATION_SEC - elapsed;

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        localStorage.removeItem(TIMER_KEY);
        onComplete();
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const formattedTime = ` ${minutes} : ${seconds < 10 ? "0" : ""}${seconds} secs`;

      const timerElement = document.getElementById("login-otp-timer");
      if (timerElement) {
        timerElement.textContent = formattedTime;
      }
    }, 1000);
  };

  const handleOtpComplete = () => {
    navigate("/express-withdraw", { replace: true });
  };

  // const handleOtpSubmit = () => {
  //   // Simulate OTP validation, then reset timer
  //   localStorage.removeItem(TIMER_KEY);
  //   startOtpTimer(handleOtpComplete);
  //   alert("OTP Submitted. Timer Reset.");
  // };

  useEffect(() => {
    startOtpTimer(handleOtpComplete);

    return () => {
      // Cleanup interval on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);






  const rawPhoneNumber = state?.uanData?.profileData?.data?.phoneNumber || '';
  const cleanedPhone = rawPhoneNumber.startsWith('91') ? rawPhoneNumber.slice(2) : rawPhoneNumber;
  const maskedPhone = `XXXXXX${cleanedPhone.slice(-4)}`;
  return (
    <div className="container-fluid to-margin-top" style={{ height: "90vh" }}>
      <div className="row h-100">
        <div className="container-fluid" style={{ height: "90vh", backgroundColor: "#E6ECFF", fontFamily: "Poppins" }}>
          <div className="row h-100">
            <div className="col-md-4 offset-md-4 d-flex flex-column align-items-center" style={{ marginTop: '3rem' }}>
              {/* Claim Amount Section */}
              <div className="text-center w-100 mb-4">
                <h5 style={{ fontWeight: 400, fontSize: "0.875rem" }}>Claim Amount</h5>
                <div className="express-amount mt-2 mb-2" style={{fontFamily: "Roboto"}}>₹ {selectedAmount}</div>
                <div className="" style={{color:"#858585"}}>
                  <div className="express-account-IFSC">A/C No: {state?.uanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber || "--"}</div>
                  <div className="express-account-IFSC mt-1">IFSC Code: {state?.uanData?.rawData?.data?.profile?.kycDetails?.bankIFSC || "--"}</div>
                </div>
              </div>

              {/* Rest of your components like OTP inputs and overlays */}
              <div className="w-100 position-relative">
                {/* <FinalOtpOverlay verificationStatus={"verified"}/> */}
                {verificationStatus && <OTPOverlay verificationStatus={verificationStatus} />}
                {claimStatus && <ClaimOverlay verificationStatus={claimStatus} />}
                {adharverificationStatus && <FinalOtpOverlay verificationStatus={adharverificationStatus} />}

                {!isVerified && !verificationStatus && !claimStatus ? (
                  <div className="card border-0 shadow-sm p-3 w-100" style={{ borderRadius: '1rem' }}>
                    <div className="card-body text-center">
                      <h5 className="mb-1" style={{ fontWeight: 700, fontSize: "0.875rem" }}>Verify your Mobile Number</h5>
                      <p className="mb-0" style={{ fontWeight: 400, fontSize: "1rem" }}>OTP Sent to your mobile number</p>
                      <p className="mb-1"style={{ fontWeight: 400, fontSize: "1rem",marginTop:"-0.2rem" }}>{maskedPhone}</p>

                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <input
                          type="text"
                          className="form-control text-center"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value);
                            if (invalidOtp) setInvalidOtp(false);
                          }}
                          maxLength={6}
                          style={{
                            borderRadius: '100px',
                            border: '1px solid #00124F',
                          }}
                        />
                        <button
                          className="btn  d-flex align-items-center justify-content-center rounded-circle clickeffect"
                          style={{ width: '35px', height: '35px', backgroundColor: "#34A853",border:"none" }}
                          onClick={submitLoginOtpForm}
                          disabled={loading}
                        >
                          <FaCheck className="text-white" />
                        </button>
                      </div>

                      <p className="mt-2 mb-0" style={{ fontWeight: 400, fontSize: "0.875rem" }} >
                        Waiting for OTP? Resend in: <span           id="login-otp-timer"

                          className="text-#304DFF" style={{ fontWeight: 700, fontSize: "0.875rem", color: "#304DFF" }}> 
                        </span>
                      </p>
                      {invalidOtp && (
                        <p className="mt-2 text-danger" style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                          Invalid OTP. Please try again.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              {showAadhaarOtp && !adharverificationStatus ? (
                <div className="card border-0 shadow-sm p-3 w-100" style={{ borderRadius: '1rem' }}>
                  <div className="card-body text-center">
                    <h5 className="mb-1" style={{ fontWeight: 700, fontSize: "0.875rem" }}>Verify your Aadhaar Number</h5>
                    <p className="mb-0" style={{ fontWeight: 400, fontSize: "1rem" }}>OTP Sent to your mobile number</p>
                    <p className="mb-1"style={{ fontWeight: 400, fontSize: "1rem",marginTop:"-0.2rem" }}>{maskedPhone}</p>

                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <input
                        type="text"
                        className="form-control text-center"
                        placeholder="Enter OTP"
                        value={finalOtp}
                        onChange={(e) => setFinalOtp(e.target.value)}
                        maxLength={6}
                        style={{ borderRadius: '100px', border: '1px solid #00124F', }}
                      />
                      <button
                        className="btn  d-flex align-items-center justify-content-center rounded-circle clickeffect"
                        style={{ width: '35px', height: '35px', backgroundColor: "#34A853",border:"none" }}
                        onClick={submitFinalOtpForm}
                        disabled={loading}
                      >
                        <FaCheck className="text-white" />
                      </button>
                    </div>

                    <p className="mt-3 mb-0" style={{ fontWeight: 400, fontSize: "0.875rem" }}>
                      Waiting for OTP? Resend in: <span  id="login-otp-timer" className="text-#304DFF" style={{ fontWeight: 700, fontSize: "0.875rem", color: "#304DFF",fontFamily: "Roboto" }}>                   </span>
                    </p>
                    {finalOtpError && (
                      <p className="mt-2 text-danger" style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        Resident authentication failed. Invalid OTP value. And claim not submitted on portal. Please try again later.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* OTP Verification Card */}


          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOTPPage;



