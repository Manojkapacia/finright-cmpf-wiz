import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { IoRocketSharp } from 'react-icons/io5';
import { BiSupport } from 'react-icons/bi';
import { post } from '../common/api';
import { decryptData, encryptData } from '../common/encryption-decryption';
import { handlePayToInitiate } from '../../helpers/payment';
import ToastMessage from "./../common/toast-message";
import ContactUsManager from '../common/ContactUsManager';
import BookCalendry from './bookCalendry';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TransactionFailedSlider from '../dashboard/Models/transactionFailedSlider';
import TransactionSuccessSlider from '../dashboard/Models/transactionSuccessSlider';
import LoaderPayment from '../user-registeration/Onboarding2.0/common/loaderPayment';

const PaymentInitiate: React.FC = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState({ type: "", content: "" });
    const [paymentData, setPaymentData] = useState<any>(null);
    const [callBookingDate, setCallBookingDate] = useState<any>(null);
    const [bookCalendry, setBookCalendry] = useState(false);
    const [hasActiveBooking, setHasActiveBooking] = useState(false);
    const [caseNumber, setCaseNumber] = useState("");
    const leadIdRef = useRef<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTransactionFailedSlider, setShowTransactionFailedSlider] = useState(false);
    const [showTransactionSuccessSlider, setShowTransactionSuccessSlider] = useState(false);
    const [lastVisitedUrl, setLastVisitedUrl] = useState("");
    const location = useLocation();
    const isPaymentPage = decryptData(localStorage.getItem("isPaymentPage"));
    const [zohoPaymentTag, setZohoPaymentTag] = useState("");
    const [checkABTestuser, setCheckABTestuser] = useState(false);
    const[paymentAmount, setPaymentAmount] = useState("2000");
    const handleBackClick = () => {
        navigate("/dashboard");
    };

    useEffect(() => {
        const tagValue = decryptData(localStorage.getItem("tag_value"));
        const hasInitialized = decryptData(localStorage.getItem("paymentInitialized")) === "true";
        
        if (!hasInitialized && isPaymentPage === "true" && !tagValue) {
            localStorage.setItem("paymentInitialized", encryptData("true"));
            handlePayToInitiate({
                setLoading,
                setMessage,
                amount: paymentAmount
            });
        }
    }, []);

    const checkUserBooking = async () => {
        setIsSubmitting(true);
        try {
            const userMobile = decryptData(localStorage.getItem("user_mobile"));
            const cleanMobile = userMobile?.replace(/^\+91/, "");
            const searchRes = await post("data/searchLead", { mobile: cleanMobile });
            const leadId = searchRes?.data?.id;
            leadIdRef.current = leadId;
            const tagValue = searchRes?.data?.Tag?.find((tag:any) => tag?.name.toLowerCase() === "paid initiation")?.name;
            setZohoPaymentTag(tagValue);
            setCaseNumber(searchRes?.data?.Case_Number);
            const bookingRes = await post("calendly/check-user-booking", { mobile: userMobile });
            if (bookingRes) {
                setIsSubmitting(false);
                setCallBookingDate(bookingRes);
                setCheckABTestuser(bookingRes?.data?.callbookingStatus?.showPaymentSlider);
                setPaymentAmount(bookingRes?.data?.callbookingStatus?.showPaymentSlider ? "999" : "2000");
                console.log(paymentAmount);
                if ((bookingRes?.data?.assigneeName && bookingRes?.data?.date && bookingRes?.data?.time) || tagValue?.toLowerCase() === "paid initiation") {
                    setBookCalendry(true);
                    if (bookingRes?.data?.date) {
                        setHasActiveBooking(true);
                    }
                } else if ((bookingRes?.data?.callbookingStatus?.noCallbookedShown && bookingRes?.hasActiveBooking === false) || tagValue?.toLowerCase() === "paid initiation") {
                    setBookCalendry(true);
                    setHasActiveBooking(false);
                }
            }
        } catch (err) {
            console.error("Error fetching agent booking:", err);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const lastVisitedUrl = localStorage.getItem("lastVisitedUrl") || "/dashboard";
        if (lastVisitedUrl.includes("/how-can-help") || lastVisitedUrl.includes("/payment-initiate")) {
            setLastVisitedUrl(lastVisitedUrl);
        }else{
            setLastVisitedUrl("/dashboard");
        }
        const init = async () => {
            await checkUserBooking(); // wait until leadIdRef is set

            const query = new URLSearchParams(location.search);
            const orderId = query.get("order_id");
            if (orderId) {
                verifyPayment(orderId);
            }
        };

        init();
    }, [location]);

    // ✅ Function to verify payment with backend
    const verifyPayment = async (orderId: any) => {
        setIsSubmitting(true);
        window.history.replaceState({}, document.title, "/payment-initiate");
        const mobileNumber = decryptData(localStorage.getItem("user_mobile"))
        try {

            const response = await post("payment/check-payment-status", { orderId, mobileNumber, redirectKey: "CMPF" });
            if (response?.data?.payment_status?.toUpperCase() === 'SUCCESS') {
                setIsSubmitting(false);
                const leadId = leadIdRef.current;
                setShowTransactionSuccessSlider(true);
                setPaymentData(response?.data);
                setTimeout(() => {
                    setBookCalendry(true);
                }, 2000);
                await post("lead/addTags", { leadId, tags: ["Paid Initiation"], mobileNumber});
            } else {
                setIsSubmitting(false);
                if(isPaymentPage === "true"){
                    localStorage.setItem("showPaymentFailed", encryptData("true"));
                    navigate("/dashboard");
                }
                setShowTransactionFailedSlider(true);
                console.error("❌ Payment verification failed:", response);
            }
        } catch (error) {
            setIsSubmitting(false);
            if(isPaymentPage === "true"){
                localStorage.setItem("showPaymentFailed", encryptData("true"));
                navigate("/dashboard");
            }
            setShowTransactionFailedSlider(true);
         
            console.error("Error verifying payment:", error);
        }
    };

    if ((bookCalendry && (paymentData?.cf_payment_id ||  callBookingDate?.data?.callbookingStatus?.cf_payment_id)) || zohoPaymentTag) {
        return <BookCalendry
            paymentResponse={{
                order_id: paymentData?.order_id || callBookingDate?.data?.callbookingStatus?.order_id,
                order_amount: paymentData?.order_amount || callBookingDate?.data?.callbookingStatus?.order_amount,
                payment_completion_time: paymentData?.payment_completion_time || callBookingDate?.data?.callbookingStatus?.payment_completion_time,
                cf_payment_id: paymentData?.cf_payment_id || callBookingDate?.data?.callbookingStatus?.cf_payment_id,
                payment_currency: paymentData?.payment_currency || callBookingDate?.data?.callbookingStatus?.payment_currency,
                assigneeName: callBookingDate?.data?.assigneeName,
                date: callBookingDate?.data?.date,
                time: callBookingDate?.data?.time,
            }}
            hasActiveBooking={hasActiveBooking}
        />;
    }

    return (
        <>
            {isSubmitting ? (
                <LoaderPayment
                />
            ) : (
                <>
                <div style={{ minHeight: '94vh', backgroundColor: '#E6ECFF', paddingTop: '2rem' }}>
                    {message.type && <ToastMessage message={message.content} type={message.type} />}
                    <div className="container" style={{ maxWidth: '' }}>
                        <div className="row">
                            <div className="col-md-4 offset-md-4">
                                {/* Back Button */}
                                <button
                                    onClick={handleBackClick}
                                    className="btn p-0 mb-4 d-flex align-items-center"
                                    style={{
                                        fontSize: '1rem',
                                        color: '#000000',
                                        background: 'none',
                                        border: 'none',
                                        gap: '0.45rem',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                    }}
                                >
                                    <FaArrowLeft size={16} />
                                    <span>Back to PF report</span>
                                </button>

                                <div className="text-center mb-4">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                            width: '5.5rem',
                                            height: '5.5rem',
                                            backgroundColor: '#FFE2A9',
                                        }}
                                    >
                                        <IoRocketSharp size={40} style={{ color: '#3B82F6' }} />
                                    </div>
                                </div>

                                {/* Header Text */}
                                <div className="text-center mb-3">
                                    <p
                                        className="fw-semibold mb-2"
                                        style={{ fontSize: '1.13rem', color: '#000000', fontWeight: '500' }}
                                    >
                                        Initiate your case
                                    </p>
                                    <p
                                        className="mb-0"
                                        style={{
                                            fontSize: '0.81rem',
                                        }}
                                    >
                                        Amazing! you have taken the first step towards getting your claim settled
                                    </p>
                                </div>

                                <div
                                    className="card shadow-sm mb-3"
                                    style={{ border: 'none', borderRadius: '0.9rem', backgroundColor: '#f8fcfc' }}
                                >
                                    <div className="card-body p-4">
                                        {/* Case Details */}
                                        <div className="mb-4">
                                            <p
                                                className="fw-medium mb-2"
                                                style={{ fontSize: '0.81rem', fontWeight: '500' }}
                                            >
                                                Your Case Details
                                            </p>

                                            <div style={{ fontSize: "0.81rem" }}>
                                                {[
                                                    ["Case ID", caseNumber],
                                                    ["Amount", checkABTestuser  ? "999.00 INR" : "2000.00 INR"],
                                                ].map(([label, value], index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            display: "flex",
                                                            padding: "0.5rem 0",
                                                            borderBottom: "1px solid #EAEAEA",
                                                        }}
                                                    >
                                                        <div style={{ minWidth: "9.5rem", fontWeight: 500 }}>
                                                            {label}
                                                        </div>
                                                        <div style={{ flex: 1 }}>{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Expert Text */}
                                        <p
                                            className="text-center mb-2"
                                            style={{
                                                fontSize: '0.95rem',
                                                color: '#858585',
                                                lineHeight: '1.2',
                                            }}
                                        >
                                            Our Experts are ready with personalized Plan of Action to get your case resolved
                                        </p>

                                        {/* Pay Now Text */}
                                        <div className="text-center">
                                            <p
                                                style={{
                                                    fontSize: '0.9rem',
                                                    color: '#FD5C5C',
                                                    fontWeight: '700',
                                                }}
                                            >
                                                Pay now to get guarantee claim settlement
                                            </p>
                                        </div>

                                        {/* Pay to Initiate Button */}

                                        <div className="text-center">
                                            <motion.button
                                                className="btn w-100"
                                                style={{
                                                    backgroundColor: "#122A7B",   // always same color
                                                    color: "white",
                                                    padding: "0.75rem 1.5rem",
                                                    borderRadius: "0.5rem",
                                                    fontWeight: 500,
                                                    fontSize: "1rem",
                                                    cursor: loading ? "not-allowed" : "pointer",
                                                    opacity: loading ? 0.85 : 1,  // slight fade to indicate disabled
                                                }}
                                                onClick={() => handlePayToInitiate({ setLoading, setMessage, amount: paymentAmount })}
                                                disabled={loading}
                                                whileTap={{ scale: 0.95 }}       // 👈 click effect
                                                transition={{ duration: 0.1 }}   // quick tap animation
                                            >
                                                {loading ? (
                                                    <span className="d-flex justify-content-center align-items-center gap-2">
                                                        <span
                                                            className="spinner-border spinner-border-sm text-light"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Please wait...
                                                    </span>
                                                ) : (
                                                    "Pay to Initiate case"
                                                )}
                                            </motion.button>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mt-3">
                                            <div>
                                                <p
                                                    className="mb-0"
                                                    style={{ fontSize: '1rem', fontWeight: '500' }}
                                                >
                                                    Facing issues? we are
                                                </p>
                                                <p
                                                    className="mb-0"
                                                    style={{ fontSize: '1rem', fontWeight: '500' }}
                                                >
                                                    there for you
                                                </p>
                                            </div>
                                            <ContactUsManager
                                                trigger={
                                                    <div
                                                        className="d-flex align-items-center gap-2 px-2 py-1 fw-medium"
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            border: "1px solid rgba(133, 133, 133, 0.5)",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <div
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{
                                                                backgroundColor: "#B2F2E7",
                                                                borderRadius: "50%",
                                                                padding: "4px",
                                                            }}
                                                        >
                                                            <BiSupport size={14} color="#000" />
                                                        </div>
                                                        <span style={{ color: "#000" }}>Contact Us</span>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        </div>

                        <TransactionFailedSlider
                            show={showTransactionFailedSlider}
                            onClose={() => {setShowTransactionFailedSlider(false); navigate(lastVisitedUrl)}}
                            onRetry={() => {(handlePayToInitiate({ setLoading, setMessage, amount: paymentAmount }));
                        }}
                        />
                        <TransactionSuccessSlider
                            show={showTransactionSuccessSlider}
                            onClose={() => setShowTransactionSuccessSlider(false)}
                        />
                </>
            )}
        </>
    );
};

export default PaymentInitiate;

