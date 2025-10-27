import { FaExclamationCircle } from "react-icons/fa";
import { CustomButton, CustomOutlinedButton } from "../../helpers/helpers"
import "../styles/UserRegisteration.css"
import { decryptData } from "../common/encryption-decryption";
import { useEffect, useState } from "react";
import { setClarityTag } from "../../helpers/ms-clarity";
// import { ZohoLeadApi } from "../common/zoho-lead";
import { useNavigate } from "react-router-dom";

const EpfoDown = () => {
  const navigate = useNavigate()
  const [, setZohoUserID] = useState<any>();

  useEffect(() => {
    // zohoUpdateLead("EPFO down");
    setClarityTag("EPF_SERVICE_NOT_REACHABLE", "EPFO down page");
  }, [])

  setTimeout(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, 0)

  // const handleClick = () => {
  //   setClarityTag("BUTTON_TRY_AGAIN", "EPFO down page");
  //   localStorage.clear()
  //   window.location.href = MESSAGES.CHEKC_MY_PF_URL;
  // };

  const handleFullLogin = () => {
    setClarityTag("BUTTON_FULL_SCRAPPING_LOGIN", "EPFO down page");
    navigate('/login-uan', {state: { type: 'full'}})
  };
  
  // const zohoUpdateLead = async (tag: any) => {
  //   const rawData = decryptData(localStorage.getItem("lead_data"));
  //   const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
  //   const userName = decryptData(localStorage.getItem("user_name"))

  //   const newUser = rawData ? JSON.parse(rawData) : null;
  //   const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
  //   const user = existUser || newUser;

  //   if (!user) {
  //     return;
  //   }

  //   if (user) {
  //     const zohoReqData = {
  //       Last_Name: userName || user?.Last_Name,
  //       Mobile: user?.Mobile,
  //       Email: user?.Email,
  //       Wants_To: user?.Wants_To,
  //       Lead_Status:existUser && tag?.toLowerCase() === "notify me" ? "Reopen" : user?.Lead_Status,
  //       Lead_Source: user?.Lead_Source,
  //       Campaign_Id: user?.Campaign_Id,
  //       CheckMyPF_Status: tag,
  //     };
  //     ZohoLeadApi(zohoReqData);
  //   }
  // }


  return (
    <div className="to-margin-top min-vh-100 d-flex flex-column align-items-center py-4"
      style={{
        position: "fixed",
        left: 0,
        width: "100%",
      }}>

      <div className="user-register-text text-center p-2">
        <p className="title text-center" style={{'fontSize': '18px'}}>
          Uncover hidden issues and ensure access to your funds
        </p>
      </div>

      <br />
      <ErrorFetchingDetails />
      <br />

      <div className="d-flex flex-column align-items-center gap-3 mt-auto" >
        {/* <CustomButton name="Try again" onClick={handleClick} /> */}
        <CustomButton name="Login using UAN and Password" onClick={handleFullLogin} />
        <CustomOutlinedButton name="Notify me when service is available!" 
        // onClick={() => zohoUpdateLead("Notify me")}
         />
      </div>
      <br /><br />
      <br /> <br /><br />
      <br />
    </div>
  )
}

export default EpfoDown;

const ErrorFetchingDetails = () => {
  return (
    <div
      className="error-container"

    >
      <div className="error-header">
        <FaExclamationCircle className="error-icon" />
        <p className="error-title"> Oh! EPFO isn’t responding</p>
      </div>

      <div className="error-text">
        <p className="error-message">
          Looks like EPFO servers are down and not responding
        </p>
        <p className="error-message">
          Please try again after sometime
        </p>
      </div>
    </div>
  );
};