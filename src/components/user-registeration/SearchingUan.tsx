import "../styles/UserRegisteration.css"
import Searchmoney from "../../assets/search-money.png";
import { UserRegisterTextContent } from "../../features/user-registration/helpers/ExportingText";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ToastMessage from "./../common/toast-message"
import { post } from "../common/api";
import useNavigateLogin from "../../helpers/useNavigateLogin";
import { decryptData, encryptData } from "../common/encryption-decryption";
 import { ZohoLeadApi } from "../common/zoho-lead";
import { trackClarityEvent } from "../../helpers/ms-clarity";
import MESSAGES from "../constant/message";

const SearchingUan = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const [message] = useState({ type: '', content: '' })
  let { mobile_number } = location.state || {};
  
  // navigate login (auto logout)
  useNavigateLogin()

  useEffect(() => {
    const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    if(mobileNumber){
      mobile_number = mobile_number || mobileNumber;
    }

    fetchUanByMobile();
  }, [])

  const zohoUpdateLead = async (status:any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;

    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user.CheckMyPF_Intent;
    
      if (intent.includes("1lakh")) {
        intent = intent.replace(/1lakh/gi, "").trim();
      }
    
      if (!intent.includes("50K")) {
        intent = intent.length ? `${intent} 50K` : "50K";
      }
    
      user.CheckMyPF_Intent = intent;
    }

    if (!user) {
      return;
    }

    if (user) {
      const zohoReqData = {
        Last_Name: user?.Last_Name || 'New Lead',
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: existUser && existUser !== "" ? user?.CheckMyPF_Status : status,
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
        ZohoLeadApi(zohoReqData);
    }
  }

  const fetchUanByMobile = async () => {
    try {
      // call api to fetch UAN by mobile number
      const response = await post('surepass/fetchUanByMobile', { mobile_number: "" });

      // handle response
      if (response && response?.success) {
        trackClarityEvent(MESSAGES.ClarityEvents.USER_AUTHENTICATED)
        // store user uan 
        localStorage.setItem("user_uan", encryptData(response.data[0].uan))
        if(response?.status === 200 && response.data.length && response.data[0].uan) {
          // store user name
          if(response.data[0].employment_history.length && response.data[0].employment_history[0]?.name) {
            localStorage.setItem("user_name", encryptData(response.data[0].employment_history[0]?.name))
          }
          navigate('/uan-list', { state: { uanListItems: response.data, mobile_number } })
        } else {
          navigate('/uan-list', { state: { uanListItems: [], mobile_number } })
        }
      } else {
        localStorage.setItem("service_history", JSON.stringify(true));
        zohoUpdateLead("API down")
        navigate('/uan-list', { state: { uanListItems: [], mobile_number } })
      }
    } catch (error) {
      // zohoUpdateLead("API down", "None")
      navigate('/login-uan', { state: { type: 'full', apiFailure: true}})
    }
  };

  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      <div className="to-margin-top d-flex flex-column align-items-center gap-1 py-4"
        style={{
          position: "fixed",
          left: 0,
          width: "100%"
        }}
      >
        <UserRegisterTextContent />
        <div className="text-center">
          <img
            src={Searchmoney}
            alt="search-money-icon"
            className="search-icon rounded-circle border border-3"
          />
        </div>
        <p className="searching-uan-text text-center fw-semibold">Searching UAN</p>
        <div className="loading-box bg-white rounded-2 p-3 d-flex flex-column gap-2 shadow-sm">
          <div className="loading-bar mx-auto rounded-1 bg-gray shimmer"></div>
          <div className="loading-bar mx-auto rounded-1 bg-gray shimmer"></div>
          <div className="loading-bar mx-auto rounded-1 bg-gray shimmer"></div>
        </div>
      </div>
    </>
  );
};

export default SearchingUan;
