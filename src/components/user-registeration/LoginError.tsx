import { FaExclamationCircle } from "react-icons/fa";
import { PoweredBy, UserRegisterTextContent } from "../../features/user-registration/helpers/ExportingText";
import "../styles/UserRegisteration.css";
import { CustomButton, CustomOutlinedButton } from "../../helpers/helpers";
import { useNavigate } from "react-router-dom";
import MESSAGES from "../constant/message";
import { useEffect, useState } from "react";
import { decryptData } from "../common/encryption-decryption";
import { setClarityTag } from "../../helpers/ms-clarity";
// import { ZohoLeadApi } from "../common/zoho-lead";

const LoginError = () => {
  const navigate = useNavigate();
  const [, setZohoUserID] = useState<any>();

  useEffect(() => {
    // zohoUpdateLead(props.errorType ? props.errorType :"Tech error");
  }, []);

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);
  
  const handleLoginClick = () => {
    navigate('/login-uan', { state: { type: 'full' } });
    // zohoUpdateLead("Full profile")
  }

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
  //       Lead_Status: user?.Lead_Status,
  //       Lead_Source: user?.Lead_Source,
  //       Campaign_Id: user?.Campaign_Id,
  //       CheckMyPF_Status: tag,
  //     };
  //     if(newUser){
  //       ZohoLeadApi(zohoReqData);
  //     }
  //     if(existUser && (user?.CheckMyPF_Status?.toLowerCase() == "none" || user?.CheckMyPF_Status?.toLowerCase() == "epfo down" || user?.CheckMyPF_Status?.toLowerCase() == "try again" || user?.CheckMyPF_Status?.toLowerCase() == "notify me")){
  //       ZohoLeadApi(zohoReqData)
  //     }
  //   }
  // }



  const handleTryAgain = () => {
    setClarityTag("BUTTON_TRY_AGAIN", "Technical error");
    localStorage.clear();
    window.location.href = MESSAGES.CHEKC_MY_PF_URL
  }

  return (
    <div className="to-margin-top  d-flex flex-column align-items-center gap-3 py-4 gap-2 min-vh-100"
      style={{
        position: "fixed", // Fixes the container in place
        left: 0,
        width: "100%", // Ensures full width
      }}
    >
      <div>
        <UserRegisterTextContent />
        <ErrorFetchingDetails />
      </div>
      <br />
      <br />

      <div className="d-flex justify-content-center mt-auto">
        <CustomButton name="Try Again" onClick={handleTryAgain} />
      </div>
      <div className="d-flex justify-content-center">
        <CustomOutlinedButton name="Login using UAN and Password" onClick={handleLoginClick} />
      </div>

      {/* <div className="d-flex justify-content-center mt-auto  mb-3">
        <UserRegistrationSubmitButton />
      </div> */}
      <div className="d-flex justify-content-center mb-5">
        <PoweredBy />
      </div>
      <br />
    </div>
  );
};

export default LoginError;

export const ErrorFetchingDetails = () => {
  return (
    <div
      className="error-container"
    >
      <div className="error-header">
        <FaExclamationCircle className="error-icon" />
        <p className="error-title"> Oh! This wasn’t supposed to happen</p>
      </div>

      <div className="error-text">
        <p className="error-message">
          Looks like there was an error fetching your details.
        </p>
        <p className="error-message">
          Please try again after sometime or login using your UAN and password.
        </p>
      </div>
    </div>
  );
};
