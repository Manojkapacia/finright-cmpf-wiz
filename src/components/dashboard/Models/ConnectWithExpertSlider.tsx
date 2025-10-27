import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlCalender } from "react-icons/sl";
import { FaPhoneAlt } from "react-icons/fa";
import { post } from "../../common/api";
import { decryptData } from "../../common/encryption-decryption";

interface ConnectWithExpertSliderProps {
    show: boolean;
    onClose: () => void;
    onBookCall: () => Promise<void>;
}
type Mode = "main" | "callInfo";

const ConnectWithExpertSlider: React.FC<ConnectWithExpertSliderProps> = ({ show, onClose, onBookCall }) => {
    const [mode, setMode] = useState<Mode>("main");
    const [agentAvailable, setAgentAvailable] = useState(false);
    const [paymentSlider, setPaymentSlider] = useState<boolean | null>(null);

    useEffect(() => {
        if (show) setMode("main");
    }, [show]);

    const handleClose = () => {
        // ✅ Reset immediately on close to avoid flashing wrong content next open
        setMode("main");
        onClose();
    };

    useEffect(() => {
        const fetchBooking = async () => {
          try {
            const bookingRes: any = await post("calendly/check-user-booking", {
              mobile: decryptData(localStorage.getItem("user_mobile")),
            });
      
            setPaymentSlider(bookingRes?.data?.callbookingStatus?.showPaymentSlider ?? false);
          } catch (error) {
            console.error("Error fetching booking:", error);
            setPaymentSlider(false); // fallback
          }
        };
      
        fetchBooking();
      }, []);

    const handleCallNow = async () => {

        try {
            const response = await fetch("https://kpi.knowlarity.com/Basic/v1/account/agent", {
                method: "GET",
                headers: {
                    Authorization: "cccd9c43-0772-49c3-bdac-6677ebd46efd",
                    "Content-Type": "application/json",
                    "x-api-key": "QdQa83awS05tyB0KAVATX7tvm3WuBXz16QEluhix",
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch agent data:", response.statusText);
                setAgentAvailable(false);
                return;
            }

            const agentData = await response.json();

            const availableAgents = agentData.objects.filter((agent: any) => agent.status === "Available");

            if (availableAgents.length > 0) {
                setAgentAvailable(true);
            } else {
                setAgentAvailable(false);
            }
            setMode("callInfo");
        } catch (error) {
            console.error("Error fetching agents:", error);
            setAgentAvailable(false);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        className="position-fixed start-0 end-0"
                        style={{
                            bottom: 0,
                            zIndex: 1050,
                        }}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    >
                        <div
                            className="mx-auto shadow-lg"
                            style={{
                                width: "100%",
                                maxWidth: "31rem",
                                background: "#fff",
                                borderTopLeftRadius: "1rem",
                                borderTopRightRadius: "1rem",
                                padding: "1rem",
                                maxHeight: "65vh",
                                minHeight: "45vh",
                                overflowY: "auto",
                                position: "relative",
                            }}
                        >
                            {/* Close */}
                            <button
                                onClick={handleClose}
                                className="btn btn-light position-absolute"
                                style={{ right: 12, top: 8, lineHeight: 1 }}
                                aria-label="Close"
                            >
                                ×
                            </button>

                            {mode === "main" && paymentSlider !== null &&(
                                <>
                                    <h5
                                        className="text-center mb-3"
                                        style={{ fontWeight: 600, marginTop: "2rem" }}
                                    >
                                        Connect with Expert
                                    </h5>

                                    {/* Card 1: Schedule */}
                                    <div
                                        className="d-flex flex-column"
                                        style={{
                                            minHeight: paymentSlider ? "37vh" : "auto", // same height as callInfo when only one card
                                            justifyContent: paymentSlider ? "center" : "flex-start", // center card if only one
                                        }}
                                    >
                                        <div
                                            className="bg-white"
                                            style={{
                                                borderRadius: "0.75rem",
                                                border: "1px solid rgba(0,0,0,0.08)",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                padding: "1rem",
                                                marginBottom: "1rem",
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <SlCalender size={16} color="#374151" />
                                                <span
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: "0.95rem",
                                                        color: "#111827",
                                                    }}
                                                >
                                                    Schedule a Call
                                                </span>
                                            </div>
                                            <p
                                                className="mb-3"
                                                style={{ fontSize: ".9rem", color: "#374151" }}
                                            >
                                                Book a call with our expert for a later time as per
                                                availability
                                            </p>
                                            <div className="d-flex justify-content-center">
                                                <button
                                                    className="w-50 clickeffect"
                                                    onClick={async () => {
                                                        await onBookCall();
                                                        onClose();
                                                    }}
                                                    style={{
                                                        border: 0,
                                                        outline: 0,
                                                        padding: "0.625rem 1rem",
                                                        borderRadius: "9999px",
                                                        background: "#E6E8FF",
                                                        color: "#000",
                                                        fontWeight: 600,
                                                        fontSize: ".9rem",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                                    }}
                                                >
                                                    Book a Call
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card 2: Call Now */}
                                        {!paymentSlider &&
                                            <div
                                                className="bg-white"
                                                style={{
                                                    borderRadius: "0.75rem",
                                                    border: "1px solid rgba(0,0,0,0.08)",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                    padding: "1rem",
                                                }}
                                            >
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <FaPhoneAlt size={16} color="#374151" />
                                                    <span
                                                        style={{
                                                            fontWeight: 500,
                                                            fontSize: "0.95rem",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        Call right now
                                                    </span>
                                                </div>
                                                <p
                                                    className="mb-3"
                                                    style={{ fontSize: ".9rem", color: "#374151" }}
                                                >
                                                    Book a call with our expert for a later time as per
                                                    availability
                                                </p>
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        className="w-50 clickeffect"
                                                        style={{
                                                            border: "1px solid #000",
                                                            outline: 0,
                                                            padding: "0.625rem 1rem",
                                                            borderRadius: "9999px",
                                                            background: "#fff",
                                                            color: "#000",
                                                            fontWeight: 600,
                                                            fontSize: ".9rem",
                                                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                                        }}
                                                        onClick={() => handleCallNow()}
                                                    >
                                                        Call Now
                                                    </button>
                                                </div>
                                            </div>
                                        }
                                    </div>

                                </>
                            )}
                            {mode === "callInfo" && (
                                <>
                                    <h5
                                        className="text-center mb-3"
                                        style={{ fontWeight: 600, marginTop: "2rem" }}
                                    >
                                        Call Availability
                                    </h5>

                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            height: "100%", // take full available space in slider
                                            minHeight: "37vh", // makes sure card sits more center
                                        }}
                                    >
                                        <div
                                            className="bg-white w-100"
                                            style={{
                                                borderRadius: "0.75rem",
                                                border: "1px solid rgba(0,0,0,0.08)",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                padding: "2rem 1rem",
                                                minHeight: "12rem", // card is taller
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {
                                                agentAvailable === true ?
                                                    <p className="mb-0 text-center" style={{ fontSize: "1rem", color: "#374151" }}>
                                                        You can connect with our experts at: <br />
                                                        <strong>+91 95134 46193</strong>
                                                    </p> :
                                                    <p className="mb-0 text-center" style={{ fontSize: "1rem", color: "#374151" }}>
                                                        Our team will be available to attend to your call between{" "}
                                                        <strong>9.00 AM to 7.00 PM</strong> from <strong>Mon - Sat</strong>.
                                                    </p>
                                            }
                                            {/* <p
                                                className="mb-0 text-center"
                                                style={{ fontSize: "1rem", color: "#374151" }}
                                            >
                                                Our team will be available to attend to your call between{" "}
                                                <strong>9.00 AM to 7.00 PM</strong> from{" "}
                                                <strong>Mon - Sat</strong>.
                                            </p> */}
                                        </div>
                                    </div>

                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConnectWithExpertSlider;

