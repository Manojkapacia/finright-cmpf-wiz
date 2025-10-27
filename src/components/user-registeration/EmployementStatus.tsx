import { useLocation, useNavigate } from "react-router-dom";
import "./../../styles/global.css";
import { CurrentWorkingCompany, PoweredBy, UserRegisterationOtherUanTextContent } from "../../features/user-registration/helpers/ExportingText"
import { CircularLoading } from "./Loader";
import { useEffect, useRef, useState } from "react";
import { get, getForEpfoStatus, post } from "../common/api";
import ToastMessage from "../common/toast-message";
import { decryptData } from "../common/encryption-decryption";
import { ZohoLeadApi } from "../common/zoho-lead";
import MESSAGES from "../constant/message";
import { trackClarityEvent } from "../../helpers/ms-clarity";

const EmployementStatus = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' });
  const isMessageActive = useRef(false);

  const { mobile_number,currentEmploymentUanData, processedUan, type, partialPassbook } = location.state || {};
  
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const zohoUpdateLead = async (status: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
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
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: status === "Partial Report" ? "Partial Report" : existUser && existUser !== "" ? user?.CheckMyPF_Status : status,
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

 const handleEmployementClick = async (status: any) => {
  trackClarityEvent(MESSAGES.ClarityEvents.CHOOSE_EMPLOYMENT_STATUS);
  setIsLoading(true);
  
  const navigateToLoginUanWithEpfoCheck = async (statePayload: any) => {
    try {
      const epfoStatus = await getForEpfoStatus("/epfo/status");
      if (!epfoStatus?.isAvailable) {
        setIsLoading(false);
        navigate("/epfo-down");
        return;
      }
    } catch (err) {
      console.error("EPFO check failed", err);
      setIsLoading(false);
      navigate("/epfo-down");
      return;
    }

    setIsLoading(false);
    navigate('/login-uan', { state: statePayload });
  };

  const normalized = selectedCompany.trim().toLowerCase();
  if (["retired", "i am retired"].includes(normalized)) {
    status = "retired";
  } else if (normalized === "i am currently not working") {
    status = "notworking";
  } else if (normalized === "i have multiple uans") {
    status = "notlisted";
  } else if (normalized === "pf not deducted by current employer") {
    status = "notdeducted";
  } else {
    status = "working";
  }

  const employeeStatusData = {
    uan: processedUan,
    userEmpHistoryCorrect: status === 'working',
    userStillWorkingInOrganization: status === 'working',
    currentOrganizationMemberId: status === 'working'
      ? (type.toLowerCase() !== 'full'
        ? currentEmploymentUanData[0]?.member_id
        : currentEmploymentUanData[0]?.currentOrganizationMemberId)
      : "",
    status,
    type,
    userMobileNumber: mobile_number,
  };

  try {
    if (type.toLowerCase() !== 'full') {
      
      try {
        if (partialPassbook && partialPassbook.toLowerCase() === 'true') {
          try {
            const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', employeeStatusData);
            if (withdrawabilityCheckUpReportResponse) {
              setIsLoading(false);
              trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
              zohoUpdateLead("Partial Report");
              navigate('/dashboard', { state: { mobile_number, processedUan,type:"full" } });
            } else {
              await navigateToLoginUanWithEpfoCheck({
                type: 'full',
                apiFailure: true,
                currentUan: processedUan,
                mobile_number,
              });
            }
          } catch (error) {
            await navigateToLoginUanWithEpfoCheck({
              type: 'full',
              apiFailure: true,
              currentUan: processedUan,
              mobile_number,
            });
          }
        } else {
          const passbookResponse = await post('/surepass/getAdvancePassbook', { mobile_number, uan: processedUan });

          if (passbookResponse && passbookResponse.success) {
            try {
              const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', employeeStatusData);
              if (withdrawabilityCheckUpReportResponse) {
                setIsLoading(false);
                zohoUpdateLead("Partial Report");
                trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
                navigate('/dashboard', { state: { mobile_number, processedUan,type:"full" } });
              } else {
                await navigateToLoginUanWithEpfoCheck({
                  type: 'full',
                  apiFailure: true,
                  currentUan: processedUan,
                  mobile_number,
                });
              }
            } catch (error) {
              await navigateToLoginUanWithEpfoCheck({
                type: 'full',
                apiFailure: true,
                currentUan: processedUan,
                mobile_number,
              });
            }
          } else {
            zohoUpdateLead("API down");
            await navigateToLoginUanWithEpfoCheck({
              type: 'full',
              apiFailure: true,
              currentUan: processedUan,
              mobile_number,
            });
          }
        }
      } catch (error) {
        await navigateToLoginUanWithEpfoCheck({
          type: 'full',
          apiFailure: true,
          currentUan: processedUan,
          mobile_number,
        });
      }
    } else {
      try {        
        const responseUan = await get('/data/fetchByUan/' + processedUan);
        trackClarityEvent(MESSAGES.ClarityEvents.SERVICE_HISTORY_FETCHED);
        setIsLoading(false);
        navigate('/kyc-details', {
          state: {
            mobile_number,
            processedUan,
            currentUanData: responseUan,
            currentEmploymentUanData: employeeStatusData,
            type,
          },
        });
      } catch (error) {
        await navigateToLoginUanWithEpfoCheck({
          type: 'full',
          apiFailure: true,
          currentUan: processedUan,
          mobile_number,
        });
      }
    }
  } catch (error) {
    await navigateToLoginUanWithEpfoCheck({
      type: 'full',
      apiFailure: true,
      currentUan: processedUan,
      mobile_number,
    });
  }
};


  

  return (
    <>
      {isLoading && <CircularLoading />}
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {
        !isLoading &&

        <div
          className="min-vh-100 d-flex flex-column align-items-center justify-content-between gap-2 py-4"
          style={{
            marginTop: "3rem",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          <div className="">
            <UserRegisterationOtherUanTextContent
              headText="Choose your Employment Status!"
              singleviewText=""
            />

            <p className="text-center select-employe-status">Choose the option that best<br /> represents your employment status</p>
          </div>
          
          <div className="mb-5 pb-5">
            {currentEmploymentUanData?.length > 0 && (
                <CurrentWorkingCompany
                  type={type}
                  currentEmploymentUanData={currentEmploymentUanData}
                  onCompanySelect={setSelectedCompany}
                  setIsModalOpen={setIsModalOpen}
                />
            )}
          </div>

          {/* Bottom fixed button */}
            <div className=" mb-2" style={{ visibility: isModalOpen ? 'hidden' : 'visible' }}>
            <button
              className="btn text-white fw-bold clickeffect pb-1 pt-1"
              style={{
                width: "19.375rem",         // 310px
                height: "3.1875rem",        // 51px
                maxHeight: "4.5rem",        // 72px
                borderRadius: "62.5rem",
                backgroundColor: "#00124F",
                padding: "1rem 2rem"
              }}
                onClick={() => {
                    handleEmployementClick("working");
                }}
            >
              Continue
            </button>

            <div className="d-flex justify-content-center mt-4 mb-5 pb-5"  >
              <PoweredBy />
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default EmployementStatus