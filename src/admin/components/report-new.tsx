
import { useEffect, useState } from 'react';
import './style/report-new.css';
import SidebarLayout from "../SidebarLayout";
import { useLocation, useNavigate } from 'react-router-dom';
import ServiceHistory from './service-history';
import Passbook from './passbook';
import { del, get, login, post } from '../../components/common/api';
import SoW from './SoW';
import { formatCurrency } from '../../components/common/currency-formatter';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import ToastMessage from '../../components/common/toast-message';
import { decryptData } from '../../components/common/encryption-decryption';
import { AnimatePresence, motion } from 'framer-motion';
import UanGrievanceList from './uanGrievanceList';
import Select from 'react-select';
import React from 'react';
import ClaimModal from '../components/claim/ClaimModal';
import UanClaimList from './claim/uanClaimList';

interface Claim {
  claimId: string;
  receiptDate: string;
  approvedDate?: string;
  memberId: string;
  formType: string;
  claimDescription: string;
  totalAmount?: string;
  rejectDate?: string;
  rejectionReason?: string;
  location?: string;
  status: string;
  doj: string;
}

const SimpleEmployeeReport = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { uanData, isFromArchive, value , profileData} = location.state || {};
  const [activeTab, setActiveTab] = useState('overview');
  const profiledata = uanData?.data?.profile;
  // const [pfReportOpen, setPfReportOpen] = useState(false);
  const [pfReportOpen, setPfReportOpen] = useState<boolean[]>([]);
  const [nestedSectionsOpen, setNestedSectionsOpen] = useState<{
    [index: number]: {
      employment: boolean;
      pf: boolean;
      pension: boolean;
    };
  }>({});
  const [showMore, setShowMore] = useState(false);
  const [userCredentials, setUserCredentials] = useState({
    uan: '',
    password: '',
    mobileNumber: ''
  });
  // const [isEmploymentOpen, setIsEmploymentOpen] = useState(true);
  // const [pfContributionsOpen, setPfContributionsOpen] = useState(true);
  // const [pensionReportOpen, setPensionReportOpen] = useState(true);
  const [kycOpen, setKycOpen] = useState(true);
  const [commonIssueOpen, setCommonIssueOpen] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [showMessage, setShowMessage] = useState("");
  const [loaderText, setLoaderText] = useState("");
  const [OTPBypassEnabled, setIsOtpBypassEnabled] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ content: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<"login" | "otp">("login");
  const [dataToDisplay, setDataToDisplay] = useState(uanData);
  const [, setProfileToDisplay] = useState(profiledata);
  const [passwordFromForm, setPasswordFromForm] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [, setGenerateOtpResult] = useState<any>(null);
  const [otpStage, setOtpStage] = useState<"mobile" | "otp">("mobile");
  const [showModal, setShowModal] = useState(false);
  const [openPassbookFor, setOpenPassbookFor] = useState<string | null>(null);
  // const [message, setMessage] = useState({ type: "", content: "" });
  const [timer, setTimer] = useState(45);
  const [isDecrypt, setIsDecrypt] = useState(true);

  const [showAddGrievanceForm, setShowAddGrievanceForm] = useState(false);
  const [grievanceIds, setGrievanceIds] = useState<string[]>([]);
  const [agentName, setAgentName] = useState<any[]>([])
  const [addGrievanceFormData, setAddGrievanceFormData] = useState({
    uan: '',
    userName: '',
    mobileNumber: '',
    email: '',
    grievanceId: '',
    grievanceNumber: '',
    agentName: ''
  });
  const [poaData, setPoaData] = useState<any>(null);
  const [poaMessagesOpen, setPoaMessagesOpen] = useState<{ [key: string]: boolean }>(() => {
    const initialState: { [key: string]: boolean } = {};
    return initialState;
  });
  const [newPoaMessage, setNewPoaMessage] = useState<{ [key: string]: string }>({});
  const [isAddingPoa, setIsAddingPoa] = useState<{ [key: string]: boolean }>({});
  const [errorsAddGrievance, setErrorsAddGrievance] = useState({
    uan: '',
    userName: '',
    mobileNumber: '',
    email: '',
    grievanceId: '',
    grievanceNumber: '',
    agentName: ''
  });
  let claimsData = uanData?.data?.claims?.details;
  let historyData = uanData?.data?.serviceHistory?.history || [];
  // let passbookData = uanData?.data?.passbooks;
  const [apiError, setApiError] = useState(false);
  const [claimTracker, setClaimTracker] = useState(false);
  const [showAddClaimForm, setShowAddClaimForm] = useState(false);

  const fetchClaimsList = async (page: number = 1) => {
    setShowLoader(true);
      try {
        const payload: any = {
          page,
          limit: 10,
          search: "",
          claimType: "",
          status: "",
          fromDate: "",
          toDate: "",
          agentName: ""
        };
  
       await post("claims/get-claims-list", payload);
       setShowLoader(false);
      } catch (error: any) {
        setShowLoader(false);
        console.error("Error fetching claims list:", error);
        setToastMessage({
          type: "error",
          content:
            error?.response?.data?.message || "Failed to fetch claims list.",
        });
      }
    };

  const handleClaimSubmit = async (formData: any) => {
    setToastMessage({ content: "", type: "success" });
    try {
      const response: any = await post("claims/add-claims", formData);

      if (response.status === 200 && response.success) {
        // Success toast
        setToastMessage({
          type: "success",
          content: response.message || "Claim added successfully!",
        });

        // Refresh the claims list
        await fetchClaimsList(1);

        // Close the modal (this will trigger form reset in ClaimModal)
        setShowAddClaimForm(false);
      } else {
        setToastMessage({
          type: "error",
          content: response?.message || "Failed to add claim.",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);

      setToastMessage({
        type: "error",
        content:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };
  const handleInputChangeGrievance = (e: any) => {
    const { id, value } = e.target;
  
    setAddGrievanceFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  
    // Clear error when user starts typing
    setErrorsAddGrievance((prev) => ({
      ...prev,
      [id]: ''
    }));
  };
  useEffect(() => {
    if (uanData?.meta?.uan) {
      setUserCredentials({
        uan: uanData.meta.uan,
        password: uanData.meta.password || '',
        mobileNumber: profileData?.data?.phoneNumber || ''
      });
    }
  }, [uanData]);
  

  const grievanceOptions = grievanceIds.map((type) => ({
    value: type,
    label: type.replace(/_/g, ' '), // prettier label
  }));

  // const handleInputChangeGrievanceId = (selectedOption: any) => {
  //   setAddGrievanceFormData((prev) => ({
  //     ...prev,
  //     grievanceId: selectedOption?.value || '', // Save the selected value
  //   }));
  // };
  

  const validateGrievanceForm = () => {
    const newErrors: any = {};
  
    if (!addGrievanceFormData.uan) newErrors.uan = 'UAN is required';
    if (!addGrievanceFormData.userName) newErrors.userName = 'Name is required';
    if (!addGrievanceFormData.mobileNumber || addGrievanceFormData.mobileNumber.length !== 10 || isNaN(Number(addGrievanceFormData.mobileNumber))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!addGrievanceFormData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addGrievanceFormData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!addGrievanceFormData.grievanceId) newErrors.grievanceId = 'Grievance ID is required';
    if (!addGrievanceFormData.grievanceNumber) newErrors.grievanceNumber = 'Grievance number is required';
    if (!addGrievanceFormData.agentName) newErrors.agentName = 'Agent name is required';
  
    setErrorsAddGrievance(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetGrievanceForm = () => {
    setAddGrievanceFormData({
      uan: "",
      userName: "",
      mobileNumber: "",
      email: "",
      grievanceId: "",
      grievanceNumber: "",
      agentName: ""
    });
    setErrorsAddGrievance({
      uan: '',
      userName: '',
      mobileNumber: '',
      email: '',
      grievanceId: '',
      grievanceNumber: '',
      agentName: ''
    });
  };

  const getUserList = async () => {
      try {
        const response = await get("admin/get-all-users");
  
        if (response.status === 200) {
          setAgentName(response.data.map((item: any) => ({
            value: item.userName,
            label: item.userName
          })));
        }
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };

  const fetchGrievanceIds = async () => {
      try {
        const response = await get('grievance-list');
        const ids = response.data.map((item: any) => item.grievanceId);
        setGrievanceIds(ids);
      } catch (error) {
        console.error('Error fetching grievance IDs:', error);
      }
    };

  const handleAddGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage({ content: "", type: "success" });
  
    const isValid = validateGrievanceForm();
    if (!isValid) return;
  
    try {
      const response = await post("add-grievance", addGrievanceFormData);
  
      if (response.status === 200 && response.success) {
        fetchGrievances();
        setToastMessage({
          content: response.message || "Grievance added successfully!",
          type: "success",
        });
  
        setAddGrievanceFormData({
          uan: "",
          userName: "",
          mobileNumber: "",
          email: "",
          grievanceId: "",
          grievanceNumber: "",
          agentName: ""
        });
  
        // setTimeout(() => {
          setShowAddGrievanceForm(false);
        // }, 2000);
      } else {
        setToastMessage({
          content: response?.message || "Failed to add grievance.",
          type: "error"
        });
      }
    } catch (error: any) {
      setToastMessage({
        content: error?.response?.data?.message || error?.message || "Something went wrong.",
        type: "error"
      });
    }
  };

  const fetchGrievances = async (page: number = 1) => {
    try {
        setShowLoader(true);
        const payload: any = {
            page,
            limit: 10,
            search: uanData?.meta?.uan,
            grievanceId: "",
            status: "",
            agentName: "",
            fromDate: null,
            toDate: null,
            closeYesterday: false,
        };

        await post("list", payload);
    } catch (error: any) {
        console.error("Error fetching grievances:", error);
    } finally {
        setShowLoader(false);
    }
};

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: "onChange", defaultValues: { uan: profiledata?.UAN, password: "" } });

  useEffect(() => {
    const fetchData = async () => {
      if (!uanData?.meta?.uan) return;

      // setLoading(true);
      try {
        const result = await get(`/admin/report/fetchByUanForAdmin/${uanData?.meta?.uan}`);
        setReportData(result?.data);
      } catch (error) {
        console.log(error);
      } finally {
        // setLoading(false);
      }
    };
    fetchReport();
    fetchData();
  }, [uanData]);

  const statusLabels: Record<string, string> = {
    working: "Working",
    retired: "Retired",
    notworking: "Not Working",
    notlisted: "Not Listed",
    notdeducted: "PF not deducted by current employer"
  };

  const lastContributionDate = reportData?.lastContribution?.transactionDate;

  let durationDisplay = "N/A";

  if (lastContributionDate) {
    // Convert "15-09-2022" to "2022-09-15"
    const [day, month, year] = lastContributionDate.split("-");
    const formattedDateStr = `${year}-${month}-${day}`;
    const lastDate = new Date(formattedDateStr);

    const now = new Date();

    if (!isNaN(lastDate.getTime())) {
      const diffInDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      const yearDiff = now.getFullYear() - lastDate.getFullYear();
      const monthDiff = now.getMonth() - lastDate.getMonth();
      const dayDiff = now.getDate() - lastDate.getDate();

      let diffInMonths = yearDiff * 12 + monthDiff;
      if (dayDiff < 0) diffInMonths -= 1;

      if (diffInMonths < 1) {
        durationDisplay = `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      } else {
        durationDisplay = `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
      }
    }
  }

  useEffect(() => {
    fetchGrievanceIds();
    getUserList();
    (async () => {
      try {
        const { allTogglers = [] } = await get("/data/toggle/keys");
        const toggle = allTogglers?.find((t: any) => t.type === "otp-bypass");
        setIsOtpBypassEnabled(toggle?.isEnabled == true ? true : false);

      } catch {
        setIsOtpBypassEnabled(false);
      }
    })();
  }, [])

  useEffect(() => {
    const history = uanData?.data?.serviceHistory?.history;
    if (history?.length) {
      const pfOpen = history.map(() => true); // open all
      setPfReportOpen(pfOpen);

      const nestedState: Record<number, any> = {};
      history.forEach((_: any, idx: any) => {
        nestedState[idx] = {
          employment: true,
          pf: true,
          pension: true
        };
      });
      setNestedSectionsOpen(nestedState);
    }
  }, [uanData?.data?.serviceHistory?.history]);


  const kycErrors = reportData?.withdrawabilityCheckupReport
    ?.find((category: any) => category.category === "KYC")
    ?.subCategory?.find((sub: any) => sub.name === "KYC")
    ?.errorMessages;
  const employmentHistory = reportData?.withdrawabilityCheckupReport
    ?.find((item: any) => item.category === "Employment History");

  const employmentRecord = employmentHistory?.subCategory?.find((sub: any) => sub.name === "Employement_Record");

  const amountConsolidationErrors = reportData?.withdrawabilityCheckupReport
    ?.find((category: any) => category.category === "PF Contributions")
    ?.subCategory?.find((sub: any) => sub.name === "Amount_Consolidation");
  // const fullWithdrawability = employmentHistory?.subCategory?.find((sub: any) => sub.name === "Full_Withdrawability");

  // const toggleAccordion = (index: number) => {
  //   setPfReportOpen(prev => {    
  //     const newState = [...prev];
  //     newState[index] = !newState[index];
  //     return newState;
  //   });
  // };

  const toggleAccordion = (index: number) => {
    setPfReportOpen(prev => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const toggleNestedSection = (index: number, section: 'employment' | 'pf' | 'pension') => {
    setNestedSectionsOpen(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [section]: !prev[index]?.[section]
      }
    }));
  };

  const fetchReport = async () => {
    setShowLoader(true);
    setLoaderText("Fetching Report, Please wait...");
    try {
      const dataToSend = {
        userEmpHistoryCorrect: true,
        userStillWorkingInOrganization: true,
        currentOrganizationMemberId: uanData?.data?.home?.currentEstablishmentDetails?.memberId || "",
        kycStatus: {
          fullName: true,
          gender: true,
          fatherHusbandName: true,
          physicallyHandicapped: true,
          UAN: true,
          dateOfBirth: true,
          aadhaar: true,
          pan: true,
          bankAccountNumber: true,
          bankIFSC: true
        },
        isReqFromAdmin: true,
        uanToSearch: uanData?.meta.uan,
        userMobileNumber: uanData?.data?.profile?.phone,
      };
      const response = await post('admin/withdrawability-check', dataToSend);
      fetchSavedMessages(uanData?.meta.uan);
      setShowLoader(false);
      setReportData(response);
    } catch (error: any) {
      setShowLoader(false);
      if(error.message === "Request failed with status code 500"){
        setApiError(true);
      }
      else{
        setToastMessage({ content: error.message, type: "error" });
      }
    }
  };

  useEffect(() => {
    if (apiError) {
      setReportData(null);
    }
  }, [apiError]);
  // function getErrorMessagesByMemberAndCompany(memberId: string, companyName: string, reportData: any) {
  //   const relevantCategories = ["Employment History", "PF Contributions", "EPF Pension Records"];

  //   const result: Record<string, Record<string, string[]>> = {};

  //   reportData?.withdrawabilityCheckupReport?.forEach((categoryObj: any) => {
  //     const { category, subCategory } = categoryObj;

  //     if (!relevantCategories.includes(category)) return;

  //     subCategory.forEach((sub: any) => {
  //       const subName = sub.name;
  //       if (subName === "Amount_Consolidation") return;
  //       const errors: string[] = sub.errorMessages || [];

  //       // Conditions based on category
  //       if (category === "Employment History") {
  //         // Filter only Date_Of_Exit and Service_Overlap
  //         if (["Date_Of_Exit", "Service_Overlap"].includes(subName)) {
  //           const matchedErrors = errors.filter((msg: string) =>
  //              msg.includes(memberId) || msg.includes(companyName)
  //           );
  //           if (matchedErrors.length) {
  //             if (!result[category]) result[category] = {};
  //             result[category][subName] = matchedErrors;
  //           }
  //         }
  //       } else if (category === "PF Contributions" || category === "EPF Pension Records") {
  //         // Check all subcategories for relevant errors
  //         const matchedErrors = errors.filter((msg: string) =>
  //             msg.includes(memberId) || msg.includes(companyName)
  //         );
  //         if (matchedErrors.length) {
  //           if (!result[category]) result[category] = {};
  //           result[category][subName] = matchedErrors;
  //         }
  //       }
  //     });
  //   });

  //   return result;
  // }

  function parseMonthYear(str: string) {
    const [monthStr, yearStr] = str.split(" ");
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = monthMap[monthStr.slice(0, 3).toLowerCase()];
    const year = parseInt(yearStr, 10);
    return new Date(year, month, 1);
  }
  
  function isDateWithinRange(date: Date, start: string, end: string) {
    const startDate = start && start !== "-" ? new Date(start) : null;
    const endDate = end && end !== "-" ? new Date(end) : null;
    if (!startDate) return false;
    if (endDate && date > endDate) return false;
    if (date < startDate) return false;
    return true;
  }
  
  function findMemberIdFromErrorMessage(message: string, serviceHistory: any[]) {
    const companyRegex = /by (.*?) for/i;
    const companyMatch = message.match(companyRegex);
    const companyName = companyMatch ? companyMatch[1].trim() : null;
  
    const dateRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/g;
    const dates = message.match(dateRegex) || [];
  
    if (!companyName) return null;
  
    const matchingCompanies = serviceHistory.filter(entry =>
      entry.company.toLowerCase() === companyName.toLowerCase()
    );
  
    if (matchingCompanies.length === 1) {
      return matchingCompanies[0].details["Member Id"];
    }
  
    for (const dateStr of dates) {
      const dateObj = parseMonthYear(dateStr);
      const match = matchingCompanies.find(entry => {
        const doj = entry.details["Joining Date"];
        const doe = entry.details["Exit Date"];
        return isDateWithinRange(dateObj, doj, doe);
      });
      if (match) {
        return match.details["Member Id"];
      }
    }
  
    return null;
  }
  

  function getErrorMessagesByMemberAndCompany(
    memberId: string,
    // companyName: string,
    reportData: any,
    serviceHistory: any[]
  ) {
    const result: Record<string, Record<string, string[]>> = {};
  
    reportData?.withdrawabilityCheckupReport?.forEach((categoryObj: any) => {
      const { category, subCategory } = categoryObj;
  
      // Only process the categories we care about
      if (
        category !== "PF Contributions" &&
        category !== "EPF Pension Records" &&
        category !== "Employment History"
      ) {
        return; // skip other categories
      }
  
      subCategory.forEach((sub: any) => {
        const subName = sub.name;
  
        // For Employment History → only specific subcategories
        if (
          category === "Employment History" &&
          !["Date_Of_Exit", "Service_Overlap"].includes(subName)
        ) {
          return;
        }
        
        if (category === "PF Contributions") {
          if (["Amount_Consolidation"].includes(subName)) return;
        }
  
        const errors: string[] = sub.errorMessages || [];
  
        const matchedErrors = errors.filter((msg) => {
          // Direct memberId match
          if (msg.includes(memberId)) return true;
  
          // Try to infer memberId from message
          const inferredMemberId = findMemberIdFromErrorMessage(msg, serviceHistory);
          return inferredMemberId === memberId;
        });
  
        if (matchedErrors.length) {
          if (!result[category]) result[category] = {};
          if (!result[category][subName]) result[category][subName] = [];
          result[category][subName].push(...matchedErrors);
        }
      });
    });
  
    return result;
  }
  
  
  
  
  const passwordAvailable = uanData?.meta?.password || "";
  const handleRefresh = async () => {
    setShowMessage("");
    if (userCredentials.password) {
      await handleLoginAndStatusFlow(
        userCredentials.uan,
        userCredentials.password,
        userCredentials.mobileNumber
      );
    } 
    else if (passwordAvailable) {
      await handleLoginAndStatusFlow(profiledata.UAN, uanData.meta.password, profiledata.phone);

    } else {
      setIsModalOpen(true);
      setModalStage("login");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOtpInput("");
    setShowMessage("");
    setPasswordFromForm("");
    reset({ uan: profiledata?.UAN, password: "" });
  };

  const handleLoginSubmit = async (data: any) => {
    await handleLoginAndStatusFlow(profiledata?.UAN, data.password.trim(), profiledata?.phone);
  };

  const handleLoginAndStatusFlow = async (
    uan: string,
    password: string,
    mobile_number: string,
  ) => {
    setShowMessage("");
    setLoaderText(OTPBypassEnabled ? "Please wait...Verifying & updating details" : "Please wait...verifying credentials");
    setShowLoader(true);

    try {
      const result = await login(uan, password.trim(), mobile_number);

      if (result?.status === 400) {
        setToastMessage({ content: "Invalid credentials. Please try again.", type: "error" });
        setShowLoader(false);
        return;
      }

      let retries = 0;
      const maxRetries = 60;
      const pollInterval = 3000;

      const checkLoginStatus = async (): Promise<boolean> => {
        try {
          const loginStatusResponse = await get(`/auth/login-status?uan=${uan}`);
          if (loginStatusResponse?.data?.status === "success") {
            if (OTPBypassEnabled) {
              setIsModalOpen(false);
              await handleByPassOtp(uan);
            } else {
              setPasswordFromForm(password.trim());
              setIsModalOpen(true);
              setModalStage("otp");
            }
            return true;
          } else if (loginStatusResponse?.data?.status === "failed") {
            setToastMessage({ content: loginStatusResponse?.data?.message || "Login failed", type: "error" });
            if(loginStatusResponse?.data?.message === "Either UAN or Password is incorrect"){
              setIsModalOpen(true);
              setModalStage("login");
              reset({ uan: profiledata?.UAN, password: "" });
            }
            return true;
          }
          return false;
        } catch (err) {
          console.error("Error checking login status:", err);
          return false;
        }
      };

      let isComplete = await checkLoginStatus();
      while (!isComplete && retries < maxRetries) {
        await new Promise((r) => setTimeout(r, pollInterval));
        isComplete = await checkLoginStatus();
        retries++;
      }

      if (!isComplete) {
        setToastMessage({ content: "Request timed out. Please try again.", type: "error" });
      }

      setShowLoader(false);
    } catch (err: any) {
      console.error("Login error:", err);
      setToastMessage({ content: err?.message || "Login failed. Please try again.", type: "error" });
      setShowLoader(false);
    }
  };

  const handleOtpSubmit = async () => {
    setLoaderText("Verifying OTP...");
    setShowLoader(true);
    try {
      const passwordToUse = passwordAvailable
        ? dataToDisplay?.meta?.password
        : passwordFromForm;
      const result = await post("auth/submit-otp", {
        otp: otpInput,
        type: " ",
        uan: profiledata?.UAN,// UAN : UAN
        password: passwordToUse,
        mobile_number: profiledata?.phone,
      });
      if (result?.status === 400) {
        setShowLoader(false);
        setIsModalOpen(false);
        setToastMessage({ content: "Invalid OTP. Try again.", type: "error" });
        return;
      }
      await handleByPassOtp(profiledata?.UAN)
      setIsModalOpen(false);
    } catch (err: any) {
      setShowLoader(false);
      setToastMessage({ content: "Invalid OTP. Try again.", type: "error" });
    }
  };

  const handleByPassOtp = async (uan: any) => {
    try {
      const responseUan = await get('/data/fetchByUan/' + uan);
       if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
        const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
        setToastMessage({ content: errorMsg, type: "error" });
        return;
      }
      setDataToDisplay(responseUan.rawData);
      setProfileToDisplay(responseUan.profileData);
      // onDataUpdate?.(responseUan.rawData, responseUan.profileData);          
  

      if (!responseUan) {
        setShowLoader(false);
        setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });
      } else {
        setShowLoader(false);
        if (!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
          setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });
          return
        }
      }
      setShowLoader(false);
      setToastMessage({
        content: "Profile updated successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/operation/uan-list");
      }, 2000);
    } catch (error: any) {
      setShowLoader(false)
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.warn('Server Connection Error:', {
          error: error.message,
          code: error.code
        });
        setToastMessage({ content: "Seems like there is some issue in getting your data from EPFO. Please try again later!!", type: "error" });

      }
    }
  }
  const opsType = decryptData(localStorage.getItem("opsType"));
  const handleDecryptData = () => {
    setShowOtpModal(true);
  }

  useEffect(() => {
    if (otpStage === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, otpStage]);

  // OTP input handlers
  const handleOtpModalChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      const next = document.getElementById(`otp-input-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleOtpModalBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-input-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };
  const handleVerifyAndGenerateOtp = async () => {
    try {
      setShowLoader(true);

      // Step 1: Verify mobile number
      const verifyResponse = await post("/admin/checkDecryptAccessibility", {
        mobile_number: mobileNumber,
      });

      if (!verifyResponse || !verifyResponse.success) {
        setToastMessage({ type: "error", content: "Invalid Mobile Number" });
        return;
      }

      // Step 2: If valid, call reusable OTP generation function
      await handleGenerateOtp();

      // If successful, move to OTP stage
      setOtpStage("otp");
      setTimer(60);
      setOtp(Array(6).fill(""));

    } catch (error) {
      console.error(error);
      setToastMessage({ type: "error", content: "Invalid Mobile Number" });
    } finally {
      setShowLoader(false);
    }
  };

  const handleGenerateOtp = async () => {
    try {
      setShowLoader(true);
      const formattedMobile = `+91${mobileNumber}`;
      const response = await post("/auth/generateOtpFixMyPf", { mobile_number: formattedMobile });
      if (response && response.success) {
        setGenerateOtpResult(response);
        setToastMessage({ type: "success", content: "OTP sent successfully" });
      } else {
        setToastMessage({ type: "error", content: "Failed to send OTP" });
      }
    } catch (error) {
      setToastMessage({ type: "error", content: "Something went wrong!" });
    } finally {
      setShowLoader(false);
    }
  };

  const handleConfirmOtp = async () => {
    try {
      setShowLoader(true);
      const response = await post("/auth/confirmOtpFixpf", {
        mobile_number: mobileNumber,
        otp: otp.join("")
      });
      if (response && response.success) {
        setToastMessage({ type: "success", content: "OTP Verified!" });
        setIsDecrypt(false);
        setShowOtpModal(false);
        await fetchArchivedDataByUan(value);
      } else {
        setToastMessage({ type: "error", content: "Invalid OTP!" });
      }
    } catch (error) {
      setToastMessage({ type: "error", content: "Verification failed" });
    } finally {
      setShowLoader(false);
    }
  };
  const fetchArchivedDataByUan = async (uanValue: string) => {
    try {
      const res = await get(`/admin/archive/view/${uanValue}`);
      // setUanData(res?.results?.[0]);
      navigate('/operation/view-details', {
        state: {
          uanData: res?.results?.[0],
          isFromArchive: true,
        },
      });
      // setIsProcessing(false);
      // You can store `res` in state if needed
    } catch (error) {
      console.error("Failed to fetch archive data:", error);
    }
  };


  // claims data starts here 
  const parseDDMMYYYY = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };
  const isArray = (data: any) => Array.isArray(data);
  const combinedClaims: Claim[] = [];
  if (isArray(claimsData?.["Pending Claims"])) {
    combinedClaims.push(
      ...claimsData["Pending Claims"].map((claim: any) => ({
        ...claim,
        status: "Pending",
      }))
    );
  }

  if (isArray(claimsData?.["Settled Claims"])) {
    combinedClaims.push(
      ...claimsData["Settled Claims"].map((claim: any) => ({
        ...claim,
        status: "Settled",
      }))
    );
  }

  if (isArray(claimsData?.["Rejected Claims"])) {
    combinedClaims.push(
      ...claimsData["Rejected Claims"].map((claim: any) => ({
        ...claim,
        status: "Rejected",
      }))
    );
  }


  const memberIdToDojMap: Record<string, string> = {};
  const memberIdToCompanyMap: Record<string, string> = {};
  historyData.forEach((item: any) => {
    const memberId = item?.details?.["Member Id"];
    const companyName = item?.["company"];
    const doj = item?.details?.["Joining Date"];
    if (memberId && doj) {
      memberIdToDojMap[memberId] = doj;
    }
    if (memberId && companyName) {
      memberIdToCompanyMap[memberId] = companyName;
    }
  });

  // Group claims by memberId
  const groupedClaims: { [key: string]: Claim[] } = combinedClaims.reduce((acc, claim) => {
    if (!acc[claim.memberId]) {
      acc[claim.memberId] = [];
    }
    acc[claim.memberId].push(claim);
    return acc;
  }, {} as { [key: string]: Claim[] });

  // Sort claims inside each memberId group by doj
  //   Object.keys(groupedClaims).forEach((memberId) => {
  //     groupedClaims[memberId].sort((a, b) => {
  //       const dateA = new Date(a.doj).getTime();
  //       const dateB = new Date(b.doj).getTime();
  //       return dateB - dateA;
  //     });
  //   });
  Object.keys(groupedClaims).forEach((memberId) => {
    groupedClaims[memberId].sort((a, b) => {
      const dateA = parseDDMMYYYY(a.receiptDate);
      const dateB = parseDDMMYYYY(b.receiptDate);
      return dateA.getTime() - dateB.getTime();
    });
  });
      const fetchSavedMessages = async (uan: string) => {
          try {
              const res = await post(`lead/get-message`, { uan });
              if (res.success && res.data) {
                setPoaData(res.data);
              }

              return null;
          } catch (error) {
              console.error("Error fetching saved messages:", error);
              return null;
          }
      };

  const getPoaMessagesByContext = (
    memberId: string,
    category: string,
    subCategory: string,
    poaData: any
  ) => {
    if (!poaData?.messages) return [];

    return poaData.messages.filter((msg: any) =>
      msg.memberId === memberId &&
      msg.category?.toLowerCase() === category.toLowerCase() &&
      (msg.subcategory?.toLowerCase() === subCategory.toLowerCase() ||
        msg.subCategory?.toLowerCase() === subCategory.toLowerCase())
    );

  };



const togglePoaSection = (index: number, category: string, subCategory: string) => {
  const key = `${index}-${category}-${subCategory}`;
  setPoaMessagesOpen(prev => ({ ...prev, [key]: !prev[key] }));
};

const toggleAddPoaForm = (index: number, category: string, subCategory: string) => {
  const key = `${index}-${category}-${subCategory}`;
  setIsAddingPoa(prev => ({ ...prev, [key]: !prev[key] }));
};
const handleAddPoaMessage = async (index: number, category: string, subCategory: string, memberId: string, companyName: string) => {
  const key = `${index}-${category}-${subCategory}`;
  const message = newPoaMessage[key];
  if (!message?.trim()) return;
  
  try {
    // Call your API to add POA message
    await addPoaMessage(memberId, companyName,  category, subCategory, message);
    setNewPoaMessage(prev => ({ ...prev, [key]: '' }));
    setIsAddingPoa(prev => ({ ...prev, [key]: false }));
    // Refresh your data here if needed
  } catch (error) {
    console.error('Failed to add POA message:', error);
  }
};
const addPoaMessage = async (
  memberId: string,
  companyName: string,
  category: string,
  subCategory: string,
  message: string
) => {
  try {
    const response = await post("/lead/add-poa-message", {
      uan: uanData?.meta?.uan,
      memberId,
      companyName,
      category,
      subcategory: subCategory,
      messages: [message],
    });
    

    

    // Update local state with the updated document
    setPoaData(response);
    return response;

  } catch (error) {
    console.error('Error adding POA message:', error);
    throw error;
  }
};

const handleDeletePoaMessage = async (
  messageIndex: number,
  memberId: string,
  category: string,
  subCategory: string,
  messageText: string
) => {
  try {
    const response = await del("/lead/delete-poa-message", {
      uan: uanData?.meta?.uan,
      memberId,
      category,
      subCategory,
      messageText,
      messageIndex,
    });
    

    // Update local state
     if (response?.data) {
      setPoaData(response.data);
    } else {
      setPoaData(response); // fallback if backend directly returns the doc
    }
  } catch (error) {
    console.error('Error deleting message:', error);

  }
};
  const renderPoaMessages = (index: number, category: string, subCategory: string, memberId: string, companyName: string, poaData: any) => {
    const key = `${index}-${category}-${subCategory}`;
    const poaMessages = getPoaMessagesByContext(memberId, category, subCategory, poaData);
    if (poaMessagesOpen[key] === undefined) {
      setPoaMessagesOpen(prev => ({ ...prev, [key]: true }));
    }
    const isPoaOpen = poaMessagesOpen[key];
    const isAddingPoaForm = isAddingPoa[key];

    return (
      <div className="mt-3">
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => togglePoaSection(index, category, subCategory)}
        >
          <h5 className="text-info">
            📋 POA Messages ({poaMessages?.[0]?.messages?.length || 0})
          </h5>
          <button className="btn btn-link p-0">
            <i className={`bi ${isPoaOpen ? "bi-chevron-up" : "bi-chevron-down"} fs-6`}></i>
          </button>
        </div>

        {isPoaOpen && (
          <div className="mt-2">
            {/* Existing POA Messages */}
            {poaMessages.length > 0 ? (
              <div className="info-table mb-3">
                {poaMessages.map((poaMsg: any, poaIdx: number) => (
                  <div key={poaIdx} className="info-row d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      {poaMsg.messages?.map((msg: string, msgIdx: number) => (
                        <div key={msgIdx} className="text-dark mb-1">
                          {msgIdx + 1}. {msg}
                          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePoaMessage(
                msgIdx, 
                memberId,
                category,
                subCategory,
                msg 
              );
            }}
            title="Delete POA Message"
          >
            <i className="bi bi-trash"></i>
          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted text-center py-2">
                No POA messages found
              </div>
            )}

            {/* Add New POA Message */}
            <div className="border-top pt-2">
              {!isAddingPoaForm ? (
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => toggleAddPoaForm(index, category, subCategory)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Add POA Message
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter POA message..."
                    value={newPoaMessage[key] || ''}
                    onChange={(e) => setNewPoaMessage(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                  />
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleAddPoaMessage(index, category, subCategory, memberId, companyName)}
                  >
                    <i className="bi bi-check"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => toggleAddPoaForm(index, category, subCategory)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
};
  return (
    <SidebarLayout>
      {showLoader ? (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
          <div className="text-center p-4 bg-white rounded shadow">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">{loaderText}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="container-fluid">
            {toastMessage && (
              <ToastMessage
                message={toastMessage.content}
                type={toastMessage.type}
              />
            )}
            <div className='row'>
              <div className={`employee-report ${apiError ? 'error-state' : ''}`}>
                  <div className="row mb-3">
                    <div className="d-flex justify-content-between align-items-center w-100">
                      {/* Back Button on the Left */}
                      <div>
                        {isFromArchive ? (
                          <button className="btn p-0" onClick={() => navigate("/operation/archived-module")}>
                            <ArrowLeft size={20} className="me-1" /> Back
                          </button>
                        ) : (
                          <button className="btn p-0" onClick={() => navigate("/operation/uan-list")}>
                            <ArrowLeft size={20} className="me-1" /> Back
                          </button>
                        )}
                      </div>

                      {/* Right-side Buttons */}
                      <div className="d-flex gap-2 ms-auto">
                        {(opsType !== "ops" && isFromArchive) ? (
                          isDecrypt && (
                            <button
                              className="btn btn-lg btn-info text-white"
                              // style={{ width: "12rem" }}
                              onClick={handleDecryptData}
                            >
                              <span className="me-2">🔓</span>
                              Decrypt Data
                            </button>
                          )
                        ) : (
                          <button
                            className="btn btn-lg btn-info text-white"
                            style={{ width: "13rem" }}
                            onClick={handleRefresh}
                          >
                            <span className="me-2">⟳</span>
                            Refresh
                          </button>
                        )}
                        { (activeTab === "grievance" || activeTab === "claim") &&  (
                        claimTracker ? (
                          <button
                            className="btn btn-info btn-lg text-white d-flex align-items-center"
                            onClick={() => {
                              setShowAddClaimForm(true);
                            }}
                          >
                            <span className="me-2">+</span>
                            Add Claim
                          </button>
                        ) : (
                        <button
                          className="btn btn-info btn-lg text-white d-flex align-items-center"
                          onClick={() => {
                            setAddGrievanceFormData({
                              uan: profiledata?.UAN || "",
                              userName: profiledata?.fullName || "",
                              mobileNumber: profiledata?.phone || "",
                              email: profiledata?.email || "",
                              grievanceId: "",
                              grievanceNumber: "",
                              agentName: "",
                            });
                            setShowAddGrievanceForm(true);
                          }}
                        >
                          <span className="me-2">+</span>
                          Add Grievance
                        </button>
                        )
                        )}
                      </div>
                    </div>
                  </div>
                  {apiError ? (
                    <div className="d-flex justify-content-center align-items-center vh-100 ">
                    <div className="container">
                      <div className="alert alert-warning w-100 text-center" role="alert">
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          <div>
                            <h5 className="alert-heading">No Data Available</h5>
                            <p className="mb-0">
                              We couldn't fetch the report data. Please try refreshing the page.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>                  

                  ) : (
  <>
                {/* Header Section */}
                {profiledata && (
                  <div className="report-header">
                    <div className="employee-info">
                      <div className="avatar">
                        <span>👤</span>
                      </div>
                      <div className="employee-details">
                        <h1>{profiledata.fullName}</h1>
                        <p>UAN: {profiledata.UAN}</p>
                      </div>
                    </div>

                    <div className="contact-info">
                      <div className="contact-item">
                        <span>📞 UAN Linked Mobile</span>
                        <span>{profiledata?.phone}</span>
                      </div>
                      <div className="contact-item">
                        <span>📅</span>
                        <span>DOB: {profiledata?.basicDetails?.dateOfBirth}</span>
                      </div>
                      <div className="contact-item">
                        <span>✉️</span>
                        <span>{profiledata?.email}</span>
                      </div>
                      {profileData?.data?.phoneNumber && (
                        <div className="contact-item">
                          <span>📞 User Login Mobile</span>
                          <span>{profileData?.data?.phoneNumber?.replace(/^\+91/, '')}</span>
                        </div>
                      )}
                    </div>

                    <div className="badges">
                      <span className="badge">
                        Gender: {profiledata.basicDetails?.gender === "M" ? "Male" : profiledata.basicDetails?.gender === "F" ? "Female" : "Other"}
                      </span>
                      <span className="badge">
                        Father/Husband Name: {profiledata.basicDetails?.fatherHusbandName} ({profiledata.basicDetails?.relation})
                      </span>
                      <span className="badge">
                        International Worker: {profiledata.basicDetails?.internationalWorker === "Y" ? "Yes" : "No"}
                      </span>
                      <span className="badge">
                        Physically Handicapped: {profiledata.basicDetails?.physicallyHandicapped === "Y" ? "Yes" : "No"}
                      </span>
                        <span className="badge">
                          Aadhar Card: {dataToDisplay?.data?.profile?.kycDetails?.aadhaar
                            ? `XXXX XXXX ${dataToDisplay?.data?.profile?.kycDetails?.aadhaar.slice(-4)}`
                            : ""}
                        </span>

                        <span className="badge">
                          Bank Account: {dataToDisplay?.data?.profile?.kycDetails?.bankAccountNumber
                            ? `XXXXXXXXX${dataToDisplay?.data?.profile?.kycDetails?.bankAccountNumber.slice(-4)}`
                            : ""}
                        </span>

                        <span className="badge">
                          Pan Card: {dataToDisplay?.data?.profile?.kycDetails?.pan
                            ? `${dataToDisplay?.data?.profile?.kycDetails?.pan.slice(0, 2)}XXXX${dataToDisplay?.data?.profile?.kycDetails?.pan.slice(6)}`
                            : ""}
                        </span>

                        <span className="badge">
                          IFSC Code: {dataToDisplay?.data?.profile?.kycDetails?.bankIFSC
                            ? `${dataToDisplay?.data?.profile?.kycDetails?.bankIFSC.slice(0, 4)}XXXXXXXX${dataToDisplay?.data?.profile?.kycDetails?.bankIFSC.slice(-4)}`
                            : ""}
                        </span>


                    </div>
                  </div>
                )}

                {/* Navigation Tabs */}
                  <div className="tabs">
                    <button
                      className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      Report
                    </button>
                    <button
                      className={`tab ${activeTab === 'sow' ? 'active' : ''}`}
                      onClick={() => setActiveTab('sow')}
                    >
                      SoW
                    </button>
                          <button
                            className={`tab ${activeTab === "grievance" || activeTab === "claim" ? "active" : ""
                              }`}
                            onClick={() => setActiveTab("grievance")}
                          >
                            Activity Tracker
                          </button>
                  </div>


                {/* Tab Content */}
                <div className="tab-content">


                  {activeTab === 'overview' && (
                    <div className="overview-content">
                      <div className="section-card">
                        <h3>General Information</h3>
                        <div className={`info-grid ${showMore ? 'expanded' : ''}`}>
                          <div className="info-table">
                            <div className="info-row">
                              <span>Current Employment Status</span>
                              <span>{statusLabels[reportData?.userSelectedValues?.status] || "N/A"}</span>
                            </div>

                            <div className="info-row">
                              <span>Should be an EPS member?</span>
                              <span>
                                {
                                  reportData?.withdrawabilityCheckupReport
                                    ?.find((item: any) => item.category === "EPF Pension Records")
                                    ?.isEpsMember?.toUpperCase() === "Y"
                                    ? "✅ Yes"
                                    : "❌ No"
                                }
                              </span>
                            </div>

                            <div className="info-row">
                              <span>Months Since last contribution</span>
                              <span>{durationDisplay}</span>
                            </div>

                            <div className="info-row">
                              <span>Amount Stuck</span>
                              <span>{formatCurrency(reportData?.updatedCalculation?.totalAmountStuck) || "₹ 0"}</span>
                            </div>

                            <div className="info-row">
                              <span>Eligible for full withdrawability</span>
                              <span>
                                {
                                  reportData?.withdrawabilityCheckupReport
                                    ?.find((cat: any) => cat.category === "Employment History")
                                    ?.subCategory
                                    ?.find((sub: any) => sub.name === "Full_Withdrawability")
                                    ?.errorMessages
                                    ?.includes("Full Withdrawability is allowed")
                                    ? "✅ Yes"
                                    : "❌ No"
                                }
                              </span>
                            </div>
                            {!showMore && (
                              <div className="info-row">
                                <span>PF Balance</span>
                                <span>{formatCurrency(reportData?.updatedCalculation?.totalPfBalanceWithoutPension) || "₹ 0"}</span>
                              </div>
                            )}
                          </div>

                          {showMore && (
                            <div className="info-table">
                              <div className="info-row">
                                <span>PF Balance</span>
                                <span>{formatCurrency(reportData?.updatedCalculation?.totalPfBalanceWithoutPension) || "₹ 0"}</span>
                              </div>
                              <div className="info-row">
                                <span>Max. Withdrawal Amount (Post correction)</span>
                                <span>{formatCurrency(reportData?.updatedCalculation?.maxAmountPostCorrection) || "₹ 0"}</span>
                              </div>

                              <div className="info-row">
                                <span>Amount Available to withdraw (Pre correction)</span>
                                <span>{formatCurrency(reportData?.updatedCalculation?.amountAvailablePreCorrection) || "₹ 0"}</span>
                              </div>

                              <div className="info-row">
                                <span>Amount immediately available</span>
                                <span>{formatCurrency(reportData?.updatedCalculation?.amountImmediatelyAvailableWithin22Days) || "₹ 0"}</span>
                              </div>

                              <div className="info-row">
                                <span>Withdraw able Pension Balance</span>
                                <span>{formatCurrency(reportData?.epsDetails?.pensionStats?.totalPensionAvailableToWithdraw) || "₹ 0"}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 d-flex justify-content-center">
                          <button
                            className="btn btn-link p-0"
                            onClick={() => setShowMore(!showMore)}
                          >
                            {showMore ? "View Less" : "View More"}
                          </button>
                        </div>
                      </div>
                      {/* service history */}
                      <div className="section-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="my-2">Service History</h3>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setShowModal(true)}
                            style={{ fontSize: "0.8rem" }}
                          >
                            More Details
                          </button>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                          <table className="table table-bordered mt-3 table-hover" style={{ width: "100%", minWidth: "1200px" }}>
                            <thead className="thead-light">
                              <tr>
                                <th>Company Name</th>
                                <th>Member ID</th>
                                <th>DOJ - DOE</th>
                                <th>Employee Share</th>
                                <th>Employer Share</th>
                                <th>Pension Share</th>
                                <th>Transferred To</th>
                                <th>10C_Done?</th>
                                <th>Last Contribution EPF Wage</th>
                                <th>EPS Flag</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData?.epsDetails?.chronologicallyOrderedCompanies.map((item: any, index: number) => {
                                const memberId = item.memberId;
                                const transferToList = reportData?.epsDetails?.transferChainMap
                                  ?.filter((t: any) => t.from === memberId && t.linked === true)
                                  ?.map((t: any) => {
                                    const targetCompany = reportData?.epsDetails?.chronologicallyOrderedCompanies
                                      ?.find((comp: any) => comp.memberId === t.to);
                                    return targetCompany?.establishmentName || t.to;
                                  });

                                const transferTo = transferToList?.length > 0 ? transferToList.join(", ") : "No Transfer";

                                return (
                                  <tr key={index}>
                                    <td>{item.establishmentName || "-"}</td>
                                    <td>{item.memberId || "-"}</td>
                                    <td>{item.doj || "-"} - {item.doe || "Present"}</td>
                                    <td>{formatCurrency(item.shareDetails?.employeeShare) || "₹ 0"}</td>
                                    <td>{formatCurrency(item.shareDetails?.employerShare) || "₹ 0"}</td>
                                    <td>{formatCurrency(item.shareDetails?.pensionShare) || "₹ 0"}</td>
                                    <td>{item.is10cCompany ? "Amount Withdrawn" : transferTo}</td>
                                    <td>{item.is10cCompany ? "Yes" : "No"}</td>
                                    <td>{item.lastContributionDetails?.epfWages || "0"}</td>
                                    <td>{reportData?.epsDetails?.overallEpsMemberFlag ? "No" : "Yes"}</td>
                                  </tr>
                                );
                              })}
                                {(() => {
                                  const totals = reportData?.epsDetails?.chronologicallyOrderedCompanies || []
                                  const history = totals.reduce(
                                    (acc: any, curr: any) => {
                                      acc.employee += curr.shareDetails?.employeeShare || 0;
                                      acc.employer += curr.shareDetails?.employerShare || 0;
                                      acc.pension += curr.shareDetails?.pensionShare || 0;
                                      return acc;
                                    },
                                    { employee: 0, employer: 0, pension: 0 }
                                  );

                                  return (
                                    <tr style={{ fontWeight: "bold", background: "#f1f1f1" }}>
                                      <td>Total</td> 
                                      <td>-</td>
                                      <td>
                                        {uanData?.data?.serviceHistory?.overview["Total Experience"] || "-"}
                                      </td>
                                      <td>{formatCurrency(history.employee) || "₹ 0"}</td>
                                      <td>{formatCurrency(history.employer) || "₹ 0"}</td>
                                      <td>{formatCurrency(history.pension) || "₹ 0"}</td>
                                      <td>-</td>
                                      <td>-</td>
                                      <td>-</td>
                                      <td>-</td>
                                    </tr>
                                  );
                                })()}

                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* PF Report */}
                      {uanData?.data?.serviceHistory?.history?.slice()                // copy to avoid mutating original
                        .reverse().map((company: any, index: number) => {
                          const memberId = company.details['Member Id'];
                          const companyName = company.company;
                          const dojRaw = company.details['Joining Date'];
                          const doeRaw = company.details['Exit Date'];

                          const doj = (!dojRaw || dojRaw.trim() === '' || dojRaw.trim() === '-') ? 'N/A' : dojRaw;
                          const doe = (!doeRaw || doeRaw.trim() === '' || doeRaw.trim() === '-') ? 'N/A' : doeRaw;
                          const errorData = getErrorMessagesByMemberAndCompany(memberId, reportData, uanData?.data?.serviceHistory?.history);
                  
                          return (
                            <div className="section-card" key={memberId}>
                              {/* Header Row with toggle */}
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100">
                                <h3 className="mb-2 mb-md-0">
                                  {companyName} ({memberId}) ({doj} - {doe})
                                </h3>

                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setOpenPassbookFor(memberId)}
                                  >
                                    View Passbook
                                  </button>

                                  <button
                                    className="btn btn-link p-0"
                                    onClick={() => toggleAccordion(index)}
                                    aria-expanded={pfReportOpen[index]}
                                    aria-controls={`pfReportCollapse-${index}`}
                                  >
                                    <i className={`bi ${pfReportOpen[index] ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                                  </button>
                                </div>
                              </div>

                              {/* Accordion Body */}
                              {pfReportOpen[index] && (
                                <div id={`pfReportCollapse-${index}`} className="mt-3">
                                  {pfReportOpen && (
                                    <div id="pfReportCollapse" className="mt-3">
                                      <hr />
                                      <h3 className="mt-3">📊 Error</h3>
                                      <hr />
                                      {(!errorData ||
                                        Object.values(errorData).every((section: any) =>
                                          Object.keys(section).length === 0)
                                      ) && (
                                          <div className="text-center text-success mt-3">
                                            ✅ No Error found for this employment
                                          </div>
                                        )}

                                      {errorData && errorData["Employment History"] && (
                                        <>
                                          <h3 className="mt-3 d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => toggleNestedSection(index, 'employment')}>
                                            {/* Employment History */}
                                            {/* <button
                                              className="btn btn-link p-0"
                                              aria-expanded={nestedSectionsOpen[index]?.employment}
                                              aria-controls="employmentHistoryCollapse"
                                            >
                                              <i className={`bi ${nestedSectionsOpen[index]?.employment ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                                            </button> */}
                                          </h3>
                                          {nestedSectionsOpen[index]?.employment && (
                                            <div id="employmentHistoryCollapse" className="table-responsive">
                                              <div className="w-100">
                                                {Object.entries(errorData["Employment History"]).map(
                                                  ([subCatName, messages]: [string, string[]], i) => (
                                                    <div key={i}>
                                                      <div className="info-table">
                                                        {messages.map((msg, idx) => (
                                                          <div className="info-row" key={idx}>
                                                            <span className="text-danger">{idx + 1}. {msg}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                      {renderPoaMessages(index, "Employment History", subCatName, memberId, companyName, poaData)}
                                                      <hr />
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </>

                                      )}
                                      <hr />
                                      {errorData && errorData["PF Contributions"] && (
                                        <>
                                          <h3 className="mt-3 d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => toggleNestedSection(index, 'pf')}>
                                            PF contributions
                                            <button
                                              className="btn btn-link p-0"
                                              aria-expanded={nestedSectionsOpen[index]?.pf}
                                              aria-controls="pfContributionsCollapse"
                                            >
                                              <i className={`bi ${nestedSectionsOpen[index]?.pf ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                                            </button>
                                          </h3>

                                          {nestedSectionsOpen[index]?.pf && (
                                            <div id="pfContributionsCollapse" className="table-responsive">
                                              <div className="w-100">
                                                {Object.entries(errorData["PF Contributions"]).map(
                                                  ([subCatName, messages]: [string, string[]], i) => (
                                                    <div key={i}>
                                                      <h5 className="text-danger">🔴 {subCatName.replace(/_/g, ' ')}</h5>
                                                      <div className="info-table">
                                                        {messages.map((msg, idx) => (
                                                          <div className="info-row" key={idx}>
                                                            <span className="text-danger">{idx + 1}. {msg}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                      {renderPoaMessages(index, "PF Contributions", subCatName, memberId, companyName, poaData)}
                                                      <hr />
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {/* <hr /> */}
                                      {errorData && errorData["EPF Pension Records"] && (
                                        <>
                                          <h3 className="mt-3 d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => toggleNestedSection(index, 'pension')}>
                                            Pension Records
                                            <button
                                              className="btn btn-link p-0"
                                              aria-expanded={nestedSectionsOpen[index]?.pension}
                                              aria-controls="pensionReportCollapse"
                                            >
                                              <i className={`bi ${nestedSectionsOpen[index]?.pension ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                                            </button>
                                          </h3>
                                          {nestedSectionsOpen[index]?.pension && (
                                            <div id="pensionReportCollapse" className="table-responsive">
                                              <div className="w-100">
                                                {Object.entries(errorData["EPF Pension Records"]).map(
                                                  ([subCatName, messages]: [string, string[]], i) => (
                                                    <div key={i}>
                                                      <h5 className="text-danger">🔴 {subCatName.replace(/_/g, ' ')}</h5>
                                                      <div className="info-table">
                                                        {messages.map((msg, idx) => (
                                                          <div className="info-row" key={idx}>
                                                            <span className="text-danger">{idx + 1}. {msg}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                      {renderPoaMessages(index, "EPF Pension Records", subCatName, memberId, companyName, poaData)}
                                                      <hr />
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      <hr />

                                      {/* Member-wise Claim Details */}
                                      {groupedClaims[memberId]?.length > 0 && (
                                       <div>
                                          <div className="table-responsive">
                                       <h3>Claims Data</h3>
                                            <table
                                              className="table table-bordered table-hover"
                                              style={{
                                                fontSize: "0.9rem",
                                                minWidth: "1000px",
                                                borderCollapse: "collapse",
                                              }}
                                            >
                                              <thead className="table-light">
                                                <tr>
                                                  <th className="px-3 py-2">#</th>
                                                  <th className="px-3 py-2">Claim ID</th>
                                                  <th className="px-3 py-2">Receipt Date</th>
                                                  <th className="px-3 py-2">Approved Date</th>
                                                  <th className="px-3 py-2">Form Type</th>
                                                  <th className="px-3 py-2">Description</th>
                                                  <th className="px-3 py-2">Claim Amount</th>
                                                  <th className="px-3 py-2">Rejection Date</th>
                                                  <th className="px-3 py-2">Rejection Reason</th>
                                                  <th className="px-3 py-2">Location</th>
                                                  <th className="px-3 py-2">Status</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {groupedClaims[memberId].map((claim, index) => (
                                                  <tr key={index}>
                                                    <td className="px-3 py-2">{index + 1}</td>
                                                    <td className="px-3 py-2">{claim.claimId}</td>
                                                    <td className="px-3 py-2">{claim.receiptDate}</td>
                                                    <td className="px-3 py-2">{claim.approvedDate || "N/A"}</td>
                                                    <td className="px-3 py-2">{claim.formType}</td>
                                                    <td className="px-3 py-2">{claim.claimDescription}</td>
                                                    <td className="px-3 py-2">{claim.totalAmount || "N/A"}</td>
                                                    <td className="px-3 py-2">{claim.rejectDate || "N/A"}</td>
                                                    <td className="px-3 py-2 text-danger">{claim.rejectionReason || "N/A"}</td>
                                                    <td className="px-3 py-2">{claim.location || "N/A"}</td>
                                                    <td className="px-3 py-2">
                                                      <span
                                                        style={{
                                                          display: "inline-block",
                                                          width: "4rem", // static width
                                                          textAlign: "center",
                                                          padding: "4px 8px",
                                                          borderRadius: "8px",
                                                          color: "white",
                                                          backgroundColor:
                                                            claim.status === "Settled"
                                                              ? "#28a745" // green
                                                              : claim.status === "Rejected"
                                                                ? "#dc3545" // red
                                                                : "#ffc107", // yellow for In Progress or other
                                                        }}
                                                      >
                                                        {claim.status}
                                                      </span>
                                                    </td>

                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <hr />
                                          </div>
                                        </div>
                                      )}

                                    </div>
                                  )}

                                </div>
                              )}
                             

                            </div>
                          );
                        })}

                      {/* common issue */}

                      {(employmentRecord?.errorMessages?.length > 0 || amountConsolidationErrors?.errorMessages?.length > 0) && (
                        <div className="section-card">
                          <h3 className="d-flex justify-content-between align-items-center" style={{ marginBottom: !kycOpen ? '-0.1rem' : '0', cursor: 'pointer' }} onClick={() => setCommonIssueOpen(!commonIssueOpen)}>
                            Common Issue
                            <button
                              className="btn btn-link p-0"
                              aria-expanded={commonIssueOpen}
                              aria-controls="commonIssueCollapse"
                            >
                              <i className={`bi ${commonIssueOpen ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                            </button>
                          </h3>
                          {commonIssueOpen && (
                            <>
                              <hr />
                              <div id="commonIssueCollapse" className="table-responsive">
                                <div className="w-100">
                                  {
                                    employmentRecord?.errorMessages?.length > 0 && (
                                      <>
                                        <h5 className="text-danger">🔴 Employment Record</h5>
                                        <div className="info-table">
                                          {employmentRecord?.errorMessages.map((msg: any, index: any) => (
                                            <div className="info-row" key={index}>
                                              <span className="text-danger">{index + 1}. {msg}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    )}

                                  {amountConsolidationErrors?.errorMessages?.length > 0 && (
                                    <>
                                      <h5 className={`text-danger ${employmentRecord?.errorMessages?.length > 0 ? 'mt-3' : 'mt-0'}`}>🔴 Amount Consolidation</h5>
                                      <div className="info-table">
                                        {amountConsolidationErrors?.errorMessages.map((msg: any, index: any) => (
                                          <div className="info-row" key={index}>
                                            <span className="text-danger">{index + 1}. {msg}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </>

                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {kycErrors?.length > 0 && (

                        <div className="section-card" style={{}}>
                          <h3 className="d-flex justify-content-between align-items-center" style={{ marginBottom: !kycOpen ? '-0.1rem' : '0', cursor: 'pointer' }} onClick={() => setKycOpen(!kycOpen)}>
                            KYC Details
                            <button
                              className="btn btn-link p-0"
                              aria-expanded={kycOpen}
                              aria-controls="kycCollapse"
                            >
                              <i className={`bi ${kycOpen ? "bi-chevron-up" : "bi-chevron-down"} fs-5`}></i>
                            </button>
                          </h3>
                          {kycOpen && (
                            <>
                              <hr />

                              <div id="kycCollapse" className="d-flex gap-3">
                                <div className="w-100">
                                  <h5 className="text-danger">🔴 Critical Error</h5>
                                  <div className="info-table">
                                    {kycErrors.map((msg: any, index: any) => (
                                      <div className="info-row" key={index}>
                                        <span className="text-danger">{index + 1}. {msg}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {showModal && (
                      <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          height: "100vh",
                          width: "100vw",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          zIndex: 9999,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <motion.div
                          className="modal-content"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                            padding: "2rem",
                            overflowY: "auto",
                            position: "relative"
                          }}
                        >
                          <button
                            className="btn btn-danger position-absolute top-0 end-0 m-3"
                            onClick={() => setShowModal(false)}
                          >
                            Close
                          </button>

                          {/* Your ServiceHistory component directly shown */}
                          <ServiceHistory jsonData={uanData} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>


                  <AnimatePresence>
                    {openPassbookFor && (
                      <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          height: "100vh",
                          width: "100vw",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          zIndex: 9999,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <motion.div
                          className="modal-content"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                            padding: "2rem",
                            overflowY: "auto",
                            position: "relative"
                          }}
                        >
                          <button
                            className="btn btn-danger position-absolute top-0 end-0 m-3"
                            onClick={() => setOpenPassbookFor(null)}
                          >
                            Close
                          </button>

                          {/*  Passbook only for selected memberId */}
                          <Passbook jsonData={uanData} memberId={openPassbookFor} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activeTab === 'sow' && (
                    <div className="sow-tab">
                      <SoW jsonData={uanData} reportData={reportData} durationDisplay={durationDisplay} />
                    </div>
                  )}
                          {(activeTab === "grievance" || activeTab === "claim") && (
                            <div className="sub-tabs-container">
                              <div className="tabs sub-tabs">
                                <button
                                  className={`tab ${activeTab === "grievance" ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTab("grievance");
                                    setClaimTracker(false);
                                  }}
                                >
                                  Grievance Tracker
                                </button>
                                <button
                                  className={`tab ${activeTab === "claim" ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTab("claim");
                                    setClaimTracker(true);
                                  }}
                                >
                                  Claim Tracker
                                </button>
                              </div>

                              <div className="sub-tab-content">
                                {activeTab === "grievance" && (
                                  <UanGrievanceList jsonData={uanData} />
                                )}
                                {activeTab === "claim" && (
                                  <UanClaimList jsonData={uanData} />
                                )}
                              </div>
                            </div>
                          )}
                </div>
                </>
              )}
              </div>

              {isModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{modalStage === "login" ? "User Login" : "Enter OTP"}</h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                      </div>

                      <div className="modal-body">
                        <div className="row justify-content-center align-items-center">
                          <div className="col-md-12">
                            {showLoader ? (
                              <div className="text-center my-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-3">{loaderText}</p>
                              </div>
                            ) : (
                              <>
                                {modalStage === "login" ? (
                                  <form onSubmit={handleSubmit(handleLoginSubmit)}>
                                    <div className="mb-3">
                                      <label className="form-label">UAN Number</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        {...register("uan")}
                                      />
                                    </div>

                                    <div className="mb-3">
                                      <label className="form-label">Password</label>
                                      <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter password"
                                        {...register("password", {
                                          required: "Password is required.",
                                          minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters long.",
                                          },
                                          validate: {
                                            upperCase: (value) =>
                                              /[A-Z]/.test(value) || "At least one uppercase required.",
                                            lowerCase: (value) =>
                                              /[a-z]/.test(value) || "At least one lowercase required.",
                                            specialChar: (value) =>
                                              /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Special character required.",
                                          },
                                        })}
                                      />
                                      {errors.password && (
                                        <span className="text-danger">{errors.password.message}</span>
                                      )}
                                    </div>

                                    <div className="text-center mt-4">
                                      <button type="submit" className="btn btn-primary px-4" disabled={!isValid}>
                                        {OTPBypassEnabled ? "Submit" : "Continue"}
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    <div className="mb-3">
                                      <label className="form-label">OTP</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={otpInput}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (/^\d{0,6}$/.test(value)) {  // only allow up to 6 digits
                                            setOtpInput(value);
                                          }
                                        }}
                                        placeholder="Enter OTP"
                                      />
                                      {otpInput && otpInput.length !== 6 && (
                                        <small className="text-danger">OTP must be exactly 6 digits</small>
                                      )}
                                    </div>

                                    <div className="text-center mt-4">
                                      <button className="btn btn-success px-4" onClick={handleOtpSubmit} disabled={otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)}>
                                        Submit OTP
                                      </button>
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {showMessage && (
                              <p className="text-center text-danger mt-3">{showMessage}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showOtpModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{ zIndex: 1040 }}
            >
              <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{otpStage === "mobile" ? "Enter Mobile Number" : "OTP Verification"}</h5>
                      <button type="button" className="btn-close" onClick={() => {
                        setShowOtpModal(false);
                        setOtpStage("mobile");
                        setMobileNumber("");
                        setOtp(Array(6).fill(""));
                        setTimer(0);
                        setShowLoader(false);
                      }} />
                    </div>

                    <div className="modal-body">
                      {otpStage === "mobile" ? (
                        <>
                          <label htmlFor="mobile" className="form-label">Registered Mobile Number</label>
                          <input
                            type="text"
                            className="form-control"
                            maxLength={10}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 10-digit mobile number"
                          />
                          {mobileNumber.length !== 10 && (
                            <p className="text-danger mt-1">Please enter a valid 10-digit mobile number</p>
                          )}
                          <div className="text-center mt-4">
                            <button
                              className="btn btn-primary px-4"
                              disabled={mobileNumber.length !== 10 || showLoader}
                              // onClick={async () => {
                              //   await handleGenerateOtp();
                              //   setOtpStage("otp");
                              //   setTimer(60);
                              //   setOtp(Array(6).fill(""));
                              // }}
                              onClick={handleVerifyAndGenerateOtp}
                            >
                              {showLoader ? "Sending..." : "Send OTP"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-3">Enter the OTP sent to <b>{mobileNumber}</b></div>
                          <div className="d-flex justify-content-center">
                            {otp.map((digit, index) => (
                              <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                id={`otp-input-${index}`}
                                className="form-control text-center mx-1"
                                style={{ width: "2.5rem", fontSize: "1.25rem" }}
                                onChange={(e) => handleOtpModalChange(e.target.value, index)}
                                onKeyDown={(e) => handleOtpModalBackspace(e, index)}
                              />
                            ))}
                          </div>

                          <div className="d-flex justify-content-center align-items-center mt-3">
                            <span className="text-muted">
                              {timer > 0 ? `OTP expires in ${timer}s` : "OTP expired"}
                            </span>
                            <button
                              className="btn btn-link p-0 ms-2"
                              disabled={timer > 0}
                              onClick={async () => {
                                await handleGenerateOtp();
                                setTimer(60);
                                setOtp(Array(6).fill(""));
                              }}
                            >
                              Resend OTP
                            </button>
                          </div>

                          <div className="text-center mt-4">
                            <button
                              className="btn btn-success px-5"
                              disabled={otp.some((digit) => digit === "") || showLoader}
                              onClick={handleConfirmOtp}
                            >
                              {showLoader ? "Verifying..." : "Verify OTP"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Grievance Form Modal */}
          {showAddGrievanceForm && (
            <div className="modal-overlay">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">Add New Grievance</h2>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddGrievance}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="uan" className="form-label">UAN Number *</label>
                          <input
                            id="uan"
                            className="form-control"
                            value={addGrievanceFormData.uan}
                            onChange={handleInputChangeGrievance}
                            placeholder="Enter 12-digit UAN"
                            maxLength={12}
                            disabled={!!addGrievanceFormData.uan}
                          />
                          {/* Show validation error (required/numeric/length) */}
                          {errorsAddGrievance.uan && <p className="text-danger mb-0">{errorsAddGrievance.uan}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="userName" className="form-label">User Name *</label>
                          <input
                            id="userName"
                            className="form-control"
                            value={addGrievanceFormData.userName}
                            placeholder="Enter full name"
                            onChange={handleInputChangeGrievance}
                            disabled={!!addGrievanceFormData.userName}
                          />
                          {errorsAddGrievance.userName && <p className="text-danger mb-0">{errorsAddGrievance.userName}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="mobileNumber" className="form-label">Mobile Number *</label>
                          <input
                            id="mobileNumber"
                            className="form-control"
                            value={addGrievanceFormData.mobileNumber}
                            onChange={handleInputChangeGrievance}
                            placeholder="Enter 10-digit mobile"
                            maxLength={10}
                          />
                          {errorsAddGrievance.mobileNumber && <p className="text-danger mb-0">{errorsAddGrievance.mobileNumber}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">Email ID *</label>
                          <input
                            id="email"
                            type="email"
                            className="form-control"
                            value={addGrievanceFormData.email}
                            onChange={handleInputChangeGrievance}
                            placeholder="Enter email address"
                          />
                          {errorsAddGrievance.email && <p className="text-danger mb-0">{errorsAddGrievance.email}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="grievanceId" className="form-label">Grievance ID *</label>
                            <Select
                              id="grievanceId"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              value={
                                grievanceOptions.find(option => option.value === addGrievanceFormData.grievanceId) || null
                              }
                              onChange={(selectedOption: any) => {
                                setAddGrievanceFormData((prev) => ({ ...prev, grievanceId: selectedOption.value }));
                                setErrorsAddGrievance((prev) => ({ ...prev, grievanceId: "" }));
                              }}
                              options={grievanceOptions}
                              isSearchable
                              placeholder="Select grievance ID"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ensures it's above modal
                                menu: (provided) => ({
                                  ...provided,
                                  overflowY: 'auto',
                                }),
                              }}
                            />


                          {errorsAddGrievance.grievanceId && <p className="text-danger mb-0">{errorsAddGrievance.grievanceId}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="grievanceNumber" className="form-label">Grievance Number *</label>
                          <input
                            id="grievanceNumber"
                            className="form-control"
                            value={addGrievanceFormData.grievanceNumber}
                            onChange={handleInputChangeGrievance}
                            placeholder="Enter grievance number"
                          />
                          {errorsAddGrievance.grievanceNumber && <p className="text-danger mb-0">{errorsAddGrievance.grievanceNumber}</p>}
                        </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="agent" className="form-label">Add Agent *</label>
                            <Select
                              id="agent"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              value={agentName.find((option: any) => option.value === addGrievanceFormData.agentName) || null}
                              onChange={(selectedOption: any) => {
                                setAddGrievanceFormData((prev) => ({ ...prev, agentName: selectedOption.value }));
                                setErrorsAddGrievance((prev) => ({ ...prev, agentName: "" }));
                              }}
                              options={agentName}
                              isSearchable
                              placeholder="Select an agent"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                menu: (provided) => ({
                                  ...provided,
                                  overflowY: 'auto',
                                  maxHeight: 300,
                                }),
                              }}
                            />
                            {errorsAddGrievance.agentName && <p className="text-danger mb-0">{errorsAddGrievance.agentName}</p>}
                          </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button type="button" onClick={() => {
                          resetGrievanceForm();       // ✅ Clear all fields
                          setShowAddGrievanceForm(false); // ✅ Close modal
                        }} className="btn btn-outline-secondary">
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Add Grievance
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>



          )}
          {/* Add Claim Form Modal */}
            <ClaimModal
              isOpen={showAddClaimForm}
              onClose={() => setShowAddClaimForm(false)}
              onSubmit={handleClaimSubmit}
              initialData={{
                uan: profiledata?.UAN || "",
                userName: profiledata?.fullName || "",
                mobileNumber: profiledata?.phone || "",
                email: profiledata?.email || "",
              }}
              agentName={agentName}
            />
        </>
      )}
    </SidebarLayout>
  );
};

export default SimpleEmployeeReport;
