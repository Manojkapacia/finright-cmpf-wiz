import RiskCard from "../../../components/dashboard/risk-card";
import { BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../components/common/currency-formatter";
import { ToTitleCase } from "../../../components/common/title-case";
import { getShareByPassbook } from "../../../components/common/data-transform";
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
import { setClarityTag } from "../../../helpers/ms-clarity";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import { BiChevronRight } from "react-icons/bi";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";

const PassbookForPF = (props: any) => {
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });

  const [, setZohoUserID] = useState<any>();
  const showAlternate = props.currentUanData == null;


  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);



  const handleHighRiskModelEPFOModel = () => {
    navigate('/risk-reports', { state: { currentUanData: props?.currentUanData, fromPfReport: true, } });
  }

  const handleViewDetails = () => {
    setShowModal({ show: true, type: "viewdetail" });
  }



  // resolve now
  const handleResolveNow = async () => {
    setShowModal({ show: true, type: "resolvenow" });
    setClarityTag("BUTTON_RESOLVE_NOW", "Passbook Page full report");
    zohoUpdateLead("Full Report", "Fix Issues");
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

  // amountstuck
  const handleAmountStuck = () => {
    setShowModal({ show: true, type: "amountstuck" });

  }

  // zoho lead creation
  const zohoUpdateLead = async (status: any, intent:any) => {
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
        CheckMyPF_Intent: intent,
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
    const passbookData = getShareByPassbook(
      props?.currentUanData?.rawData?.data?.passbooks[selectedMemberId]
    );
    return passbookData.totalAmount;
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

  const goToLoginPage = () => {
    navigate("/login-uan", {
      state: {
        type: "refresh",
        currentUan: props?.currentUanData?.profileData?.data?.uan,
        mobile_number:
          props?.currentUanData?.profileData?.data?.phoneNumber.replace(
            /^91/,
            ""
          ),
          dashboard:true
      },
    });
  }
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
          <div className="card border-none position-relative" style={{ cursor: "pointer", border: "1px solid #FF3B30" }} onClick={handleAmountStuck}>
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

        {props?.currentUanData?.rawData?.isScrappedFully ?
          ((props?.currentUanData?.reportData?.totalIssuesFound?.critical > 0 ||
            props?.currentUanData?.reportData?.totalIssuesFound?.medium > 0) && (
              <div className="card border border-danger position-relative" onClick={handleAmountStuck} style={{ cursor: "pointer" }}>
                <div className="card-body">
                  <AiOutlineExclamationCircle className="text-danger fs-4" style={{ marginTop: '-0.5rem' }} />
                  <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
                    <span className="text-danger">Amount stuck</span> due to identified issues
                  </p>
                  <p className="mb-0 cardHighlightText text-danger mt-2" style={{ fontFamily: 'roboto' }}>
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
          <RiskCard riskPossibility={props?.currentUanData?.reportData?.claimRejectionProbability} onClick={handleHighRiskModelEPFOModel}></RiskCard>
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
                content="Resolve Issues Now"
                color="#FF0000"
                onClick={handleResolveNow}
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
                    style={{ cursor: "pointer",borderRadius:"1rem" }}
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

      </div>
    </div>
  );
};
export default PassbookForPF;
