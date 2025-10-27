import "./../../../App.css";
import RiskCard from "./../../../components/dashboard/risk-card";
import TransactionCard from "./../../../components/dashboard/transaction-card";
import { formatCurrency } from "../../../components/common/currency-formatter";
import PaymentUnlockForPfReport from "../../../components/dashboard/PaymentUnlockforPfRefort";
import FundGrowthChart from "../../../components/dashboard/FundGrowth";
import PfAnalysisPensionReport from "../../../components/dashboard/PfAnalysisPensionReport";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ViewDetailModel from "../../../components/dashboard/Models/ViewDetailModel";
import ConnectwithExportModel from "../../../components/dashboard/Models/ConnectwithExportModel";
import CalculatedModel from "../../../components/dashboard/Models/CalculatedModel";
import { decryptData, encryptData } from "../../../components/common/encryption-decryption";
import ZohoModal from "../../../components/dashboard/Models/ZohoModal";
import { CompleteProfileButton, CustomButtonAll, PFLoadingCard, PFSuccessCard, WithdrawNowButton } from "../../../helpers/helpers";
import {
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import AmountStuckModel from "../../../components/dashboard/Models/AmountStuckModel";
import WithdrawTransferNowModel from "../../../components/dashboard/Models/WithdrawTransferNowModel";
import ConnectNowModel from "../../../components/dashboard/Models/ConnectNowModel";
import ToWithdrawAnalysisModel from "../../../components/dashboard/Models/ToWithdrawAnalysisModel";
import ResolveNowModel from "../../../components/dashboard/Models/ResolveNowModel";
import { BiChevronRight } from "react-icons/bi";
import HighRiskModelEPFOModel from "../../../components/dashboard/Models/HighRiskModelEPFOModel";
// import ConnectEPFOModel from "../../../components/dashboard/Models/ConnectEPFOModel";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import "../../../styles/global.css"
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";
import { BsExclamationTriangleFill } from "react-icons/bs";
import CompleteProfileModel from "../../../components/dashboard/Models/CompleteProfileModel";
import { get, getForEpfoStatus, post } from "../../../components/common/api";
import { trackClarityEvent } from "../../../helpers/ms-clarity";
import MESSAGES from "../../../components/constant/message";
import MoreForYouSlider from "../../../components/dashboard/Dashboard2.o/MoreForYouSlider";
import VerifyEpfoPassbookModel from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookModel";
import VerifyEpfoPassbookOtpModal from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookOtpModal";
import FinancialHealthBanner from "../../../components/dashboard/Dashboard2.o/FinancialHealthBanner";
import UrgentProfile from "../../../assets/suport-profile.png"
import CallBookedSlider from "../../../components/dashboard/Models/CallBookedModel";
import { CalendlySlider } from "../../../components/dashboard/Models/CalendlySliderModel";
import { FaRegCalendarAlt, FaUserAlt } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdOutlineNotificationsActive } from "react-icons/md";
import InitialCallBookingSlider from "../../../components/dashboard/Models/InitialCallBookingSlider";
import AfterInitialPaidCallBooking from "../../../components/dashboard/Models/afterInitialPaidCallBooking";
import AdvancePaidCallBooking from "../../../components/dashboard/Models/advancePaidCallBooking";
import moment from "moment";
import { formatToISO } from "../../../helpers/dates-convertor";
// import { AnimatePresence } from "framer-motion";
import PaymentABTestSlider from "../../../components/dashboard/Models/paymentABTestSlider";
import { handleCalendlyBooking } from "../../../helpers/calendryBooking";
import BookingFaildSlider from "../../../components/dashboard/Models/bookingFaildSlider";
// import { getForEpfoStatus } from "../../../components/common/api";

const PfReport = (props: any) => {
  interface ZohoUpdateLeadParams {
    tag?: string;
    status?: string | null;
    intent?: string | null;
    intentStatus?: "Scheduled" | "Not Scheduled" | null;
    callDate?: string | null;
    callTime?: string | null;
  }
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });
  const [calculatedContent] = useState<any>("");
  const [isZohoModalOpen, setZohoModalOpen] = useState(false);
  const [, setZohoUserID] = useState<any>();
  const showAlternate = props.currentUanData == null;
  const [isNewUIToggleEnabled, setIsNewUIToggleEnabled] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState("");
const [showCalendlySlider, setShowCalendlySlider] = useState(false);

const [showBookedSlider, setShowBookedSlider] = useState(false);
const [bookedDate, setBookedDate] = useState("");
const [bookedTime, setBookedTime] = useState("");
const [assigneeName, setAssigneeName] = useState("");
const [lastName, setLastName] = useState("");
const [showInitialCallSlider, setShowInitialCallSlider] = useState(false);
const [showAfterInitialCallbooking, setShowAfterInitialCallbooking] = useState(false);
const [showAdvancePaidCallBooking, setShowAdvancePaidCallBooking] = useState(false);
const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
const [hasActiveBooking, setHasActiveBooking] = useState<boolean | null>(null);
const [isBookingRes, setIsBookingRes] = useState(false);
const [showPaymentABTestSlider, setShowPaymentABTestSlider] = useState(false);
const [zohopaymentTag, setZohopaymentTag] = useState(null);
const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false)
const [allowInitialCall, setAllowInitialCall] = useState(true);
const allowInitialCallRef = useRef(allowInitialCall);
  
