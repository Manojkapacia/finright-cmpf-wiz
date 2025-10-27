import "swiper/swiper-bundle.css";
import { useLocation, useNavigate } from "react-router-dom";
import { CompleteProfileButton } from "../../../helpers/helpers";
import { FaCheckCircle } from "react-icons/fa";
import { BsExclamationCircleFill } from "react-icons/bs";
import { useState } from "react";
// import ConnectEPFOModel from "../../../components/dashboard/Models/ConnectEPFOModel";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import { decryptData } from "../../../components/common/encryption-decryption";
import CompleteProfileModel from "../../../components/dashboard/Models/CompleteProfileModel";

const PassboolReport = () => {
    const [showModal, setShowModal] = useState<any>({
        show: false,
        type: "view report",
    });

    const navigate = useNavigate();
    const location = useLocation();


    const currentUanData = location.state?.currentUanData;
    const showAlternate = currentUanData == null;

    // viewdetails
    const handleViewDetails = async () => {
        setShowModal({ show: true, type: "connectEpfo" });
        zohoUpdateLead("Fix Issues");
        // const userBalance = decryptData(localStorage.getItem("user_balance"))
        // const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
        // if (userBalance > 50000) {
        //     try {
        //         await post('lead/knowlarity-lead', { mobileNumber, tag: "Fix Issues" });
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
    }

    const zohoUpdateLead = async (intent: any) => {
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
            Lead_Status: existUser ? "Reopen" : user?.Lead_Status,
            Lead_Source: user?.Lead_Source,
            Campaign_Id: user?.Campaign_Id,
            CheckMyPF_Status: currentUanData?.rawData?.isScrappedFully ? "Full Report" : "Partial Report",
            CheckMyPF_Intent: intent,
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


    const navigateToScrapper = () => {
        navigate("/login-uan", {
            state: {
                type: "partial",
                currentUan: currentUanData?.profileData?.data?.uan,
                mobile_number:
                    currentUanData?.profileData?.data?.phoneNumber.replace(
                        /^91/,
                        ""
                    ),
                dashboard:true
            },
        });
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

      <div className="to-margin-top pb-1">
        <VanityCard
          uan={currentUanData?.rawData?.data?.profile?.UAN}
          fullName={currentUanData?.rawData?.data?.profile?.fullName}
          totalPfBalance={currentUanData?.reportData?.totalPfBalance}
          lastUpdated={currentUanData?.reportData?.lastContribution?.wageMonth}
          handleCurrentBalance={handleCurrentBalanceClick}
          handleBack={backPassbook}
          icon={true}
          chevron={true}
        />
      </div>

     <div
  className="card border-0 mt-4"
  style={{
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    backgroundColor: "#FFFFFF",
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
          onClick={handleViewDetails}
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
