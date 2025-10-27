import { useEffect, useState } from "react";
import { decryptData, encryptData } from "../../common/encryption-decryption";
import { ZohoLeadApi } from "../../common/zoho-lead";
import { CustomButton, TitleSubtitleBlock } from "./common/helpers";
import { get, post } from "../../common/api";
import ToastMessage from "../../common/toast-message";
import { useLocation, useNavigate } from "react-router-dom";
import LoaderCard from "./common/loader-card";
import EmployementStatusModel from "../../dashboard/Models/employementStatusModel";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingCalendryBook from "../../dashboard/Models/onboardingCalendryBook";
import { CalendlySlider } from "../../dashboard/Models/CalendlySliderModel";
import CallBookedSliderStatus from "../../dashboard/Models/onboardingCallBookingStatus";
import { formatToISO } from "../../../helpers/dates-convertor";
import OnboardingPayment from "../../dashboard/Models/onboardingPayment";
import BookingFaildSlider from "../../dashboard/Models/bookingFaildSlider";

const helpOptions = [
  {
    id: 1,
    key: "Withdraw Funds",
    heading: "Provident fund Withdrawal",
    description: "Need Help withdrawing my PF",
  },
  {
    id: 2,
    key: "Transfer Funds",
    heading: "Consolidate PF Balance",
    description: "Want to transfer PF to my latest employer",
  },
  {
    id: 3,
    key: "Fix Issues",
    heading: "Resolve PF Issues",
    description: "Claim Rejection or other PF account issues",
  },
  {
    id: 4,
    key: "CheckMyPF",
    heading: "CheckMyPF",
    description: "Ensure my PF is Error free & withdrawable",
  },
  {
    id: 5,
    key: "TrackMyPF",
    heading: "TrackMyPF",
    description: "I want to track my Pf balance & passbook",
  },
];