useEffect(() => {
  if (isBookingRes) {
    zohoUpdateLead({
      intentStatus: "Scheduled",
      callDate: bookedDate,
      callTime: bookedTime
    })
  }
}, [isBookingRes]);
useEffect(() => {
  allowInitialCallRef.current = allowInitialCall;
}, [allowInitialCall]);


  useEffect(() => {
    const getToggleValue = async () => {
      try {
        const response = await get("/data/toggle/keys");
        const newUIToggle = response?.allTogglers?.find((item: any) => item.type === "new-ui");
        const bannerToggle = response?.allTogglers?.find((item: any) => item.type == "finquest-swiping")
        setIsNewUIToggleEnabled(newUIToggle?.isEnabled);
        setIsBannerVisible(bannerToggle?.isEnabled);
      } catch (err) {}
    };
   const totalBalance = props.currentUanData?.reportData?.totalPfBalance;

  if (totalBalance < 50000) {
    setAllowInitialCall(false);
  }
    checkAgentBooking();
    // userAlreadyBooked();
    getToggleValue();
  }, []);

  const handleHighRiskModelEPFOModel = () => {
    navigate('/risk-reports', { state: { currentUanData: props?.currentUanData, fromPfReport: true, } });
  }

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);

  useEffect(() => {
    if(props?.otpHandling?.otpmodel){
      setShowModal({ show: true, type: "verifyEpfoPassbookOtp" });
      props?.otpHandling?.setOtpmodel(false)
    }
  }, [props?.otpHandling?.otpmodel]);


  

  // amountstuck
  const handleAmountStuck = () => {
    setShowModal({ show: true, type: "amountstuck" });

  }

  const handleCalendlyEvent = async (zohoIntent?: any) => {
    if (zohoIntent) {
      zohoUpdateLead({ intent: zohoIntent });
    }
    try {
      await handleCalendlyBooking({
        zohoIntent,
        paymentStatus,
        // zohopaymentTag,
        setBookedDate,
        setBookedTime,
        setAssigneeName,
        setShowBookedSlider,
        setShowPaymentABTestSlider,
        setShowInitialCallSlider,
        setShowAfterInitialCallbooking,
        setShowAdvancePaidCallBooking,
        setLastName,
        setCalendlyLink,
        setShowCalendlySlider, // Now this matches the interface
        navigate,
        setShowBookingFaildSlider
      });
    } catch (error) {
      console.error("Error in handleCalendlyBooking:", error);
    }
  };

  const checkAgentBooking = async () => {
    const mobile = decryptData(localStorage.getItem("user_mobile"));

    try {
      const response = await post("calendly/check-user-booking", { mobile });
      checkpaymentStatus(response?.hasActiveBooking);
      if (response?.success) {
        setBookedDate(response?.data?.date);
        setBookedTime(response?.data?.time);
        setAssigneeName(response?.data?.assigneeName);
        setHasActiveBooking(response?.hasActiveBooking);

      }
    } catch (err) {
      console.error("Error fetching agent booking:", err);
    }
  }

  const checkpaymentStatus = async (hasActiveBooking: boolean) => {
    const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    const isCallBookingUrl = decryptData(localStorage.getItem("isCallBookingUrl"));
    try {
      const response = await post("calendly/cmpf-payment-status", { mobileNumber });
      setPaymentStatus(response?.callbookingStatus?.paymentStatus);
      if (response?.success) {
        const convertedContact = response?.callbookingStatus?.Converted_Contact;        
        const zohopaymentTag = response?.callbookingStatus?.Tag?.find((tag:any) => tag?.name.toLowerCase() === "paid initiation")?.name;
        setZohopaymentTag(zohopaymentTag);
        if(isCallBookingUrl==="true" && Array.isArray(response?.callbookingStatus?.Tag)){
          const calendarClosed = decryptData(localStorage.getItem('calendarClosed'));
          if (calendarClosed === 'true') {
            return; // Don't show calendar if it was manually closed
          }
          handleCalendlyEvent();
        } else{ 
          if(zohopaymentTag !== "Paid Initiation" && response?.callbookingStatus?.paymentStatus === "unpaid" && response?.callbookingStatus?.noCallbookedShown === false && hasActiveBooking === false){
            setTimeout(() => {
              if (response?.callbookingStatus?.showPaymentSlider) {
                setShowPaymentABTestSlider(true);
              } else {
                if (allowInitialCallRef.current === true) {
                  setShowInitialCallSlider(true);
                }
              }
            }, 2000);
          }
          if(convertedContact=== null && zohopaymentTag === "Paid Initiation" && (response?.callbookingStatus?.paymentStatus === "initialpayment" && (response?.callbookingStatus?.initialPaymentDoneButCallNotBooked === false && response?.callbookingStatus?.noCallbookedShown === true && hasActiveBooking === false))){
            setTimeout(() => {
              setShowAfterInitialCallbooking(true);
            }, 2000);
          }
          if((convertedContact && hasActiveBooking === false) || (response?.callbookingStatus?.paymentStatus === "fullpayment" && response?.callbookingStatus?.advancePaymentDoneButCallNotBooked === false && response?.callbookingStatus?.noCallbookedShown === true && response?.callbookingStatus?.initialPaymentDoneButCallNotBooked === true && hasActiveBooking === false)){
            setTimeout(() => {
              setShowAdvancePaidCallBooking(true);
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching payment status:", err);
    }
  }

  const navigateToScrapper = async() => {
  if(isNewUIToggleEnabled){
    setShowModal({ show: true, type: "verifyEpfoPassbook" });
  }
  else{
     try {
    const data = await getForEpfoStatus("/epfo/status");
    if (data?.isAvailable) {
      trackClarityEvent(MESSAGES.ClarityEvents.REFRESH_BUTTON_PRESS);
       const isScrappedFully = props?.currentUanData?.rawData?.isScrappedFully;
       if(isScrappedFully){
        navigate("/login-uan", {
          state: {
            type: "refresh",
            currentUan: props?.currentUanData?.profileData?.data?.uan,
            mobile_number:
              props?.currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
              password: props?.currentUanData?.profileData?.data?.password,
            dashboard: true,
          },
        });
       }
       else{
      navigate("/login-uan", {
        state: {
          type: "refresh",
          currentUan: props?.currentUanData?.profileData?.data?.uan,
          mobile_number:
            props?.currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
          dashboard: true,
        },
      });
    }
    } else {
      setShowModal({ show: true, type: "serverDown" });
    }
  } catch (err) {
    setShowModal({ show: true, type: "serverDown" });
  }
}
};

  const handleTalkToExpert = () => {
      if(props?.currentUanData?.rawData?.isScrappedFully){
        // navigate('/express-withdraw', { state: { currentUanData: props?.currentUanData, fromPfreport: true,} });
        setShowModal({ show: true, type: "connectNow" });
        // zohoUpdateLead("Need Consultation");
        // // getZohoUserId("Need Consultation")
      }else{
             setShowModal({ show: true, type: "connectEpfo" });
      }
  };
  const handleCloseZohoModal = () => {
    setZohoModalOpen(false); // Close ZohoModal
  };

  let riskPossibility =
    props?.currentUanData?.reportData?.claimRejectionProbability;


  const zohoUpdateLead = async (
    {
      intent,
      intentStatus,
      callDate,
      callTime,
    }: ZohoUpdateLeadParams) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
    const userBalance = decryptData(localStorage.getItem("user_balance"));

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if(userBalance > 50000 && intent !== undefined && intent !== null && intent.trim() !== ""){
      intent = `${intent} 50K`;
    }

    if (!user) {
      return;
    }

    if (user) {
      const zohoReqData = {
        Last_Name: userName || props?.currentUanData?.rawData?.data?.profile?.fullName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: props?.currentUanData?.rawData?.isScrappedFully ? "Full Report" : "Partial Report",
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : (intentStatus === "Scheduled" ? "Scheduled" : "Not Scheduled"),
      Call_Schedule: intentStatus === "Scheduled" && callDate && callTime
        ? formatToISO(callDate, callTime)
        : user.Call_Schedule || "",
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  // fetching facbook details 
  const handleFetchPassbook = () => {
    // fetch logic comes here..

  }
  const passbookSharesData = {
    totalAmountWithInterest: props?.currentUanData?.reportData?.totalPfBalance || 0,
    employeeShare: props?.currentUanData?.reportData?.amountContributed?.totalEmployeeShare || 0,
    employerShare: props?.currentUanData?.reportData?.amountContributed?.totalEmployerShare || 0,
    pensionShare: props?.currentUanData?.reportData?.amountContributed?.totalPensionShare || 0,
    interestShare: props?.currentUanData?.reportData?.amountContributed?.totalInterestShare || 0
  };
  // vanity card onclick
  const handleCurrentBalanceClick = () => {
    setShowModal({ show: true, type: "currentbalance" });
  }

const goToLoginPage = async () => {
  if(isNewUIToggleEnabled){
  
   setShowModal({ show: true, type: "verifyEpfoPassbook" });
  }
  else{
  try {
    const data = await getForEpfoStatus("/epfo/status");
    if (data?.isAvailable) {
      trackClarityEvent(MESSAGES.ClarityEvents.COMPLETE_PROFILE_BUTTON_PRESS);
      const isScrappedFully = props?.currentUanData?.rawData?.isScrappedFully;
      if(isScrappedFully){
        navigate("/login-uan", {
          state: {
            type: "refresh",
            currentUan: props?.currentUanData?.profileData?.data?.uan,
            mobile_number:
              props?.currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
             password: props?.currentUanData?.profileData?.data?.password,
            dashboard: true,
          },
        });
      }
      else{
      navigate("/login-uan", {
        state: {
          type: "refresh",
          currentUan: props?.currentUanData?.profileData?.data?.uan,
          mobile_number:
            props?.currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
          dashboard: true,
        },
      });
    }
    } else {
      setShowModal({ show: true, type: "serverDown" });
    }
  } catch (err) {
    setShowModal({ show: true, type: "serverDown" });
  }
}
};

const handleserverDown =() => {
         setShowModal({ show: false, type: "serverDown" });

 }

// const employmentDataSet = [
//   {
//     establishment_name:props?.currentUanData?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
//     currentOrganizationMemberId:props?.currentUanData?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
//     userEmpHistoryCorrect: !!props?.currentUanData?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
//     userStillWorkingInOrganization: !!props?.currentUanData?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
//     serviceHistory:props?.currentUanData?.rawData?.data?.serviceHistory?.history,
//     isFromFullScrapper: true
//   }
// ];


useEffect(() => {
  // const isKycChanged = props?.currentUanData?.rawData?.isKycChanged;
  const isScrapingComplete = props?.scrapingStatus === 'complete';
 setShowModal({ show: false, type: "verifyEpfoPassbook" });
  // if (props?.type === "refresh" && isKycChanged && isScrapingComplete) {
  //   setShowModal({ show: true, type: 'kycContinue' });
  // } else if (props?.type === "full" && isScrapingComplete) {
  //   setShowModal({ show: true, type: 'kycContinue' });
  // } else 
  if (isScrapingComplete) {
    const timeoutId = setTimeout(() => {
      props.setScrapingStatus("idle");
    navigate("/dashboard", {
      replace: true,
      state: {
        mobile_number: props?.currentUanData?.profileData?.data?.phoneNumber?.replace(/^91/, ""),
        processedUan: props?.currentUanData?.profileData?.data?.uan,
        type: "null",
        _ts: Date.now(), 
      }
    });
    navigate(0);
    }, 5000);

    // Clean up timeout on re-render
    return () => clearTimeout(timeoutId);
  }
}, [
  props?.currentUanData?.rawData?.isKycChanged,
  props?.type,
  props?.scrapingStatus,
  props?.setScrapingStatus,
  props?.currentUanData
]);


  return (
    <div>   
          {/* handle Modal Opening & Closing  */}
          {showModal?.show && showModal?.type === "view report" && (
            <ViewDetailModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "view report" });
              }}
              onContinue={() => {
                navigateToScrapper();
              }}
            />
          )}
          {showModal?.show && showModal?.type === "connect" && (
            <ConnectwithExportModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "connect" });
              }}
              onExpertTalk={() => {
                handleTalkToExpert();
              }}
            />
          )}
          {showModal?.show && showModal?.type === "calculated" && (
            <CalculatedModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "calculated" });
              }}
              content={calculatedContent}
            />
          )}
          {/* amountstuck model */}
          {showModal?.show && showModal?.type === "amountstuck" && (
            <AmountStuckModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "amountstuck" });
              }}
              content={calculatedContent}
            />
          )}


          {/* view details */}
          {showModal?.show && showModal?.type === "viewdetail" && (
            <ViewDetailModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "viewdetail" });
              }}
              onContinue={() => {
                navigateToScrapper();
              }}
              content={calculatedContent}
            />
          )}
          {/* withdraw analysis */}
          {showModal?.show && showModal?.type === "withdrawanalysis" && (
            <ToWithdrawAnalysisModel
              isOpen={showModal?.show}
              onClose={() => {
                setShowModal({ show: false, type: "withdrawanalysis" });
              }}
              content={calculatedContent}
            />
          )}
          {showModal.show && showModal.type === "withdraw" && (
            <WithdrawTransferNowModel
              setShowModal={setShowModal}
              onTalkToExpert={handleTalkToExpert}
            />
          )}
          {showModal.show && showModal.type === "connectNow" && (
            <ConnectNowModel setShowModal={setShowModal} />
          )}

          {/*high risk connecting epfo */}
          {showModal.show && showModal.type === "highriskepfo" && (
            <HighRiskModelEPFOModel
              setShowModal={setShowModal}
              issuesCount={props?.currentUanData?.reportData?.totalIssuesFound?.critical + props?.currentUanData?.reportData?.totalIssuesFound?.medium}
            />
          )}
          {/* {showModal.show && showModal.type === "connectEpfo" && (
            <ConnectEPFOModel setShowModal={setShowModal}
              onContinue={() => {
                navigateToScrapper();
              }}
        />
      )} */}

          {/* resolve now */}
          {showModal.show && showModal.type === "resolvenow" && (
            <ResolveNowModel
              setShowModal={setShowModal}
            />
          )}
          {showModal.show && showModal.type === "connectNow" && (
            <ConnectNowModel setShowModal={setShowModal} />
          )}
          {/* current balance */}
          {showModal.show && showModal.type === "currentbalance" && (
            <CurrentBalanceModel
              isOpen={true}
              onClose={() => setShowModal({ show: false, type: "" })}
              passbookSharesData={passbookSharesData} 
            />
          )}

         {showModal.show && showModal.type === "connectEpfo" && (
        <CompleteProfileModel
          setShowModal={setShowModal}
          onContinue={() => {
            navigateToScrapper();
          }}
          bodyText="Please complete your profile before initiating withdrawal request"
        />
      )}

      
         {showModal.show && showModal.type === "serverDown" && (
        <CompleteProfileModel
          setShowModal={setShowModal}
          onContinue={handleserverDown}
          headText="EPFO servers are not responding"
          bodyText="Looks like EPFO servers are currently not responding, please try again after sometime."
        />
      )}
      
  

