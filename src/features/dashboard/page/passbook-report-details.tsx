import "swiper/swiper-bundle.css";
import ZohoModal from "../../../components/dashboard/Models/ZohoModal";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  formatCurrency,
  parseCurrency,
} from "./../../../components/common/currency-formatter";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import AccountDetaillsModel from "../../../components/dashboard/Models/AccountDetaillsModel";
import { getShareByPassbook } from "../../../components/common/data-transform";
import TransactionDetailsModel from "../../../components/dashboard/Models/TransactionDeatailsModel";
import { ToTitleCase } from "../../../components/common/title-case";
import WithdrawTransferNowModel from "../../../components/dashboard/Models/WithdrawTransferNowModel";
import ConnectNowModel from "../../../components/dashboard/Models/ConnectNowModel";
import { CustomButtonAll } from "../../../helpers/helpers";
import { decryptData } from "../../../components/common/encryption-decryption";
import { setClarityTag } from "../../../helpers/ms-clarity";
import { formatJoiningDate } from "../../../components/common/dates-converter";
import { ZohoLeadApi } from "../../../components/common/zoho-lead";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import CurrentBalanceModel from "../../../components/dashboard/Models/CurrentBalanceModel";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PassboolReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUanData, selectedMemberId, selectedCompany, fromPassbook, isTrustPassbook, isScrappedFully} = location.state || {};

  const [selectedPassbookData, setSelectedPassbookData] = useState<any>(null);
  const [yearsDropdown, setYearsDropdown] = useState<any>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [serviceHistory, setServiceHistory] = useState<any>([]);
  const [passbookSharesData, setPassbookSharesData] = useState<any>(null);
  const [showModal, setShowModal] = useState<any>({ show: false, type: 'account details' })
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [zohoModalOpen, setZohoModalOpen] = useState(false);
  const [, setZohoUserID] = useState<any>();

  useEffect(() => {
    const storedData = localStorage?.getItem("zohoUserId");
    if (storedData) {
      const zohoUser = decryptData(storedData);
      setZohoUserID(zohoUser);
    }
  }, []);

  // zoho lead creation
  const zohoUpdateLead = async (intent:any) => {
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
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: existUser ? "Reopen" : user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: isScrappedFully ? "Full Report" : "Partial Report",
        CheckMyPF_Intent: intent,
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const handleOpenWithdrawModal = async () => {
    setShowModal({ show: true, type: "withdraw" });
    setClarityTag("BUTTON_TRANSFER", "Show Passbook transaction");
    zohoUpdateLead("Transfer Funds");
    // const userBalance = decryptData(localStorage.getItem("user_balance"))
    // const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    // if (userBalance > 50000) {
    //   try {
    //     await post('lead/knowlarity-lead', { mobileNumber, tag: "Transfer Funds" });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

  useEffect(() => {
    if (!currentUanData) return;
    const passbookData =
      currentUanData?.rawData?.data?.passbooks[selectedMemberId];
    const serviceHistory =
      currentUanData?.rawData?.data?.serviceHistory?.history.filter(
        (entry: any) => entry.details?.["Member Id"] === selectedMemberId
      );
    setServiceHistory(serviceHistory);
    setSelectedPassbookData(passbookData);
    getDropdownYears(passbookData);
    setPassbookSharesData(getShareByPassbook(passbookData))
  }, [currentUanData, selectedMemberId]);

  const getDropdownYears = (passbookData: any) => {
    if (!passbookData) return;
    const years = Object.keys(passbookData)
      .filter((year) => {
        const yearData = passbookData[year];
        return yearData?.transactions?.length > 0
      })
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => {
        const finStart = parseInt(year);
        const finEnd = finStart + 1;
        return `Financial Year: ${finStart}-${finEnd.toString().slice(-2)}`;
      });

    setYearsDropdown(years);
    if (years.length) setSelectedYear(years.length > 1 ? years[0] : years[0]);
  };

  const backPassbook = () => {
    if (fromPassbook) {
      navigate("/dashboard", { state: { processedUan: currentUanData?.rawData?.data?.profile?.UAN, openTab: "passbook" } });
    } else {
      navigate("/dashboard", { state: { processedUan: currentUanData?.rawData?.data?.profile?.UAN, openTab: "" } });
    }
  };

  // Handle dropdown selection change
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  const selectedYearKey = selectedYear.split(": ")[1]?.split("-")[0]; // Extract "2023" from "Financial Year: 2023-24"
  const transactions = selectedPassbookData?.[selectedYearKey]?.transactions || [];
  const reversedTransactions = transactions.slice().reverse();

  const handleAccountDetailsClick = () => {
    setShowModal({ show: true, type: 'account details' });
  }

  const handleTransactionDetailsClick = (transaction: any) => {
    setShowModal({ show: true, type: 'transaction details' });
    setSelectedTransaction(transaction)
  }

  // vanity card onclick
  const handleCurrentBalanceClick = () => {
    setShowModal({ show: true, type: "currentbalance" });
  }

  return (
    <>
      {showModal?.show && showModal?.type === 'account details' && <AccountDetaillsModel isOpen={showModal?.show} onClose={() => { setShowModal({ show: false, type: 'account details' }) }} serviceDetails={serviceHistory} companyName={selectedCompany} passbookSharesData={passbookSharesData} />}
      {showModal?.show && showModal?.type === 'transaction details' && <TransactionDetailsModel isOpen={showModal?.show} onClose={() => { setShowModal({ show: false, type: 'transaction details' }) }} selectedTransaction={selectedTransaction} />}
      {showModal.show && showModal.type === "withdraw" && (
        <WithdrawTransferNowModel
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
              title="Current Balance"
            />
          )}
      <ZohoModal isOpen={zohoModalOpen} onClose={() => setZohoModalOpen(false)} />
      <div
        className="container-fluid pt-3">
        <div className="row">
          <div className="col-md-4 offset-md-4"  style={{backgroundColor: "#E6ECFF",minHeight: "100vh"}}>

                 
            <div className="to-margin-top mb-4 mt-2">
              <VanityCard
                uan={currentUanData?.rawData?.data?.profile?.UAN}
                fullName={currentUanData?.rawData?.data?.profile?.fullName}
                totalPfBalance={passbookSharesData?.totalAmount}
                companyName={ToTitleCase(selectedCompany)}
                timeLine={`${formatJoiningDate(serviceHistory[0]?.details["Joining Date"])?.split(" - ")[0]} - ${formatJoiningDate(serviceHistory[0]?.details["Exit Date"])?.split(" - ")[0]}`}
                handleCurrentBalance={handleCurrentBalanceClick}
                handleBack={backPassbook}
                icon={true}
                chevron={true}
              />

            </div>

            <div className="mt-4 py-3">
              <CustomButtonAll
                content="Withdraw/ Transfer Funds"
                color="null"
                onClick={handleOpenWithdrawModal}
              />
            </div>
            <div className="card border-0  mt-2 shadow-sm" style={{ height: "3.5rem", background: "white",borderRadius:"1rem" }}>
              <div className="card-body d-flex flex-column p-2">
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", height: "100%" }}
                  onClick={handleAccountDetailsClick}
                >
                  <p className="mb-0 paragraphText px-3">Employer Details</p>
                  <BsChevronRight className="fs-6" style={{ color: "black", cursor: "pointer", marginRight: "0.5rem" }} />
                </div>
              </div>
            </div>
            <p className="sectionTitle mb-0 mt-3">Statements</p>
            <span className="underline mb-3"></span>

            {!isTrustPassbook &&
              <div className="mb-4 pb-1">
                <div className="card  border-0 mt-3 shadow-sm" style={{ height: "3.5rem", background: "white" ,borderRadius:"1rem" }}>
                  <div className="card-body d-flex align-items-center p-2 position-relative">
                    <select
                      className="form-select w-100 paragraphText border-0"
                      id="exampleSelect"
                      value={selectedYear}
                      onChange={handleYearChange}
                      style={{
                        height: "100%",
                        background: "white",
                        appearance: "none", // Removes the default dropdown arrow
                        paddingRight: "2rem", // Space for custom arrow
                      }}
                    >
                      {yearsDropdown.length > 1 ? yearsDropdown.map((year: any, index: any) => (
                        <option key={index} value={year} className="paragraphText">
                          {year}
                        </option>
                      )) : yearsDropdown.map((year: any, index: any) => (
                        <option key={index} value={year} className="paragraphText">
                          {year}
                        </option>
                      ))}
                    </select>
                    <BsChevronDown
                      className="position-absolute"
                      style={{
                        right: "1rem",
                        fontSize: "1rem",
                        color: "black",
                        pointerEvents: "none", // Prevent interaction
                      }}
                    />
                  </div>
                </div>
                {reversedTransactions.length > 0 ? (
                  reversedTransactions.map((transaction: any, index: number) => {
                    const isNegativeTransaction = transaction.transactionType === "-";

                    let transactionType;
                    const particulars = transaction.particulars.toUpperCase();
                    if (isNegativeTransaction) {
                      if (particulars.includes("TRANSFER OUT")) {
                        transactionType = "Transfer Out";
                      } else if (particulars.includes("CLAIM")) {
                        transactionType = "Claim";
                      } else {
                        transactionType = "Withdrawal";
                      }
                    } else {
                      if (particulars.includes("CONT")) {
                        transactionType = "Contribution";
                      } else if (particulars.includes("OB INT") || particulars.includes("INT")) {
                        transactionType = "Interest";
                      } else if (particulars.includes("TRANSFER IN")) {
                        transactionType = "Transfer In";
                      } else {
                        transactionType = "Contribution";
                      }
                    }

                    const color = isNegativeTransaction ? "#FF4D4D" : "#00C7A5";

                    return (
                      <div key={index} className="card border-0 my-2 py-3 relative shadow-sm" style={{borderRadius:"1rem"}}>
                        <div className="d-flex align-items-center justify-content-between" onClick={() => { handleTransactionDetailsClick(transaction) }}>
                          <div className="d-flex align-items-center" style={{ cursor: "pointer" }}>
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle ms-2"
                              style={{ width: "2.5rem", height: "2.5rem", backgroundColor: color }}
                            >
                              <span style={{ fontSize: "1.2rem", color: "#ffffff" }}>₹</span>
                            </div>
                            <div className="ms-3 relative">
                              <p className="mb-1 cardBody" style={{ color: color }}>
                                {transactionType}
                              </p>

                              <div className="relative">
                                <p
                                  className="mb-0 truncate max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap cardTitle"
                                  style={{ color: "#000" }}
                                >
                                  {ToTitleCase(transaction.particulars.replace(/\(.*?\)/g, "")).trim().length > 25
                                    ? `${ToTitleCase(transaction.particulars.replace(/\(.*?\)/g, "").trim().slice(0, 25))}...`
                                    : ToTitleCase(transaction.particulars.replace(/\(.*?\)/g, "").trim())}
                                </p>
                              </div>

                              <p className="text-muted mb-0 cardSubText">
                                {transaction.wageMonth}
                              </p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <p
                              className="cardHighlightText mb-0 me-1"
                              style={{ color: color, whiteSpace: "nowrap", display: "inline-block", fontFamily: "roboto" }}
                            >
                              {formatCurrency(
                                (parseCurrency(transaction?.employeeShare) || 0) +
                                (parseCurrency(transaction?.employerShare) || 0)
                              )}
                            </p>
                            <BsChevronRight className="fs-6 me-1" style={{ color: 'black', cursor: 'pointer' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center mt-3 text-muted">No Transaction Found</p>
                )}
              </div>
            }
            {isTrustPassbook && <p className="text-center mt-3 text-muted">This is an expempted organisation</p>}
          </div>

        </div>
      </div>
    </>
  );
};
export default PassboolReport;
