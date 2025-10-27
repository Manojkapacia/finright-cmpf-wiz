import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import plantDecoration from "../assets/potPlant.png";
import "./epfoStyle.css";
import cashfreeLogo from "../assets/cashfreePayments.png";
import { encryptData } from "../../components/common/encryption-decryption";

const EPFOLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const isPaymentPage = location.pathname === "/payment-auth";
  const getLoginUrl = location.pathname;
  useEffect(() => {
    localStorage.clear();
  }, []);
  // Clear local storage 
  const validateMobileNumber = (number: string): boolean => {
    const regex = /^\d{10}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber) {
      setError("Mobile number is required");
      return;
    }
    
    if (!validateMobileNumber(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    const appendMobileNumber = "+91" + mobileNumber;
    localStorage.setItem("user_mobile", encryptData(appendMobileNumber))
    if (isPaymentPage) {
      navigate("/payment-auth/otp", {
        state: { mobile_number: mobileNumber, getLoginUrl },
      });
    } else {
      navigate("/call-booking/otp", {
        state: { mobile_number: mobileNumber, getLoginUrl },
      });
    }
  };

  return (
    <div className="container-fluid p-0">            
    <div className="row g-0">                      
      <div className="col-12 col-md-4 offset-md-4 p-0" style={{ backgroundColor: "#ffffff" }}>
    <div className="epf-container">

      {/* Main Content */}
      <main className="epf-main">
        <div className="epf-content">
          {/* Title */}
          <h1 className={`epf-title ${isPaymentPage ? "payment-page" : "call-booking-page"}`}>
          {isPaymentPage
                    ? "Initiate Your Case"
                    : "Stuck with EPF?\nWe've Got Your Back"}
          </h1>

          {/* Subtitle */}
          <p className={`epf-subtitle ${isPaymentPage ? "payment-page" : "call-booking-page"}`}>
            {isPaymentPage
                    ? "Finright Secure Payment\nGateway"
                    : "EPF shouldn't be this hard but for those who are stuck, we are here"}
          </p>

          {/* Heading */}
          <h2 className={`epf-heading ${isPaymentPage ? "payment-page" : "call-booking-page"}`}>{isPaymentPage ? "Authenticate Yourself" : "Get your EPF issues resolved"}</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="epf-form">
            <div className="form-group">
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                  if (value.length <= 10) {
                    setMobileNumber(value); // Allow only up to 10 digits
                  }
                }}
                className="epf-input"
                maxLength={10}
              />
            </div>
            {error && <div className="invalid-feedback d-block" style={{marginTop: "-0.75rem"}}>{error}</div>}
            <button type="submit" className="epf-button">
              {isPaymentPage ? "Authenticate" : "Book Call with EPF Expert"}
            </button>

                  {isPaymentPage && (
                    <div className="powered-by" style={{ textAlign: "center"}}>
                      <p style={{ fontSize: "11px", color: "#00124F", fontWeight: "400" , marginTop: "0.76px" , marginBottom: "0px"}}>Powered by</p>
                      <img
                        src={cashfreeLogo}
                        alt="Cashfree Payments"
                        style={{ height: "100px", width: "100px" }}
                      />
                    </div>
                  )}
          </form>
        </div>

        {/* Decorative Plant */}
        <div className="epf-plant">
          <img src={plantDecoration} alt="Decorative plant" />
        </div>
      </main>
    </div>
    </div>
    </div>
    </div>
  );
};

export default EPFOLogin;