{/* {showModal.show && showModal.type === "kycContinue" && (
        <KycDetailsContinueModel
          setShowModal={setShowModal}
          onContinue={() => {
            navigate("/kyc-details", {
              state: {
                processedUan: props?.currentUanData?.profileData?.data?.uan,     // or uan
                mobile_number:props?.currentUanData?.rawData?.data?.profile?.phone,
                currentUanData:props?.currentUanData,
                currentEmploymentUanData:employmentDataSet,
                type:"partial"
              }
            });
          }}
        />
      )} */}

      {showModal.show && showModal.type === "verifyEpfoPassbook" && (
            <VerifyEpfoPassbookModel
              setShowModal={setShowModal}
              processedUan={props?.currentUanData?.profileData?.data?.uan || props?.otpHandling?.processedUan}
              epfoLoading={props?.otpHandling?.isEpfoLoading}
              onVerify={(uan, pass) => props?.otpHandling?.handleVerify(uan, pass, setShowModal)}
              currentUanData={props?.currentUanData}
              // selectedTags={selectedTags}
              // name={name}               
            />
          )}
           {showModal.show && showModal.type === "verifyEpfoPassbookOtp" && (
            <VerifyEpfoPassbookOtpModal
              setShowModal={setShowModal}
              epfoLoading={props?.otpHandling?.isEpfoLoading}
              onVerifyOtp={props?.otpHandling?.handleVerifyOtp}
              onResendOtp={props?.otpHandling?.handleResendOtp}
              onRetryLogin={props?.otpHandling?.handleVerify} 
              mobileNumber={props?.otpHandling?.mobileNumber}
              credentials={props?.otpHandling?.credentials}
            />
          )}

          <ZohoModal isOpen={isZohoModalOpen} onClose={handleCloseZohoModal} />
          <div className="to-margin-top mb-4">
            <VanityCard
               fullNameDownload={props?.currentUanData?.rawData?.data?.profile?.fullName}
               isScrappedFully={props?.currentUanData?.rawData?.isScrappedFully}
               currentUanData={props?.currentUanData}
              uan={props?.currentUanData?.rawData?.data?.profile?.UAN}
              fullName={props?.currentUanData?.rawData?.data?.profile?.fullName}
              totalPfBalance={props?.currentUanData?.reportData?.totalPfBalance}
              chevron={true}
              handleCurrentBalance={handleCurrentBalanceClick}
              onRefresh={goToLoginPage}
              lastUpdated={props?.currentUanData?.rawData?.meta?.createdTime}
            />
          </div>
