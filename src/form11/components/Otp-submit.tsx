import React from 'react';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import './../App.css'
import { useEffect, useState } from 'react';
import LoadingCard from './../common/loading-card';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ToastMessage from '../common/toast-message';
import MoreForYouSlider from '../common/MoreForYouSlider';
import { get, post } from '../../components/common/api';
import MESSAGES from '../../components/constant/message';

const OtpSubmit: React.FC = () => {
    const [showLoader, setShowLoader] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const [timer, setTimer] = useState(60)
    const { uan, password } = location.state || {};
    const [otp, setOtp] = useState('');

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (sec: any) => {
        const minutes = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;

        if (minutes > 0 && remainingSeconds > 0) {
            return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} min`;
        } else if (minutes > 0 && remainingSeconds === 0) {
            return `${minutes}:00 min`;
        } else {
            return `${remainingSeconds} sec`;
        }
    };

    const handleApiCall = async () => {
        if (!otp.trim()) {
            setMessage({ type: "error", content: MESSAGES.error.invalidOtp });
            return;
        }

        try {
            setShowLoader(true);

            const result = await post("auth/submit-otp", {
                otp: otp.trim(),
                uan,
                password
            });

            if (result?.status === 400) {
                setMessage({ type: "error", content: result.message });
                setShowLoader(false);
                return;
            }

            const responseUan = await get('/data/fetchByUan/' + uan);

            if (!responseUan) {
                setMessage({ type: "error", content: MESSAGES.error.generic });
                setShowLoader(false);
                return;
            }

            if (
                !responseUan?.rawData?.data?.home ||
                !responseUan?.rawData?.data?.serviceHistory?.history
            ) {
                setMessage({
                    type: "error",
                    content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!"
                });
                setTimeout(() => {
                    navigate("/epfo-down");
                }, 3000);
                setShowLoader(false);
                return;
            }

            const employmentDataSet = [{
                establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
                currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
                userEmpHistoryCorrect: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
                userStillWorkingInOrganization: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
                serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
                isFromFullScrapper: true
            }];

             // Step 1: Delay for 5 seconds while showing loader
        setTimeout(() => {
            // Step 2: Show success message
            setMessage({ type: "success", content: "EPF data fetched successfully!" });

            // Step 3: Wait 2 more seconds, then navigate
            setTimeout(() => {
                navigate("/form11/kyc", {
                    state: {
                        processedUan: uan,
                        mobile_number: '+911122334455',
                        currentUanData: responseUan,
                        currentEmploymentUanData: employmentDataSet
                    }
                });
                setShowLoader(false);
            });
        }, 5000);
        } catch (error: any) {
            console.error("OTP submission error", error);
            setShowLoader(false);

            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                setMessage({
                    type: "error",
                    content: "Unable to connect to server. Please check your connection or try again later."
                });
            } else {
                setMessage({
                    type: "error",
                    content: "Something went wrong. Please try again."
                });
            }

            setTimer(0);
        }
    };

    return (
        <>
            {message.type && <ToastMessage message={message.content} type={message.type} />}
        <div className="container-fluid px-2">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff', height: '100vh' }}>
                    <Header />
                    <CoustomCard />

                    {showLoader ? (
                        <LoadingCard
                            show={showLoader}
                            onClose={() => {
                                setShowLoader(false);
                            }}
                        />
                    ) : (
                        <>
                            <p className="mt-4 ms-2 mb-0" style={{ fontSize: '0.8rem', color: '#000000' }}>Enter your UAN and EPFO portal Password</p>

                            <div className="card w-100 border-0 mt-4" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }} >
                                <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
                                    <label className="mb-0 me-2 ms-1" style={{ fontSize: '0.8rem' }}>
                                        UAN
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control custom-input"
                                        value={uan}
                                        readOnly
                                        style={{ maxWidth: '60%' }}
                                        placeholder="Enter UAN"
                                    />
                                </div>
                            </div>

                            <div className="card w-100 border-0 mt-2" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }} >
                                <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
                                    <label className="mb-0 me-2 ms-1" style={{ fontSize: '0.8rem' }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control custom-input"
                                        style={{ maxWidth: '60%' }}
                                        value={password}
                                        readOnly
                                        placeholder="Enter Password"
                                    />
                                </div>
                            </div>

                            <div className="card w-100 border-0 mt-2" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }} >
                                <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
                                    <label className="mb-0 me-2 ms-1" style={{ fontSize: '0.8rem' }}>
                                        OTP
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="form-control custom-input"
                                        style={{ maxWidth: '60%' }}
                                        placeholder="Enter OTP"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                if (onlyNums.length <= 6) {
                                                    setOtp(onlyNums);
                                                }
                                            }}
                                    />
                                </div>
                            </div>
                            {timer > 1 ? (
                                <p className="mt-4 mb-0 ms-2" style={{ fontSize: '0.8rem' }}>
                                    Waiting for OTP? Resend in : {' '}
                                    <span style={{ color: '#2463EB', cursor: 'pointer', fontWeight: '700' }}>{formatTime(timer)}</span>
                                </p>
                            ) : (
                                <p className="mt-4 mb-0 ms-2" style={{ fontSize: '0.8rem' }}>
                                    OTP Expired 
                                    {/* <span className="fw-bold ms-1" style={{ color: "#304DFF", cursor: "pointer" }} onClick={resendOtp}>
                                       : Resend OTP
                                    </span> */}
                                </p>
                            )}
                            <button className="btn mt-4 w-100" disabled={otp.length !== 6 || timer <= 0} onClick={handleApiCall} style={{ backgroundColor: "#07115B", color: "#FFFFFF", fontSize: "1rem", fontWeight: "700", paddingTop: "0.8rem", paddingBottom: "0.8rem", cursor: otp.length === 6 && timer > 0 ? "pointer" : "not-allowed"}}>
                                Continue
                            </button>
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

export default OtpSubmit;