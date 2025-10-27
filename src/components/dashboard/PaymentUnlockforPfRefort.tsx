import { useState, useEffect } from "react";

import styles from "../styles/dashboard.module.css";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FaChevronRight, FaChevronUp, FaCircleExclamation } from "react-icons/fa6";
import ConnectwithExportModel from "./Models/ConnectwithExportModel";
import { CustomButtonAll } from "../../helpers/helpers";
import WithdrawTransferNowModel from "./Models/WithdrawTransferNowModel";
import ConnectNowModel from "./Models/ConnectNowModel";
import { decryptData } from "../common/encryption-decryption";
import ResolveNowModel from "./Models/ResolveNowModel";
import { setClarityTag } from "../../helpers/ms-clarity";
import { ZohoLeadApi } from "../common/zoho-lead";

const PaymentUnlockForPfReport = (props: any) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [, setZohoUserID] = useState<any>();
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });
  const [categoryDetailsFromReport, setCategoryDetailsFromReport] = useState([]);
   // State to manage collapse status for any card
const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({
  epsPension: true,
  transferRecords: true,
  pfContributions:true,
  employmentHistory:true,
  kycDetails: true,
  
});
const toggleCardCollapse = (cardKey: string) => {
  setCollapsedCards((prev) => ({
    ...prev,
    [cardKey]: !prev[cardKey],
  }));
};
 

  useEffect(() => {
    // process report data
    setTimeout(() => {
      processReportData();
    }, 2000);

    // set payment status
    setIsUnlocked(!!props?.currentUanData?.rawData?.isScrappedFully);
  }, [props?.currentUanData]);

  useEffect(() => {
      const storedData = localStorage?.getItem("zohoUserId");
      if (storedData) {
        const zohoUser = decryptData(storedData);
        setZohoUserID(zohoUser);
      }
    }, []);
  
    // const getZohoUserId = async (tag: any) => {
    //   if (zohoUserId) {
    //     const userId = zohoUserId
    //     const sessionId = tag;
    //     identifyUser(userId, sessionId);
    //   }
    // }

  // Function to process data and set state
  const processReportData = () => {
    if (!props?.currentUanData?.reportData?.withdrawabilityCheckupReport)
      return;

    const processedData =
      props?.currentUanData?.reportData.withdrawabilityCheckupReport
        .map((category: any) => {
          return category.subCategory.map((sub: any) => ({
            category: category.category,
            subCategory: sub.name,
            criticalCount: sub.critical,
            mediumCount: sub.medium,
            totalErrorCount: sub.critical + sub.medium,
            consolidatedErrorMessage: sub?.errorMessages
              ?.filter((msg: any) => msg)
              ?.map((msg: any, index: any) => (
                <span
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ marginRight: "0.5rem" }}>{index + 1}.</span>
                  <span style={{ textAlign: "left", flex: 1 }}>{msg}.</span>
                </span>
              )),
          }));
        })
        .flat(); // Flattening to avoid nested arrays
    setCategoryDetailsFromReport(processedData);
  };

  // function to check status for KYC
  const isInvalid = (valueToCheck: any) => {
    const kycCategory =
      props?.currentUanData?.reportData?.withdrawabilityCheckupReport.find(
        (item: any) => item.category.toLowerCase() === "kyc"
      );
    return (
      kycCategory?.subCategory?.length &&
      kycCategory?.subCategory[0].errorMessages.some((msg: any) =>
        msg.toLowerCase().includes(valueToCheck.toLowerCase())
      )
    );
  };

  const getSelectedSubCategoryData = (subCategory: any): any => {
    return (
      categoryDetailsFromReport &&
      categoryDetailsFromReport.find(
        (item: any) =>
          item.subCategory.toLowerCase() === subCategory.toLowerCase()
      )
    );
  };

  const getSelectedCategoryData = (category: any) => {
    if (!props?.currentUanData?.reportData?.withdrawabilityCheckupReport)
      return;
    const categoryData =
      props?.currentUanData?.reportData?.withdrawabilityCheckupReport.find(
        (item: any) => item.category.toUpperCase() === category.toUpperCase()
      );

    return {
      isEpsMember: categoryData?.isEpsMember,
      totalCritical: categoryData?.totalCritical,
      totalMedium: categoryData?.totalMedium,
      consolidatedErrorMessage: categoryData?.subCategory
        ?.flatMap((sub: any) => sub.errorMessages)
        ?.filter((msg: any) => msg)
        ?.map((msg: any, index: any) => (
          <span
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>{index + 1}.</span>
            <span style={{ textAlign: "left", flex: 1 }}>{msg}.</span>
          </span>
        )),
    };
  };

  const handleTalkToExpert = () => {
    console.log("Will connect you with agent");
    setShowModal({ show: false, type: "connect" });
  };

  // resolve now
  const handleResolveNow = async () => {
    setShowModal({ show: true, type: "resolvenow" });
    zohoUpdateLead("Fix Issues");
    setClarityTag("BUTTON_CONSULTATION", "Pf report Page");
    // const userBalance = decryptData(localStorage.getItem("user_balance"))
    // const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    // if (userBalance > 50000) {
    //   try {
    //     await post('lead/knowlarity-lead', { mobileNumber, tag: "Fix Issues" });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  }


  // zoho lead creation
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
          Last_Name: userName || props?.currentUanData?.rawData?.data?.profile?.fullName || user?.Last_Name,
          Mobile: user?.Mobile,
          Email: user?.Email,
          Wants_To: user?.Wants_To,
          Lead_Status: existUser ? "Reopen" : user?.Lead_Status,
          Lead_Source: user?.Lead_Source,
          Campaign_Id: user?.Campaign_Id,
          CheckMyPF_Status: props?.currentUanData?.rawData?.isScrappedFully ? "Full Report" : "Partial Report",
          CheckMyPF_Intent: intent,
          Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
        };
        ZohoLeadApi(zohoReqData);
      }
    }


  return (
    <>
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
      {/* withdray and transfer */}
      {showModal.show && showModal.type === "withdraw" && (
        <WithdrawTransferNowModel setShowModal={setShowModal} />
      )}

      {showModal.show && showModal.type === "connectNow" && (
        <ConnectNowModel setShowModal={setShowModal} />
      )}
      {/* resolve issue */}
      {showModal.show && showModal.type === "resolvenow" && (
        <ResolveNowModel
          setShowModal={setShowModal}
        />
      )}
      {showModal.show && showModal.type === "connectNow" && (
        <ConnectNowModel setShowModal={setShowModal} />
      )}

      {isUnlocked && (
        <div>
          {/* updated design */}
          {/* kyc here.. */}
          <div
            className="bg-white shadow-sm mt-3"
            style={{ borderRadius: "1rem", padding: "0.9375rem 1.25rem" }}
          >
            {/* Card Header */}
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCardCollapse("kycDetails")}
            >
              {/* Title */}
              <p className="cardTitle text-start mb-0" style={{ marginLeft: "0.5rem" }}>KYC Verification</p>

              {/* Issues and Icon */}
              <div className="d-flex align-items-center gap-2">
                {collapsedCards.kycDetails && (
                  <span
                    style={{
                      fontWeight: 500,
                      color:
                        (getSelectedCategoryData("KYC")?.totalCritical || 0) +
                          (getSelectedCategoryData("KYC")?.totalMedium || 0) > 0
                          ? "#FF3B30"
                          : "#34A853",
                    }}
                  >
                    {(getSelectedCategoryData("KYC")?.totalCritical || 0) +
                      (getSelectedCategoryData("KYC")?.totalMedium || 0) > 0
                      ? `${(getSelectedCategoryData("KYC")?.totalCritical || 0) +
                      (getSelectedCategoryData("KYC")?.totalMedium || 0)} Issue${(getSelectedCategoryData("KYC")?.totalCritical || 0) +
                        (getSelectedCategoryData("KYC")?.totalMedium || 0) > 1
                        ? "s"
                        : ""
                      }`
                      : "No Issue"}
                  </span>
                )}

                {/* Chevron Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(239,241,245)",
                    cursor: "pointer",
                  }}
                >
                  {collapsedCards.kycDetails ? (
                    <FaChevronRight color="#000000" style={{ fontSize: "0.6rem" }} />
                  ) : (
                    <FaChevronUp color="#000000" style={{ fontSize: "0.6rem" }} />
                  )}
                </div>
              </div>

            </div>

            {/* Card Content */}
            {!collapsedCards.kycDetails && (
              <div className="row row-cols-1 row-cols-md-2 mt-2 px-2">
                {/* LEFT SIDE */}
                <div className="col">
                  {/* Father/Husband Name */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">
                        {props?.currentUanData?.rawData?.data?.profile?.basicDetails?.relation === "F"
                          ? "Father's Name"
                          : "Husband's Name"}
                        :
                      </label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.basicDetails?.fatherHusbandName || "--"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Father/Husband Name") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>

                  {/* Gender */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">Gender:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.basicDetails?.gender === "M" ? "Male" : "Female"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Gender") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>

                  {/* Physically Handicapped */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">Physically Handicapped:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.basicDetails?.physicallyHandicapped === "Y" ? "Yes" : "No"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Physically Handicapped") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>

                  {/* Bank Account Number */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">Bank A/C Number:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber || "--"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Bank Account Number") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col">
                  {/* Date of Birth */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">Date of Birth:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.basicDetails?.dateOfBirth || "--"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Date of Birth") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>

                  {/* Aadhaar Number */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">Aadhaar Number:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.kycDetails?.aadhaar || "--"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("Aadhar Number") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>

                  {/* PAN Number */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className="cardSubText d-block">PAN Number:</label>
                      <p className="cardBody mb-0 text-start">
                        {props?.currentUanData?.rawData?.data?.profile?.kycDetails?.pan || "--"}
                      </p>
                    </div>
                    <span className="cardTitle mt-1">
                      {!isInvalid("PAN Number") ? (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#34A853"}}>
                          <FaCheckCircle className="me-2" size={16} /> Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center fw-bold" style={{color:"#FF3B30"}}>
                          <FaCircleExclamation className="me-2" size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>
                  {/* IFSC Number  */}
                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <label className={`cardSubText d-block`}>
                        IFSC Number:
                      </label>
                      <p className={`cardBody mb-0 text-start`}>
                        {props?.currentUanData?.rawData?.data?.profile?.kycDetails
                          ?.bankIFSC || "--"}
                      </p>
                    </div>
                    <span className={`cardTitle d-flex align-items-start mt-1`} style={{ fontWeight: '700' }}>
                      {!isInvalid("Bank IFSC") ? (
                        <span className="d-flex align-items-center" style={{color:"#34A853"}}>
                          <FaCheckCircle size={16} className="me-2" />
                          Verified
                        </span>
                      ) : (
                        <span className="d-flex align-items-center " style={{color:"#FF3B30"}}>
                          <FaCircleExclamation size={16} className="me-2" />
                          Incorrect
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border-bottom mb-1 py-1"></div>
                  {(props?.currentUanData?.reportData?.totalIssuesFound?.critical > 0 ||
                    props?.currentUanData?.reportData?.totalIssuesFound?.medium > 0) && (
                      <div className="mt-3">
                        <CustomButtonAll
                          content="Resolve Issues Now"
                          color="#FF0000"
                          onClick={handleResolveNow}
                        />
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* employee history */}
          <div
            className="bg-white shadow-sm mt-3"
            style={{ borderRadius: "1rem", padding: "0.9375rem 1.25rem" }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCardCollapse("employmentHistory")}
            >
              {/* Title */}
              <p className="cardTitle text-start mb-0" style={{ marginLeft: "0.5rem" }} >Employment History</p>

              {/* Issues count and icon container */}
              <div className="d-flex align-items-center gap-2">
                {/* Issue Count */}
                {collapsedCards.employmentHistory &&
                  <span
                    style={{
                      color:
                        (getSelectedCategoryData("Employment History")?.totalCritical || 0) > 0
                          ? "#FF3B30"
                          : "#34A853",
                      fontWeight: "500",
                    }}
                  >
                    {(getSelectedCategoryData("Employment History")?.totalCritical || 0) > 0
                      ? `${getSelectedCategoryData("Employment History")?.totalCritical} Issue${getSelectedCategoryData("Employment History")?.totalCritical > 1 ? "s" : ""
                      }`
                      : "No Issue"}
                  </span>
                }

                {/* Chevron Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(239,241,245)",
                    cursor: "pointer",
                  }}
                >
                  {collapsedCards.employmentHistory ? (
                    <FaChevronRight color="#000000" style={{ fontSize: "0.6rem" }} />
                  ) : (
                    <FaChevronUp color="#000000" style={{ fontSize: "0.6rem" }} />
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            {!collapsedCards.employmentHistory && (
              <div  style={{marginTop:"-0.8rem"}}>
                <table className="table">
                  <tbody>
                    <tr>
                      <td className={`cardBody text-start`}>Service History</td>
                      <td className="text-end">
                        {getSelectedSubCategoryData("Employement_Record")?.criticalCount > 0 && (
                          <div
                            className=" d-flex align-items-center justify-content-end cardTitle"
                            style={{color:"#FF3B30",fontWeight: "700"}}
                          >
                            <FaCircleExclamation size={16} className="me-2 mb-1" />
                            <span style={{ whiteSpace: "nowrap" }}>
                              {getSelectedSubCategoryData("Employement_Record")!.criticalCount} Critical issue
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`cardBody  text-start`}>Full withdrawal</td>
                      <td className="text-end">
                        {getSelectedSubCategoryData("Full_Withdrawability")
                          ?.criticalCount > 0 && (
                            <div className="d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#FF3B30" }}>
                              <FaCircleExclamation size={16} className="me-2 mb-1" />
                              <span
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {
                                  getSelectedSubCategoryData("Full_Withdrawability")
                                    ?.criticalCount
                                }{" "}
                                Critical issue
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Full_Withdrawability")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Full_Withdrawability")
                            ?.mediumCount > 0 && (
                            <div className={`${styles.textWarningCustom} d-flex align-items-center justify-content-end cardTitle`} style={{ fontWeight: '700' }}>
                              <FaExclamationTriangle size={16} className="me-2 mb-1" />
                              <span style={{ whiteSpace: "nowrap" }}>
                                Not Eligible
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Full_Withdrawability")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Full_Withdrawability")
                            ?.mediumCount === 0 && (
                            <div className="d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#34A853" }}>
                              <FaCheckCircle size={16} className="me-2 " />
                              <span style={{ whiteSpace: "nowrap" }}>
                                No issue{" "}
                              </span>
                            </div>
                          )}
                      </td>
                    </tr>

                    <tr>
                      <td className={`cardBody  text-start`}>Date of Exit</td>
                      <td className="text-end">
                        {getSelectedSubCategoryData("Date_Of_Exit")?.criticalCount >
                          0 && (
                            <div className="d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#FF3B30" }}>
                              <FaCircleExclamation size={16} className="me-2 mb-1" />
                              <span
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {
                                  getSelectedSubCategoryData("Date_Of_Exit")
                                    ?.criticalCount
                                }{" "}
                                Critical issue
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Date_Of_Exit")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Date_Of_Exit")?.mediumCount >
                          0 && (
                            <div className={`${styles.textWarningCustom} d-flex align-items-center justify-content-end cardTitle`} style={{ fontWeight: '700' }}>
                              <FaExclamationTriangle size={16} className="me-2 mb-1" />
                              <span style={{ whiteSpace: "nowrap" }}>
                                {
                                  getSelectedSubCategoryData("Date_Of_Exit")
                                    ?.mediumCount
                                }{" "}
                                Medium issue
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Date_Of_Exit")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Date_Of_Exit")
                            ?.mediumCount === 0 && (
                            <div className="d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#34A853" }}>
                              <FaCheckCircle size={16} className="me-2" />
                              <span style={{ whiteSpace: "nowrap" }}>
                                No issue{" "}
                              </span>
                            </div>
                          )}
                      </td>
                    </tr>

                    <tr>
                      <td className={`cardBody  text-start`}>Service Overlap</td>
                      <td className="text-end">
                        {getSelectedSubCategoryData("Service_Overlap")
                          ?.criticalCount > 0 && (
                            <div className=" d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#FF3B30" }}>
                              <FaCircleExclamation size={16} className="me-2 mb-1" />
                              <span
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {
                                  getSelectedSubCategoryData("Service_Overlap")
                                    ?.criticalCount
                                }{" "}
                                Critical issue
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Service_Overlap")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Service_Overlap")
                            ?.mediumCount > 0 && (
                            <div className={`${styles.textWarningCustom} d-flex align-items-center justify-content-end cardTitle`} style={{ fontWeight: '700' }}>
                              <FaExclamationTriangle size={16} className="me-2 mb-1" />
                              <span style={{ whiteSpace: "nowrap" }}>
                                {
                                  getSelectedSubCategoryData("Service_Overlap")
                                    ?.mediumCount
                                }{" "}
                                Medium issue
                              </span>
                            </div>
                          )}
                        {getSelectedSubCategoryData("Service_Overlap")
                          ?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Service_Overlap")
                            ?.mediumCount === 0 && (
                            <div className="d-flex align-items-center justify-content-end cardTitle" style={{ fontWeight: '700',color:"#34A853" }}>
                              <FaCheckCircle size={16} className="me-2" />
                              <span style={{ whiteSpace: "nowrap" }}>No issue</span>
                            </div>
                          )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Issue messages */}
                {getSelectedCategoryData("Employment History")?.totalCritical &&
                  getSelectedCategoryData("Employment History")!.totalCritical > 0 ? (
                  <div style={{color:"#FF3B30"}}>
                    <p
                      className={`cardBody mb-0 text-start`}
                      style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
                    >
                      <span
                        style={{ display: "flex", alignItems: "center", gap: "5px", marginLeft: "-0.2rem" }}
                      >
                        <FaCircleExclamation size={16} />
                        <span className="cardTitle" style={{ fontWeight: "700" }}>
                          {getSelectedCategoryData("Employment History")!.totalCritical} Issue Found:
                        </span>
                      </span>
                      {getSelectedCategoryData("Employment History")!.consolidatedErrorMessage}
                    </p>
                  </div>
                ) : (
                  <div style={{color:"#34A853"}}>
                    <p className={`cardBody mb-0 text-start`}>
                      <FaCheckCircle size={16} className="me-2 flex-shrink-0 mb-1" />
                      <span className="cardTitle" style={{ fontWeight: "700" }}>
                        No Issue Found,
                      </span>{" "}
                      All Good! 1 less thing to worry about.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* pf contribution */}
          <div
            className="bg-white shadow-sm mt-3"
            style={{ borderRadius: "1rem", padding: "0.9375rem 1.25rem" }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCardCollapse("pfContributions")}
            >
              {/* Title */}
              <p className="cardTitle text-start mb-0" style={{ marginLeft: "0.5rem" }}>PF Contributions</p>

              {/* Issues count and icon container */}
              <div className="d-flex align-items-center gap-2">
                {/* Issue Count */}
                {collapsedCards.pfContributions && (
                  <span
                    style={{
                      fontWeight: 500,
                      color:
                        (getSelectedCategoryData("PF Contributions")?.totalCritical || 0) +
                          (getSelectedCategoryData("PF Contributions")?.totalMedium || 0) > 0
                          ? "#FF3B30"
                          : "#34A853",
                    }}
                  >
                    {(getSelectedCategoryData("PF Contributions")?.totalCritical || 0) +
                      (getSelectedCategoryData("PF Contributions")?.totalMedium || 0) > 0
                      ? `${(getSelectedCategoryData("PF Contributions")?.totalCritical || 0) +
                      (getSelectedCategoryData("PF Contributions")?.totalMedium || 0)} Issue${(getSelectedCategoryData("PF Contributions")?.totalCritical || 0) +
                        (getSelectedCategoryData("PF Contributions")?.totalMedium || 0) > 1
                        ? "s"
                        : ""
                      }`
                      : "No Issue"}
                  </span>
                )}

                {/* Chevron Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(239,241,245)",
                    cursor: "pointer",
                  }}
                >
                  {collapsedCards.pfContributions ? (
                    <FaChevronRight color="#000000" style={{ fontSize: "0.6rem" }} />
                  ) : (
                    <FaChevronUp color="#000000" style={{ fontSize: "0.6rem" }} />
                  )}
                </div>
              </div>

            </div>


            {!collapsedCards.pfContributions && (
              <>
                <table className="table mt-2">
                  <tbody>
                    {/* Repeat your rows similarly here */}
                    {[
                      "Amount_Consolidation",
                      "Contribution_DOE_Anomalies",
                      "Contribution_DOJ_Anomalies",
                      "Missing_Contribution",
                      "Incorrect_Contribution"
                    ].map((subCatKey) => {
                      const subCatData = getSelectedSubCategoryData(subCatKey) || {};
                      return (
                        <tr key={subCatKey}>
                          <td className={`cardBody text-start`} style={{ whiteSpace: "nowrap" }}>
                            {subCatKey.replace(/_/g, " ")}
                          </td>
                          <td
                            className="d-flex align-items-center justify-content-end cardTitle"
                            style={{ fontWeight: "700" }}
                          >
                            {subCatData.criticalCount > 0 && (
                              <div className="d-flex align-items-center" style={{color:"#FF3B30"}}>
                                <span style={{ whiteSpace: "nowrap" }}>
                                  <FaCircleExclamation size={16} className="me-1 mb-1" />
                                  {subCatData.criticalCount} Critical issue
                                </span>
                              </div>
                            )}
                            {subCatData.criticalCount === 0 && subCatData.mediumCount > 0 && (
                              <div className="text-warning d-flex align-items-center">
                                <span style={{ whiteSpace: "nowrap" }}>
                                  <FaExclamationTriangle size={16} className="me-1 mb-1" />
                                  {subCatData.mediumCount} Medium issue
                                </span>
                              </div>
                            )}
                            {subCatData.criticalCount === 0 && subCatData.mediumCount === 0 && (
                              <div className="d-flex align-items-center" style={{color:"#34A853"}}>
                                <span style={{ whiteSpace: "nowrap" }}>
                                  <FaCheckCircle size={16} className="me-1" />
                                  No issue
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Bottom summary (error or success) */}
                {(getSelectedCategoryData("PF Contributions")?.totalCritical > 0 ||
                  getSelectedCategoryData("PF Contributions")?.totalMedium > 0) && (
                    <div
                    style={{
                      color:
                        getSelectedCategoryData("PF Contributions")?.totalCritical > 0
                          ? "#FF3B30"
                          : "#F9A825", // This is a warning-like yellow, adjust as needed
                    }}
                    >
                      <p
                        className={`cardBody mb-0 text-start`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "start",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginLeft: "-0.2rem",
                          }}
                        >
                          <FaCircleExclamation size={16} />
                          <span style={{ fontWeight: "700" }}>
                            {(getSelectedCategoryData("PF Contributions")?.totalCritical || 0) +
                              (getSelectedCategoryData("PF Contributions")?.totalMedium || 0)}{" "}
                            Issue Found:
                          </span>
                        </span>
                        {getSelectedCategoryData("PF Contributions")?.consolidatedErrorMessage}
                      </p>
                    </div>
                  )}

                {(getSelectedCategoryData("PF Contributions")?.totalCritical || 0) === 0 &&
                  (getSelectedCategoryData("PF Contributions")?.totalMedium || 0) === 0 && (
                    <div style={{color:"#34A853"}}>
                      <p className={`cardBody mb-0 text-start`}>
                        <FaCheckCircle size={16} className="me-2 flex-shrink-0 mb-1" />
                        <span style={{ fontWeight: "700" }}>No Issue Found, </span> All Good! 1 less thing to worry
                        about.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* eps pension */}
          <div
            className="bg-white shadow-sm mt-3"
            style={{ borderRadius: "1rem", padding: "0.9375rem 1.25rem" }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCardCollapse("epsPension")}
            >
              {/* Title */}
              <p className="cardTitle text-start mb-0" style={{ marginLeft: "0.5rem" }}
              >EPS Pension Records</p>

              {/* Issues count and icon container */}
              <div className="d-flex align-items-center gap-2">
                {/* Issue Count */}
                {collapsedCards.epsPension && (
                  <span
                    style={{
                      color:
                        (getSelectedCategoryData("EPF Pension Records")?.totalCritical || 0) +
                          (getSelectedCategoryData("EPF Pension Records")?.totalMedium || 0) >
                          0
                          ? "#FF3B30"
                          : "#34A853",
                      fontWeight: "500",
                    }}
                  >
                    {(
                      (getSelectedCategoryData("EPF Pension Records")?.totalCritical || 0) +
                      (getSelectedCategoryData("EPF Pension Records")?.totalMedium || 0)
                    ) > 0
                      ? `${(getSelectedCategoryData("EPF Pension Records")?.totalCritical || 0) +
                      (getSelectedCategoryData("EPF Pension Records")?.totalMedium || 0)
                      } Issue${(getSelectedCategoryData("EPF Pension Records")?.totalCritical || 0) +
                        (getSelectedCategoryData("EPF Pension Records")?.totalMedium || 0) > 1
                        ? "s"
                        : ""}`
                      : "No Issue"}
                  </span>
                )}

                {/* Chevron Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(239,241,245)",
                    cursor: "pointer",
                  }}
                >
                  {collapsedCards.epsPension ? (
                    <FaChevronRight color="#000000" style={{ fontSize: "0.6rem" }} />
                  ) : (
                    <FaChevronUp color="#000000" style={{ fontSize: "0.6rem" }} />
                  )}
                </div>
              </div>

            </div>


            {/* Card Body */}
            {!collapsedCards["epsPension"] && (
              <>
                <table className="table mt-2">
                  <tbody>
                    <tr>
                      <td className={`cardBody`}>Is EPS Member?</td>
                      <td
                        className="d-flex align-items-center justify-content-end cardTitle"
                        style={{ fontWeight: "700" }}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>
                          {getSelectedCategoryData("EPF Pension Records")?.isEpsMember === "N"
                            ? "Not a Member"
                            : "Yes"}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className={`cardBody`} style={{ whiteSpace: "nowrap" }}>
                        EPS Irregularities
                      </td>
                      <td
                        className="d-flex align-items-center justify-content-end cardTitle"
                        style={{ fontWeight: "700" }}
                      >
                        {(getSelectedSubCategoryData("Pension")?.criticalCount ?? 0) > 0 ||
                          (getSelectedSubCategoryData("Pension")?.mediumCount ?? 0) > 0 ? (
                          <div className="d-flex align-items-center" style={{color:"#FF3B30"}}>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <FaCircleExclamation size={16} className="me-1 mb-1" />
                              {getSelectedSubCategoryData("Pension")?.criticalCount} Critical issue
                            </span>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center" style={{color:"#34A853"}}>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <FaCheckCircle size={16} className="me-1" />
                              No issue
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {(getSelectedCategoryData("EPF Pension Records")?.totalCritical ?? 0) > 0 ||
                  (getSelectedCategoryData("EPF Pension Records")?.totalMedium ?? 0) > 0 ? (
                  <div
                      style={{
                        color:
                          getSelectedCategoryData("EPF Pension Records")?.totalCritical > 0
                            ? "#FF3B30"
                            : "#F9A825", // This is a warning-like yellow, adjust as needed
                      }}
                  >
                    <p
                      className={`cardBody mb-0 text-start`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start"
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginLeft: "-0.2rem"
                        }}
                      >
                        <FaCircleExclamation size={16} />
                        <span style={{ fontWeight: "700" }}>
                          {(getSelectedCategoryData("EPF Pension Records")?.totalCritical ?? 0) +
                            (getSelectedCategoryData("EPF Pension Records")?.totalMedium ?? 0)}{" "}
                          Issue Found:
                        </span>
                      </span>
                      {
                        getSelectedCategoryData("EPF Pension Records")
                          ?.consolidatedErrorMessage
                      }
                    </p>
                  </div>
                ) : (
                  <div style={{color:"#34A853"}}>
                    <p className={`cardBody mb-0 text-start`}>
                      <FaCheckCircle size={16} className="me-2 flex-shrink-0 mb-1" />
                      <span style={{ fontWeight: "700" }}>No Issue Found, </span> All Good! 1 less thing to worry
                      about.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* transfer record */}
          <div
            className="bg-white mt-3 shadow-sm mb-2"
            style={{
              borderRadius: "1rem",
              padding: "0.9375rem 1.25rem",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCardCollapse("transferRecords")}
            >
              {/* Title */}
              <p className="cardTitle mb-0 text-start" style={{ marginLeft: "0.5rem" }}>Transfer Records</p>

              {/* Issue Count & Chevron */}
              <div className="d-flex align-items-center gap-2">
                {collapsedCards.transferRecords &&
                  <span
                    style={{
                      fontWeight: 500,
                      color:
                        (getSelectedCategoryData("Transfer Records")?.totalCritical || 0) +
                          (getSelectedCategoryData("Transfer Records")?.totalMedium || 0) > 0
                          ? "#FF3B30"
                          : "#34A853",
                    }}
                  >
                    {(getSelectedCategoryData("Transfer Records")?.totalCritical || 0) +
                      (getSelectedCategoryData("Transfer Records")?.totalMedium || 0) > 0
                      ? `${(getSelectedCategoryData("Transfer Records")?.totalCritical || 0) +
                      (getSelectedCategoryData("Transfer Records")?.totalMedium || 0)} Issue${(getSelectedCategoryData("Transfer Records")?.totalCritical || 0) +
                        (getSelectedCategoryData("Transfer Records")?.totalMedium || 0) > 1
                        ? "s"
                        : ""
                      }`
                      : "No Issue"}
                  </span>
                }
                {/* Chevron Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(239,241,245)",
                    cursor: "pointer",
                  }}
                >
                  {collapsedCards.transferRecords ? (
                    <FaChevronRight color="#000000" style={{ fontSize: "0.6rem" }} />
                  ) : (
                    <FaChevronUp color="#000000" style={{ fontSize: "0.6rem" }} />
                  )}
                </div>
              </div>
            </div>

            {!collapsedCards.transferRecords && (
              <>
                <table className="table mt-2">
                  <tbody>
                    {/* Transfer Out */}
                    <tr>
                      <td className="cardBody">Transfer Out</td>
                      <td
                        className="d-flex align-items-center justify-content-end cardTitle"
                        style={{ fontWeight: "700" }}
                      >
                        {getSelectedSubCategoryData("Transfer_Out")?.criticalCount > 0 && (
                          <div className="d-flex align-items-center" style={{color:"#FF3B30"}}>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <FaCircleExclamation size={16} className="me-1 mb-1" />
                              {getSelectedSubCategoryData("Transfer_Out")?.criticalCount} Critical issue
                            </span>
                          </div>
                        )}

                        {getSelectedSubCategoryData("Transfer_Out")?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Transfer_Out")?.mediumCount > 0 && (
                            <div
                              className="d-flex align-items-center"
                              style={{ color: "#F56905" }}
                            >
                              <span style={{ whiteSpace: "nowrap" }}>
                                <FaExclamationTriangle size={16} className="me-1 mb-1" />
                                {getSelectedSubCategoryData("Transfer_Out")?.mediumCount} Medium issue
                              </span>
                            </div>
                          )}

                        {(getSelectedSubCategoryData("Transfer_Out")?.criticalCount || 0) === 0 &&
                          (getSelectedSubCategoryData("Transfer_Out")?.mediumCount || 0) === 0 && (
                            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
                              <span className="mb-0" style={{ whiteSpace: "nowrap" }}>
                                <FaCheckCircle size={16} className="me-1" />
                                No Issues
                              </span>
                            </div>
                          )}
                      </td>
                    </tr>

                    {/* Transfer In */}
                    <tr>
                      <td className="cardBody">Transfer In</td>
                      <td
                        className="d-flex align-items-center justify-content-end cardTitle"
                        style={{ fontWeight: "700" }}
                      >
                        {getSelectedSubCategoryData("Transfer_In")?.criticalCount > 0 && (
                          <div className="d-flex align-items-center" style={{color:"#FF3B30"}}>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <FaCircleExclamation size={16} className="me-1 mb-1" />
                              {getSelectedSubCategoryData("Transfer_In")?.criticalCount} Critical issue
                            </span>
                          </div>
                        )}

                        {getSelectedSubCategoryData("Transfer_In")?.criticalCount === 0 &&
                          getSelectedSubCategoryData("Transfer_In")?.mediumCount > 0 && (
                            <div
                              className="d-flex align-items-center"
                              style={{ color: "#F56905" }}
                            >
                              <span style={{ whiteSpace: "nowrap" }}>
                                <FaExclamationTriangle size={16} className="me-1 mb-1" />
                                {getSelectedSubCategoryData("Transfer_In")?.mediumCount} Medium issue
                              </span>
                            </div>
                          )}

                        {(getSelectedSubCategoryData("Transfer_In")?.criticalCount || 0) === 0 &&
                          (getSelectedSubCategoryData("Transfer_In")?.mediumCount || 0) === 0 && (
                            <div className="d-flex align-items-center" style={{ color: "#34A853" }}>
                              <span className="mb-0" style={{ whiteSpace: "nowrap" }}>
                                <FaCheckCircle size={16} className="me-1" />
                                No Issues
                              </span>
                            </div>
                          )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Bottom Summary */}
                {(getSelectedCategoryData("Transfer Records")?.totalCritical > 0 ||
                  getSelectedCategoryData("Transfer Records")?.totalMedium > 0) && (
                    <div style={{ color: "#FF3B30" }}>
                      <p
                        className="cardBody mb-0 text-start"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "start",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginLeft: "-0.2rem",
                          }}
                        >
                          <FaCircleExclamation size={16} />
                          <span style={{ fontWeight: "700" }}>
                            {(getSelectedCategoryData("Transfer Records")?.totalCritical || 0) +
                              (getSelectedCategoryData("Transfer Records")?.totalMedium || 0)}{" "}
                            Issue Found:
                          </span>
                        </span>
                        {getSelectedCategoryData("Transfer Records")?.consolidatedErrorMessage}
                      </p>
                    </div>
                  )}

                {(getSelectedCategoryData("Transfer Records")?.totalCritical || 0) === 0 &&
                  (getSelectedCategoryData("Transfer Records")?.totalMedium || 0) === 0 && (
                    <div style={{ color: "#34A853" }}>
                      <p className="cardBody mb-0 text-start">
                        <FaCheckCircle size={16} className="me-2 flex-shrink-0 mb-1" />
                        <span style={{ fontWeight: "700" }}>No Issues</span>, All Good! 1 less thing to worry
                        about.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentUnlockForPfReport;