<div className="mt-2 pt-2">
{props.scrapingStatus === 'in-progress' && (
  <PFLoadingCard text="We are updating your details..." />
)}

{props.scrapingStatus === 'complete' && (
  <PFSuccessCard />
)}
</div>

{props.scrapingStatus === 'idle' && !props?.currentUanData?.rawData?.isScrappedFully && (
  <div className="mt-2 pt-2">
    <div
      className="card border-0 shadow-sm"
      style={{
        padding: "0.625rem",
        paddingBottom: "1rem",
        borderRadius: "1rem",
        display: "flex",
        backgroundColor: "#F7F9FF",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <div className="d-flex justify-content-end align-items-center mb-1">
        <BsExclamationTriangleFill
          style={{
            color: "#FF3B30",
            fontSize: "var(--fs-title-card-title)",
            marginRight: "0.25rem",
          }}
        />
        <span
          className="text-end"
          style={{
            color: "#FF3B30",
            fontSize: "var(--fs-title-card-title)",
          }}
        >
          20% Profile Complete
        </span>
      </div>

      <div
        style={{
          height: "0.5rem",
          width: "100%",
          backgroundColor: "#E5E5E5",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#FF3B30",
            borderRadius: "1rem 0 0 1rem",
          }}
        ></div>
      </div>

      <div className="text-center">
        <p
          style={{
            fontSize: "var(--fs-title-card-title)",
            fontWeight: 400,
            lineHeight: "1.25rem",
            marginBottom: 0,
          }}
        >
          Ensure your PF withdrawals are protected
        </p>
      </div>

      <CompleteProfileButton text="Complete Profile Now" onClick={goToLoginPage} />
    </div>
  </div>
)}
      <p className={`section-title mb-1 py-2 ${props?.currentUanData?.rawData?.isScrappedFully && "mt-2"}`}>Attention Required!</p>
      <span className="underline mb-3" style={{ marginTop: "-0.6rem" }}></span>
      {/* <StackedCardSlider currentUanData={props?.currentUanData} /> */}
        <InitialCallBookingSlider
          show={showInitialCallSlider}
          onClose={() => setShowInitialCallSlider(false)}
          onBookCall={handleCalendlyEvent}
        />
      <PaymentABTestSlider
        show={showPaymentABTestSlider}
        onClose={() => setShowPaymentABTestSlider(false)}
        // onProceed={handleCalendlyEvent}
      />

        <AfterInitialPaidCallBooking
          show={showAfterInitialCallbooking}
          onClose={() => setShowAfterInitialCallbooking(false)}
          onBookCall={handleCalendlyEvent}
        />

        <AdvancePaidCallBooking
          show={showAdvancePaidCallBooking}
          onClose={() => setShowAdvancePaidCallBooking(false)}
          onBookCall={handleCalendlyEvent}
        />
      {zohopaymentTag !== "Paid Initiation" && paymentStatus === "unpaid" && hasActiveBooking === false && (
        <div
          className="px-4 py-3 my-3"
          style={{
            background: "linear-gradient(60deg, #00124F,#03617C, #06AEA8, #00C7A5)", // ✅ gradient
            color: "white",
            borderRadius: "0.75rem",
            boxShadow: "0px 10px 10px -5px rgba(0,0,0,0.3)"
          }}
        >
          {/* Text (left aligned, wraps naturally) */}
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              textAlign: "left",
              marginBottom: "1rem",
              lineHeight: "1.4",
            }}
          >
            Looking for guaranteed claim <br /> settlement?
          </div>

          {/* Centered button */}
          <div className="d-flex justify-content-center">
            <button className="clickeffect"
              style={{
                backgroundColor: "white",
                color: "#000",
                borderRadius: "1rem",
                fontSize: "0.80rem",
                padding: "0.4rem 1rem",
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)", // subtle shadow
              }}
              onClick={handleCalendlyEvent}

            >
              Book a call now
            </button>
          </div>
        </div>
      )}

      {(zohopaymentTag === "Paid Initiation" || paymentStatus?.toLowerCase() === "initialpayment" || paymentStatus?.toLowerCase() === "fullpayment") && hasActiveBooking === false && (
        <div
          className="px-4 py-3 my-3"
          style={{
            background: "linear-gradient(60deg, #00124F,#03617C, #06AEA8, #00C7A5)", // ✅ gradient
            color: "white",
            borderRadius: "0.75rem",
            boxShadow: "0px 10px 10px -5px rgba(0,0,0,0.3)"
          }}
        >
          {/* Text (left aligned, wraps naturally) */}
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              textAlign: "left",
              lineHeight: "1.4",
            }}
          >
            {zohopaymentTag === "Paid Initiation" || paymentStatus === "initialpayment" ? "Your Plan of Action is ready!" : "Your case is under process"}
          </div>

          <p style={{
            marginBottom: "1rem",
            lineHeight: "1.4",fontSize:"0.8rem"
          }}>{zohopaymentTag === "Paid Initiation" || paymentStatus === "initialpayment" ? "Scheduled a call with our Expert" : "Connected with your SPOC for further steps"}</p>
          {/* Centered button */}
          <div className="d-flex justify-content-center">
            <button className="clickeffect"
              style={{
                backgroundColor: "white",
                color: "#000",
                borderRadius: "1rem",
                fontSize: "0.80rem",
                padding: "0.4rem 1rem",
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)", // subtle shadow
              }}
              onClick={handleCalendlyEvent}
            >
              Book a call now
            </button>
          </div>
        </div>
       )}
       



      {(paymentStatus === "unpaid" || paymentStatus === "initialpayment" || paymentStatus === "fullpayment") && hasActiveBooking === true && (
        <div
          className="px-3 py-3 my-3"
          style={{
            background: "linear-gradient(60deg, #00124F,#03617C, #06AEA8, #00C7A5)",
            color: "white",
            borderRadius: "0.75rem",
            boxShadow: "0px 10px 10px -5px rgba(0,0,0,0.3)",
          }}
        >
          {/* Top Row: text left, icon right */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: "1.4",
              }}
            >
              Call booked, Sit back and relax
            </div>
            <MdOutlineNotificationsActive size={25} />
          </div>

          <p style={{
            marginBottom: "1rem",
            lineHeight: "1.4",fontSize:"0.8rem"
          }}>We will call you as per schedule</p>

          {/* Buttons row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // equal spacing
              gap: "0.4rem", // spacing between buttons
            }}
          >
            <button
              style={{
                backgroundColor: "white",
                color: "#000",
                borderRadius: "1rem",
                fontSize: "0.8rem",
                padding: "6px",
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                display: "flex", // align icon + text
                alignItems: "center",
                gap: "0.4rem",
                flex: 1, // equal button width
                justifyContent: "center",
              }}
            >
              <FaRegCalendarAlt /> {moment(bookedDate).format("DD-MM-YYYY")}
            </button>

            <button
              style={{
                backgroundColor: "white",
                color: "#000",
                borderRadius: "1rem",
                fontSize: "0.8rem",
                padding: "6px",
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <IoMdTime /> {bookedTime}
            </button>

            <button
              style={{
                backgroundColor: "white",
                color: "#000",
                borderRadius: "1rem",
                fontSize: "0.8rem",
                padding: "6px",
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <FaUserAlt /> {assigneeName}
            </button>
          </div>
        </div>
      )}

          {showAlternate ? (
            <>
              <div className="card border-none position-relative" style={{ cursor: "pointer",borderRadius:"1rem", border: "1px solid #FF3B30",backgroundColor: "#F7F9FF",}} onClick={handleFetchPassbook}>
                <div className="card-body">
                  <AiOutlineExclamationCircle className="text-danger fs-4" style={{ marginTop: '-0.5rem' }} />
                  <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
                    <span>Passbook not found!
                    </span>
                  </p>
                  <p className="mb-0 cardBody">
                    Fetch your passbook to view details
                  </p>
                </div>

                <BiChevronRight size={30} className="fs-3 position-absolute text-secondary" style={{ top: "50%", right: "1rem", transform: "translateY(-50%)" }} />
              </div>
              <div className="mt-3 mb-5" >
                <CustomButtonAll
                  content="Fetch Passbook"
                  color="#FF0000"
                  onClick={handleFetchPassbook}
                />
              </div>
            </>

          ) : (<>
            {/* show in partial scrapping done  */}
            {!props?.currentUanData?.rawData?.isScrappedFully && (
              <>
                <TransactionCard currentUanData={props?.currentUanData}></TransactionCard>
              {props?.currentUanData?.rawData &&
                <RiskCard riskPossibility={riskPossibility} onClick={handleHighRiskModelEPFOModel}></RiskCard>
              }      
              </>
            )}
            {/* End of stats container  */}

            {/* show if full scrapping done  */}
            {props?.currentUanData?.rawData?.isScrappedFully && (
              <>
                  <TransactionCard currentUanData={props?.currentUanData}></TransactionCard>
                  {(props?.currentUanData?.reportData?.totalIssuesFound?.critical > 0 ||
                    props?.currentUanData?.reportData?.totalIssuesFound?.medium > 0) &&
                    (
                      <>
                        <div className="card position-relative" onClick={handleAmountStuck} style={{ cursor: "pointer",borderRadius:"1rem",border:"1px solid #FF0000",backgroundColor: "#F7F9FF", }}>
                          <div className="card-body">
                            <AiOutlineExclamationCircle className="fs-4" style={{ marginTop: '-0.5rem',color:"#FF0000" }} />
                            <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
                              <span style={{color:"#FF0000"}}>Amount stuck</span> due to identified issues
                            </p>
                            <p className="mb-0 cardHighlightText  mt-2" style={{ fontFamily: 'roboto',color:"#FF0000" }}>
                              {formatCurrency(
                                 props?.currentUanData?.reportData?.updatedCalculation?.totalAmountStuck ??
                                props?.currentUanData?.reportData?.totalAmountStuck
                              ) || "₹ 0"}
                            </p>
                          </div>

                          <BiChevronRight
                            size={30}
                            className="fs-3 position-absolute text-secondary"
                            style={{ top: "50%", right: "1rem", transform: "translateY(-50%)" }}
                          />
                        </div>
                      </>
                    )}
              </>
            )}

          </>
          )}


          {/* End of Stats Container  */}

          <>
            {/* <div className="d-flex align-items-center gap-1 mt-3">
              <p className="sectionTitle mb-0">Withdrawal Analysis</p>
              <AiOutlineExclamationCircle style={{ cursor: "pointer" }} color="#999999" className="fs-6 ms-1 mt-1" onClick={handleWithdrawAnalysis} />
            </div>
            <span className="underline mb-3" style={{height:"2.5px"}}></span> */}


           <div className="card border-0 my-3 shadow-sm"style={{borderRadius:"1rem",backgroundColor: "#F7F9FF",}}>
              <div className="card-body">
                <div className="row">
                  <div className="col-7 text-start">
                    <p className="cardBody mb-0">
                      Amount you can get within
                      <br /> 3 -20 days
                    </p>
                  </div>
                  <div className="col-5 text-end">
                    <p
                      className="cardHighlightText mb-0"
                      style={{ fontFamily: "roboto" }}
                    >{
                  props?.currentUanData?.reportData?.updatedCalculation?.amountImmediatelyAvailableWithin22Days != null
                  ? formatCurrency(
                  props?.currentUanData?.reportData?.updatedCalculation?.amountImmediatelyAvailableWithin22Days || "0"
                  )
                  :props?.currentUanData?.reportData?.withdrawableAmount != null
                        ? formatCurrency(
                          props?.currentUanData?.reportData?.withdrawableAmount || "0")
                        : "--"}
                    </p>
                  </div>
                </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <p className="cardSubText mb-0" style={{ color: "#858585" }}>
                EPFO processing time : 3-20 Days
              </p>
               {showAlternate ? (
              null
            ) : (
              <WithdrawNowButton
                content="Withdraw Now"
                onClick={() => handleCalendlyEvent("Withdraw Funds")}
                // color="#FF3B30"
              />)}
            </div>
              </div>
            </div>

            {props?.currentUanData?.rawData?.isScrappedFully && (
              <div className="card border-0 my-3 shadow-sm" style={{borderRadius:"1rem", backgroundColor: "#F7F9FF",}}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-7 text-start">
                      <p className="cardBody mb-0" >
                        Maximum Amount you<br /> can withdraw
                      </p>
                    </div>
                    <div className="col-5 text-end">
                      <p className="cardHighlightText mb-0" style={{ fontFamily: "roboto" }}>

                        {formatCurrency( props?.currentUanData?.reportData?.updatedCalculation?.amountAvailablePreCorrection ??
                          props?.currentUanData?.reportData?.maxWithdrawableLimit) || "₹ 0"}
                      </p>

                    </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
              <p className="cardSubText mb-0" style={{ color: "#FF0000" }}>
              Fix issues to increase available <br/> amount
              </p>
               {showAlternate ? (
              null
            ) : (
              <WithdrawNowButton
                content="Resolve Issues"
                // onClick={handleResolveNow}
                onClick={() => handleCalendlyEvent("Fix Issues")}
                color="#FF3B30"
              />)}
            </div>
                  </div>
                </div>
              </div>
            )}
             {props?.currentUanData?.rawData?.isScrappedFully && isBannerVisible && (
             <FinancialHealthBanner fullName={props?.currentUanData?.rawData?.data?.profile?.fullName} email={props?.currentUanData?.rawData?.data?.profile?.email} mobile = {props?.currentUanData?.profileData?.data?.phoneNumber?.replace(/^91/, "")} 
             caseNumber={decryptData(localStorage.getItem("case_number") || "")}/>
        )}
            
            {/* <UrgentHelpCard imageUrl={UrgentProfile} bgcolor={true} /> */}
          </>
            {props?.currentUanData?.rawData?.isScrappedFully &&
            <>
              <p className="sectionTitle mb-0 mt-3">Detailed Report</p>
              <span className="underline mb-3"></span>
              <PaymentUnlockForPfReport
                currentUanData={props?.currentUanData}
              />
            </>
          }
        
          {/* End  */}
          <div className="d-flex align-items-center gap-1 mt-3" >
        <p className="sectionTitle mb-0">Fund Analysis</p>
      </div>
      <span className="underline mb-3"></span>
          <FundGrowthChart currentUanData={props?.currentUanData}></FundGrowthChart>

          <PfAnalysisPensionReport
            currentUanData={props?.currentUanData}
          ></PfAnalysisPensionReport>
      <div>
        <p className={`section-title mb-1 py-2 mt-2`}>More for you!</p>
        <span className="underline" style={{ marginTop: "-0.6rem" }}></span>
        <MoreForYouSlider />
      </div>
        
      {/* Calendly Slider */}
      {calendlyLink && (
        <CalendlySlider
          show={showCalendlySlider}
          onClose={() => { setShowCalendlySlider(false); localStorage.setItem('calendarClosed',encryptData('true')); }}
          calendlyLink={calendlyLink}
          prefillName={lastName || ""}
          assigneeName={assigneeName || ""}
          registeredMobileNumber={decryptData(localStorage.getItem("user_mobile") || "")}
          onBookingConfirmed={(dbData) => {
            setBookedDate(dbData.date);
            setBookedTime(dbData.time);
            setAssigneeName(dbData.assigneeName);
            setHasActiveBooking(true);  // ✅ important for card condition
            setIsBookingRes(true);
          }}
        />
      )}

      {/* Booked Slider */}
      <CallBookedSlider
          show={showBookedSlider}
          onClose={() => setShowBookedSlider(false)}
          bookedDate={bookedDate || ""}
          bookedTime={bookedTime || ""}
          assignedExpert={assigneeName || "PF Expert"}
          profileImage={UrgentProfile}
        />
        <BookingFaildSlider
          show={showBookingFaildSlider}
          onClose={() => setShowBookingFaildSlider(false)}
          onBookCall={handleCalendlyEvent}
        />

        
        </div>
  );
};
export default PfReport;
