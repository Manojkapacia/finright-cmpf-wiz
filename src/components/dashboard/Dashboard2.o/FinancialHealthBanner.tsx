
import { FaDollarSign, FaChartLine, FaChartBar } from "react-icons/fa";
import "./Dashboard2.o.css";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { post } from "../../common/api";

interface FinancialHealthBannerProps {
  fullName?: string;
  email?: string;
  mobile?: string;
  caseNumber?: string;
}
const FinancialHealthBanner = ({ fullName, email, mobile, caseNumber }: FinancialHealthBannerProps) => {

  const [showIframe, setShowIframe] = useState(false);

  const encodedName = fullName ? encodeURIComponent(fullName?.toLowerCase().replace(/\s+/g, '_')) : '';
  let surveyUrl = `https://finquest.finright.in/${encodedName}`;

  const handleStartSwiping = async () => {
    try {
      const payload = {
        username: fullName,
        caseId: caseNumber || "",
        email,
        mobile,
        survey_url: surveyUrl
      };

      const result = await post("/supabase/users/add", payload);

      if (result?.status === 400 || result?.status === 401 || result?.status === 429) {
        // console.error("User handling failed:", result?.message || "Unknown error");
      } else {
        surveyUrl = result?.data?.survey_url;
      }
    } catch (err) {
      console.log(err)
    }
    setShowIframe(true); // Always open iframe regardless of success/failure
  };


  return (
    <>
      <div className=" card border-0 my-3 shadow-sm financial-banner position-relative overflow-hidden" style={{ borderRadius: "1rem" }}>
        {/* Gradient background */}
        <div className="card-body">
          <div className="financial-gradient position-absolute top-0 start-0 w-100 h-100" />

          {/* Decorative Icons */}
          <FaDollarSign className="icon-dollar" />
          <FaChartLine className="icon-chart-line" />
          <FaChartBar className="icon-chart-bar" />
          <div className="dot dot1" />
          <div className="dot dot2" />
          <div className="dot dot3" />

          {/* Content */}
          <div className="position-relative text-white p-2 d-flex flex-column justify-content-between h-100">
            <div>
              <p
                className="mb-1"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "0.6875rem",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  verticalAlign: "middle"
                }}
              >
                Swipe away to a better financial health
              </p>

              <p
                className="mb-0 mt-2"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  lineHeight: "100%",
                  letterSpacing: "0rem",
                  verticalAlign: "middle"
                }}
              >
                Get expert answers to your financial queries
              </p>

            </div>
            <div className="mt-2">
              <button
                className="start-swipe-btn"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "Poppins",
                  lineHeight: "100%",
                  letterSpacing: "0rem",
                  verticalAlign: "middle"
                }}
                onClick={() => handleStartSwiping()}
              >
                Start Swiping
              </button>

            </div>
          </div>
        </div>
      </div>

      {showIframe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "white",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "1rem",
              background: "#fff",
              borderBottom: "1px solid #ccc",
              zIndex: 10000,
            }}
          >
            <IoCloseSharp
              onClick={() => setShowIframe(false)}
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#333",
              }}
            />
          </div>
          <div>

          </div>
          <iframe
            src={surveyUrl}
            title="Finquest"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          ></iframe>
        </div>

      )}
    </>
  );
};

export default FinancialHealthBanner;
