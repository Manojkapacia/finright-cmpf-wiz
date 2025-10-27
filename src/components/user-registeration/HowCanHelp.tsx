import { useState } from "react";
import { ZohoLeadApi } from "../common/zoho-lead";
import { decryptData } from "../common/encryption-decryption";
import MESSAGES from "../constant/message";
import { CustomButton } from "../../helpers/helpers";
import { HiCheckBadge } from "react-icons/hi2";

const HowCanHelp = () => {
  const [isHelpSelected, setIsHelpSelected] = useState(false);

  const zohoUpdateLead = async (tag: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
    const userUan = decryptData(localStorage.getItem("user_uan"))
    const serviceHistory = JSON.parse(localStorage.getItem("service_history") || "false");
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if(userBalance > 50000 && tag !== undefined && tag !== null && tag.trim() !== ""){
      tag = `${tag} 50K`;
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
        CheckMyPF_Status: existUser && existUser !== ""? user?.CheckMyPF_Status : serviceHistory && !userUan ? "API down" : "No UAN found" ,
        CheckMyPF_Intent: tag,
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const handleCardClick = async (data: any) => {
        
        // if (data.toLowerCase() !== "trackmypf" && data.toLowerCase() !== "checkmypf") {
        //   const userBalance = decryptData(localStorage.getItem("user_balance"))
        //   const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
        //   if(userBalance > 50000){
        //     try {
        //       await post('lead/knowlarity-lead', { mobileNumber, tag: data });
        //     } catch (error) {
        //       console.log(error);
        //     }
        //   }
        // }
        setIsHelpSelected(true);
        zohoUpdateLead(data);
    
    // setIsHelpSelected(true);
    // zohoUpdateLead(data)
    // if (data.toLowerCase() !== "trackmypf" && data.toLowerCase() !== "checkmypf") {
    //   const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    //   try {
    //     await post('lead/knowlarity-lead', { mobileNumber, tag: data,userUan });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    
  };

  const handleOkClick = () => {
    localStorage.clear()
    window.location.href = MESSAGES.CHEKC_MY_PF_URL
  };

  const cardStyle = { boxShadow: "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset" };
  return (
    <>
      {!isHelpSelected && 
        <div
          className="to-margin-top d-flex flex-column align-items-center justify-center text-center w-100 px-3"
          style={{
            minHeight: "calc(100vh - 40px)",
            paddingTop: "1.9rem",
            paddingBottom: "1.2rem",
            overflowY: "auto",
          }}
        >
          <div className="mt-4 px-2 mx-auto w-100" style={{ maxWidth: "21rem" }} >
            <p className="subtitle fw-semibold text-center" style={{ fontSize: "1.7rem" }}>
              How can we help you?
            </p>
          </div>
          {/* Support message */}
          <div className=" px-2" style={{ maxWidth: "21rem" }}>
            {/* Help card */}
            <div className="mx-auto w-100" style={{ maxWidth: "20rem" }}>
              <div className="bg-white rounded px-3 py-3 d-flex flex-column w-100 clickeffect mb-3" style={cardStyle} onClick={() => handleCardClick("Withdraw Funds")} >
                <div className="text-dark mb-1" style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "left" }}>
                Provident Fund Withdrawal
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 400, color: "#858585", lineHeight: 1.25, textAlign: "left" }}>
                Need help withdrawing my EPF
                </div>
              </div>

              <div className="bg-white rounded px-3 py-3 d-flex flex-column w-100 clickeffect mb-3" style={cardStyle} onClick={() => handleCardClick("Transfer Funds")}>
                <div className="text-dark mb-1" style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "left" }}>
                Consolidate PF Balance
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 400, color: "#858585", lineHeight: 1.25, textAlign: "left" }}>
                Want to transfer PF to latest Employer
                </div>
              </div>

              <div className="bg-white rounded px-3 py-3 d-flex flex-column w-100 clickeffect mb-3" style={cardStyle} onClick={() => handleCardClick("Fix Issues")}>
                <div className="text-dark mb-1" style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "left" }}>
                Resolve PF Issues
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 400, color: "#858585", lineHeight: 1.25, textAlign: "left" }}>
                Claim Rejection or other PF Account issues
                </div>
              </div>

              <div className="bg-white rounded px-3 py-3 d-flex flex-column w-100 clickeffect mb-3" style={cardStyle} onClick={() => handleCardClick("CheckMyPF")}>
                <div className="text-dark mb-1" style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "left" }}>
                  CheckMyPF
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 400, color: "#858585", lineHeight: 1.25, textAlign: "left" }}>
                 Ensure my PF is Error-free and withdrawable
                </div>
              </div>
              <div className="bg-white rounded px-3 py-3 d-flex flex-column w-100 clickeffect mb-3" style={cardStyle} onClick={() => handleCardClick("TrackMyPF")}>
                <div className="text-dark mb-1" style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "left" }}>
                  TrackMyPF
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 400, color: "#858585", lineHeight: 1.25, textAlign: "left" }}>
                  I want to track my PF balance and passbook                  </div>
              </div>

            </div>

          </div>
        </div>
      }

      {isHelpSelected &&
        <div
          className="to-margin-top min-vh-100 d-flex flex-column justify-content-center align-items-center gap-2 py-3"
          style={{
            position: "fixed",
            left: 0,
            width: "100%",
          }}
        >
          <div style={{ marginTop: "-5.5rem" }}>
            <p className="title fw-semibold text-dark mb-2 text-center">
              Your request is registered
            </p>
            <p className="subtitle fw-semibold mt-3 px-3 text-center">
              Sit tight, help is on the way
            </p>
          </div>

          <div className="d-flex justify-content-center align-items-center my-2">
            <HiCheckBadge
              style={{ color: "#304DFF", width: "12.25rem", height: "12.25rem" }}
            />
          </div>

          <div className="d-flex flex-column align-items-center">
            <p className="subtitle fw-semibold mt-3 px-3 text-center">
              One of our experts will reach out to you within 12 hours between 8:30 AM to 7:00 PM from Monday - Saturday.
            </p>
            <div className="mt-3">
              <CustomButton
                name="Ok"
                onClick={handleOkClick}
              />
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default HowCanHelp;