const HowCanHelpUser = () => {
  interface ZohoUpdateLeadParams {
    tag?: string;
    status?: string | null;
    intentStatus?: "Scheduled" | "Not Scheduled" | null;
    callDate?: string | null;
    callTime?: string | null;
  }
  const location = useLocation();
  const navigate = useNavigate();
  const { name, processedUan, mobile_number } = location.state || {};

  // const [mobileNumber, setMobileNumber] = useState(mobile_number || "");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [localProcessedUan, setProcessedUan] = useState(processedUan || "");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  //  const [apiFinished, setApiFinished] = useState(false);

  const userUan = decryptData(localStorage.getItem("user_uan")) || processedUan;
  const userMobile = decryptData(localStorage.getItem("user_mobile")) || mobile_number;
  const [showEmploymentStatusModal, setShowEmploymentStatusModal] = useState(false);
  const [selectedModalData, setSelectedModalData] = useState<ModalData | null>(null);
  interface ModalData {
    mobile_number: any;
    processedUan: string;
    currentEmploymentUanData: any;
    type: string;
    newUIEnabled: any;
    partialPassbook?: any;
  }
  const [showCalendrySlider, setShowCalendrySlider] = useState(false);
  const [showBookedSlider, setShowBookedSlider] = useState(false);
  const [bookedDate, setBookedDate] = useState("");
  const [bookedTime, setBookedTime] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [lastName, setLastName] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [showSlider, setShowSlider] = useState(false);
  const [caseId, setCaseId] = useState("");
 const [bookingRes, setBookingRes] = useState(false);
 const [showPaymentOnboarding, setShowPaymentOnboarding] = useState(false);
 const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false);

  const [containerHeight, setContainerHeight] = useState(
    window.innerWidth > 1500 ? "96dvh" : "94dvh"
  );

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerWidth > 1500 ? "96dvh" : "94dvh");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.fromBooking) {
      handleSubmit();
    }
 
  }, []);

  const handleSubmit = async () => {
    let fetchedUanFromAPI = false;

    // if (selectedOptions.length === 0) {
    //   setMessage({
    //     type: "error",
    //     content: "Please select one option so we can assist you better.",
    //   });
    //   return;
    // }
    

    const selectedTags =  decryptData(localStorage.getItem ("selected_tags"));
    if (!selectedTags) {
      setMessage({
        type: "error",
        content: "Please select one option so we can assist you better.",
      });
      return;
    }
    setIsSubmitting(true);
    // localStorage.setItem("selected_tags", encryptData(selectedTags));
    

    // If no UAN, fetch
    let finalUan = localProcessedUan || userUan;
    let zohoStatus: "No UAN found" | "API down" | null = null;
    let noUanFound = false;
    
    if (!finalUan) {
      try {
        const response = await post("surepass/fetchUanByMobile", { mobile_number: userMobile });
        if (response?.success && Array.isArray(response.data) && response.data.length) {
          const uan = response.data[0].uan;
          localStorage.setItem("user_uan", encryptData(uan));
          const empName = response.data[0]?.employment_history?.[0]?.name || response?.getAdvancePassbookData?.data?.profile?.fullName || "";
          if(uan){
            if ((response?.data?.length && response.data[0]?.employment_history?.length) || (response?.getAdvancePassbookData?.data?.serviceHistory?.history?.length)) {
              fetchedUanFromAPI = true;
              const responseUan = await get('/data/fetchByUan/' + uan);
              const hasEmploymentHistory = !!response?.data[0]?.employment_history?.length;
              const hasPassbookHistory = !!response?.getAdvancePassbookData?.data?.serviceHistory?.history?.length;
              const isGetAdvancePassbook = hasPassbookHistory;
              
              if(!hasEmploymentHistory && !hasPassbookHistory){
                  zohoStatus = "API down";
              }
  
              let normalizedHistory = [];
  
              if (hasEmploymentHistory) {
                // Use employment_history directly
                normalizedHistory = response.data[0].employment_history;
              } else if (hasPassbookHistory) {
  
                // Normalize passbook data to resemble employment_history
                normalizedHistory = [{
                  establishment_name: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.establishmentName,
                  currentOrganizationMemberId: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId,
                  userEmpHistoryCorrect: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
                  userStillWorkingInOrganization: responseUan?.rawData?.data?.home?.currentEstablishmentDetails?.memberId ? true : false,
                  serviceHistory: responseUan?.rawData?.data?.serviceHistory?.history,
                  isFromFullScrapper: true
                }]
              }
              setShowEmploymentStatusModal(true);
              setIsSubmitting(false);
              setSelectedModalData({
                mobile_number,
                processedUan: response.data[0]?.uan,
                currentEmploymentUanData: normalizedHistory,
                type: 'partial',
                newUIEnabled: true,
                partialPassbook: isGetAdvancePassbook.toString(),
              });
            }       
            localStorage.setItem("isPartialScrape", encryptData(true));
            setProcessedUan(uan);
            finalUan = uan;
  
            if (empName) {
              localStorage.setItem("user_name", encryptData(empName));
            }
          }
          // else{
          //   zohoStatus = "No UAN found";
          // }          
        } else {
          localStorage.setItem("service_history", JSON.stringify(true));
          zohoStatus = "API down";
          noUanFound = true;
          if(response.status === 422){
            zohoStatus = "No UAN found";
          }
        }
        // set user as logged in
        localStorage.setItem("is_logged_in_user", encryptData("true"))
      } catch (error) {
        // set user as logged in
        localStorage.setItem("is_logged_in_user", encryptData("true"))
        zohoStatus = "API down";
        navigate("/dashboard", {
          state: {
            mobile_number: userMobile,
            name,
            type: "full",
            selectedTags,
            processedUan: finalUan,
            noUanFound
          },
        });
      }
    }

    await zohoUpdateLead({tag:selectedTags, status:zohoStatus});
    
    //  setApiFinished(true);
    if (!fetchedUanFromAPI) {
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            mobile_number: userMobile,
            name,
            type: "full",
            selectedTags,
            processedUan: finalUan,
            noUanFound
          },
        });
      }, 700);
    }
  };
  
  const updateUserProfileOnboarding = async ({ userName, selectedOption, mobile_number }: any) => {
    try {
      const response = await post("auth/update-user-profile-onboarding", {
        userName,
        selectedOption,
        mobile_number,
      });
  
      if (response?.status === 200 && response?.data?.success) {
        return response.data;
      } else {
        console.warn("Failed to update onboarding data:", response.data?.message);
        return null;
      }
    } catch (error) {
      console.error("API error while updating onboarding data:", error);
      return null;
    }
  };
  useEffect(() => {
    if (bookingRes) {
      zohoUpdateLead({
        intentStatus: "Scheduled",
        callDate: bookedDate,
        callTime: bookedTime
      })
    }
  }, [bookingRes]);

  const handleToggle = (id: number) => {
    setSelectedOptions((prev) => (prev.includes(id) ? [] : [id]));
  };

  const zohoUpdateLead = async ({
    tag,
    status,
    intentStatus,
    callDate,
    callTime,
  }: ZohoUpdateLeadParams) => {
    try {
      const leadRaw = decryptData(localStorage.getItem("lead_data"));
      const existRaw = decryptData(localStorage.getItem("existzohoUserdata"));
      const userName = decryptData(localStorage.getItem("user_name"));
      // const userUan = decryptData(localStorage.getItem("user_uan"));
      const userBalance = decryptData(localStorage.getItem("user_balance"));
      // const serviceHistory = JSON.parse(localStorage.getItem("service_history") || "false");

      const newUser = leadRaw ? JSON.parse(leadRaw) : null;
      const existUser = existRaw ? JSON.parse(existRaw) : null;
      const user = existUser || newUser;

      if (!user) return;

      const balanceTag = userBalance > 50000 ? " 50K" : "";
      const finalTag = tag?.trim() + balanceTag;

      const payload = {
        Last_Name: userName || user.Last_Name,
        Mobile: user.Mobile,
        Email: user.Email,
        Wants_To: finalTag,
        Lead_Status: user.Lead_Status,
        Lead_Source: user.Lead_Source,
        Campaign_Id: user.Campaign_Id,
        CheckMyPF_Status: status ? status : user.CheckMyPF_Status,
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : (intentStatus === "Scheduled" ? "Scheduled" : "Not Scheduled"),
      Call_Schedule: intentStatus === "Scheduled" && callDate && callTime
        ? formatToISO(callDate, callTime)
        : user.Call_Schedule || "",
        Total_PF_Balance: userBalance > 0 ? userBalance : user.Total_PF_Balance,
      };

      ZohoLeadApi(payload);
    } catch (error) {
      console.error("zohoUpdateLead failed:", error);
    }
  };

  const openbookCallSlider = async () => {
    const selectedTags = selectedOptions
      .map((id) => helpOptions.find((opt) => opt.id === id)?.key)
      .filter(Boolean)
      .join(", ");
    localStorage.setItem("selected_tags", encryptData(selectedTags));
    updateUserProfileOnboarding({ userName: name, selectedOption: selectedTags, mobile_number: userMobile.length ? userMobile : mobile_number })
    const bookingRes: any = await post("calendly/check-user-booking", { mobile: userMobile });
    if(bookingRes?.data?.callbookingStatus?.showPaymentSlider){
      setShowPaymentOnboarding(true);
    }
    else{
      setShowCalendrySlider(true);
    }
  };

   const handleCalendlyEvent = async () => {
      const userMobile = decryptData(localStorage.getItem("user_mobile"));
      const cleanMobile = userMobile?.replace(/^\+91/, "");
      setCaseId(decryptData(localStorage.getItem("case_number")));
      const calendlyToggle = decryptData(localStorage.getItem("calendlyToggle") || "") || "";
      try {
        const bookingRes: any = await post("calendly/check-user-booking", { mobile: userMobile });
        
        if (bookingRes?.hasActiveBooking && bookingRes?.data) {
          setBookedDate(bookingRes.data.date);
          setBookedTime(bookingRes.data.time);
          setAssigneeName(bookingRes.data.assigneeName);
          setShowBookedSlider(true);
          setShowCalendrySlider(false);
          setBookingRes(true);
          return; // ✅ Stop here
        } 

        if (bookingRes?.data?.callbookingStatus?.Assigned_To === null) {
          setShowCalendrySlider(false);
          setShowBookingFaildSlider?.(true);
          return;
        }
        if (calendlyToggle === true) {
          navigate("/booking", { state: {prevRoute: "/how-can-help"} });
          return;
        }
  
        // If no valid booking, then fetch Calendly link
        const searchRes: any = await post("data/searchLead", { mobile: cleanMobile });
        const assignedTo = searchRes?.data?.Assigned_To;
        const lastName = searchRes?.data?.Last_Name;
        setCaseId(searchRes?.data?.Case_Number);
  
        if (lastName && lastName.toLowerCase() !== "new lead") {
          setLastName(lastName);
        } else {
          const userName = decryptData(localStorage.getItem("user_name")) || "";
          // 🔹 Remove prefixes like "Mr", "Mr.", "Mrs", "Ms", "Dr", case-insensitive
          const cleanedName = userName.replace(/^(mr|mrs|ms|mr.)\.?/i, "").trim();
          setLastName(cleanedName);
        }

        async function waitForAssignee() {
          let assignee = assignedTo;
          while (!assignee || assignee.trim().length === 0) {
            await new Promise(r => setTimeout(r, 200)); // wait 200ms
            assignee = searchRes?.data?.Assigned_To;    // check again from same response
          }
          return assignee;
        }
        let finalAssignee: string;
        finalAssignee = await waitForAssignee();
  
       
        // Update state only for UI
        setAssigneeName(finalAssignee);
  
        // ✅ Use local variable (not state) for API call
        const userRes: any = await post("get-assigned-user", { assignedTo: finalAssignee });
        const link = userRes?.data?.calendlyLink;
        if (link) {
          setCalendlyLink(link);
          setShowSlider(true);
          setShowCalendrySlider(false);
        } else {
          console.log("No Calendly link found for this user");
        }
      } catch (err) {
        console.error("Error fetching booking or Calendly link:", err);
      }
    };

  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      {isSubmitting ? (
        <LoaderCard
        // apiFinished={apiFinished} 
        />
      ) : (
        <div className="container-fluid p-0" style={{ height: containerHeight, overflow: "hidden" }}>
          <div className="row g-0" style={{ height: "100%" }}>
            <div
              className="col-md-4 offset-md-4 d-flex flex-column"
              style={{
                backgroundColor: "#FFFFFF",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="pt-5">
                <TitleSubtitleBlock title="How can we help you?" />
              </div>
              <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                  <div
                    className="px-4 flex-grow-1"
                    style={{
                      overflowY: selectedOptions.length > 0 && !showEmploymentStatusModal ? 'auto' : 'visible',
                      maxHeight: selectedOptions.length > 0 && !showEmploymentStatusModal ? 'calc(100% - 45vh)' : 'none',
                      transition: 'max-height 0.3s ease',
                      marginTop: selectedOptions.length > 0 && !showEmploymentStatusModal ? '1rem' : '2rem',
                      paddingBottom: selectedOptions.length > 0 && !showEmploymentStatusModal ? '2rem' : '0',
                      paddingTop: selectedOptions.length > 0 && !showEmploymentStatusModal ? '1rem' : '0',
                    }}
                  >
                  <div className="d-flex flex-column gap-3">
                    {helpOptions.map((option) => {
                      const savedTag = decryptData(localStorage.getItem("selected_tags"));
                      const savedOption = helpOptions.find(opt => opt.key === savedTag);
                      const isSelected = selectedOptions.includes(option.id) || savedOption?.id === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleToggle(option.id)}
                          className="d-flex align-items-start p-3 cursor-pointer clickeffect"
                          style={{
                            borderRadius: "1rem",
                            backgroundColor: "#F7F9FF",
                            gap: "0.6rem",
                            boxShadow:
                              "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => e.stopPropagation()}
                            style={{
                              width: "20px",
                              height: "20px",
                              appearance: "none",
                              borderRadius: "50%",
                              border: `2px solid ${isSelected ? "#3687f2" : "#858585"}`,
                              backgroundColor: isSelected ? "#3687f2" : "#FFFFFF",
                              marginTop: "0.7rem",
                            }}
                          />
                          <div>
                            <h5
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
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
                </div>
              </div>
              <AnimatePresence>
                {selectedOptions.length > 0 && !showEmploymentStatusModal && !showCalendrySlider  && !showBookingFaildSlider && (
                    <motion.div
                      initial={{ y: 0, opacity: 0, transform: "translate(-50%, 100%)" }}
                      animate={{ opacity: 1, transform: "translate(-50%, 0)" }}
                      exit={{ opacity: 0, transform: "translate(-50%, 100%)" }}
                      transition={{ duration: 0.3, stiffness: 180, damping: 18 }}
                      className="position-fixed start-50 d-flex flex-column"
                      style={{
                        bottom: 0,
                        borderTopLeftRadius: "1.25rem",
                        borderTopRightRadius: "1.25rem",
                        height: "45vh",
                        maxWidth: "31.25rem",
                        width: "100%",
                        padding: "1.25rem",
                        gap: "0.625rem",
                        zIndex: 1050,
                        backgroundColor: '#4255CB'
                      }}
                    >
                      <p
                        className="px-3 text-center mt-4"
                        style={{ color: "#FFFFFF", fontSize: "1.125rem" }}
                      >
                        Hi {name || ""}, Please proceed to next after selecting an option.
                      </p>

                      <div className="mt-auto">
                        <CustomButton label="Next" onClick={openbookCallSlider} />
                      </div>
                    </motion.div>
                 )}
              </AnimatePresence>


            </div>

          </div>
        </div>

      )}
      {/* Show Modal */}
      {showEmploymentStatusModal && selectedModalData && (
        <EmployementStatusModel
          setShowModal={setShowEmploymentStatusModal}
          modalData={selectedModalData}
        />
      )}
      <AnimatePresence>
        {showCalendrySlider && (
          <OnboardingCalendryBook 
          onClose={() => setShowCalendrySlider(false)} 
          handleSubmit={handleSubmit}
          onBookCall={handleCalendlyEvent}
          />
        )}
      </AnimatePresence>
      { showPaymentOnboarding &&
        <OnboardingPayment 
        onClose={()=> setShowPaymentOnboarding(false)}
        handleSubmit={handleSubmit}
        />
      }
      {calendlyLink && (
          <CalendlySlider
            show={showSlider}
            onClose={() => setShowSlider(false)}
            calendlyLink={calendlyLink}
            prefillName={lastName || ""}
            assigneeName={assigneeName || ""}
            registeredMobileNumber={decryptData(localStorage.getItem("user_mobile") || "")}
            onBookingConfirmed={(dbData) => {
              setBookedDate(dbData.date);
              setBookedTime(dbData.time);
              setAssigneeName(dbData.assigneeName);
              setShowBookedSlider(true);
              setBookingRes(true);
            }}
          />
        )}

        {/* Booked Slider */}
        <CallBookedSliderStatus
          show={showBookedSlider}
          onClose={() => setShowBookedSlider(false)}
          bookedDate={bookedDate || ""}
          bookedTime={bookedTime || ""}
          caseId={caseId || ""}
          assignedExpert={assigneeName || "PF Expert"}
          handleSubmit={handleSubmit}
        />

        <BookingFaildSlider
          show={showBookingFaildSlider}
          onClose={() => setShowBookingFaildSlider(false)}
          onBookCall={handleCalendlyEvent}
        />
    </>
  );
};

export default HowCanHelpUser;




