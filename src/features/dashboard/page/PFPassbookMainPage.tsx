import { useEffect, useRef, useState } from "react";
import TabComponent from "../../../components/dashboard/PassbookTab";
import { get, login, post, put } from "../../../components/common/api";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularLoading } from "../../../components/user-registeration/Loader";
import { decryptData, encryptData } from "../../../components/common/encryption-decryption";
import { TabProvider } from "../../../components/context/TabContext";
import colors from "../../../styles/colors";
import { UrgentHelpCard } from "../../../components/dashboard/Dashboard2.o/UrgentHelpCard";
import UrgentProfile from "../../../assets/suport-profile.png"
import MoreForYouSlider from "../../../components/dashboard/Dashboard2.o/MoreForYouSlider";
import { CompleteProfileButton, PFLoadingCard, PFSuccessCard } from "../../../helpers/helpers";
import { trackClarityEvent } from "../../../helpers/ms-clarity";
import MESSAGES from "../../../components/constant/message";
import { BsExclamationTriangleFill } from "react-icons/bs";
import VerifyEpfoPassbookModel from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookModel";
// import { ExtractMobile } from "../../../components/common/extract-mobile";
import VerifyEpfoPassbookOtpModal from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookOtpModal";
import EmployementStatusModel from "../../../components/dashboard/Models/employementStatusModel";
import CallBackRequestedModel from "../../../components/dashboard/Models/CallBackRequestedModel ";
import ToastMessage from "../../../components/common/toast-message";
import PaymentNoDataFound from "../../../components/dashboard/Dashboard2.o/paymentNoDataFound";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import TransactionFailedSlider from "../../../components/dashboard/Models/transactionFailedSlider";
import { handlePayToInitiate } from "../../../helpers/payment";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { FaRegCalendarAlt, FaUserAlt } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import moment from "moment";


const PFPassbookMainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
    disableAutoVerification: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUanData, setCurrentUanData] = useState<any>(null);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [activeTab, setActiveTab] = useState("pf-report");
  const [emptyPageData, setEmptyPageData] = useState<boolean>(false);
  const isMessageActive = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [processedUanNumber, setProcessedUanNumber] = useState<string>("");
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "in-progress" | "complete">("idle");
  const [isScrapperBypassEnabled, setIsScrapperBypassEnabled] = useState(false);
  const [credentials, setCredentials] = useState({ uan: "", password: "" });
  const [mobile_number, setMobileNumber] = useState();
  const [isOtpBypassEnabled, setIsOtpBypassEnabled] = useState(false);
  const [isEpfoLoading, setEpfoLoading] = useState(false);
  const [otpmodel, setOtpmodel] = useState(false);
  const [showEmploymentStatusModal, setShowEmploymentStatusModal] = useState(false);
  const [selectedModalData, setSelectedModalData] = useState<ModalData | null>(null);
  const { processedUan, openTab, type, payload, name, selectedTags, dashboard, noUanFound=false } = location.state || {};
  const [apiDone, setApiDone] = useState(false);
  const [isNewUIToggleEnabled, setIsNewUIToggleEnabled] = useState(false);
  const [showPaymentABTestSlider, setShowPaymentABTestSlider] = useState(false);
  const[noUanNumberFound, setNoUanNumberFound] = useState(noUanFound);
  const [lastAuthSource, setLastAuthSource] = useState<"uanpws" | "pws" | null>(null);
  const [showTransactionFailedSlider, setShowTransactionFailedSlider] = useState(false);
  const [, setLoading] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState<boolean | null>(null);
  const [bookedDate, setBookedDate] = useState<string | null>(null);
  const [bookedTime, setBookedTime] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState<string | null>(null);

  interface ModalData {
    mobile_number: any;
    processedUan: string;
    currentEmploymentUanData: any;
    type: string;
    partialPassbook: any;
    uanLinkedPhoneNumber?: any;
  }

  const [userName, setUserName] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  
  const stateName = name || decryptData(localStorage.getItem("user_name"));
  const stateSelectedTags = selectedTags || decryptData(localStorage.getItem("selected_tags"));
  const userMobile = mobile_number || decryptData(localStorage.getItem("user_mobile"));

  // const lastCallBackTimeRef = useRef(0);
  useEffect(() => {
    const showPaymentFailed = decryptData(localStorage.getItem("showPaymentFailed")) === "true";
    const isPaymentPage = decryptData(localStorage.getItem("isPaymentPage")) === "true";
    if (showPaymentFailed && isPaymentPage) {
        setShowTransactionFailedSlider(true);
        // Clear the flags
        localStorage.removeItem("showPaymentFailed");
        localStorage.removeItem("isPaymentPage");
        localStorage.removeItem("tag_value");
    }
}, []);
  // Message auto-clear
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

  // Scroll to top on tab change
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [activeTab]);

  // Tab switch from location
  useEffect(() => {
    if (openTab === "passbook") setActiveTab("passbook");
  }, [location.state]);

  // Fetch toggle config
  useEffect(() => {
    const getToggleValue = async () => {
      try {
        const response = await get("/data/toggle/keys");
        const scrapperToggle = response?.allTogglers?.find((item: any) => item.type === "scrapper-toggle");
        const otpByPassToggle = response?.allTogglers?.find((item: any) => item.type === "otp-bypass");
        const newUIToggle = response?.allTogglers?.find((item: any) => item.type === "new-ui");
        setIsNewUIToggleEnabled(newUIToggle?.isEnabled || false);
        setIsOtpBypassEnabled(otpByPassToggle?.isEnabled || false);
        setIsScrapperBypassEnabled(scrapperToggle?.isEnabled || false);
      } catch (err) { }
    };
    getToggleValue();
    fetchOnboarding();
    paymentCard();
  }, []);

  // Determine UAN and fetch on mount
  useEffect(() => {
    const uan = processedUan || decryptData(localStorage.getItem("user_uan"));
    setMobileNumber(decryptData(localStorage.getItem("user_mobile")));
    if (uan) {
      setProcessedUanNumber(uan);
      if (isScrapperBypassEnabled) {
        fetchUanData(uan);
      } else {
        fetchUanDataInitial(uan);
      }
    }
  }, [location.state, isScrapperBypassEnabled]);

  useEffect(() => {
    const isScrappedFully = currentUanData?.rawData?.isScrappedFully;
  
    let timeout: any;
  
    const shouldShowModal =
      (type === "full" || type === "partial") &&
      isNewUIToggleEnabled &&
      isScrappedFully !== true; // allow if false or undefined
  
    if (shouldShowModal) {
      timeout = setTimeout(() => {
        setShowModal({ show: true, type: "verifyEpfoPassbook" });
        
      }, 5000);
    }
  
    if (type === "return-login") {
      timeout = setTimeout(() => {
        setShowModal({ show: true, type: "verifyEpfoPassbook" });
      }, 500);
    }
  
    return () => clearTimeout(timeout);
  }, [type, currentUanData, isNewUIToggleEnabled]);

   
  useEffect(() => {
    // First check from navigation state

    if (type === "camefromfynprint") {

      setShowEmploymentStatusModal(true);

    } 
  }, [type]);

  const fetchOnboarding = async () => {
    try {
      const res = await post("auth/onboarding-data", { mobile_number: userMobile });
      if (res?.success) {
        if(!res?.data?.uan || res?.data?.uan.length=== 0){
          setNoUanNumberFound(true);
        }
        setUserName(res?.data?.onboardingData?.userName);
        localStorage.setItem("user_name", encryptData(res?.data?.onboardingData?.userName));
        setSelectedOption(res?.data?.onboardingData?.selectedOption);
      } 
    } catch (err) {
      console.error("Failed to load onboarding data:", err);
    } 
  };
  const paymentCard = async () => {
      try {
        setIsLoading(true);
        const bookingRes: any = await post("calendly/check-user-booking", { mobile: userMobile });

        if (bookingRes?.success) {
            setBookedDate(bookingRes?.data?.date);
            setBookedTime(bookingRes?.data?.time);
            setAssigneeName(bookingRes?.data?.assigneeName);
            setHasActiveBooking(bookingRes?.hasActiveBooking);
    
          }

        if (bookingRes?.data?.callbookingStatus?.showPaymentSlider) {
          setShowPaymentABTestSlider(true);
        } else {
          setShowPaymentABTestSlider(false);
        }
      } catch (err) {
        console.error("Error checking booking:", err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      }
  }
  

  const fetchUanDataInitial = async (uan: string) => {
    try {
      if (!uan) return;
      setIsLoading(true);

      const result = await get("/data/fetchByUan/" + uan);
      if (result.status === 400) {
        setMessage({ type: "error", content: result.message });
      } else {
        if (!result) {
          
          setEmptyPageData(true);
        } else {
          setCurrentUanData(result);
          if(type === "camefromfynprint"){
          const employmentDataSet = [{
            establishment_name: result?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
            currentOrganizationMemberId: result?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            userEmpHistoryCorrect: !!result?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            userStillWorkingInOrganization: !!result?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
            serviceHistory: result?.rawData?.data?.serviceHistory?.history,
            isFromFullScrapper: true
          }];

          setSelectedModalData({
            mobile_number,
            processedUan: uan||processedUan,
            currentEmploymentUanData: employmentDataSet,
            type: "newui",
            partialPassbook: false
          });
        }
          localStorage.setItem("Full_Name", encryptData(result?.rawData.data?.profile.fullName));
          localStorage.setItem("user_uan", encryptData(result?.rawData.data?.profile?.UAN));
          localStorage.setItem("isScrappePassbook", encryptData(true));
          if(result?.rawData?.isScrappedFully){
            localStorage.setItem("password", encryptData(result?.rawData?.meta?.password));
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      setEmptyPageData(true);
      setIsLoading(false);
      // setMessage({ type: "error", content: "Oops! We encountered an error fetching your report!" });
    }
  };

  // Track which slider initiated verification
  const handleVerifyFromUanPws = (uan: any, password: any) => {
    setLastAuthSource("uanpws");
    handleVerify(uan, password);
  };

  const handleVerifyFromPws = (uan: any, password: any) => {
    setLastAuthSource("pws");
    handleVerify(uan, password);
  };

  const fetchUanData = async (uan: string) => {
    try {
      if (!uan) return;

      const validateResponse = (response: any) => {
        if (response?.rawData?.data?.error?.trim()) {
          setMessage({ type: "error", content: "Password Expired! Please reset and try after 6 hrs." });
          return false;
        }
        if (
          !response?.rawData?.data?.home ||
          !response?.rawData?.data?.serviceHistory?.history ||
          !response?.rawData?.data?.passbooks ||
          !response?.rawData?.data?.profile
        ) {
          setMessage({ type: "error", content: "EPFO servers are down. Try again later!" });
          return false;
        }
        return true;
      };

      if (type === "refresh" || type === "full") {
        if (type === "full" && !currentUanData) setEmptyPageData(true);
        setScrapingStatus("in-progress");
        const otpResult = await post("auth/submit-otp", payload);

        if (otpResult?.status === 400) {
          setMessage({ type: "error", content: "Oops!! We encountered an error submitting OTP! Please try again later" });
          setIsLoading(false);
          return;
        }

        const response = await get("/data/fetchByUan/" + uan);
        if (!validateResponse(response)) {
          setIsLoading(false);
          return;
        }

        const uanData = response?.profileData?.data;
        const empDetails = response?.rawData?.data?.home?.currentEstablishmentDetails;

        const employmentData = {
          type: "full",
          uan: uanData?.uan,
          userMobileNumber: uanData?.phoneNumber?.replace(/^91/, ""),
          establishment_name: empDetails?.establishmentName,
          currentOrganizationMemberId: empDetails?.memberId,
          userEmpHistoryCorrect: !!empDetails?.memberId,
          userStillWorkingInOrganization: !!empDetails?.memberId,
          serviceHistory: response?.rawData?.data?.serviceHistory?.history,
          isFromFullScrapper: true,
          fullName: true,
          gender: true,
          fatherHusbandName: true,
          physicallyHandicapped: true,
          bankAccountNumber: true,
          dateOfBirth: true,
          pan: true,
          bankIFSC: true,
        };

        if(response?.rawData?.isScrappedFully){
          localStorage.setItem("password", encryptData(response?.rawData?.meta?.password));
        }

        const withdrawCheck = await post("withdrawability-check", employmentData);

        if (withdrawCheck) {
          trackClarityEvent(MESSAGES.ClarityEvents.FULL_REPORT_GENERATED);
          setCurrentUanData(response);
          setScrapingStatus("complete");
        }

        setIsLoading(false);
        return;
      }

      // fallback
      const result = await get("/data/fetchByUan/" + uan);
      if (result.status === 400) {
        setMessage({ type: "error", content: result.message });
        setScrapingStatus("idle");

      } else {
        setCurrentUanData(result);
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setScrapingStatus("idle");

      if (error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_REFUSED") {
        setScrapingStatus("idle");
        setMessage({ type: "error", content: "Unable to connect to server. Please try again later." });
        return;
      }

      const errMsg =
        error?.status === 503
          ? error?.errorCode === "SCRAPPER_DOWN"
            ? "Service temporarily unavailable."
            : "Unable to connect to service."
          : error?.status === 500
            ? "Oops! We encountered an error fetching your report! Please try again later"
            : error?.status === 400
              ? MESSAGES.error.invalidOtpServer
              : error.message || MESSAGES.error.generic;
      setScrapingStatus("idle");
      setMessage({ type: "error", content: errMsg });
    }
  };

  const goToLoginPage = () => {
    setShowModal({ show: true, type: "verifyEpfoPassbook" });
  };

  const handleVerify = async (uan: any, password: any, setShowModal1?: React.Dispatch<React.SetStateAction<{ show: boolean; type: string }>>) => {

    localStorage.removeItem("otpStartTime");
    setMessage({ type: "", content: "" })
    localStorage.setItem("user_pass", encryptData(password));
    
    const uanToUse = processedUanNumber?.length === 12 ? processedUanNumber : uan;
    localStorage.setItem("user_uan", encryptData(uanToUse))
    if (uanToUse && password) {
      try {
        setEpfoLoading(true)
        setCredentials({ uan: uanToUse, password: password })
        const uanLinkedPhoneNumber = decryptData(localStorage.getItem("uanLinkedPhoneNumber"));
        const mobileToSend = uanLinkedPhoneNumber ? uanLinkedPhoneNumber : mobile_number;
        const oldMobileNumber = uanLinkedPhoneNumber ? mobile_number : "";
        const payload = {
          uan: uanToUse,
          password: password.trim(),
          mobile_number: mobileToSend,
          oldMobileNumber,
        };
        const result = await login(payload.uan, payload.password, payload.mobile_number, payload.oldMobileNumber);

        if (result.status === 400) {
          setEpfoLoading(false)
          setScrapingStatus("idle");
          setMessage({ type: "error", content: result.message });
          setTimeout(() => {
            setEpfoLoading(false)
          }, 2000);
        }

        // 🕒 POLLING STARTS HERE
        let retries = 0;
        const maxRetries = 60; // ~3 minutes if interval is 4s
        const pollInterval = 3000;
        let modalTimeout: ReturnType<typeof setTimeout> | null = null;

        if (isOtpBypassEnabled) {
          modalTimeout = setTimeout(() => {
            setShowModal({ show: false, type: "verifyEpfoPassbook" });
            if (setShowModal1) {
              setShowModal1({ show: false, type: "verifyEpfoPassbook" });
            }
            setScrapingStatus("in-progress");
            setEpfoLoading(false);
          }, 10000); // 10 seconds
        }

        const pollStatus = async () => {
          try {            
            const loginStatusResponse = await get(`/auth/login-status?uan=${uanToUse}`);
            if (loginStatusResponse?.data?.status === "success") {
              if (modalTimeout) clearTimeout(modalTimeout); 
              setTimeout(async () => {
                setEpfoLoading(false)
                if (isOtpBypassEnabled) {
                  setApiDone(true)
                  setShowModal({ show: false, type: "verifyEpfoPassbook" });
                  handleByPassOtp(uanToUse)
                } else {
                  trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_SENT);
                  setMessage({ type: "success", content: loginStatusResponse?.data?.message });
                  setApiDone(true)
                  setOtpmodel(true)
                  setShowModal({ show: true, type: "verifyEpfoPassbookOtp" });
                  // if (!currentUanData?.rawData?.isScrappedFully) {
                  // }
                }
              }, 2000);
            } else if (loginStatusResponse?.data?.status === "failed") {
              if(loginStatusResponse?.data?.message === "Either UAN or Password is incorrect"){
                    setShowModal({ show: true, type: "verifyEpfoPassbook", disableAutoVerification: true, lastAuthSource: lastAuthSource || "pws"  });
              }
              
              if (modalTimeout) clearTimeout(modalTimeout);
              setScrapingStatus("idle");
              setMessage({ type: "error", content: loginStatusResponse?.data?.message || MESSAGES.error.generic });
              setTimeout(() => {
                setEpfoLoading(false);
              }, 3000);
              if (loginStatusResponse?.data?.statusCode >= 500) {
                // navigate("/epfo-down")
                setMessage({ type: "error", content: loginStatusResponse?.data?.message || "EPFO servers are not responding, Please try again later!!"});
                return;
              }
            } else {
              // Still pending or processing
              if (++retries < maxRetries) {
                setTimeout(pollStatus, pollInterval);
              } else {
                setMessage({ type: "error", content: MESSAGES.error.generic });
                setTimeout(() => setEpfoLoading(false), 2000);
              }
            }
          } catch (err: any) {
            if (modalTimeout) clearTimeout(modalTimeout); 
            setMessage({ type: "error", content: err?.message });
            setTimeout(() => {
              setEpfoLoading(false);
            }, 3000);
            // navigate("/epfo-down")
          }
        };

        // Start first poll
        pollStatus();
      } catch (error: any) {
        console.log(error)
        setEpfoLoading(false)
        setMessage({ type: "error", content: error?.message });
        setShowModal({ show: false, type: "verifyEpfoPassbookOtp" });

        if (error.status >= 500) {
          // navigate("/epfo-down")
          setMessage({ type: "error", content: error?.message || "EPFO servers are not responding, Please try again later!!"});
        }
      }
    }
  };

  const handleByPassOtp = async (uan: any) => {
    
    setShowModal({ show: false, type: "verifyEpfoPassbook" });

    try {
      setScrapingStatus("in-progress"); // Start scraping
  
      // Update password
      await put('auth/update-profile', { uan, password: credentials.password });
  
      // Fetch data by UAN
      const responseUan = await get('/data/fetchByUan/' + uan);
      // setCurrentUanData(responseUan);
  
      if (responseUan?.rawData?.data?.error?.trim()) {
        const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
        setMessage({ type: "error", content: errorMsg });
        setScrapingStatus("idle");
        setTimeout(() => navigate("/login-uan"), 5000);
        return;
      }
  
      // Save session data
      localStorage.setItem("is_logged_in_user", encryptData("true"));
      localStorage.setItem("user_uan", encryptData(uan));
      // localStorage.setItem("user_mobile", encryptData(mobile_number));
      const isPartialScrape = decryptData(localStorage.getItem("isPartialScrape"))

      // Validate fetched data
      if (!responseUan?.rawData?.data?.home ||
          !responseUan?.rawData?.data?.serviceHistory?.history ||
          !responseUan?.rawData?.data?.passbooks ||
          !responseUan?.rawData?.data?.profile ||
          !responseUan?.rawData?.data?.claims) {
        setMessage({ type: "error", content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!" });
        setScrapingStatus("idle");
        return;
      }
  
      setScrapingStatus("complete"); // Done
      zohoUpdateLead("Details received - Full","Full Report");
        if (typeof type === 'undefined' || type?.toLowerCase() === 'full') {
          if (!isPartialScrape) {
            const employmentDataSet = [{
              establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
              currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
              userEmpHistoryCorrect: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
              userStillWorkingInOrganization: !!responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
              serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
              isFromFullScrapper: true
            }];
            
            trackClarityEvent(MESSAGES.ClarityEvents.FULL_REPORT_GENERATED);        
            setShowEmploymentStatusModal(true);
            setSelectedModalData({
              mobile_number,
              processedUan: uan,
              currentEmploymentUanData: employmentDataSet,
              type: "newui",
              partialPassbook: false
            });
          } else {
            // setShowModal({ show: true, type: 'kycContinue' });
            try {
              const uanProfile = responseUan?.profileData?.data;
              const empDetails = responseUan?.rawData?.data?.home?.currentEstablishmentDetails;
              const uanLinkedPhoneNumber = decryptData(localStorage.getItem("uanLinkedPhoneNumber"))
              const dataToSend: any = {
                type: "full",
                uan: uan,
                userMobileNumber: (uanProfile?.phoneNumber || "").toString().replace(/^91/, ""),
                establishment_name: empDetails?.establishmentName,
                currentOrganizationMemberId: empDetails?.memberId,
                userEmpHistoryCorrect: !!empDetails?.memberId,
                userStillWorkingInOrganization: !!empDetails?.memberId,
                serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
                isFromFullScrapper: true,
                uanLinkedPhoneNumber: uanLinkedPhoneNumber ? uanLinkedPhoneNumber : ""
              };

              const withdrawabilityCheckUpReportResponse = await post("withdrawability-check", dataToSend);
              if (withdrawabilityCheckUpReportResponse) {
                trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
                // navigate("/dashboard", { state: { mobile_number, processedUan: uan, type: "full" } });
                navigate(0);
              } else {
                navigate(0);
              }
            } catch (e) {
              navigate(0);
            }
          }
        }
        else{
          try {
            const uanProfile = responseUan?.profileData?.data;
            const empDetails = responseUan?.rawData?.data?.home?.currentEstablishmentDetails;
            const uanLinkedPhoneNumber = decryptData(localStorage.getItem("uanLinkedPhoneNumber"))
            const dataToSend: any = {
              type: "full",
              uan: uan,
              userMobileNumber: (uanProfile?.phoneNumber || "").toString().replace(/^91/, ""),
              establishment_name: empDetails?.establishmentName,
              currentOrganizationMemberId: empDetails?.memberId,
              userEmpHistoryCorrect: !!empDetails?.memberId,
              userStillWorkingInOrganization: !!empDetails?.memberId,
              serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
              isFromFullScrapper: true,
              uanLinkedPhoneNumber: uanLinkedPhoneNumber ? uanLinkedPhoneNumber : ""
            };

            const withdrawabilityCheckUpReportResponse = await post("withdrawability-check", dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
              trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
              navigate(0);
            } else {
              navigate(0);

            }
          } catch (e) {
            navigate(0);
          }
        }
    } catch (error: any) {
      console.error("Scraping error", error);
      setScrapingStatus("idle");
  
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        setMessage({
          type: "error",
          content: "Unable to connect to server. Please check your connection or try again later."
        });
        return;
      }
  
      switch (error.status) {
        case 503:
          if (error?.errorCode === "SCRAPPER_DOWN") {
            zohoUpdateLead("","EPFO down");
            setMessage({
              type: "error",
              content: "Service is temporarily unavailable. Please try again later.",
            });
          } else if (error?.errorCode === "NETWORK_ERROR") {
            setMessage({
              type: "error",
              content: "Unable to connect to the service. Please check your connection.",
            });
          } else {
            // navigate("/epfo-down");
            return;
          }
          break;
  
        case 500:
          setMessage({
            type: "error",
            content: "An internal server error occurred. Please try again later.",
          });
          break;
  
        case 400:
          setMessage({
            type: "error",
            content: MESSAGES.error.invalidOtpServer
          });
          break;
  
        default:
          setMessage({
            type: "error",
            content: error.message || MESSAGES.error.generic
          });
      }
    }
  };
  

  const handleVerifyOtp = async (otp: string) => {
    setEpfoLoading(true);

    if (otp.length !== 6) {
      setEpfoLoading(false);
      setMessage({ type: "error", content: MESSAGES.error.invalidOtp });
      return;
    }
    const userUan = decryptData(localStorage.getItem("user_uan"));
    const payload = {
      otp,
      type,
      uan: processedUanNumber?.length === 12 ? processedUanNumber : userUan,
      password: decryptData(localStorage.getItem("user_pass")),
      mobile_number,
    };

    let hasResponded = false;
    let modalTimeout: ReturnType<typeof setTimeout> | null = null;

    modalTimeout = setTimeout(() => {
      if (hasResponded) return;
      hasResponded = true;
      setShowModal({ show: false, type: "verifyEpfoPassbookOtp" });
      setMessage({
        type: "info",
        content: "OTP verification is taking longer than expected. Continuing in background...",
      });
    }, 10000);

    try {
      await put("auth/update-profile", {
        uan: processedUanNumber,
        password: decryptData(localStorage.getItem("user_pass")),
      });
       
      if (isScrapperBypassEnabled) {
        if (modalTimeout) clearTimeout(modalTimeout);
        hasResponded = true;
        navigate("/dashboard", {
          state: { processedUan: processedUanNumber, type, mobile_number, payload },
        });
        return;
      }

      // Set status: OTP submitted, scraping started
      setScrapingStatus("in-progress");

      const result = await post("auth/submit-otp", payload);
      if (modalTimeout) clearTimeout(modalTimeout);
      if (hasResponded) return;
      hasResponded = true;
      if (result?.status === 400) {
        setScrapingStatus("idle");
        setEpfoLoading(false);
        setMessage({ type: "error", content: result.message });
        return;
      }

      const responseUan = await get("/data/fetchByUan/" + processedUanNumber);      

      if (responseUan?.rawData?.data?.error?.trim()) {
        setScrapingStatus("idle");
        setMessage({
          type: "error",
          content:
            "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password",
        });
        setTimeout(() => setEpfoLoading(false), 3000);
        setTimeout(() => {
          if (dashboard) navigate("/dashboard", { state: { processedUan: processedUanNumber } });
          else navigate("/login-uan");
        }, 5000);
        return;
      }

      if (
        !responseUan?.rawData?.data?.home ||
        !responseUan?.rawData?.data?.serviceHistory?.history ||
        !responseUan?.rawData?.data?.passbooks ||
        !responseUan?.rawData?.data?.profile ||
        !responseUan?.rawData?.data?.claims
      ) {
        setScrapingStatus("idle");
        setEpfoLoading(false);
        setMessage({
          type: "error",
          content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!",
        });
        // setTimeout(() => navigate("/epfo-down"), 3000);
        return;
      }

      //  Scraping complete
      setScrapingStatus("complete");
      setEpfoLoading(false);
      setApiDone(true);
      setShowModal({ show: false, type: "verifyEpfoPassbookOtp" });
      const isPartialScrape = decryptData(localStorage.getItem("isPartialScrape"))

      trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_VERIFIED);
      localStorage.setItem("is_logged_in_user", encryptData("true"));
      localStorage.setItem("user_uan", encryptData(processedUanNumber));
      
      if ((!type || type?.toLowerCase() === "full") && !isPartialScrape ) {
        trackClarityEvent(MESSAGES.ClarityEvents.FULL_REPORT_GENERATED);
        const employmentDataSet = [{
          establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
          currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
          userEmpHistoryCorrect: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
          userStillWorkingInOrganization: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
          serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
          isFromFullScrapper: true
        }]
        setShowEmploymentStatusModal(true);
            setSelectedModalData({
              mobile_number,
              processedUan: processedUanNumber,
              currentEmploymentUanData: employmentDataSet,
              type: 'newui',
              partialPassbook: false
            });
      }
    } catch (error: any) {
      if (modalTimeout) clearTimeout(modalTimeout);
      if (hasResponded) return;
      hasResponded = true;
      setEpfoLoading(false);
      setScrapingStatus("idle");
      setMessage({
        type: "error",
        content: error.message || MESSAGES.error.generic,
      });

      if (error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_REFUSED") {
        setScrapingStatus("idle");
        setMessage({
          type: "error",
          content: "Unable to connect to server. Please check your connection or try again later.",
        });
        return;
      }

      switch (error.status) {
        case 503:
          if (error?.errorCode === "SCRAPPER_DOWN") {
            setScrapingStatus("idle");
            setMessage({ type: "error", content: "Service is temporarily unavailable. Please try again later." });
          } 
          // else {
          //   navigate("/epfo-down");
          // }
          break;

        case 500:
          setMessage({ type: "error", content: "An internal server error occurred. Please try again later." });
          setScrapingStatus("idle");
          break;

        case 400:
          setMessage({ type: "error", content: MESSAGES.error.invalidOtpServer });
          setScrapingStatus("idle");
          break;

        default:
          setMessage({ type: "error", content: error.message || MESSAGES.error.generic });
          setScrapingStatus("idle");

      }
    }
  };

  const handleResendOtp = async () => {
    if (processedUanNumber && mobile_number) {
      try {
        setEpfoLoading(true);
        const result = await post("/auth/resend-scrapper-otp", { uan: processedUanNumber, mobile_number });

        // Set status: OTP submitted, scraping started
        setScrapingStatus("idle");

        if (result.status === 400) {
          setTimeout(() => {
            setEpfoLoading(false);
          }, 3000);
          setMessage({ type: "error", content: result.message });
        } else {
          setTimeout(() => {
            setEpfoLoading(false);
          }, 3000);
          setMessage({ type: "success", content: result.message });
        }
      } catch (error: any) {
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
          console.warn('Server Connection Error:', {
            error: error.message,
            code: error.code
          });
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
          setMessage({
            type: "error",
            content: "Unable to connect to server. Please check your connection or try again later."
          });
          return;
        }

        setTimeout(() => {
          setIsLoading(false);
        }, 3000);

        // Handle specific status codes
        switch (error.status) {
          case 503:
            const errorCode = error?.errorCode;
            if (errorCode === "SCRAPPER_DOWN") {
              setMessage({
                type: "error",
                content: "Service is temporarily unavailable. Please try again later.",
              });
            } else if (errorCode === "NETWORK_ERROR") {
              setMessage({
                type: "error",
                content: "Unable to connect to the service. Please check your connection.",
              });
            }
            // else {
            //   navigate("/epfo-down");
            // }
            break;

          case 500:
            setMessage({
              type: "error",
              content: "An internal server error occurred. Please try again later.",
            });
            break;

          case 400:
            setMessage({
              type: "error",
              content: error.message || "Invalid request. Please try again."
            });
            break;

          default:
            setMessage({
              type: "error",
              content: error.message || MESSAGES.error.generic
            });
        }
      }
    }
  };



   const zohoUpdateLead = async (leadStatus?:any,checkMyPFStatus?:any) => {
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
        user.CheckMyPF_Intent.toLowerCase() !== "none"
      ) {
        let intent = user.CheckMyPF_Intent;
      
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
          Lead_Status: leadStatus && leadStatus.trim() !== "" ? leadStatus : user?.Lead_Status,
          Lead_Source: user?.Lead_Source,
          Campaign_Id: user?.Campaign_Id,
          CheckMyPF_Status: checkMyPFStatus === "Full Report" ? "Full Report" : existUser && existUser !== "" ? user?.CheckMyPF_Status : checkMyPFStatus,
          CheckMyPF_Intent: user.CheckMyPF_Intent,
          Call_Schedule: user.Call_Schedule || "",  
          Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
        };
        ZohoLeadApi(zohoReqData);
      }
    }

  return (
    <>
      {isLoading && <CircularLoading />}
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {showModal.show && showModal.type === "verifyEpfoPassbook" && (
        <VerifyEpfoPassbookModel
          setShowModal={setShowModal}
          processedUan={processedUan || processedUanNumber}
          onVerify={handleVerify}
          onVerifyFromUanPws={handleVerifyFromUanPws}
          onVerifyFromPws={handleVerifyFromPws}
          lastAuthSource={lastAuthSource || undefined}
          onEmploymentStatusSuccess={(data: any) => {
            setSelectedModalData({
              mobile_number: data?.mobile_number,
              uanLinkedPhoneNumber: data?.uanLinkedPhoneNumber,
              processedUan: data?.processedUan,
              currentEmploymentUanData: data?.currentEmploymentUanData,
              type: data?.type,
              partialPassbook: data?.partialPassbook,
            });
            setShowEmploymentStatusModal(true);
            // Close the bottom-sheet slider so EmploymentStatus modal is visible
            setShowModal({ show: false, type: "verifyEpfoPassbook" });
          }}
          epfoLoading={isEpfoLoading}
          selectedTags={stateSelectedTags}
          name={stateName}
          apiDone={apiDone}
          emptyPageData={emptyPageData}
          currentUanData={currentUanData}
          disableAutoVerification={showModal.disableAutoVerification}
          noUanFound={noUanNumberFound}
        />
      )}
      {showModal.show && showModal.type === "verifyEpfoPassbookOtp" && (
        <VerifyEpfoPassbookOtpModal
          setShowModal={setShowModal}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onRetryLogin={handleVerify}
          epfoLoading={isEpfoLoading}
          apiDone={apiDone}
          mobileNumber={mobile_number}
          credentials={credentials}
        />
      )}
      {showEmploymentStatusModal && selectedModalData && (
        <EmployementStatusModel
          setShowModal={setShowEmploymentStatusModal}
          modalData={selectedModalData}
        />
      )}

      {showModal.show && showModal.type === "callBackRequested" && (
        <CallBackRequestedModel
          isOpen={showModal.show}
          onClose={() => setShowModal({ show: false, type: "" })}
        />
      )}
      {!isLoading &&
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 offset-md-4 " style={{ backgroundColor: "#E6ECFF", height: "100%" }}>
              <div ref={containerRef} style={{ position: "relative", minHeight: "100vh" }}>

                <div style={{ marginTop: "20px", overflow: "hidden" }}>
                  {
                    emptyPageData || !currentUanData ? <>
                      <div className="to-margin-top">
                        <div className="d-flex flex-column align-items-center" style={{ position: "relative", }}>
                          {/* Main Vanity Card */}
                          <div
                            className="card border-none text-center text-white position-relative"
                            style={{
                              width: "100%",
                              backgroundColor: colors.vanityCardPrimary,
                              borderRadius: "1.25rem",
                              overflow: "hidden",
                              zIndex: 2,
                              height: "12.5rem", // 200px
                              border: "none"
                            }}
                          >
                            {/* Decorative Bubbles */}
                            <div
                              style={{
                                position: "absolute",
                                top: "10%",
                                right: "-7.5rem",
                                width: "12rem",
                                height: "12rem",
                                backgroundColor: colors.vanityBlackBubble,
                                borderRadius: "50%",
                                opacity: 0.1,
                                zIndex: 0,
                              }}
                            ></div>

                            <div
                              style={{
                                position: "absolute",
                                bottom: "-40%",
                                left: "-10%",
                                width: "90%",
                                height: "100%",
                                backgroundColor: colors.vanityWhiteBubble,
                                borderRadius: "50%",
                                opacity: 0.1,
                                zIndex: 0,
                              }}
                            ></div>

                            {/* Main Card Body */}
                            <div
                              className="card-body position-relative text-start px-4 d-flex flex-column justify-content-between py-4"
                              style={{
                                zIndex: 1,
                                height: "100%",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {/* Top Content */}
                              <div>
                                {processedUanNumber?.length === 12 ? (
                                  <p className="mb-0 vanity-label-text">
                                    UAN: <span>{processedUanNumber}</span>
                                  </p>
                                ) : (
                                  <p className="mb-0 vanity-label-text">
                                    Mob: <span>{decryptData(localStorage.getItem('user_mobile'))} (No UAN Found)</span>
                                  </p>
                                )}

                                <p className="mb-0 vanity-name-text">
                                {decryptData(localStorage.getItem('Full_Name')) || userName || stateName}
                                </p>
                              </div>
                              {/* Bottom Content */}
                              <div>
                                <p className="mb-0 vanity-label-text mt-2">Service Requirement</p>
                                <div className="d-flex align-items-center" style={{ marginBottom: "-0.3rem" }}>
                                  <p className="mb-0 vanity-amount-text">{selectedOption ? selectedOption : stateSelectedTags}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mt-3 pt-2">
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

                          <div className="mt-3">
                            {scrapingStatus === 'in-progress' && (
                              <PFLoadingCard text="We are updating your details..." />
                            )}

                            {scrapingStatus === 'complete' && (
                              <PFSuccessCard />
                            )}
                          </div>
                          <p className={`section-title mb-1 py-2 mt-2`}>Attention Required!</p>
                          <span className="underline mb-3" style={{ marginTop: "-0.6rem" }}></span>
                          <div className=" position-relative">
                            <div
                              className="card border-0 shadow-sm position-relative "
                              style={{
                                padding: "0.625rem", // 10px
                                paddingBottom: "1rem",
                                borderRadius: "1rem",
                                display: "flex",
                                backgroundColor: "#F7F9FF",
                                flexDirection: "column",
                                gap: "0.25rem", // 4px
                              }}
                            >
                              {/*  Red Dot  */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: "0.7rem",
                                  left: "0.7rem",
                                  width: "0.625rem",
                                  height: "0.625rem",
                                  backgroundColor: "#FF3B30",
                                  borderRadius: "50%",
                                  zIndex: 2,
                                  boxShadow: "0 0 0.5rem 0.25rem rgba(255, 59, 48, 0.4)", // soft glow
                                }}
                              ></div>

                              {/* Text Block */}
                              <div className="px-3 py-2">
                                <p
                                  className="mb-2 px-2"
                                  style={{
                                    fontSize: "0.8125rem", // 13px
                                    fontWeight: 600,
                                    lineHeight: "120%",
                                    letterSpacing: "0",
                                  }}
                                >
                                  Your PF withdrawal can be at high risk
                                </p>
                                <p
                                  className="px-2"
                                  style={{
                                    fontSize: "0.8125rem", // 13px
                                    fontWeight: 400,
                                    lineHeight: "120%",
                                    letterSpacing: "0",
                                    marginBottom: 0,
                                  }}
                                >
                                  There can be hidden issues in your account that can lead to claim rejection. Complete your profile to get a detailed report.
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>

                        {hasActiveBooking ?
                          (
                            <div
                              className="px-3 py-3 mt-3"
                              style={{
                                background: "linear-gradient(60deg, #00124F,#03617C, #06AEA8, #00C7A5)",
                                color: "white",
                                borderRadius: "0.75rem",
                                boxShadow: "0px 3px 3px -1px rgba(0,0,0,0.3)",
                              }}
                            >
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
                                lineHeight: "1.4", fontSize: "0.8rem"
                              }}>We will call you as per schedule</p>

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
                          ) :
                          <div>
                            <p className={`section-title mb-1 py-2 mt-2`}>Connect with an Expert now!</p>
                            <span className="underline mb-3" style={{ marginTop: "-0.6rem" }}></span>
                            {showPaymentABTestSlider ? <PaymentNoDataFound /> :
                              <UrgentHelpCard imageUrl={UrgentProfile} bgcolor={true} />
                            }
                          </div>
                        }

                        
                        <div>
                          <p className={`section-title mb-1 py-2 mt-2`}>More for you!</p>
                          <span className="underline" style={{ marginTop: "-0.6rem" }}></span>
                          <MoreForYouSlider />
                        </div>


                      </div>
                    </> : <div style={{ paddingBottom: "90px" }}>
                      <TabProvider>
                        <TabComponent scrapingStatus={scrapingStatus} type={type} currentUanData={currentUanData} activeTab={activeTab} setScrapingStatus={setScrapingStatus}
                          otpHandling={{
                            isEpfoLoading,
                            handleVerifyOtp,
                            handleResendOtp,
                            handleVerify,
                            processedUan,
                            otpmodel,
                            setOtpmodel,
                            credentials
                          }}
                        />
                      </TabProvider>
                    </div>
                  }

                </div>
              </div>
            </div>
          </div>

        </div>
      }
        <TransactionFailedSlider
                            show={showTransactionFailedSlider}
                            onClose={() => {setShowTransactionFailedSlider(false)}}
                            onRetry={() => {(handlePayToInitiate({ setLoading, setMessage }));
                        }}
                        />

    </>

  );
};

export default PFPassbookMainPage;