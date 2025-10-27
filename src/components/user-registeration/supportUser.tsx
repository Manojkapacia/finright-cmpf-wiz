
import React, { useState, useEffect } from "react";
import { post } from "../common/api";
import { decryptData } from "../common/encryption-decryption";

interface SupportModalPageProps {
  onClose: () => void;
  showToast: (type: string, content: string) => void; 
}

const SupportModalPage: React.FC<SupportModalPageProps> = ({ onClose, showToast }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [userIssue, setUserIssue] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLoading] = useState(false);
  const [name, setName] = useState("");


  // Prevent body scroll on open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    try {
      const encryptedName = localStorage.getItem("user_name");
      const encryptedMobile = localStorage.getItem("user_mobile");
  
      if (encryptedName) {
        const decryptedName = decryptData(encryptedName);
        if (decryptedName) setName(decryptedName);
      }
  
      if (encryptedMobile) {
        let decryptedMobile = decryptData(encryptedMobile);
  
        // ✅ Remove +91 prefix if present
        if (decryptedMobile.startsWith("+91")) {
          decryptedMobile = decryptedMobile.slice(3);
        }
  
        // ✅ Keep only digits, max 10
        decryptedMobile = decryptedMobile.replace(/\D/g, "").slice(0, 10);
  
        if (decryptedMobile) setMobileNumber(decryptedMobile);
      }
    } catch (err) {
      console.error("Error decrypting user info:", err);
    }
  }, []);
  

  const isFormValid =
    name.trim().length > 0 &&
    userIssue &&
    userQuery.trim().length > 0 &&
    mobileNumber.trim().length === 10 &&
    /^\d{10}$/.test(mobileNumber);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setLoading(true);
    const body = {
      name: name.trim(),
      phoneNumber: mobileNumber,
      details: `${userIssue}: ${userQuery}`,
    };
    try {
      const responce = await post("lead/send-whatsapp-support", body);
      console.log("res",responce);

      if (responce?.success) {
        showToast("success", responce?.message || "Your request has been submitted successfully! Our team will contact you soon.");
        setMobileNumber("");
        setUserIssue("");
        setUserQuery("");
        setLoading(false);
        onClose();

      } else {

        setLoading(false);
        showToast("error", responce?.message || "Something went wrong, please try again later.");
        
      }
    } catch (error) {
      setLoading(false);
      showToast("error", `${error}` || "Failed to send request. Please check your connection and try again");
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
     {/* {loading && (
            <div style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div className={`${styles.loaderContainer}`}>
                <div className={`${styles.loader}`}></div>
                <p className={`${styles.loaderText} mt-5`}>Submitting...</p>
              </div>
            </div>
          )} */}
          {/* {message.type && <ToastMessage message={message.content} type={message.type} />} */}
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="modal-box"
        style={{
          backgroundColor: "#E6ECFF",
          borderRadius: "1rem",
          maxWidth: "400px",
          width: "100%",
          maxHeight: "calc(100vh - 40px)", // 🟢 leaves some breathing room
          overflowY: "auto", 
          position: "relative",
          padding: "1.5rem",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            fontSize: "1.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div className="text-center mt-2">
          <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>
            Want to connect with our expert?
          </p>
          <p style={{ fontSize: "0.8rem" }}>
            We'll first get a few details about your issue and then someone will call you right away
          </p>
        </div>

        <div className="mt-3">

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ borderRadius: "0.75rem" }}
            />

          <input
            type="tel"
            className="form-control mb-3"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) =>
              setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            style={{ borderRadius: "0.75rem" }}
          />

          <select
            className="form-select mb-3"
            value={userIssue}
            onChange={(e) => setUserIssue(e.target.value)}
            style={{
              borderRadius: "0.75rem",
              color: userIssue === "" ? "#858585" : "#000",
            }}
          >
            <option value="" hidden>
              Select area related to your issue
            </option>
            <option value="PF Withdrawal">PF Withdrawal</option>
            <option value="PF Transfer">PF Transfer</option>
            <option value="Report an Issue">Report an Issue</option>
            <option value="Service Quality Feedback">Service Quality Feedback</option>
            <option value="Remove My Data">Remove My Data</option>
          </select>

          <textarea
            className="form-control"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            rows={6}
            placeholder="Tell us more about the issue you are facing...."
            style={{ borderRadius: "0.75rem" }}
          />
        </div>

        <div className="mt-3">
          <button
            className={isFormValid ? "clickeffect" : ""}
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={{
              backgroundColor: isFormValid ? "#00124F" : "#7f88a7",
              borderRadius: "0.3125rem",
              width: "100%",
              color: "white",
              border: "none",
              padding: "0.625rem",
              fontSize: "0.8125rem",
              fontWeight: "600",
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SupportModalPage;


