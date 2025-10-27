import {
  ChooseUanContainer,
  ChooseUanContainerSingle,
  DataEncryption,
  EpfMemberLogo,
  NoUanFoundContainer,
  PoweredBy,
} from "../../features/user-registration/helpers/ExportingText";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ToastMessage from "../common/toast-message";
import "../styles/UserRegisteration.css";
import { CustomButton, CustomOutlinedButtonWithIcons } from "../../helpers/helpers";
import React from "react";
import { setClarityTag } from "../../helpers/ms-clarity";
import { decryptData } from "../common/encryption-decryption";
import { ZohoLeadApi } from "../common/zoho-lead";

const LoginMultipleUan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState({ type: "", content: "" });
  const isMessageActive = useRef(false);

  const { uanListItems, mobile_number } = location.state || {};

  useEffect(() => {
    // call zoho api
    setTimeout(() => {
      if(uanListItems.length === 0){
        zohoUpdateLead()
      }
    }, 1000) 
  }, [])

  useEffect(() => {
    if (message.type) {
      isMessageActive.current = true;
      const timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
        isMessageActive.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleContinueClick = async () => {
    if (uanListItems.length && uanListItems[0]?.employment_history?.length) {
      navigate("/employment-status", { state: { mobile_number, processedUan: uanListItems[0]?.uan, currentEmploymentUanData: uanListItems[0]?.employment_history, type: 'partial' } });
    } else {
      navigate('/login-uan', { state: { type: 'full', apiFailure: true, currentUan: uanListItems[0]?.uan, mobile_number } })
    }
  }

  const handleLoginClick = () => {
    setClarityTag("BUTTON_LOGIN_PASSWORD", "When no UAN found link mobile number");
    navigate("/login-uan", { state: { type: "full", mobile_number } });
  };

  const handlePfExpertClick = () => {
    navigate('/how-can-help')
  }

  const zohoUpdateLead = async () => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"))
    const userBalance = decryptData(localStorage.getItem("user_balance"))
    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;

    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user?.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user?.CheckMyPF_Intent;
    
      if (intent.includes("1lakh")) {
        intent = intent.replace(/1lakh/gi, "").trim();
      }
    
      if (!intent.includes("50K")) {
        intent = intent.length ? `${intent} 50K` : "";
      }
    
      user.CheckMyPF_Intent = intent;
    }

    if (!user) {
      return;
    }

    if (user) {
      const zohoReqData = {
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: uanListItems.length > 0 ? user?.CheckMyPF_Status : "Authenticated User - No UAN Found",
        CheckMyPF_Intent : user?.CheckMyPF_Intent,
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData)
    }
  }

  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      <div
        className="min-vh-100  d-flex flex-column"
      >
        {uanListItems?.length >= 2 && (
          <>
            <div>
              {" "}
              <div
                className="d-flex flex-column justify-content-between align-items-center text-center min-vh-100  px-3 py-5"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  overflowY: "auto",
                }}
              >
                {/* Centered Main Content */}
                <div
                  className="d-flex flex-column align-items-center justify-content-center flex-grow-1 w-100"
                  style={{ maxWidth: "22rem" }}
                >
                  <EpfMemberLogo epfMemberLogoTextContent="Choose a UAN to start" />

                  {uanListItems?.map((item: any, index: number) => (
                    <ChooseUanContainer
                      key={index}
                      uanItem={item}
                      onClick={handleContinueClick}
                    />


                  ))}

                  <DataEncryption />
                </div>

                {/* Bottom Section */}
                <div className="d-flex justify-content-center mt-3 mb-5">
                  <PoweredBy />
                </div>
              </div>
            </div>
          </>
        )}
        {uanListItems?.length === 1 && (
          <div
            className="min-vh-100  d-flex flex-column justify-content-between py-5"
            style={{
              position: "fixed",
              left: 0,
              width: "100%",
            }}
          >
            {/* Main centered content */}
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 mb-3">
              <div className="mb-3">
                <EpfMemberLogo epfMemberLogoTextContent="UAN found" />
              </div>
              {uanListItems.map((item: any, index: number) => (
                <React.Fragment key={index}>
                  <ChooseUanContainerSingle uanItem={item} />
                </React.Fragment>
              ))}

              <DataEncryption />
            </div>

            {/* Bottom fixed button */}
            <div className="d-flex justify-content-center mb-2">
              <button
                className="btn text-white fw-bold clickeffect pb-1 pt-1"
                style={{
                  width: "19.375rem",         // 310px
                  height: "3.1875rem",        // 51px
                  maxHeight: "4.5rem",        // 72px
                  borderRadius: "62.5rem",    // 1000px
                  backgroundColor: "#00124F",
                  padding: "1rem 2rem"        // 16px 32px
                }}
                onClick={handleContinueClick}
              >
                Continue
              </button>
            </div>

            {/* Powered by at bottom with margin */}
            <div className="d-flex justify-content-center mb-5 pb-5"  >
              <PoweredBy />
            </div>
  
          </div>
        )}
        {uanListItems?.length === 0 && (
          <>
            <div
              className="d-flex flex-column justify-content-between align-items-center text-center w-100 px-3 py-5"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                overflowY: "auto",
                paddingTop: "2rem",
                paddingBottom: "2rem",
              }}
            >
              {/* Centered Main Content */}
              <div
                className="d-flex flex-column align-items-center justify-content-center flex-grow-1 w-100"
                style={{ maxWidth: "22rem" }}
              >
                <div className="text-center">
                  <EpfMemberLogo epfMemberLogoTextContent="UAN Not Found" />
                </div>
                <NoUanFoundContainer />
              </div>

              {/* Bottom Section */}
              <div className="w-100 d-flex flex-column align-items-center" style={{ maxWidth: "22rem" }}>
                <p
                  className="text-center mb-1"
                  style={{ fontSize: "1rem", color: "#858585", marginTop: "-0.5rem" }}
                >
                  If you know your UAN and Password
                </p>
                <CustomButton name="Login using UAN and Password" onClick={handleLoginClick} />

                <p
                  className="text-center mt-4 mb-1"
                  style={{ fontSize: "1rem", color: "#858585", marginTop: "-0.5rem" }}
                >
                  Get quick help for PF Withdrawals & Transfers
                </p>

                <CustomOutlinedButtonWithIcons name="Connect Now" onClick={handlePfExpertClick} />

                <div className="d-flex justify-content-center mt-2 mb-5">
                  <PoweredBy />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LoginMultipleUan;
