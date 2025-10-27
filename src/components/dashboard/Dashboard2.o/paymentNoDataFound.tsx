import React, { useState } from "react";
import { handlePayToInitiate } from "../../../helpers/payment";
import ToastMessage from "../../common/toast-message";
import { MdOutlineLocalPolice } from "react-icons/md";
import profileImage from "../../../assets/suport-profile.png";
import { FaCheck } from "react-icons/fa";

const PaymentNoDataFound: React.FC = () => {
  const [loading, setLoading] = useState(false);
  // const [step, setStep] = useState<"intro" | "milestone">("intro");
  const [message, setMessage] = useState({ type: "", content: "" });
  const amount = "999";

  const bulletPoints = [
    "1 : 1 call with EPF Expert (30 min)",
    "Detailed PF account Assessment",
    "Get a plan of action to resolve your case",
    // "EPF Withdrawal, EPF Merge, Trusts, UAN Activation & more",
  ];


  // const handleProceedClick = () => setStep("milestone");

  const handlePayClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      handlePayToInitiate({ setLoading, setMessage, amount });
    } catch (err) {
      console.error("Error during payment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div
    //   className="px-0 pt-3"
    //   style={{
    //     maxWidth: "31.25rem",
    //     background: "#F4F5FB",
    //     borderRadius: "1rem",
    //     paddingBottom: "1.5rem",
    //     // margin: "2rem auto",
    //   }}
    // >
    //   {message.type && (
    //     <ToastMessage message={message.content} type={message.type} />
    //   )}

    //   {/* INTRO STEP */}
    //   {step === "intro" && (
    //     <>
    //       <p
    //         style={{
    //           fontSize: "1.13rem",
    //           fontWeight: 700,
    //           textAlign: "center"
    //         }}
    //       >
    //         Get all your PF issues resolved
    //       </p>

    //       <div
    //         style={{
    //           background: "#fff",
    //           borderRadius: "0.75rem",
    //           padding: "1.25rem 1rem",
    //           marginLeft: "1rem",
    //           marginRight: "1rem",
    //           boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    //         }}
    //       >
    //         {[
    //           "Dedicated EPF expert for end-to-end case handling",
    //           "Clear issue diagnosis with action plan",
    //           "Guaranteed settlement with milestone-based fees",
    //           "Regular follow-ups and EPF office visits",
    //           "Pay only on completion of milestone",
    //         ].map((point, idx, arr) => (
    //           <div
    //             key={idx}
    //             className="d-flex align-items-center"
    //             style={{
    //               marginBottom: idx !== arr.length - 1 ? "0.5rem" : "0.7rem",
    //             }}
    //           >
    //             <FaRegCircleCheck
    //               color="#00C7A5"
    //               size={"1.1rem"}
    //               className="me-3 flex-shrink-0"
    //             />
    //             <span style={{ fontSize: "0.81rem", lineHeight: 1.4 }}>
    //               {point}
    //             </span>
    //           </div>
    //         ))}

    //         <hr className="mt-0" />

    //         <div className="text-center mt-3">
    //           <button
    //             className="btn w-100"
    //             style={{
    //               backgroundColor: "#00124F",
    //               color: "white",
    //               padding: "0.8rem 1.5rem",
    //               borderRadius: "0.5rem",
    //               fontWeight: 500,
    //               fontSize: "1rem",
    //             }}
    //             onClick={handleProceedClick}
    //           >
    //             Proceed
    //           </button>
    //         </div>
    //       </div>
    //     </>
    //   )}
    //   {step === "milestone" && (
    //     <>
    //       <p
    //         style={{
    //           fontSize: "1.13rem",
    //           fontWeight: 500,
    //           textAlign: "center",
    //         }}
    //       >
    //         Milestone based success fee
    //       </p>

    //       <div
    //         style={{
    //           background: "#fff",
    //           borderRadius: "0.75rem",
    //           padding: "1.25rem 1rem 1.25rem 2.5rem",
    //           boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    //           position: "relative",
    //           paddingLeft: "2.5rem",
    //           marginLeft: "1rem",
    //           marginRight: "1rem",
    //         }}
    //       >
    //         <div style={{ position: "relative", paddingBottom: "1.5rem" }}>
    //           <div
    //             style={{
    //               position: "absolute",
    //               left: "-1.9rem",
    //               top: "-0.2rem",
    //               width: "1.8rem",
    //               height: "1.8rem",
    //               borderRadius: "50%",
    //               backgroundColor: "rgba(8, 220, 184, 0.15)",
    //               display: "flex",
    //               alignItems: "center",
    //               justifyContent: "center",
    //               boxShadow: "0 0 8px 4px rgba(8, 220, 184, 0.3)",
    //             }}
    //           >
    //             <div
    //               style={{
    //                 width: "0.9rem",
    //                 height: "0.9rem",
    //                 borderRadius: "50%",
    //                 backgroundColor: "#08DCB8",
    //               }}
    //             />
    //           </div>

    //           <div
    //             style={{
    //               position: "absolute",
    //               left: "calc(-1.9rem + 0.9rem)",
    //               top: "1.7rem",
    //               bottom: "1rem",
    //               width: "2px",
    //               background: "#E0E0E0",
    //               zIndex: 0,
    //             }}
    //           />

    //           <div className="ms-1">
    //             <div
    //               className="d-flex justify-content-between align-items-center"
    //               style={{
    //                 position: "relative",
    //                 top: "-0.1rem",
    //                 marginBottom: "0.9rem"
    //               }}
    //             >
    //               <span style={{ fontWeight: 700, fontSize: "0.81rem" }}>
    //                 Now: Initiate your case
    //               </span>
    //               <span
    //                 style={{
    //                   background: "#E6F9E9",
    //                   color: "#fff",
    //                   backgroundColor: "#50C878",
    //                   fontWeight: 700,
    //                   fontSize: "0.81rem",
    //                   padding: "0.2rem 0.6rem",
    //                   borderRadius: "0.4rem",
    //                 }}
    //               >
    //                 ₹ 2000/-
    //               </span>
    //             </div>

    //             {[
    //               "30 min consultation with PF expert",
    //               "Understand any hidden issues in your account",
    //               "Get a personalized Plan of Action to maximize withdrawal",
    //             ].map((point, idx, arr) => (
    //               <div
    //                 key={idx}
    //                 className="d-flex align-items-center"
    //                 style={{
    //                   marginBottom: idx !== arr.length - 1 ? "0.5rem" : "0.75rem",
    //                 }}
    //               >
    //                 <FaRegCircleCheck
    //                   color="#00C7A5"
    //                   size={"1.1rem"}
    //                   className="me-2 flex-shrink-0"
    //                 />
    //                 <span style={{ fontSize: "0.81rem", lineHeight: 1.4 }}>
    //                   {point}
    //                 </span>
    //               </div>
    //             ))}

    //             <div className="text-start">
    //               <button
    //                 className="btn"
    //                 style={{
    //                   backgroundColor: "#00124F",
    //                   color: "white",
    //                   padding: "0.75rem 1rem",
    //                   borderRadius: "0.5rem",
    //                   fontWeight: 500,
    //                   fontSize: "1rem",
    //                   width: "75%",
    //                 }}
    //                 onClick={handlePayClick}
    //                 disabled={loading}
    //               >
    //                 {loading ? "Please wait..." : "Pay & Book expert call"}
    //               </button>
    //             </div>
    //           </div>
    //         </div>

    //         <div style={{ position: "relative", paddingBottom: "1.5rem" }}>
    //           <div
    //             style={{
    //               position: "absolute",
    //               left: "-1.5rem",
    //               top: "0.25rem",
    //               width: "0.9rem",
    //               height: "0.9rem",
    //               borderRadius: "50%",
    //               background: "#C4C4C4",
    //             }}
    //           />
    //           <div
    //             style={{
    //               position: "absolute",
    //               left: "-1.1rem",
    //               top: "1.5rem",
    //               bottom: "0.5rem",
    //               width: "2px",
    //               background: "#E0E0E0",
    //             }}
    //           />

    //           <div style={{ marginTop: "0.2rem" }}>
    //             <div className="d-flex justify-content-between align-items-center mb-1 ms-1">
    //               <span style={{ fontWeight: 700, fontSize: "0.81rem" }}>
    //                 Advance payment
    //               </span>
    //               <span
    //                 style={{
    //                   background: "#E1E4E4",
    //                   color: "#000",
    //                   fontWeight: 700,
    //                   fontSize: "0.81rem",
    //                   padding: "0.2rem 0.6rem",
    //                   borderRadius: "0.4rem",
    //                 }}
    //               >
    //                 50% Success Fee
    //               </span>
    //             </div>
    //             <p style={{ fontSize: "0.81rem", color: "#858585", marginBottom: 0 }}>
    //               Pay 50% of success fee (initiation fee adjusted) to start case processing
    //             </p>
    //           </div>
    //         </div>

    //         <div style={{ position: "relative" }}>
    //           <div
    //             style={{
    //               position: "absolute",
    //               left: "-1.5rem",
    //               top: "0.25rem",
    //               width: "0.9rem",
    //               height: "0.9rem",
    //               borderRadius: "50%",
    //               background: "#C4C4C4",
    //             }}
    //           />

    //           <div style={{ marginTop: "0.2rem" }}>
    //             <div className="d-flex justify-content-between align-items-center mb-1 ms-1">
    //               <span style={{ fontWeight: 700, fontSize: "0.81rem" }}>
    //                 Full payment
    //               </span>
    //               <span
    //                 style={{
    //                   background: "#E6E7EB",
    //                   color: "#000",
    //                   fontWeight: 700,
    //                   fontSize: "0.81rem",
    //                   padding: "0.2rem 0.6rem",
    //                   borderRadius: "0.4rem",
    //                 }}
    //               >
    //                 100% Success Fee
    //               </span>
    //             </div>
    //             <p style={{ fontSize: "0.81rem", color: "#858585", marginBottom: 0 }}>
    //               Full payment on successful resolution and settlement of your case
    //             </p>
    //           </div>
    //         </div>

    //         <div className="text-center mt-3">
    //           <a
    //             href="https://finright.in/pricing"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             style={{ textDecoration: "none" }}
    //           >
    //             <p
    //               className="mb-0"
    //               style={{
    //                 fontSize: "0.81rem",
    //                 fontWeight: 500,
    //                 color: "#304DFF",
    //                 cursor: "pointer",
    //               }}
    //             >
    //               Success Fee Calculator
    //             </p>
    //           </a>
    //         </div>
    //       </div>
    //     </>
    //   )}


    // </div>

    <div
    className="shadow-lg"
    style={{
      maxWidth: "31.25rem",
      margin: "2rem auto",
      background: "#FFFFFF",
      padding: "1rem 1.5rem",
      borderRadius: "1rem",
    }}
  >
    {message.type && (
        <ToastMessage message={message.content} type={message.type} />
      )}
    <p
      style={{
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: "1.3",
        textAlign: "center",
        marginBottom: "1rem",
      }}
    >
      Stuck with EPF? <br/>
      We’ve Got Your Back
    </p>
    <p style={{fontSize: "0.87rem",lineHeight: "1.3", textAlign: "center", marginBottom: "2.5rem"}}>EPF shouldn’t be this hard but for those<br/> who are stuck, we are here</p>

    {/* Image Box */}
    <center className="px-4">
      <div
        style={{
          backgroundColor: "#FFCA62",
          borderRadius: "1rem",
          height: "12.5rem",
          width: "17rem",
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
          <MdOutlineLocalPolice size={"2rem"} />
          <div
            className="text-start"
            style={{ fontSize: "1rem", fontWeight: 500, lineHeight: "1.3" }}
          >   
            Consult with<br /> an EPF Expert<br /> Now in just<br/>
            <span className="text-start" style={{color: "#6C6A6A", fontSize: "0.75rem",  textDecoration: "line-through", display: "inline-block",marginTop: "0.5rem"}}>₹ 2000</span><br/>
            <span className="text-start" style={{color: "#304DFF", fontSize: "1.5rem", fontWeight: 500, display: "inline-block",marginTop: "0.3rem"}}>₹ 999/-</span>
          </div>
        </div>

        <img
          src={profileImage}
          alt="Expert"
          style={{
            position: "absolute",
            top: "-17.5%",
            right: "-11%",
            height: "118%",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      </div>
    </center>

    {/* Bullet Points (loop) */}
    <div className="mt-3 px-3">
      {bulletPoints.map((point, idx) => (
        <div key={idx} className="d-flex align-items-center mb-2">
          <FaCheck
            color="#00C7A5"
            size={"1.2rem"}
            className="me-3"
            style={{ marginTop: "0.2rem", flexShrink: 0 }}
          />
          <span style={{ fontSize: "0.87rem", fontWeight: 500 }}>{point}</span>
        </div>
      ))}
    </div>

    {/* Button */}
    <div className="text-center mt-4 px-2">
      <button
        className="btn w-100"
        style={{
          backgroundColor: "#00124F",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: 500,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.85 : 1,
        }}
        onClick={handlePayClick}
        disabled={loading}
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
          "Book a Call Now"
        )}
      </button>
    </div>
  </div>

  );
};

export default PaymentNoDataFound;
