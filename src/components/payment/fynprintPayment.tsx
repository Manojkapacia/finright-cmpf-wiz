import "./fynprintPayment.css";
import { post } from "../common/api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";
import MESSAGES from "../constant/message";
import fynprint_logo from "../../assets/fynprint_logo.png";
import finright_logo from "../../assets/headerLogo.svg";


export default function PaymentRedirect() {
    const [searchParams] = useSearchParams();
    const [heading, setHeading] = useState('Redirecting to Payment Gateway')
    const [message, setMessage] = useState('Please wait while we prepare your secure payment session');
    const [mobileNumber, setMobileNumber] = useState('');
    const [, setAmount] = useState(0);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const CASHFREE_MODE = MESSAGES.CASHFREE_MODE as "production" | "sandbox"

    useEffect(() => {
        // Get amount and mobile from URL parameters
        const amountParam = atob(searchParams.get('amount') || '');
        const mobileParam = atob(searchParams.get('mobileNumber') || '');

        // if (!amountParam || !mobileParam) {
        //     setMessage('Transaction could not be completed Redirecting...');
        //     setTimeout(() => {
        //         window.location.href = MESSAGES.THEFYNPRINT_URL + `?order_id=&mobileNumber=${(mobileParam)}&payment_status=false`;
        //     }, 3000);
        //     return;
        // }

        // Set the state with URL parameters
        setAmount(Number(amountParam));
        setMobileNumber(mobileParam);

        const processPayment = async () => {
            try {
                const res = await post('payment/create-payment',
                    {
                        mobileNumber,
                        amount: Number(amountParam),
                    }
                );

                if (res?.success) {
                    const paymentSessionId = res.data.payment_session_id;
                    if (!paymentSessionId) {
                        throw new Error('Payment session ID not received');
                    }

                    const cashfree = await load({
                        mode: CASHFREE_MODE,
                        showLoader: true,
                        style: {
                            backgroundColor: "#ffffff",
                            color: "#1f2937",
                            fontFamily: "'Inter', sans-serif",
                            button: {
                                backgroundColor: "#FF5C5C",
                                color: "#ffffff",
                                border: "none",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                fontWeight: "600"
                            }
                        }
                    });

                    // Start checkout with redirect back to same page
                    cashfree.checkout({
                        paymentSessionId,
                        redirectTarget: "_self",
                        onSuccess: () => {
                        },
                        onFailure: () => {
                            throw new Error();
                        },
                        onClose: () => {
                            throw new Error();
                        }
                    });
                    return true;
                } else {
                    throw new Error();
                }
            } catch (error: any) {
                // setMessage(error?.message || "Transaction could not be completed Redirecting...");
                setTimeout(() => {
                    window.location.href = MESSAGES.THEFYNPRINT_URL + `?order_id=&mobileNumber=${(mobileParam)}&payment_status=false`;
                }, 3000);
            }
        };

        // Only process payment if we have valid amount and mobile number
        if (amountParam && mobileParam) processPayment();
    }, [searchParams, mobileNumber])

    useEffect(() => {
        const orderId = searchParams.get('order_id');
        const mobileNumber = searchParams.get('mobile_number');
        const payment = searchParams.get('payment_status');

        if(orderId && orderId !== '' && payment === 'true') {
            setIsPaymentComplete(true);
            setHeading('Redirecting to Consultation Booking Session');
            setMessage("Please wait while we take you back");
            setTimeout(() => {
                window.location.href = MESSAGES.THEFYNPRINT_URL + '?order_id=' + orderId + '&mobile_number=' + mobileNumber + '&payment_status=true';
            }, 2000);
        }
    }, [searchParams]);

    return (
        <div className="payment-container d-flex flex-column align-items-center justify-content-center">
            <div className="container">
                {/* Company Logos Header */}
                <div className="logos-section">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="logos-container">
                                {!isPaymentComplete ? (
                                    <>
                                        <div className="logo-wrapper">
                                            <img src={fynprint_logo} alt="TheFynprint Logo" className="payment-logo" />
                                        </div>
                                        <div className="connection-line">
                                            <div className="connection-dot"></div>
                                            <div className="connection-bar"></div>
                                            <div className="connection-dot"></div>
                                        </div>
                                        <div className="logo-wrapper">
                                            <img src={finright_logo} alt="Finright Logo" className="payment-logo" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="logo-wrapper">
                                            <img src={finright_logo} alt="Finright Logo" className="payment-logo" />
                                        </div>
                                        <div className="connection-line">
                                            <div className="connection-dot"></div>
                                            <div className="connection-bar"></div>
                                            <div className="connection-dot"></div>
                                        </div>
                                        <div className="logo-wrapper">
                                            <img src={fynprint_logo} alt="TheFynprint Logo" className="payment-logo" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Spinner */}
                <div className="spinner-section">
                    <div className="loading-spinner"></div>
                </div>

                {/* Loading Text */}
                <div className="text-section">
                    <h1 className="loading-title">
                        {heading}
                    </h1>
                    <p className="loading-subtitle">
                        {message}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-fill"></div>
                </div>
            </div>
        </div>
    );
}
