import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaCheck } from "react-icons/fa";

interface CallBookedSliderProps {
    show: boolean;
    onClose: () => void;
    bookedDate: string;
    bookedTime: string;
    assignedExpert: string;
    profileImage?: string;
}

const CallBookedSlider: React.FC<CallBookedSliderProps> = ({
    show,
    onClose,
    bookedDate,
    bookedTime,
    assignedExpert,
    profileImage,
}) => {
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
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                    />

                    {/* Slider Box */}
                    <motion.div
                        className="position-fixed bottom-0 start-50 translate-middle-x w-100 shadow-lg"
                        style={{
                            zIndex: 1050,
                            maxWidth: "31.25rem",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#FFFFFF",
                            padding: "0.5rem 1rem 1rem 1rem",
                            borderTopLeftRadius: "1rem",
                            borderTopRightRadius: "1rem",
                        }}
                        initial={{ opacity: 0, y: 200, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 200, scale: 0.7 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
                    >
                        {/* Close Button */}
                        <motion.button
                            className="btn btn-light position-absolute top-0 end-0 m-2 p-2"
                            onClick={onClose}
                            style={{ lineHeight: 1 }}
                        >
                            <FaTimes className="fs-5 text-dark" />
                        </motion.button>

                        {/* Content */}
                        <motion.div
                            className="px-2 py-2 mt-5"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >

                            {/* Image Box with Check + Expert Image */}
                            <center>
                                <div
                                    style={{
                                        backgroundColor: "#D1DDFD",
                                        borderRadius: "1rem",
                                        height: "12.5rem",
                                        width: "100%",
                                        // maxWidth: "20.625rem",
                                        padding: "1rem",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        position: "relative",
                                        marginTop: "1rem",
                                    }}
                                >
                                    {/* Left side: Checkmark + Text */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            padding: "0.5rem",
                                            gap: "0.5rem",
                                            zIndex: 2,
                                            height: "100%",
                                        }}
                                    >
                                        <motion.div
                                            className="position-relative d-flex align-items-center justify-content-center mb-3"
                                            style={{ width: "4.375rem", height: "4.375rem" }}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <div
                                                className="position-absolute rounded-circle"
                                                style={{
                                                    width: "4.875rem",
                                                    height: "4.875rem",
                                                    backgroundColor: "#34A85333",
                                                }}
                                            />
                                            <div
                                                className="position-absolute rounded-circle"
                                                style={{
                                                    width: "4.125rem",
                                                    height: "4.125rem",
                                                    backgroundColor: "#34A85333",
                                                }}
                                            />
                                            <div
                                                className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "3.125rem",
                                                    height: "3.125rem",
                                                    backgroundColor: "#34A853",
                                                    zIndex: 2,
                                                }}
                                            >
                                                <FaCheck size={"0.875rem"} color="#ffffff" />
                                            </div>
                                        </motion.div>

                                        <div
                                            className="text-start"
                                            style={{ fontSize: "1.2rem", fontWeight: 500, lineHeight: "1.3" }}
                                        >
                                           Your call has<br/> been booked
                                        </div>
                                    </div>

                                    {/* Right side: Expert Image */}
                                    <img
                                        src={profileImage}
                                        alt="Expert"
                                        style={{
                                            position: "absolute",
                                            top: "-8.5%",
                                            right: "5%",
                                            height: "112%",
                                            objectFit: "contain",
                                            zIndex: 1,
                                        }}
                                    />
                                </div>
                            </center>

                            {/* Call Details Box */}
                            <div
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    border: 0,
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                    marginTop: "1rem",
                                    boxShadow: "rgba(0, 0, 0, 0.15) 0px 0.125rem 0.5rem",
                                }}
                            >
                                <p
                                    className="text-start"
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 500,
                                        lineHeight: "1",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    Call details
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    <span>Date</span>
                                    <span>{bookedDate}</span>
                                </div>
                                <hr/>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    <span>Time</span>
                                    <span>{bookedTime}</span>
                                </div>
                                <hr />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    <span>Assigned Expert</span>
                                    <span>{assignedExpert}</span>
                                </div>
                                <hr className="mb-0"/>
                            </div>
                        </motion.div>
                    </motion.div>
                </>

            )}
        </AnimatePresence>
    );
};

export default CallBookedSlider;
