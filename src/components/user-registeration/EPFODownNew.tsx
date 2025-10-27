import React, { useEffect, useState } from "react";
import TriangleDanger from "../../assets/dangerTriangle.png";
import { ZohoLeadApi } from "../common/zoho-lead";
import TickMark from "../../assets/correct.png"
import { CompleteProfileButton } from "../../helpers/helpers";
import { decryptData } from "../common/encryption-decryption";
import MESSAGES from "../constant/message";
import { post } from "../common/api";
import { get } from "../../components/common/api";
import { useLocation } from "react-router-dom";


const helpOptions = [
  {
    id: 1,
    key:"Withdraw Funds",
    heading: "Provident fund Withdrawal",
    description: "Need Help withdrawing my PF",
  },
  {
    id: 2,
    key:"Transfer Funds",
    heading: "Consolidate PF Balance",
    description: "Want to transfer PF to my latest employer",
  },
  {
    id: 3,
    key:"Fix Issues",
    heading: "Resolve PF Issues",
    description: "Claim Rejection or other PF account issues",
  },
  {
    id: 4,
    key:"CheckMyPF",
    heading: "CheckMyPF",
    description: "Ensure my PF is Error free & withdrawable",
  },
  {
    id: 5,
    key:"TrackMyPF",
    heading: "TrackMyPF",
    description: "I want to track my Pf balance & passbook",
  },
];

