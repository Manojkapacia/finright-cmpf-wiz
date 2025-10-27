import { motion } from "framer-motion";
import { useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import "../../../styles/global.css";
import CallBackRequestedImage from "../../../assets/callbackrequest.png";
import whatsAppLogo from "../../../assets/whatsapp.png";

const CallBackRequestedModel = (props: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    document.body.style.overflow = props.isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [props.isOpen]);

  return (
    <div className="position-relative text-center">
      {props.isOpen && (
        <>
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={props.onClose}
          />

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
            <motion.button
              className="btn btn-light position-absolute top-0 end-0 m-2 p-2"
              onClick={props.onClose}
              style={{ lineHeight: 1 }}
            >
              <FaTimes className="fs-5 text-dark" />
            </motion.button>

            <motion.div
              className="px-2 py-2 mt-5"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-center" style={{ fontSize: "1rem", fontWeight: 500, lineHeight: "1", letterSpacing: "0" }}>Call back request noted</p>

              <center>
                <div
                  style={{
                    backgroundColor: "#D1DDFD",
                    borderRadius: "1rem",
                    height: "12.5rem",
                    width: "100%",
                    maxWidth: "16.625rem",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    marginTop: "1rem",
                  }}
                >
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
                      <div className="position-absolute rounded-circle" style={{ width: "4.375rem", height: "4.375rem", backgroundColor: "#34A85333" }} />
                      <div className="position-absolute rounded-circle" style={{ width: "3.125rem", height: "3.125rem", backgroundColor: "#34A85333" }} />
                      <div className="position-absolute rounded-circle d-flex align-items-center justify-content-center" style={{ width: "2.125rem", height: "2.125rem", backgroundColor: "#34A853", zIndex: 2 }}>
                        <FaCheck size={"0.875rem"} color="#ffffff" />
                      </div>
                    </motion.div>

                    <div className="text-start" style={{ fontSize: "0.9rem", fontWeight: 500, lineHeight: "1.3" }}>Expect a call <br /> back shortly</div>
                  </div>

                  <img
                    src={CallBackRequestedImage}
                    alt="Profile"
                    style={{
                      position: "absolute",
                      top: "-15%",
                      right: "-8%",
                      height: "115%",
                      objectFit: "contain",
                      zIndex: 1,
                    }}
                  />
                </div>
              </center>

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
                <p className="text-start" style={{ fontSize: "0.8125rem", fontWeight: 500, lineHeight: "1", marginBottom: "1rem" }}>What to expect?</p>
                {[
                  // "Get a call back to understand terms of service, pricing and initiate your case",
                   "Get a plan of action to serve your requirement",
                    "Make advance payment  and relax while our experts take care of your case",
                    "Get regular updates from your assigned expert", 
                    "Get final confirmation once your PF case is resolved"
                  ].map((text, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.625rem",
                      padding: "0.625rem 0.3125rem",
                      borderBottom: index < 4 ? "0.03125rem solid #D9D9D9" : "none",
                    }}
                  >
                        <div

                            style={{
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: "3px 0",
                                borderRadius: "50%",
                                backgroundColor: "#E6ECFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 500,
                                fontSize: "13px",
                                color: "#000",
                                textAlign: "center",
                            }}
                        >
                            {index + 1}
                        </div>
                    <div className="text-start" style={{ fontSize: "0.8125rem", fontWeight: 400, lineHeight: "1.1" }}>{text}</div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-center mt-4" style={{ fontSize: "0.8125rem", fontWeight: 400, letterSpacing: "0px", lineHeight: "1", marginBottom: "1rem" }}>
                  Did not get your call? WhatsApp us now!
                </p>
                <center>
                  <button
                    className="clickeffect"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      maxWidth: "18.75rem",
                      width: "100%",
                      padding: "0.625rem",
                      gap: "0.3125rem",
                      borderRadius: "0.3125rem",
                      backgroundColor: "#00C7A5",
                      color: "#fff",
                      border: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open("https://api.whatsapp.com/send/?phone=919372352879&text&type=phone_number&app_absent=0", "_blank")}
                  >
                    <img
                      src={whatsAppLogo}
                      alt="WhatsApp"
                      style={{ width: "1.125rem", height: "1.125rem", objectFit: "contain" }}
                    />
                    WhatsApp us
                  </button>
                </center>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CallBackRequestedModel;

