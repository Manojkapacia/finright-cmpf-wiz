import "./../../../App.css";
import RiskCard from "./../../../components/dashboard/risk-card";
import TransactionCard from "./../../../components/dashboard/transaction-card";
import { formatCurrency } from "../../../components/common/currency-formatter";
import PaymentUnlockForPfReport from "../../../components/dashboard/PaymentUnlockforPfRefort";
import FundGrowthChart from "../../../components/dashboard/FundGrowth";
import PfAnalysisPensionReport from "../../../components/dashboard/PfAnalysisPensionReport";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ViewDetailModel from "../../../components/dashboard/Models/ViewDetailModel";
import ConnectwithExportModel from "../../../components/dashboard/Models/ConnectwithExportModel";
import CalculatedModel from "../../../components/dashboard/Models/CalculatedModel";
import { decryptData } from "../../../components/common/encryption-decryption";
import ZohoModal from "../../../components/dashboard/Models/ZohoModal";
import { CompleteProfileButton, CustomButtonAll, WithdrawNowButton } from "../../../helpers/helpers";
import {
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import AmountStuckModel from "../../../components/dashboard/Models/AmountStuckModel";
import WithdrawTransferNowModel from "../../../components/dashboard/Models/WithdrawTransferNowModel";
import ConnectNowModel from "../../../components/dashboard/Models/ConnectNowModel";
import ToWithdrawAnalysisModel from "../../../components/dashboard/Models/ToWithdrawAnalysisModel";
import ResolveNowModel from "../../../components/dashboard/Models/ResolveNowModel";
import { setClarityTag } from "../../../helpers/ms-clarity";
import { BiChevronRight } from "react-icons/bi";
import HighRiskModelEPFOModel from "../../../components/dashboard/Models/HighRiskModelEPFOModel";
// import ConnectEPFOModel from "../../../components/dashboard/Models/ConnectEPFOModel";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import "../../../styles/global.css"
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";
import { BsExclamationTriangleFill } from "react-icons/bs";
import CompleteProfileModel from "../../../components/dashboard/Models/CompleteProfileModel";

const PfReport = (props: any) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "view report",
  });
  const [calculatedContent] = useState<any>("");
  const [isZohoModalOpen, setZohoModalOpen] = useState(false);
  const [, setZohoUserID] = useState<any>();
  const showAlternate = props.currentUanData == null;


  const handleOpenWithdrawModal = async () => {
    setShowModal({ show: true, type: "withdraw" });
    setClarityTag("BUTTON_WITHDRAW_NOW", "Pf report Page full report");
    zohoUpdateLead("Withdraw Funds");
    // const userBalance = decryptData(localStorage.getItem("user_balance"))
    // const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    // if (userBalance > 50000) {
    //   try {
    //     await post('lead/knowlarity-lead', { mobileNumber, tag: "Withdraw Funds" });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

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

  // amountstuck
  const handleAmountStuck = () => {
    setShowModal({ show: true, type: "amountstuck" });

  }

  // withdrawanalysis
  // const handleWithdrawAnalysis = () => {
  //   setShowModal({ show: true, type: "withdrawanalysis" });
  // }
  // resolve now
  const handleResolveNow = async() => {
    setShowModal({ show: true, type: "resolvenow" });
    setClarityTag("BUTTON_RESOLVE_NOW", "Pf report Page full report");
    // zohoUpdateLead("Reslove Now");
    zohoUpdateLead("Fix Issues");
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

  const navigateToScrapper = () => {
    navigate("/login-uan", {
      state: {
        type: "partial",
        currentUan: props?.currentUanData?.profileData?.data?.uan,
        mobile_number:
          props?.currentUanData?.profileData?.data?.phoneNumber.replace(
            /^91/,
            ""
          )
      },
    });
  };

  const handleTalkToExpert = () => {
      if(props?.currentUanData?.rawData?.isScrappedFully){
        navigate('/express-withdraw', { state: { currentUanData: props?.currentUanData, fromPfreport: true,} });
      }else{
             setShowModal({ show: true, type: "connectEpfo" });
      }
    // setShowModal({ show: false, type: "connect" });
    // zohoUpdateLead("Need Consultation");
    // // getZohoUserId("Need Consultation")
    // setClarityTag("BUTTON_NEED_CONSULTATION", "Pf report Page");
  };
  const handleCloseZohoModal = () => {
    setZohoModalOpen(false); // Close ZohoModal
  };

  let riskPossibility =
    props?.currentUanData?.reportData?.claimRejectionProbability;


  const zohoUpdateLead = async (intent: any) => {
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
        CheckMyPF_Status: props?.currentUanData?.rawData?.isScrappedFully ? "Full Report" : "Partial Report",
        CheckMyPF_Intent: intent,
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
// OnClick of vanity refresh and dowload report
const goToLoginPage=()=>{
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

          <ZohoModal isOpen={isZohoModalOpen} onClose={handleCloseZohoModal} />
          <div className="to-margin-top">
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
              lastUpdated={props?.currentUanData?.reportData?.lastContribution?.wageMonth}
            />
          </div>
       {!props?.currentUanData?.rawData?.isScrappedFully && (
      <div className="mt-4 pt-2">
        <div
          className="card border-0"
          style={{
            padding: "0.625rem", 
            borderRadius: "1rem", 
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

          <div className="mb-1">
            <div
              style={{
                width: "5.125rem", 
                borderBottom: "0.3125rem solid #FF3B30", 
                borderRadius: "1rem"
              }}
            ></div>
          </div>
          <div className="text-center ">
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
          <div className="text-center">
            <CompleteProfileButton text="Complete Profile Now" onClick={goToLoginPage}  />
          </div>
        </div>
      </div>)}
          <p className={`section-title mb-1 py-2 ${props?.currentUanData?.rawData?.isScrappedFully && "mt-4"}`}>Attention Required!</p>
          <span className="underline mb-3" style={{ marginTop: "-0.6rem" }}></span>
                {/* <StackedCardSlider currentUanData={props?.currentUanData} /> */}

          {showAlternate ? (
            <>
              <div className="card border-none position-relative" style={{ cursor: "pointer", border: "1px solid #FF3B30" }} onClick={handleFetchPassbook}>
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
                <RiskCard riskPossibility={riskPossibility} onClick={handleHighRiskModelEPFOModel}></RiskCard>           
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

                        {/* <div className="mt-3 mb-2">
                          <CustomButtonAll
                            content="Resolve Issues Now"
                            color="#FF0000"
                            onClick={handleResolveNow}
                          />
                        </div> */}
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
           <div className="card border-0 my-3 shadow-sm"style={{borderRadius:"1rem"}}>
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
                    >
                      {props?.currentUanData?.reportData?.withdrawableAmount != null
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
                onClick={handleOpenWithdrawModal}
                // color="#FF3B30"
              />)}
            </div>
              </div>
            </div>

            {props?.currentUanData?.rawData?.isScrappedFully && (
              <div className="card border-0 my-3 shadow-sm" style={{borderRadius:"1rem"}}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-7 text-start">
                      <p className="cardBody mb-0" >
                        Maximum Amount you<br /> can withdraw
                      </p>
                    </div>
                    <div className="col-5 text-end">
                      <p className="cardHighlightText mb-0" style={{ fontFamily: "roboto" }}>

                        {formatCurrency(props?.currentUanData?.reportData?.maxWithdrawableLimit) || "₹ 0"}
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
                onClick={handleResolveNow}
                color="#FF3B30"
              />)}
            </div>
                  </div>
                </div>
              </div>
            )}
            


            {/* {showAlternate ? (
              null
            ) : (
              <div className="mt-3 mb-5">
                <CustomButtonAll
                  content="Withdraw Now"
                  color="null"
                  onClick={handleOpenWithdrawModal}
                />
              </div>
            )} */}
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
        
        </div>
  );
};
export default PfReport;
