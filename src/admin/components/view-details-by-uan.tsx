import React, { useEffect, useState, useMemo, useRef } from "react";
import { Eye } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import MESSAGES from "./../../components/constant/message";
import { login, post, downloadExcal, get, put } from "../../components/common/api"
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
import { ExtractMobile } from "../../components/common/extract-mobile";
import UanListModal from "./uanListModel";
import './style/view-details-by-uan.css'
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css
import { getTotalShare } from "../../components/common/data-transform";
import SidebarLayout from "../SidebarLayout";
import { trackClarityEvent } from "../../helpers/ms-clarity";
import { format } from "date-fns";
import ToastMessage from "../../components/common/toast-message";
// import Pfreport from "./pf-report";
interface ViewDetailsByUanProps {
    isFromArchive?: boolean;
    archiveData?: any;
  }

function ViewDetailsByUan({ isFromArchive = false, archiveData }: ViewDetailsByUanProps) {
    const otpLength = 6;
    const [, setValue] = useState("");
    // const [currentView, setCurrentView] = useState("parent");
    const [typingTimeout, setTypingTimeout] = useState<any>(null);
    const [, setUanData] = useState<any>(null)
    const [, setUserProfileData] = useState<any>(null)
    const [loading, setLoading] = useState<any>(false);
    const [uanList, setUanList] = useState<any>([]);
    const [searchUAN, setSearchUAN] = useState<any>('');
    const [otpValues, setOtpValues] = useState<any>(Array(otpLength).fill(""));
    const [timer, setTimer] = useState(45);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [, setShowUanDetails] = useState<any>(false);
    const [isFirstModalOpen, setIsFirstModalOpen] = useState<any>(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState<any>(false);
    const [formData, setFormData] = useState<any>(null);
    const [loaderText, setLoaderText] = useState("Fetching Data, Please wait...");
    const [showMessage, setShowMessage] = useState('');
    const isBtnAssessmentEnabled = otpValues.every((field: any) => field !== "");
    const [hideOtpExpireTimer, sethideOtpExpireTimer] = useState<any>(false);
    const [showBlur, setShowBlur] = useState<any>(false);
    const [showOtpBoxes, setShowOtpBoxes] = useState<any>(true);
    const [isUanModalOpen, setIsUanModalOpen] = useState<any>(false);
    const [sourceFilter, setSourceFilter] = useState<any>("");
    const [paymentFilter, setPaymentFilter] = useState<any>("");
    const [activeSearch, setActiveSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        Date: '',
        Source: '',
        payment: ''
    });
    // const [filterList, setFilterList] = useState<any>([]);
    const [searchField, setSearchField] = useState("UAN");
    const [activeField, setactiveField] = useState("");
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const moreOptionsRef = useRef<HTMLDivElement | null>(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: undefined,
            endDate: undefined,
            key: "selection",
        },
    ]);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement | null>(null);
    const [credentials, setCredentials] = useState<any>({ uan: "", password: "" })
    const skipNextPageEffectRef = useRef(false);
    const [isOtpBypassEnabled, setIsOtpBypassEnabled] = useState(false);
    const [modelLoader, setModelLoader] = useState(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [toastMessage, setToastMessage] =useState({content: "", type: "" })
    useEffect(() => {
        if (isFromArchive && archiveData) {
            setIsProcessing(true);
            try {
                // Simulate API call delay
                const timer = setTimeout(() => {
                    setUanData(archiveData);
                    setValue(archiveData?.meta?.uan);
                    setIsProcessing(false);
                    navigate('/operation/view-details', {
                        state: {
                          uanData: archiveData,
                          isFromArchive: true,
                          value: archiveData?.meta?.uan
                        },
                      });
                }, 1000);
                
                return () => clearTimeout(timer);
            } catch (error) {
                console.error("Error processing archive data:", error);
                setIsProcessing(false);
            }
        } else {
            setLoading(false);
        }
    }, [isFromArchive, archiveData]);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
            if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
                setShowMoreOptions(false); // Close the dropdown
            }
        };
        if (moreOptionsRef) {
            document.addEventListener("mousedown", handleClickOutside); // Add event listener  
        }
        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden"; // Prevent scrolling
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar, moreOptionsRef]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: { uan: "", password: "" },
        shouldUnregister: true,
    });

    const navigate = useNavigate();
    // const handleBackButtonClick = () => {
    //     if(isFromArchive){
    //         navigate("/operation/archived-module");
    //     }else{
    //         setShowUanDetails(false);
    //     }
    // };

    React.useEffect(() => {
        let interval: any;
        if (isSecondModalOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval); // Cleanup on component unmount or re-render
    }, [isSecondModalOpen, timer]);

    const handleOtpChange = (value: any, index: any) => {
        if (!/^\d*$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value.slice(-1);
        setOtpValues(newOtpValues);
        if (value && index < otpLength - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleBackspace = (e: any, index: any) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handleChange = (uanNuber: any) => {
        if (/^\d*$/.test(uanNuber)) {
            setValue(uanNuber);
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            setShowUanDetails(true);
            const timeout = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await get(`/admin/data/${uanNuber}`)
                    if (response.status === 401) {
                        setLoading(false);
                        localStorage.clear()
                        setShowUanDetails(false);
                        navigate('/operation/login');
                    }
                    else {
                        setUanData(response.rawData);
                        setUserProfileData(response.profileData)
                        navigate('/operation/view-details', {
                            state: {
                              uanData: response.rawData,
                              profileData: response.profileData,
                            },
                          });
                    }
                }
                catch (error: any) {
                    setUanData(null);
                    setShowUanDetails(false);
                  
                    let userMessage = "Something went wrong. Please try again later.";
                  
                    // If the backend includes a message in the 500 error
                    const serverErrorMessage = error?.response?.data?.error;

                    if (error?.response?.status === 500 && serverErrorMessage) {
                        if (serverErrorMessage.toLowerCase().includes("failed to fetch and clean data")) {
                            userMessage = "No data found for this UAN.";
                        } else {
                            userMessage = serverErrorMessage;
                        }
                    }
                    // Show toast instead of alert
                    setToastMessage({ content: userMessage, type: "error"});
                  }
                finally {
                    setLoading(false); // Stop showing the loading screen
                    // setToastMessage({ content: '', type: '' });
                }
            }, 0);
            setTypingTimeout(timeout);
        }
    };

    const formatDate = (date: any) => {
        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset()); // Adjust for timezone
        return newDate.toISOString().split('T')[0]; // Get only the YYYY-MM-DD part
    };

    const fetchUanList = async (
        page = currentPage,
        search = activeSearch,
        field = activeField,
        filters = activeFilters
    ) => {
        const filter = {
            Date: filters.Date ||
                (dateRange[0]?.startDate && dateRange[0]?.endDate
                    ? `${formatDate(dateRange[0].startDate)} - ${formatDate(dateRange[0].endDate)}`
                    : ''),
            Source: filters.Source,
            payment: filters.payment,
        };

        setLoading(true);
        setLoaderText('Loading data, please wait...');

        try {
            const dataToSend = {
                page: page || 1,
                itemsPerPage,
                search,
                filter,
                field
            }
            const result = await post("admin/uan-details", dataToSend);
            if (result.status === 401) {
                localStorage.clear();
                navigate('/operation/login');
            } else {
                setUanList(result?.data?.data);
                setTotalItems(result?.data?.totalCount);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
            setLoaderText('');
            setUanList([null]);
        }
        finally {
            setLoading(false);
            setLoaderText('');
        }
    };
    useEffect(() => {
        if (isFromArchive) return;
        if (skipNextPageEffectRef.current) {
            skipNextPageEffectRef.current = false; // Reset the flag
            return;
        }
        fetchUanList(currentPage, searchUAN, searchField, activeFilters);
    }, [currentPage]);


    const handleDateChange = (ranges: any) => {
        setDateRange([ranges.selection]);
    };

    const handleSourceChange = (e: any) => {
        setSourceFilter(e.target.value);
    };

    const handlePaymentChange = (e: any) => {
        setPaymentFilter(e.target.value);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getVisiblePages = () => {
        if (totalItems < 9) return [];

        if (totalItems <= 20) {
            return [1, 2];
        }

        if (totalItems <= 30) {
            return [1, 2, 3];
        }
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage === 1) {
            return [1, 2, 3];
        } else if (currentPage === totalPages) {
            return [totalPages - 2, totalPages - 1, totalPages];
        } else {
            return [currentPage - 1, currentPage, currentPage + 1];
        }
    };

    const visiblePages = getVisiblePages();

    const handlePageChange = async (page: any) => {
        setCurrentPage(page);
    };

    const fetchSearchResults = async (input: any, field: any) => {
        setSearchUAN(input);
        setLoading(true);
        setLoaderText('Please wait.. fetching records');

        try {
            if (input === "") {
                // If the search input is cleared, still use the active filters
                setCurrentPage(1);
                await fetchUanList(1, "", "", activeFilters); // Fetch data using active filters
            } else {
                // If input is provided, search and apply filters
                const dataToSend = {
                    page: currentPage,
                    itemsPerPage,
                    search: input,
                    filter: activeFilters,
                    field
                }
                const result = await post("admin/uan-details", dataToSend);
                if (result.status === 401) {
                    localStorage.clear();
                    navigate('/operation/login');
                } else {
                    setUanList(result?.data?.data);
                    setTotalItems(result?.data?.totalCount);
                    setCurrentPage(1);
                }
            }
        } catch (err) {
            setUanList([{ uan: input, error: "Data found, but unable to retrieve details due to a server issue." }]);
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
            setLoaderText('');
        }
    };

    const debouncedFetch = useMemo(() => debounce((input, field) => fetchSearchResults(input, field), 1500), []);

    const handleSearch = async (e: any) => {
        const input = e.target.value.trim();
        setSearchUAN(input); // Set search value
        debouncedFetch(input, searchField);  // Call the debounced fetch function
    };

    // Cleanup debounce when component unmounts
    React.useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    const handleOpenFirstModal = () => {
        setIsFirstModalOpen(true);
        setShowBlur(true);
        setTimeout(() => {
            reset({ uan: "", password: "" });
            setShowMessage("");
        }, 0);
    };

    useEffect(() => {
        if (!isFirstModalOpen) {
            reset({ uan: "", password: "" });
            setShowMessage("");
        }
    }, [isFirstModalOpen, reset]);

    const [showmobikwickCalendar, setShowmobikwickCalendar] = useState(false);
    const [showCmpfCalendar, setShowCmpfCalendar] = useState(false);
    const [selectdateRange, setSelectDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [selectCmpfdateRange, setSelectCmpfDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    // const calendarRef = useRef(null);

    const handleDateChange1 = (ranges: any) => {
        setSelectDateRange([ranges.selection]);
    };

    const handleDateChange2 = (ranges: any) => {
        setSelectCmpfDateRange([ranges.selection]);
    };

    const handleClickOutside = (event: any) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target)) {
            setShowmobikwickCalendar(false);
        }
    };

    const handleDownload = async () => {
        setLoading(true)
        const start = selectdateRange[0].startDate;
        const end = selectdateRange[0].endDate;

        const from = format(start, "yyyy-MM-dd");
        const to = format(end, "yyyy-MM-dd");

        try {
            const response: any = await downloadExcal('v1/downloadMobikwickLogsExcel', { startDate: from, endDate: to }, { responseType: 'blob' });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Mobikwik_Logs.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false)
        } catch (err) {
            setLoading(false)
            console.error("Failed to download Excel", err);
        }
    };

    const handleDownloadCmpf = async () => {
        setLoading(true)
        const start = selectCmpfdateRange[0].startDate;
        const end = selectCmpfdateRange[0].endDate;

        const from = format(start, "yyyy-MM-dd");
        const to = format(end, "yyyy-MM-dd");
        try {
            const response: any = await downloadExcal('v1/downloadCmpfLogsExcel', { startDate: from, endDate: to }, { responseType: 'blob' });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `CMPF_data.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false)
        } catch (err) {
            setLoading(false)
            console.error("Failed to download Excel", err);
        }
    }

    // const fetchScrapStats = async() => {        
    //     const scrapResult = await get('/data/scrap/hourlySummary')
    //     setScrapStatsResult(scrapResult)
    // }

    useEffect(() => {
        // fetch scrap stats 
        // fetchScrapStats()
        getToggleValue();
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    const handleCloseFirstModal = () => {
        setIsFirstModalOpen(false);
        setShowBlur(false)
    };

    const handleCloseSecondModal = () => {
        setIsSecondModalOpen(false);
        sethideOtpExpireTimer(false);
        setShowBlur(false)
    };

    const handleCloseUanModal = () => {
        setIsUanModalOpen(false);
        setShowBlur(false);
    };

    const handleFilterClick = async () => {
        const filters = {
            Date: dateRange[0]?.startDate && dateRange[0]?.endDate
                ? `${formatDate(dateRange[0].startDate)} - ${formatDate(dateRange[0].endDate)}`
                : '',
            Source: sourceFilter,
            payment: paymentFilter
        };
        setActiveFilters(filters);  // Set the active filters
        setActiveSearch(searchUAN); // Keep the current search term
        setactiveField(searchField)

        skipNextPageEffectRef.current = true;  // Prevent useEffect on next currentPage update
        setCurrentPage(1);
        try {
            await fetchUanList(1, searchUAN, searchField, filters); // Fetch data with filters
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false); // Hide the loader
            setLoaderText(''); // Clear loader text
        }
    };

    const resetFilters = () => {
        const emptyFilters = {
            Date: '',
            Source: '',
            payment: ''
        };

        setSourceFilter('');
        setPaymentFilter('');
        setDateRange([{ startDate: undefined, endDate: undefined, key: 'selection' }]);
        setSearchUAN('');
        setCurrentPage(1);
        setActiveSearch('');
        setactiveField('');
        setActiveFilters(emptyFilters);
        skipNextPageEffectRef.current = false
        fetchUanList(1, '', '', emptyFilters); // Reset everything and fetch data with no search and empty filters
    };

    const handleRendOtpClick = async () => {
        if (formData) {
            setShowMessage("Please wait...Resend OTP");
            await onSubmit(formData);
            sethideOtpExpireTimer(true);
            setTimer(45);
        }
    };

    const getToggleValue = async () => {
        try {
          const response = await get("/data/toggle/keys");
          const otpByPassToggle = response?.allTogglers?.find((item:any) => item.type === "otp-bypass");
          setIsOtpBypassEnabled(otpByPassToggle?.isEnabled);
        } catch (err) { }
      }

    const otpSubmit = async () => {
        setShowMessage("");
        if (!otpValues.every((digit: any) => digit)) {
            setShowMessage(MESSAGES.error.invalidOtp);
            return;
          }
        setShowMessage("Please wait...verifying OTP");
        setModelLoader(true);
        if (otpValues.every((digit: any) => digit)) {
            try {
                const endpoint = "auth/submit-otp"
                const mobile_number = ""
                const result = await post(endpoint, { otp: otpValues.join(''), source: 'agent', uan: credentials.uan, password: credentials.password, mobile_number });
                if (result.status === 400) {
                    // setLoading(false);
                    // setLoaderText('');
                    setShowMessage(result.message);
                    setOtpValues(Array(6).fill(""));
                    sethideOtpExpireTimer(false);
                    return
                } else {
                    // setLoading(false);
                    // setLoaderText('');
                    setShowMessage("User added successfully!!")
                    setOtpValues(Array(6).fill(""));
                    setShowOtpBoxes(false)
                    sethideOtpExpireTimer(false);
                    setTimeout(() => {
                        setIsSecondModalOpen(false);
                        setShowBlur(false);
                        fetchUanList();
                    }, 5000);
                }

            } catch (error: any) {
                // setLoading(false);
                // setLoaderText('');
                const isNetworkError = error?.code === "ERR_NETWORK";
                setShowMessage(
                    isNetworkError
                      ? "Network error. Please check your internet connection."
                      : error?.message || MESSAGES.error.generic
                  );
                setOtpValues(Array(6).fill(""));
                sethideOtpExpireTimer(false);
            } finally {
                setModelLoader(false);
                setLoaderText('');
              }
        } 
    }
    const onSubmit = async (data: any) => {
        // setShowMessage("");
        if (!data.uan || !data.password) return;
      
        try {
          setModelLoader(true);
          setCredentials({ uan: data?.uan, password: data?.password });
      
          const result = await login(data?.uan, data?.password.trim(), "");
      
          if (result.status === 400) {
            setModelLoader(false);
            setShowMessage(result.message);
            
            sethideOtpExpireTimer(false);
            return;
          }
      
          let retries = 0;
          const maxRetries = 60;
          const pollInterval = 3000;
      
          const pollStatus = async () => {
            try {
              const loginStatusResponse = await get(`/auth/login-status?uan=${data.uan}`);
      
              if (loginStatusResponse?.data?.status === "success") {
                setTimeout(() => {
                    setModelLoader(false);
                  if (isOtpBypassEnabled) {
                    handleByPassOtp(data.uan);
                  } else {
                    trackClarityEvent(MESSAGES.ClarityEvents.SCRAPPER_OTP_SENT);
                    ExtractMobile(result.message);
                    setIsFirstModalOpen(false);
                    setIsSecondModalOpen(true);
                    setShowBlur(true);
                    setTimer(45);
                    setOtpValues(Array(6).fill(""));
                    sethideOtpExpireTimer(true);
                    setShowMessage('');
                    setFormData(data)
                  }
                }, 1000);
              } else if (loginStatusResponse?.data?.status === "failed") {
                setModelLoader(false);
                setShowMessage(loginStatusResponse?.data?.message || MESSAGES.error.generic);
                if (loginStatusResponse?.data?.statusCode >= 500) {
                  setIsFirstModalOpen(false);
                }
              } else {
                if (++retries < maxRetries) {
                  setTimeout(pollStatus, pollInterval);
                } else {
                  setIsFirstModalOpen(false);
                  setShowMessage("Login timed out. Please try again later.");
                  setModelLoader(false);
                  // Optional: navigate("/epfo-down");
                }
              }
            } catch (err: any) {
              setModelLoader(false);
              setShowMessage(err?.message || "Something went wrong. Please try again later.");
            }
          };
      
          pollStatus();
        } catch (error: any) {
          setModelLoader(false);
          setShowMessage(error?.status === 401 ? "Invalid Credentials" : error?.message || MESSAGES.error.generic);
        }
      };
      

    const handleByPassOtp = async (uan: any) => {
        try {
            // to update the password
            await put('auth/update-profile', { uan, password: credentials.password });

            // call fetch data by UAN api 
            const responseUan = await get('/data/fetchByUan/' + uan);

            if (responseUan?.rawData?.data?.error && responseUan.rawData.data.error.trim() !== "") {
                const errorMsg = "Password Expired!! Please reset on EPFO portal and try again re-login here after 6 hrs post resetting the password";
                setShowMessage(errorMsg);
                setModelLoader(false);
                setIsFirstModalOpen(false);
                return;
            }
            if (!responseUan) {
                setModelLoader(false);
                setShowMessage(MESSAGES.error.generic);
            } else {
                setModelLoader(false);
                if (!responseUan?.rawData?.data?.home || !responseUan?.rawData?.data?.serviceHistory?.history || !responseUan?.rawData?.data?.passbooks || !responseUan?.rawData?.data?.profile || !responseUan?.rawData?.data?.claims) {
                    setShowMessage("Seems like there is some issue in getting your data from EPFO. Please try again later!!");
                    return
                }
                setShowMessage("User added successfully!!")
                setTimeout(() => {
                    setIsFirstModalOpen(false);
                    setShowBlur(false);
                    fetchUanList();
                }, 5000);
            }
        } catch (error: any) {
            setModelLoader(false)
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                console.warn('Server Connection Error:', {
                    error: error.message,
                    code: error.code
                });
                setShowMessage('Server connection failed. Please check your connection.');
                return;
            }

            // Handle specific status codes
            switch (error.status) {
                case 503:
                    if (error?.errorCode === "SCRAPPER_DOWN") {
                        setShowMessage("Service is temporarily unavailable. Please try again later.");
                    } else if (error?.errorCode === "NETWORK_ERROR") {
                        setShowMessage("Unable to connect to the service. Please check your connection.");
                    } else {
                        setShowMessage("Service is unavailable. Try again later.");
                    }
                    return;
        
                case 500:
                    setShowMessage("An internal server error occurred. Please try again later.");
                    return;
        
                case 400:
                    setShowMessage(MESSAGES.error.invalidOtpServer);
                    return;
        
                default:
                    setShowMessage(error.message || MESSAGES.error.generic);
                    return;
            }
        }
    };

    const getTotalPassbookBalance = (passbook: any) => {
        const passbookData = getTotalShare(passbook);
        if (passbookData && passbookData.totalBalance) {
            return passbookData.totalBalance;
        } else {
            return "₹ 0";
        }
    };
    return (
        <>
         <SidebarLayout>
            {loading || isProcessing ? (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                    <div className="text-center p-4 bg-white rounded shadow">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">{loaderText}</p>
                    </div>
                </div>
            ) : (             
                <div className="container">
                        <>{toastMessage && (
              <ToastMessage
                message={toastMessage.content}
                type={toastMessage.type}
              />
            )}
                            <div className="row " style= {{ marginLeft: "1.5rem" }}>
                                <div className="col-md-9 offset-md-1 mt-5">
                                    <div className="row d-flex align-items-center">
                                        
                                        <div className="col-md-8">
                                            <div className="position-relative" >
                                                {/* Input box */}
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search By"
                                                    aria-label="Search"
                                                    value={searchUAN}
                                                    onChange={handleSearch}
                                                    style={{
                                                        paddingLeft: "8.125rem",
                                                        minHeight: "2.3rem",
                                                    }}
                                                />

                                                {/* Select inside input */}
                                                <select
                                                    value={searchField}
                                                    onChange={(e) => setSearchField(e.target.value)}
                                                    className="form-select"
                                                    style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "10px",
                                                        transform: "translateY(-50%)",
                                                        width: "6.875rem",
                                                        height: "70%",
                                                        backgroundColor: "#f8f9fa", // light background
                                                        padding: "0 10px",
                                                        fontSize: "14px",
                                                        border: "none",
                                                        borderRadius: "0.375rem",
                                                        zIndex: 2, // higher than input
                                                        appearance: "none",
                                                        pointerEvents: "auto",
                                                    }}
                                                >
                                                    <option value="UAN">UAN</option>
                                                    <option value="Mobile">Mobile</option>
                                                    <option value="Name">Name</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex w-100 gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded mobile-btn-style w-50 same-height-btn"
                                                    onClick={handleOpenFirstModal}
                                                >
                                                    Add User
                                                </button>

                                                <div className="position-relative w-50 mt-3 mt-sm-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary w-100 same-height-btn"
                                                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                                                    >
                                                        More Options
                                                    </button>

                                                    {showMoreOptions && (
                                                        <div
                                                            ref={moreOptionsRef}
                                                            className="position-absolute mt-2 border p-3 bg-light rounded shadow"
                                                            style={{
                                                                maxWidth: "24rem",
                                                                zIndex: 1000,
                                                                top: "100%",
                                                                left: 0
                                                            }}
                                                        >
                                                            <div className="position-relative mb-2 responsive-nowrap">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary w-100"
                                                                    onClick={() => setShowmobikwickCalendar(!showmobikwickCalendar)}
                                                                >
                                                                    Download Mobikwik MIS
                                                                </button>
                                                                {showmobikwickCalendar && (
                                                                    <div
                                                                        ref={calendarRef}
                                                                        className="position-absolute bg-white p-3 shadow rounded"
                                                                        style={{
                                                                            zIndex: 1000,
                                                                            top: "100%",
                                                                            left: 0,
                                                                            width: "100%",
                                                                        }}
                                                                    >
                                                                        <DateRange
                                                                            editableDateInputs={true}
                                                                            onChange={handleDateChange1}
                                                                            moveRangeOnFirstSelection={false}
                                                                            ranges={selectdateRange}
                                                                        />
                                                                        <button
                                                                            className="btn btn-primary btn-sm mt-2"
                                                                            onClick={() => {
                                                                                setShowmobikwickCalendar(false);
                                                                                handleDownload();
                                                                            }}
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="position-relative responsive-nowrap">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary w-100"
                                                                    onClick={() => setShowCmpfCalendar(!showCmpfCalendar)}
                                                                >
                                                                    CMPF MIS
                                                                </button>
                                                                {showCmpfCalendar && (
                                                                    <div
                                                                        ref={calendarRef}
                                                                        className="position-absolute bg-white p-3 shadow rounded"
                                                                        style={{
                                                                            zIndex: 1000,
                                                                            top: "100%",
                                                                            left: 0,
                                                                            width: "100%",
                                                                        }}
                                                                    >
                                                                        <DateRange
                                                                            editableDateInputs={true}
                                                                            onChange={handleDateChange2}
                                                                            moveRangeOnFirstSelection={false}
                                                                            ranges={selectCmpfdateRange}
                                                                        />
                                                                        <button
                                                                            className="btn btn-primary btn-sm mt-2"
                                                                            onClick={() => {
                                                                                setShowCmpfCalendar(false);
                                                                                handleDownloadCmpf();
                                                                            }}
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="row mt-3 align-items-end mb-4">
                                        <div className="col-md-8">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    {/* <label className="fw-bold">Filter by Date</label> */}
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        readOnly
                                                        value={
                                                            dateRange[0]?.startDate && dateRange[0]?.endDate
                                                                ? `${formatDate(dateRange[0].startDate)} - ${formatDate(dateRange[0].endDate)}`
                                                                : 'Filter by Date'
                                                        }
                                                        onClick={() => setShowCalendar(true)}
                                                    />

                                                    {showCalendar && (
                                                        <div
                                                            ref={calendarRef}
                                                            className="position-absolute bg-white p-3 shadow rounded"
                                                            style={{
                                                                zIndex: 1000,
                                                                top: "100%",
                                                                left: 0,
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <DateRange
                                                                editableDateInputs={true}
                                                                onChange={handleDateChange}
                                                                moveRangeOnFirstSelection={false}
                                                                ranges={dateRange}
                                                            />
                                                            <button className=" btn btn-primary btn-sm mt-2" onClick={() => setShowCalendar(false)}>
                                                                Done
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-4 my-2 my-sm-0">
                                                    <select
                                                        className="form-select"
                                                        value={sourceFilter} onChange={handleSourceChange}
                                                    >
                                                        <option value="">Filter by Balance</option>
                                                        <option value="Less than 50,000">Less than 50,000</option>
                                                        <option value="50,000-1,00,000">50,000-1,00,000</option>
                                                        <option value="More than 1,00,000">more than 1,00,000</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <select
                                                        className="form-select"
                                                        value={paymentFilter} onChange={handlePaymentChange}
                                                    >
                                                        <option value="">Filter by Status</option>
                                                        <option value="Authenticated">Authenticated</option>
                                                        <option value="Passbook Only">Passbook Only </option>
                                                        <option value="Full Report Generated">Full Report Generated </option>
                                                        <option value="Scrapping Issue">Scrapping Issue</option>
                                                        <option value="N/A">N/A</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mt-3 mt-sm-0">
                                            <div className="d-flex gap-2 w-100">
                                                <button className="btn btn-secondary w-50 same-height-btn" onClick={handleFilterClick}>Filter</button>
                                                <button className="btn btn-danger w-50 same-height-btn" onClick={resetFilters}>Reset</button>
                                            </div>
                                        </div>
                                    </div>

                                    {uanList?.length > 0 ? (
                                        uanList?.map((item: any, index: any) => (
                                            <div className="card mb-2" key={index}>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <p><strong>UAN Number :</strong> {item?.uan}</p>
                                                        </div>
                                                        {item?.error ? (
                                                            <div className="col-md-12">
                                                                <p className="text-danger"><strong>Error:</strong> {item?.error}</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="col-md-4">
                                                                    <p><strong>Name:</strong> {item?.fullName}</p>
                                                                </div>
                                                                {/* <div className="col-md-4">
                                                                    <p>
                                                                        <strong >Payment Status :</strong>
                                                                        <span className={`ms-1 ${item.profileData?.isPaymentDone === true ? "text-success" : "text-danger"}`}>
                                                                            {item.profileData?.isPaymentDone === true ? "Done" : "Pending"}
                                                                        </span>
                                                                    </p>
                                                                </div> */}

                                                                <div className="col-md-4">
                                                                    <p><strong>Total Balance :</strong> {getTotalPassbookBalance(item.passbook)}</p>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <p><strong>Date :</strong> {new Date(item?.date).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="col-md-4 ">
                                                                    <p>
                                                                        <strong >UAN Add Source :</strong> {item.profileData?.latestProfile?.source && item?.profileDat?.latestProfile?.source.toLowerCase() !== "user" ? item?.profileData?.latestProfile?.source.charAt(0).toUpperCase() + item?.profileData?.latestProfile?.source.slice(1) : "User"}
                                                                    </p>

                                                                </div>
                                                                <div className="col-md-4 ">
                                                                    <p>
                                                                            <strong >User Status :</strong> {item.profileData?.latestProfile?.userStatus?.toLowerCase() === 'passbook only'
                                                                                ? "Partial Report Generated"
                                                                                : item.profileData?.latestProfile?.userStatus || "Authenticated"}
                                                                    </p>

                                                                </div>
                                                                <div className="col-md-11 d-flex justify-content-center align-items-center">
                                                                    <a href="#" onClick={() => handleChange(item?.uan)} className="me-2 cursor-pointer">
                                                                        <span>View All Details</span>
                                                                    </a>
                                                                    <Eye
                                                                        size={20}
                                                                        onClick={() => handleChange(item?.uan)}
                                                                        className="cursor-pointer"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) :
                                        <table className="table table-hover">
                                            <tbody><tr><td className="text-center">No Data Found!!</td></tr></tbody>
                                        </table>
                                    }
                                    {totalItems > 10 && (
                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination justify-content-end">
                                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {visiblePages.map((page) => (
                                                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(page)}>
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}



                                </div>
                            </div>
                        </>
                    {/* )} */}
                </div>
                
            )}
             </SidebarLayout>
            {/* {showBlur && <div className={`custom-modal-overlay ${isFirstModalOpen ? "active" : ""}`} />} */}
            {showBlur && <div className="custom-modal-overlay active" />}

            <UanListModal isOpen={isUanModalOpen} onClose={handleCloseUanModal} />
            {modelLoader && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1060, // Bootstrap modal is z-index: 1055
                    }}
                >
                    <div className="text-center p-4 bg-white rounded shadow">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 mb-0">{"Verifying credentials and fetching details, please wait..."}</p>
                    </div>
                </div>
            )}
            {isFirstModalOpen && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New User</h5>
                                <button type="button" className="btn-close" onClick={handleCloseFirstModal} ></button>
                            </div>

                            <div className="modal-body">
                                <div className="row justify-content-center align-items-center">
                                    <div className="col-md-12">
                                        <div
                                            style={{
                                                filter: modelLoader ? 'blur(3px)' : 'none',
                                                pointerEvents: modelLoader ? 'none' : 'auto',
                                                transition: 'filter 0.3s ease-in-out',
                                            }}
                                        >
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                <div className="mb-3">
                                                    <label htmlFor="exampleInput" className="form-label">
                                                        UAN Number
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Enter your 12 digit UAN number"
                                                        maxLength={12}
                                                        required
                                                        {...register("uan", {
                                                            required: "UAN number is required",
                                                            pattern: {
                                                                value: /^\d{12}$/,
                                                                message: "Number must be exactly 12 digits",
                                                            }
                                                        })}
                                                        onInput={(e: any) => {
                                                            e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                        }}
                                                    />
                                                    {errors.uan && <span className="text-danger">{errors.uan.message}</span>}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="exampleInput" className="form-label">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="exampleInput"
                                                        autoComplete="off"
                                                        placeholder="Enter password"
                                                        {...register("password", {
                                                            required: "Password is required.",
                                                            minLength: {
                                                                value: 8,
                                                                message: "Password must be at least 8 characters long.",
                                                            },
                                                            validate: {
                                                                upperCase: (value) =>
                                                                    /[A-Z]/.test(value) || "Password must contain at least one uppercase letter.",
                                                                lowerCase: (value) =>
                                                                    /[a-z]/.test(value) || "Password must contain at least one lowercase letter.",
                                                                specialCharacter: (value) =>
                                                                    /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                                                                    "Password must contain at least one special character.",
                                                            },
                                                        })}
                                                    />
                                                    {errors.password && <span className="text-danger">{errors.password.message}</span>}
                                                </div>
                                                <div className='text-center mt-5'>
                                                    <button className="pfRiskButtons py-2 px-5" disabled={!isValid} type="submit">{isOtpBypassEnabled ? "Submit" : "Continue"}</button>
                                                </div>
                                            </form>

                                        </div>

                                        <p className="text-center text-danger mt-3">
                                            {showMessage === 'User added successfully!!' ? <span className="text-success">User added successfully!!</span> : showMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            )}

            {/* Second Modal */}
            {showBlur && <div className={`custom-modal-overlay ${isSecondModalOpen ? "active" : ""}`} />}
            {isSecondModalOpen && (
                <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">OTP Verification</h5>
                                <button type="button" className="btn-close" onClick={handleCloseSecondModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="otpLabel mt-2 mt-lg-5 pt-lg-5">
                                    Enter OTP sent to your EPF registered number
                                </div>
                                <div
                                    style={{
                                        filter: modelLoader ? 'blur(3px)' : 'none',
                                        pointerEvents: modelLoader ? 'none' : 'auto',
                                        transition: 'filter 0.3s ease-in-out',
                                    }}
                                >
                                    <form onSubmit={handleSubmit(otpSubmit)}>
                                        <div className="d-flex">
                                            {Array.from({ length: otpLength }).map((_, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-input-${index}`}
                                                    type="number"
                                                    maxLength={1}
                                                    autoComplete='off'
                                                    name='otp'
                                                    style={{ height: '3.5rem', fontSize: '1.5rem' }}
                                                    className={`otpInput form-control text-center mx-1 mt-2 ${!showOtpBoxes ? 'disabled-input' : ''}`}
                                                    value={otpValues[index]}
                                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                                    onKeyDown={(e) => handleBackspace(e, index)}
                                                    aria-label={`OTP input ${index + 1}`}
                                                    disabled={!showOtpBoxes}
                                                />
                                            ))}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <p
                                                className="text-danger mb-0"
                                                style={{ visibility: hideOtpExpireTimer ? "visible" : "hidden" }}>
                                                {timer > 0 ? `OTP expires in ${timer} seconds.` : "OTP expired"}
                                            </p>
                                            <a
                                                className={`text-decoration-none labelSubHeading float-end mt-2 ${(timer > 0) ? 'disabled-link' : ''}`}
                                                style={{ cursor: (timer > 0) ? "not-allowed" : "pointer" }}
                                                onClick={(timer > 0) ? undefined : handleRendOtpClick}
                                            >
                                                Resend OTP
                                            </a>
                                        </div>

                                        <div className='text-center mt-5'>
                                            <button className="pfRiskButtons py-2 px-5"
                                                disabled={!isBtnAssessmentEnabled || timer < 1}
                                            >
                                                Verify Number
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <p className="text-center mt-3">
                                    {showMessage === 'User added successfully!!' ? <span className="text-success">User added successfully!!</span> :
                                        <span className="text-danger">{showMessage}</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ViewDetailsByUan;