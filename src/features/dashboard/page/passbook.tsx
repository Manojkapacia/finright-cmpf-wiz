import RiskCard from "../../../components/dashboard/risk-card";
import { BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../components/common/currency-formatter";
import { ToTitleCase } from "../../../components/common/title-case";
import { calculatePassbookClosingBalance } from "../../../components/common/data-transform";
import { CustomButtonAll } from "../../../helpers/helpers";
import { useEffect, useState } from "react";
import ConnectNowModel from "../../../components/dashboard/Models/ConnectNowModel";
import HighRiskofStuckModel from "../../../components/dashboard/Models/HighRiskofStuckModel";
import ViewDetailModel from "../../../components/dashboard/Models/ViewDetailModel";
import { decryptData } from "../../../components/common/encryption-decryption";
import ResolveNowModel from "../../../components/dashboard/Models/ResolveNowModel";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import AmountStuckModel from "../../../components/dashboard/Models/AmountStuckModel";
import HighRiskModelEPFOModel from "../../../components/dashboard/Models/HighRiskModelEPFOModel";
import ConnectEPFOModel from "../../../components/dashboard/Models/ConnectEPFOModel";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import { BiChevronRight } from "react-icons/bi";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";
import { get, getForEpfoStatus } from "../../../components/common/api";
import { trackClarityEvent } from "../../../helpers/ms-clarity";
import MESSAGES from "../../../components/constant/message";
import VerifyEpfoPassbookModel from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookModel";
import VerifyEpfoPassbookOtpModal from "../../../components/user-registeration/Onboarding2.0/models/VerifyEpfoPassbookOtpModal";
import CallBookedSlider from "../../../components/dashboard/Models/CallBookedModel";
import { CalendlySlider } from "../../../components/dashboard/Models/CalendlySliderModel";
import UrgentProfile from "../../../assets/suport-profile.png"
import InitialCallBookingSlider from "../../../components/dashboard/Models/InitialCallBookingSlider";
import AfterInitialPaidCallBooking from "../../../components/dashboard/Models/afterInitialPaidCallBooking";
import AdvancePaidCallBooking from "../../../components/dashboard/Models/advancePaidCallBooking";
import { formatToISO } from "../../../helpers/dates-convertor";
import PaymentABTestSlider from "../../../components/dashboard/Models/paymentABTestSlider";
import { handleCalendlyBooking } from "../../../helpers/calendryBooking";
import BookingFaildSlider from "../../../components/dashboard/Models/bookingFaildSlider";


const PassbookForPF = (props: any) => {
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });
  const [isNewUIToggleEnabled, setIsNewUIToggleEnabled] = useState(false);

  const [, setZohoUserID] = useState<any>();
  const showAlternate = props.currentUanData == null;
  const [calendlyLink, setCalendlyLink] = useState("");
  const [showCalendlySlider, setShowCalendlySlider] = useState(false);

  const [showBookedSlider, setShowBookedSlider] = useState(false);
  const [bookedDate, setBookedDate] = useState("");
  const [bookedTime, setBookedTime] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [lastName, setLastName] = useState("");
  // const [, setPaymentStatus] = useState("");
  const [showInitialCallSlider, setShowInitialCallSlider] = useState(false);
  const [showAfterInitialCallbooking, setShowAfterInitialCallbooking] = useState(false);
  const [showAdvancePaidCallBooking, setShowAdvancePaidCallBooking] = useState(false);
  const [showPaymentABTestSlider, setShowPaymentABTestSlider] = useState(false);
  const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false)

  interface ZohoUpdateLeadParams {
    tag?: string;
    status?: string | null;
    intent?: string | null;
    intentStatus?: "Scheduled" | "Not Scheduled" | null;
    callDate?: string | null;
    callTime?: string | null;
  }
  const [isBookingRes, setIsBookingRes] = useState(false);
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
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);
    useEffect(() => {
      const getToggleValue = async () => {
        try {
          const response = await get("/data/toggle/keys");
          const newUIToggle = response?.allTogglers?.find((item: any) => item.type === "new-ui");
          setIsNewUIToggleEnabled(newUIToggle?.isEnabled);
        } catch (err) {}
      };
      getToggleValue();
    }, []);
    
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
    


  const handleHighRiskModelEPFOModel = () => {
    navigate('/risk-reports', { state: { currentUanData: props?.currentUanData, fromPfReport: true, } });
  }

  const handleViewDetails = () => {
    setShowModal({ show: true, type: "viewdetail" });
  }


  const handleCalendlyEvent = async (status?: string, intent?: string) => {    
    zohoUpdateLead({status:status, intent:intent});
    
    await handleCalendlyBooking({
      zohoIntent: intent,
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
      setShowCalendlySlider,
      navigate,
      setShowBookingFaildSlider
    });
  };

  // resolve now
  // const handleResolveNow = async () => {
  //   setShowModal({ show: true, type: "resolvenow" });
  //   zohoUpdateLead("Full Report", "Fix Issues");
  // }

  // amountstuck
  const handleAmountStuck = () => {
    setShowModal({ show: true, type: "amountstuck" });

  }

  // zoho lead creation
  const zohoUpdateLead = async ({
    status,
    intent,
    intentStatus,
    callDate,
    callTime
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
        Lead_Status: existUser ? "Reopen" : user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: status,
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

  const navigate = useNavigate();
  let serviceHistory =
    props?.currentUanData?.rawData?.data?.serviceHistory?.history;

  const passbookClickHandler = (
    selectedMemberId: any,
    selectedCompany: any
  ) => {
    navigate("/transaction-history", {
      state: {
        currentUanData: props?.currentUanData,
        selectedMemberId,
        selectedCompany,
        fromPassbook: true,
        isTrustPassbook: checkIsPassbookTrust(selectedMemberId),
        isScrappedFully: props?.currentUanData?.rawData?.isScrappedFully  
      },
    });
  };


  const calculatePassbookSum = (selectedMemberId: any) => {
    // const passbookData = getShareByPassbook(
    //   props?.currentUanData?.rawData?.data?.passbooks[selectedMemberId]
    // );
    const passbookDataforcheck = calculatePassbookClosingBalance(
      props?.currentUanData?.rawData?.data?.passbooks[selectedMemberId]
    );
  
    // return passbookData.totalAmount;
    return passbookDataforcheck.totalAmount;
  };

  

  const navigateToScrapper = () => {
    navigate("/login-uan", {
      state: {
        type: "partial",
        currentUan: props?.currentUanData?.profileData?.data?.uan,
        mobile_number:
          props?.currentUanData?.profileData?.data?.phoneNumber.replace(
            /^91/,
            ""
          ),
      },
    });
  };

  const checkIsPassbookTrust = (memberId: any) => {
    return props?.currentUanData?.rawData?.data?.passbooks[memberId]?.isTrust === "true" ? true : false
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

  const totalInterest = props?.currentUanData?.reportData?.amountContributed?.totalEmployeeShareInterest
    + props?.currentUanData?.reportData?.amountContributed?.totalEmployerShareInterest
    + props?.currentUanData?.reportData?.amountContributed?.totalPensionShareInterest

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
  return (
    <div>

      {/* resolve now */}
      {showModal.show && showModal.type === "resolvenow" && (
        <ResolveNowModel setShowModal={setShowModal} />
      )}
      {showModal.show && showModal.type === "connectNow" && (
        <ConnectNowModel setShowModal={setShowModal} />
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
          content={""}
        />
      )}
      {/* amountstuck model */}
      {showModal?.show && showModal?.type === "amountstuck" && (
        <AmountStuckModel
          isOpen={showModal?.show}
          onClose={() => {
            setShowModal({ show: false, type: "amountstuck" });
          }}
          content={""}
        />
      )}

      {/* risk stuck */}
      {showModal?.show && showModal?.type === "riskstuck" && (
        <HighRiskofStuckModel
          isOpen={showModal?.show}
          onClose={() => {
            setShowModal({ show: false, type: "riskstuck" });
          }}
          onContinue={navigateToScrapper}
        />
      )}

      {/*high risk connecting epfo */}
      {showModal.show && showModal.type === "highriskepfo" && (
        <HighRiskModelEPFOModel
          setShowModal={setShowModal}
          issuesCount={props?.currentUanData?.reportData?.totalIssuesFound?.critical + props?.currentUanData?.reportData?.totalIssuesFound?.medium}
        />
      )}
      {showModal.show && showModal.type === "connectEpfo" && (
        <ConnectEPFOModel setShowModal={setShowModal}
          onContinue={() => {
            navigateToScrapper();
          }}
        />
      )}

      {/* current balance */}
      {showModal.show && showModal.type === "currentbalance" && (
        <CurrentBalanceModel
          isOpen={true}
          onClose={() => setShowModal({ show: false, type: "" })}
          passbookSharesData={passbookSharesData}
        />
      )}
      {/* new ui login models */}
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

      <div className="to-margin-top mb-4 pb-3">
        <VanityCard
          fullNameDownload={props?.currentUanData?.rawData?.data?.profile?.fullName}
          isScrappedFully={props?.currentUanData?.rawData?.isScrappedFully}
          currentUanData={props?.currentUanData}
          uan={props?.currentUanData?.rawData?.data?.profile?.UAN}
          fullName={props?.currentUanData?.rawData?.data?.profile?.fullName}
          totalPfBalance={props?.currentUanData?.reportData?.totalPfBalance}
          totalInterest={totalInterest}
          chevron={true}
          handleCurrentBalance={handleCurrentBalanceClick}
          onRefresh={goToLoginPage}

        />
      </div>

      {showAlternate ? (
        <>
          <div className="card border-none position-relative" style={{ cursor: "pointer", border: "1px solid #FF3B30",  backgroundColor: "#F7F9FF",borderRadius:"1rem" }} onClick={handleAmountStuck}>
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
              onClick={handleViewDetails}
            />
          </div>
        </>

      ) : (<>

        {props?.currentUanData?.rawData?.isScrappedFully 
          ?
            ((props?.currentUanData?.reportData?.totalIssuesFound?.critical > 0 ||
              props?.currentUanData?.reportData?.totalIssuesFound?.medium > 0) && (
                <div className="card position-relative" onClick={handleAmountStuck} style={{ cursor: "pointer",border:"1px solid #FF0000",borderRadius:"1rem",backgroundColor: "#F7F9FF",}}>
                  <div className="card-body">
                    <AiOutlineExclamationCircle className="fs-4" style={{ marginTop: '-0.5rem',color:"#FF0000" }} />
                    <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
                      <span style={{color:"#FF0000"}}>Amount stuck</span> due to identified issues
                    </p>
                    <p className="mb-0 cardHighlightText  mt-2" style={{ fontFamily: 'roboto',color:"#FF0000" }}>
                      {formatCurrency(
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
              ))
          :
          <>
            {props?.currentUanData?.rawData && <RiskCard riskPossibility={props?.currentUanData?.reportData?.claimRejectionProbability} onClick={handleHighRiskModelEPFOModel}></RiskCard>}
          </>
        }

      </>
      )}




      {!props?.currentUanData?.rawData?.isScrappedFully ?
        <>
          {showAlternate ? (
            null
          ) : (
            // <div className="mt-3 mb-4">
            //   <CustomButtonAll
            //     content="Resolve Now"
            //     color="#FF0000"
            //     onClick={handleViewDetails}
            //   />
            // </div>
            null

          )}
        </>
        :
        ((props?.currentUanData?.reportData?.totalIssuesFound?.critical > 0 ||
          props?.currentUanData?.reportData?.totalIssuesFound?.medium > 0) && (
            <div className="mt-3">
              <CustomButtonAll
                content="Resolve Issues Now "
                color="#FF0000"
                // onClick={handleResolveNow}
                onClick={() => handleCalendlyEvent("Full Report", "Fix Issues")}
              />
            </div>
          ))
      }
      <p className="sectionTitle mb-0 mt-3">Service History</p>
      <span className="underline mb-3"></span>
      <div>

        {showAlternate ? (
          <p className="sectionTitle mb-0 mt-3">--</p>
        ) : (
          <>
            {serviceHistory &&
              serviceHistory.map((item: any, index: any) => {
                let formattedDate
                if (!checkIsPassbookTrust(item.details["Member Id"])) {
                  formattedDate = new Date(
                    item.details["Joining Date"]
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                } else {
                  formattedDate = "Trust"
                }

                return (
                  <div
                    key={index}
                    className="card border-0 my-2 shadow-sm"
                    style={{ cursor: "pointer",borderRadius:"1rem", backgroundColor: "#F7F9FF", }}
                    onClick={() =>
                      passbookClickHandler(
                        item.details["Member Id"],
                        item.company
                      )
                    }
                  >
                    <div className="card-body d-flex flex-column">
                      <p className="text-muted mb-1 cardBody">
                        {ToTitleCase(item.company)}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <p
                          className="mb-0 cardHighlightText"
                          style={{ fontFamily: "roboto" }}
                        >
                          {formatCurrency(
                            calculatePassbookSum(item.details["Member Id"])
                          ) || "₹ 0"}
                        </p>
                        <BsChevronRight
                          className="fs-6"
                          style={{ color: "black" }}
                        />
                      </div>
                      <p
                        className="text-muted mt-1 mb-0"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {formattedDate} &nbsp; MID: {item.details["Member Id"]}
                      </p>
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* Calendly Slider */}
        {calendlyLink && (
          <CalendlySlider
            show={showCalendlySlider}
            onClose={() => setShowCalendlySlider(false)}
            calendlyLink={calendlyLink}
            prefillName={lastName || ""}
            assigneeName={assigneeName || ""}
            registeredMobileNumber={decryptData(localStorage.getItem("user_mobile") || "")}
            onBookingConfirmed={(dbData) => {
              setBookedDate(dbData.date);
              setBookedTime(dbData.time);
              setAssigneeName(dbData.assigneeName);
              setShowBookedSlider(true);
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

        <InitialCallBookingSlider
          show={showInitialCallSlider}
          onClose={() => setShowInitialCallSlider(false)}
          onBookCall={handleCalendlyEvent}
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

        <PaymentABTestSlider
          show={showPaymentABTestSlider}
          onClose={() => setShowPaymentABTestSlider(false)}
        />

        <BookingFaildSlider
          show={showBookingFaildSlider}
          onClose={() => setShowBookingFaildSlider(false)}
          onBookCall={handleCalendlyEvent}
        />

      </div>
    </div>
  );
};
export default PassbookForPF;
