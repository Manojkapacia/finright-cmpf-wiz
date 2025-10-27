import "swiper/swiper-bundle.css";
import { useLocation, useNavigate } from "react-router-dom";
import { CompleteProfileButton } from "../../../helpers/helpers";
import { FaCheckCircle } from "react-icons/fa";
import { BsExclamationCircleFill } from "react-icons/bs";
import { useEffect, useState } from "react";
// import ConnectEPFOModel from "../../../components/dashboard/Models/ConnectEPFOModel";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import { decryptData } from "../../../components/common/encryption-decryption";
import CompleteProfileModel from "../../../components/dashboard/Models/CompleteProfileModel";
import { getForEpfoStatus } from "../../../components/common/api";
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

const PassboolReport = () => {
    const [showModal, setShowModal] = useState<any>({
        show: false,
        type: "view report",
    });

    const [showCalendlySlider, setShowCalendlySlider] = useState(false);
    const [showBookedSlider, setShowBookedSlider] = useState(false);
    const [calendlyLink, setCalendlyLink] = useState<string | null>(null);
    const [bookedDate, setBookedDate] = useState<string | null>(null);
    const [bookedTime, setBookedTime] = useState<string | null>(null);
    const [assigneeName, setAssigneeName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    // const [paymentStatus, setPaymentStatus] = useState("");
    const [showInitialCallSlider, setShowInitialCallSlider] = useState(false);
    const [showAfterInitialCallbooking, setShowAfterInitialCallbooking] = useState(false);
    const [showAdvancePaidCallBooking, setShowAdvancePaidCallBooking] = useState(false);
    const [showPaymentABTestSlider, setShowPaymentABTestSlider] = useState(false);
    const [showBookingFaildSlider, setShowBookingFaildSlider]= useState(false)

    const navigate = useNavigate();
    const location = useLocation();


    const currentUanData = location.state?.currentUanData;
    const showAlternate = currentUanData == null;
    const [isBookingRes, setIsBookingRes] = useState(false);
    interface ZohoUpdateLeadParams {
      tag?: string;
      status?: string | null;
      intent?: string | null;
      intentStatus?: "Scheduled" | "Not Scheduled" | null;
      callDate?: string | null;
      callTime?: string | null;
    }
    useEffect(() => {
      if (isBookingRes) {
        zohoUpdateLead({
          intentStatus: "Scheduled",
          callDate: bookedDate,
          callTime: bookedTime
        });
      }
    }, [isBookingRes]);

  const handleCalendlyEvent = async (intent?: string) => {
    zohoUpdateLead({ intent: intent });

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


    const zohoUpdateLead = async ({
      intent,
      intentStatus,
      callDate,
      callTime
    }: ZohoUpdateLeadParams) => {
        const rawData = decryptData(localStorage.getItem("lead_data"));
        const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
        const userName = decryptData(localStorage.getItem("user_name"));
        const userBalance = decryptData(localStorage.getItem("user_balance"))
    
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
            Last_Name: userName || currentUanData?.rawData?.data?.profile?.fullName || user?.Last_Name,
            Mobile: user?.Mobile,
            Email: user?.Email,
            Wants_To: user?.Wants_To,
            Lead_Status: user?.Lead_Status,
            Lead_Source: user?.Lead_Source,
            Campaign_Id: user?.Campaign_Id,
            CheckMyPF_Status: currentUanData?.rawData?.isScrappedFully ? "Full Report" : "Partial Report",
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

    const backPassbook = () => {
        navigate("/dashboard", { state: { processedUan: currentUanData?.rawData?.data?.profile?.UAN, openTab: "fromPfReport" } });

    };

    const getTotalIssueCount = (category: any) => {
        const categoryData =
            currentUanData?.reportData?.withdrawabilityCheckupReport.find(
                (item: any) => item.category.toLowerCase() === category.toLowerCase()
            );
        if (!categoryData) {
            return 0;
        }
        if (category.toLowerCase() === 'employment history') {
            return categoryData.totalCritical;
        } else {
            return categoryData.totalCritical + categoryData.totalMedium;
        }
    };


  const navigateToScrapper = async () => {

    try {
      const data = await getForEpfoStatus("/epfo/status");
      if (data?.isAvailable) {
        // const isScrappedFully = currentUanData?.rawData?.isScrappedFully;
        // if(isScrappedFully){
        //   navigate("/login-uan", {
        //     state: {
        //       type: "refresh",
        //       currentUan: currentUanData?.profileData?.data?.uan,
        //       mobile_number:
        //         currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
        //         password: currentUanData?.profileData?.data?.password,
        //       dashboard: true,
        //     },
        //   });

        // }
        // else{
        navigate("/login-uan", {
          state: {
            type: "refresh",
            currentUan: currentUanData?.profileData?.data?.uan,
            mobile_number:
              currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, ""),
            dashboard: true,
          },
        });
      // }
      } else {
        setShowModal({ show: true, type: "serverDown" });
      }
    } catch (err) {
      setShowModal({ show: true, type: "serverDown" });
    }
  };
    const issuesCount = currentUanData?.reportData?.totalIssuesFound?.critical + currentUanData?.reportData?.totalIssuesFound?.medium
    const passbookSharesData = {
        totalAmountWithInterest: currentUanData?.reportData.totalPfBalance || 0,
        employeeShare: currentUanData?.reportData.amountContributed?.totalEmployeeShare || 0,
        employerShare: currentUanData?.reportData.amountContributed?.totalEmployerShare || 0,
        pensionShare: currentUanData?.reportData.amountContributed?.totalPensionShare || 0,
        interestShare: currentUanData?.reportData.amountContributed?.totalInterestShare || 0
    };
    // vanity card onclick
    const handleCurrentBalanceClick = () => {
        setShowModal({ show: true, type: "currentbalance" });
    }

    
const handleserverDown =() => {
    setShowModal({ show: false, type: "serverDown" });
}

    return (
        <>
       <div className="container-fluid pt-3">
  <div className="row">
    <div className="col-md-4 offset-md-4" style={{ backgroundColor: "#E6ECFF" }}>
      {/* {showModal.show && showModal.type === "connectEpfo" && (
        <ConnectEPFOModel
          setShowModal={setShowModal}
          onContinue={() => {
            navigateToScrapper();
          }}
        />
      )} */}
       {showModal.show && showModal.type === "connectEpfo" && (
        <CompleteProfileModel
          setShowModal={setShowModal}
          onContinue={() => {
            navigateToScrapper();
          }}
          bodyText="Please complete your profile before initiating Issues resolution"
        />
      )}
      {showModal.show && showModal.type === "currentbalance" && (
        <CurrentBalanceModel
          isOpen={true}
          onClose={() => setShowModal({ show: false, type: "" })}
          passbookSharesData={passbookSharesData}
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
      <div className="to-margin-top pb-1 mt-2">
        <VanityCard
          uan={currentUanData?.rawData?.data?.profile?.UAN}
          fullName={currentUanData?.rawData?.data?.profile?.fullName}
          totalPfBalance={currentUanData?.reportData?.totalPfBalance}
          lastUpdated={currentUanData?.rawData?.meta?.createdTime}
          handleCurrentBalance={handleCurrentBalanceClick}
          onRefresh={navigateToScrapper}
          handleBack={backPassbook}
          icon={true}
          chevron={true}
        />
      </div>

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
              <BookingFaildSlider
                show={showBookingFaildSlider}
                onClose={() => setShowBookingFaildSlider(false)}
                onBookCall={handleCalendlyEvent}
              />

     <div
  className="card border-0 mt-4"
  style={{
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    backgroundColor: "#F7F9FF",
  }}
>
  <div className="card-body">
    <div>
      {/* <p
        className="modalHeadText w-100"
        style={{ textAlign: "start", marginLeft: "0.1rem" }}
      >
        Your withdrawal might get stuck!
        <span
          className="underlinered"
          style={{ backgroundColor: "#FF0000", marginLeft: "0.1rem" }}
        ></span>
      </p> */}

      {issuesCount && (
        <p
          className="w-100"
          style={{
            fontSize: "1.25rem",
            fontWeight: 400,
            textAlign: "start",
            color: "#FF0000",
          }}
        >
          {issuesCount} issues identified
        </p>
      )}

      <p
        className="modalSubText text-start d-block"
        style={{ color: "#858585" }}
      >
        These issues can result in rejection of your
      </p>
      <p
        className="modalSubText text-start d-block"
        style={{
          color: "#858585",
          marginTop: "-0.7rem",
        }}
      >
        withdrawal. resolve them to get full access
      </p>
      {!currentUanData?.rawData?.isScrappedFully && (
        <>
          <p className="cardTitle mb-0 mt-3">KYC details</p>
          {showAlternate ? (
            <p className="cardHighlightText">--</p>
          ) : getTotalIssueCount("KYC") > 0 ? (
            <div className="d-flex align-items-center" style={{ color: "#FF0000" }}>
              <BsExclamationCircleFill className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">
                {getTotalIssueCount("KYC")} Issues Found
              </p>
            </div>
          ) : (
            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
              <FaCheckCircle className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">No Issues Found</p>
            </div>
          )}

          <p className="cardTitle mb-0 mt-3">Service History</p>
          {showAlternate ? (
            <p className="cardHighlightText">--</p>
          ) : getTotalIssueCount("Employment History") > 0 ? (
            <div className="d-flex align-items-center" style={{ color: "#FF0000" }}>
              <BsExclamationCircleFill className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">
                {getTotalIssueCount("Employment History")} Issues Found
              </p>
            </div>
          ) : (
            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
              <FaCheckCircle className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">No Issues Found</p>
            </div>
          )}

          <p className="cardTitle mb-0 mt-3">Contributions</p>
          {showAlternate ? (
            <p className="cardHighlightText">--</p>
          ) : getTotalIssueCount("PF Contributions") > 0 ? (
            <div className="d-flex align-items-center" style={{ color: "#FF0000" }}>
              <BsExclamationCircleFill className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">
                {getTotalIssueCount("PF Contributions")} Issues Found
              </p>
            </div>
          ) : (
            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
              <FaCheckCircle className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">No Issues Found</p>
            </div>
          )}

          <p className="cardTitle mb-0 mt-3">EPS Contributions</p>
          {showAlternate ? (
            <p className="cardHighlightText">--</p>
          ) : getTotalIssueCount("EPF Pension Records") > 0 ? (
            <div className="d-flex align-items-center" style={{ color: "#FF0000" }}>
              <BsExclamationCircleFill className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">
                {getTotalIssueCount("EPF Pension Records")} Issues Found
              </p>
            </div>
          ) : (
            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
              <FaCheckCircle className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">No Issues Found</p>
            </div>
          )}

          <p className="cardTitle mb-0 mt-3">Intra Company transfers</p>
          {showAlternate ? (
            <p className="cardHighlightText">--</p>
          ) : getTotalIssueCount("Passbook Records") > 0 ? (
            <div className="d-flex align-items-center" style={{ color: "#FF0000" }}>
              <BsExclamationCircleFill className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">
                {getTotalIssueCount("Passbook Records")} Issues Found
              </p>
            </div>
          ) : (
            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
              <FaCheckCircle className="fs-6 me-2 mt-1" />
              <p className="cardHighlightText mb-0">No Issues Found</p>
            </div>
          )}
        </>
      )}
    </div>

    {!showAlternate && (
      <div className="mb-3 mt-4">
        <CompleteProfileButton
          text="Resolve Issues"
          color="#FF0000"
          onClick={() => handleCalendlyEvent("Fix Issues")}
        />
      </div>
    )}
  </div>
</div>

    </div>
  </div>
</div>


        </>
    );
};
export default PassboolReport;