const EPFODownNew: React.FC = () => {
const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isHelpSelected, setIsHelpSelected] = useState(false);
//  const [isAvailable, setIsAvailable] = useState(false);
const location = useLocation();
const { checkMyPFStatus } = location?.state || {};
useEffect(() => {
  const checkAgentAvailability = async () => {
    try {
      const response = await get('/lead/check-agent-availability');
      

      if (response.success) {
        // setIsAvailable(true);
      }
    } catch (err) {
      console.error('Agent check error:', err);
    }
  };

  checkAgentAvailability();
}, []);



    useEffect(() => {
    zohoUpdateLead("")
  }, [])
 const handleToggle = (id: number) => {
  setSelectedOptions(prev =>
    prev.includes(id) ? [] : [id]
  );
};


  const zohoUpdateLead = async (tag: string) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
    // const userUan = decryptData(localStorage.getItem("user_uan"));
    // const serviceHistory = JSON.parse(localStorage.getItem("service_history") || "false");
    const userBalance = decryptData(localStorage.getItem("user_balance"));

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;

    if (userBalance > 50000 && tag?.trim()) {
      tag = `${tag} 50K`;
    }

    if (!user) return;
   
    if(user){
    const zohoReqData = {
       Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: checkMyPFStatus ? checkMyPFStatus : (newUser && newUser !== "" ? "EPFO down" : user?.CheckMyPF_Status),
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
    };

    ZohoLeadApi(zohoReqData);
  }
  };

  const handleSubmit = async () => {
if (selectedOptions.length === 0) {
    window.alert("Please select one option so we can assist you better.");
    return;
  }
    const selectedTags = selectedOptions
      .map(id => helpOptions.find(opt => opt.id === id)?.key)
      .filter(Boolean)
      .join(", ");
      // console.log("selectedTags",selectedTags)


      try {
  await zohoUpdateLead(selectedTags);
//  console.log(result)
  setIsHelpSelected(true);
} catch (error) {
  // console.error("Zoho update failed:", error);
  // alert("Something went wrong while updating. Please try again later.");
}
    // await zohoUpdateLead(selectedTags);

    const userUan = decryptData(localStorage.getItem("user_uan"));
    const mobileNumber = decryptData(localStorage.getItem("user_mobile"));

    if (
      !selectedTags.toLowerCase().includes("trackmypf") &&
      !selectedTags.toLowerCase().includes("checkmypf")
    ) {
      try {
        await post("lead/knowlarity-lead", {
          mobileNumber,
          tag: selectedTags,
          userUan,
        });
      } catch (err) {
        console.error(err);
      }
    }

    // setIsHelpSelected(true);
  };

  const handleOkClick = () => {
    // setIsHelpSelected(false);
      localStorage.clear()
    window.location.href = MESSAGES.CHEKC_MY_PF_URL
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4 offset-md-4 " style={{ backgroundColor: "#FFFFFF", height: "100%" }}>
          {!isHelpSelected && (
            <div className="p-4">
              {/* Warning Icon Stack */}
              <div
                className="position-relative d-flex align-items-center justify-content-center mb-3"
                style={{ width: 120, height: 120, margin: "0 auto" }}
              >
                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "#f2f5ff",
                  }}
                />
                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#e6ecff",
                  }}
                />
                <img
                  src={TriangleDanger}
                  alt="Warning"
                  width={50}
                  height={50}
                  className="position-absolute"
                />
              </div>

              {/* Red Warning Message */}
              <p
                style={{
                  color: "#FF0000",
                  fontSize: "1.125rem",
                  fontWeight: 400,
                  lineHeight:"100%",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                EPFO servers are not responding
              </p>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 400,
                  lineHeight:"100%",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                Don’t worry, we got you covered, Let us know how can we help you?          </p>

              {/* Help Options with Checkboxes */}
              <div className="d-flex flex-column gap-2">
                {helpOptions.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleToggle(option.id)} //Entire card clickable
                      className="d-flex align-items-start p-3 clickeffect"
                      style={{
                        borderRadius: "1rem",
                        backgroundColor: "#F7F9FF",
                        gap: "0.6rem",
                        boxShadow:
                          "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                        cursor: "pointer", //  Show pointer for card
                      }}
                    >
                      <input
                      className="clickeffect"
                        type="checkbox"
                        checked={isSelected}
                        readOnly //  Prevent default checkbox interaction, since handled by parent
                        style={{
                          width: "20px",
                          height: "20px",
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          borderRadius: "50%",
                          border: `2px solid ${isSelected ? "#3687f2" : "#858585"}`,
                          backgroundColor: isSelected ? "#3687f2" : "#FFFFFF",
                          display: "inline-block",
                          position: "relative",
                          marginTop: "0.7rem",
                          cursor: "pointer", //  Show pointer for card
                        }}
                      />

                      <div>
                        <h5
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {option.heading}
                        </h5>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 400,
                            margin: 0,
                            marginTop: "0.2rem",
                          }}
                        >
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>


              {/* Submit Button */}
              <div className="mt-4 text-center">
                <CompleteProfileButton text="Submit" onClick={handleSubmit} />
              </div>
               {/* {!isAvailable && (
              <div className="w-100 d-flex justify-content-center mt-2">
                <div
                  className=" px-3 py-2  shadow-sm text-start"
                  style={{
                    backgroundColor: "#f2f2f2",
                    borderRadius: "1rem",
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: "400", color: "#656565" }}>
                    Our PF experts are available from <br />
                    <span style={{ fontWeight: '500' }}> 9:00 AM to 8:00 PM IST</span>, 365 days at your service
                  </span>
                </div>
              </div>
               )} */}
            </div>
          )}

          {/* Success Message Overlay */}
          {isHelpSelected && (
            <div className="position-relative text-center px-4 py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh", paddingBottom: "120px" }}>

              {/* Icon Stack */}
              <div
                className="position-relative d-flex align-items-center justify-content-center mb-4"
                style={{ width: 120, height: 120 }}
              >
                <div
                  className="position-absolute rounded-circle"
                  style={{ width: 120, height: 120, backgroundColor: "#f2f5ff" }}
                />
                <div
                  className="position-absolute rounded-circle"
                  style={{ width: 80, height: 80, backgroundColor: "#e6ecff" }}
                />
                <img
                  src={TickMark}
                  alt="Success"
                  width={70}
                  height={70}
                  className="position-absolute"
                  style={{ zIndex: 2, objectFit: "contain" }}
                />
              </div>

              {/* Text */}
              <p style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "center" }}>
               We have registered your request
              </p>
              <p style={{ fontSize: "0.8125rem", fontWeight: 400, textAlign: "center", maxWidth: "400px", color: "#858585" }}>
                One of our experts will reach out to you within 12 hours between 8:30 AM to 7:00 PM from Monday - Saturday.
              </p>

              {/* Fixed OK Button */}
              <div
                className="position-fixed start-50 translate-middle-x"
                style={{ bottom: "100px", zIndex: 1000, width: "100%", maxWidth: "500px", padding: "0 1.25rem" }}
              >
                <CompleteProfileButton text="OK" onClick={handleOkClick} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EPFODownNew;



