import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'react-bootstrap-icons';
import { get, post } from "../../components/common/api";
import ToastMessage from "../../components/common/toast-message";
import { formatCurrency } from '../../components/common/currency-formatter';

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

interface PfreportProps {
    jsonData?: any;
    onBack: () => void;
}

const Pfreport: React.FC<PfreportProps> = ({ jsonData, onBack }) => {
     const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Fetching Report, Please wait...");
  const isMessageActive = useRef(false);
  const [reportData, setReportData] = useState<any>(null);
    const claimsData = jsonData?.data?.claims?.details;
    const passbookData = jsonData?.data?.passbooks;
    const historyData = jsonData?.data?.serviceHistory?.history || [];
    const mobile_number = jsonData?.data?.profile?.phone
    const [isEditing, setIsEditing] = useState(false);
const [messageBoxFirst, setMessageBoxFirst] = useState<string[]>([]);
const [messageBoxSecond, setMessageBoxSecond] = useState<string[]>([]);
const [editableMessageBoxFirst, setEditableMessageBoxFirst] = useState<string[]>([]);
const [editableMessageBoxSecond, setEditableMessageBoxSecond] = useState<string[]>([]);

useEffect(() => {
  const uan = jsonData?.meta?.uan;

  if (uan && reportData?.data?.withdrawabilityCheckupReport && historyData) {
    (async () => {
      const savedData = await fetchSavedMessages(uan);
      if (savedData && savedData?.firstBoxMessage && savedData?.secondBoxMessage) {
       
        // Saved data found - use it to initialize state
        setMessageBoxFirst(savedData.firstBoxMessage);
        setMessageBoxSecond(savedData.secondBoxMessage);
        setEditableMessageBoxFirst(savedData.firstBoxMessage);
        setEditableMessageBoxSecond(savedData.secondBoxMessage);
      } else {
        // No saved data - use original messages
        const first = getErrorMessagesBoxFirst(reportData.data.withdrawabilityCheckupReport, historyData);
        const second = getErrorMessagesBoxSecond(reportData.data.withdrawabilityCheckupReport, historyData);
        
        setMessageBoxFirst(first);
        setMessageBoxSecond(second);
        setEditableMessageBoxFirst(first);
        setEditableMessageBoxSecond(second);
      }
    })();
  }
}, [jsonData?.meta?.uan, reportData, historyData]);


const fetchSavedMessages = async (uan: string) => {
  try {
    const res = await get(`lead/get-message?uan=${uan}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching saved messages:", error);
    return null;
  }
};

  const handleSave = async () => {
    setLoadingText("Report updating, please wait...");
    setLoading(true)
  try {
    const noteData = {
      uan: jsonData?.meta?.uan,
      firstBoxMessage: editableMessageBoxFirst,
      secondBoxMessage: editableMessageBoxSecond,
    };

    const response = await post("lead/message", JSON.stringify(noteData));

    if (response?.success) {
      setMessage({
        type: "success",
        content: response.message || "Saved successfully!",
      });
    } else {
      setMessage({
        type: "error",
        content: response.message || "Failed to save. Please try again.",
      });
    }

    // On save success, update the display boxes with edited content
    setMessageBoxFirst(editableMessageBoxFirst);
    setMessageBoxSecond(editableMessageBoxSecond);
    setIsEditing(false);
    setLoading(false)
  } catch (error) {
    console.error("Error saving:", error);
  } finally {
    setLoading(false);
    setLoadingText("Fetching Report, Please wait..."); 
  }
};

const handleSaveZohoNotes = async () =>{
    setLoadingText("Zoho notes updating, please wait...");
    setLoading(true)
    try {
    const noteData = {
      firstBoxMessage: editableMessageBoxFirst,
      secondBoxMessage: editableMessageBoxSecond,
      mobile_number
    };
  const response = await post("lead/zoho-notes", JSON.stringify(noteData));
   setLoading(false)

  const { success, message } = response;

  if (success) {
    setMessage({ type: "success", content: message });
  } else {
    setMessage({ type: "error", content: message });
  }
} catch (error) {
  setMessage({
    type: "error",
    content: "Something went wrong while calling the Zoho API.",
  });
}finally {
    setLoading(false);
    setLoadingText("Fetching Report, Please wait..."); 
  }

}

    
    // const isArray = (data: any) => {
    //     console.log('Checking if data is an array:', data);
    //     return Array.isArray(data);
    //   };
    // const isArrayCheckPanding = isArray(claimsData?.["Pending Claims"]);
    // const isArrayCheckSettled = isArray(claimsData?.["Settled Claims"]);
    // const isArrayCheckRejected = isArray(claimsData?.["Rejected Claims"]);

    const statusLabels: Record<string, string> = {
        working: "Working",
        retired: "Retired",
        notworking: "Not Working",
        notlisted: "Not Listed",
        notdeducted : "PF not deducted by current employer"
    };

    useEffect(() => {
    const fetchData = async () => {
      if (!jsonData?.meta?.uan) return;

      setLoading(true);
      try {
        const result = await get(`/admin/report/fetchByUanForAdmin/${jsonData.meta.uan}`);
        setReportData(result);
      } catch (error) {
        if (!isMessageActive.current) {
          setMessage({ type: "error", content: "Failed to fetch report data." });
          isMessageActive.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jsonData]);


    const parseDDMMYYYY = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
     };
    const isArray = (data: any) => Array.isArray(data);

    // Combine all claims into a single array with status
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

    const sortedMemberIds = Object.keys(groupedClaims).sort((a, b) => {
        const dateA = new Date(memberIdToDojMap[a] || 0).getTime();
        const dateB = new Date(memberIdToDojMap[b] || 0).getTime();
        return dateB - dateA; // reverse order: newest first
    });
  const renderWithdrawabilityReport = (report:any) => (
        <div>
            {report?.map((item:any, index:any) => (
                <div key={index} className="mb-4">
                    <h5>{item?.category}</h5>
                    <ul className="list-group">
                        {item?.subCategory.map((sub:any, idx:any) => (
                            <li key={idx} className="list-group-item">
                                <div className="fw-bold">{sub?.name.replace(/_/g, ' ')}</div>
                                <div>
                                     Critical: {sub?.critical} | Medium: {sub?.medium}
                                </div>
                                {item?.category?.toLowerCase() === 'epf pension records' && item?.isEpsMember &&
                                    <div>
                                        EPS Member ({item?.isEpsMember}): {item?.isEpsMember?.toUpperCase() === "Y" ? <span className="text-success">Yes</span> : <span className="text-danger">No</span>}
                                    </div>
                                }
                                {sub?.errorMessages?.length > 0 && (
                                    <div className="text-danger">
                                        Errors:
                                        {sub?.errorMessages.map((msg:any, idx:any) => (
                                            <div key={idx}>{idx + 1}. {msg}</div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );


    function getErrorMessagesBoxFirst(data: any, historyData: any) {
        if (!Array.isArray(data) || !Array.isArray(historyData)) return [];

        const messages: any[] = [];
        const issueFlags: string[] = []; //Global issue tracker

        const pensionCategory = data.find((cat) => cat.category === "EPF Pension Records");
        // const passbookCategory = data.find((cat) => cat.category === "Passbook Records");
        const pfContributionsCategory = data.find((cat) => cat.category === "PF Contributions");
        const employmentHistory = data.find((cat) => cat.category === "Employment History");
        const KYC = data.find((cat) => cat.category === "KYC");

        const messageTemplates = {
            postTermination: "We will take clarification letter and file a grievance to EPFO",
            beforeJoining: "We will take clarification letter and file a grievance to EPFO",
            ncpNotMarked: "We will take clarification letter and file a grievance to EPFO",
            suspectedVPF: "We will require clarification letter from A, Salary slip with VPF start and End dates, Full & Final statement and then apply a grievance to EPFO attaching these documents",
            initiateTransfer: "Initiate transfer from {{sources}} to {{destination}} post corrections"
        };

        function cleanErrorMessage(msg: any) {
            return msg.replace(/\([^)]*\)/g, '').trim();
        }

        if (KYC) {
            KYC.subCategory?.forEach((sub: any) => {
                if (sub.name.toLowerCase() === "kyc") {
                    const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                    allMessages.forEach((msg) => {
                        if (msg.includes("KYC details are not correct for")) {
                            // Extract field names from message
                            const fieldsMatch = msg.match(/KYC details are not correct for (.+)/);
                            if (!fieldsMatch) return;

                            const fieldText = fieldsMatch[1];
                            const fields = fieldText.split(/,| and /).map((f:any) => f.trim());

                            const bankRelatedFields = fields.filter((f:any) =>
                                f.toLowerCase().includes("bank ifsc") || f.toLowerCase().includes("bank account number")
                            );

                            if (bankRelatedFields.length > 0) {
                                messages.push(`KYC mismatch found in ${bankRelatedFields.join(", ")}
We need to apply for Bank KYC to update these details`);
                                issueFlags.push("Issue");
                            } else {
                                messages.push(`KYC mismatch found in ${fields.join(", ")}
We need to apply Joint Declaration with employer to update these details`);
                                issueFlags.push("Issue");
                            }
                        }
                    });
                }
            });
        }



        // --- Employment History: Service Overlap ---
        
        if (employmentHistory) {
            employmentHistory.subCategory?.forEach((sub: any) => {
                if (sub.name === "Date_Of_Exit") {
                    const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                    allMessages.forEach((msg) => {
                        if (!msg.includes("Date of Exit not marked by")) return;

                        const match = msg.match(/\(([A-Z0-9]{10,})\)/i);
                        if (!match) return;

                        const memberId = match[1].trim();

                        // Find the company in historyData using memberId
                        const index = historyData.findIndex(h => h.details["Member Id"] === memberId);
                        if (index === -1) return;

                        const companyA = historyData[index];
                        const nextCompany = historyData[index - 1]; // Next company = more recent

                        if (!companyA || !nextCompany) return;

                        const companyAName = companyA.company;
                        const nextCompanyName = nextCompany.company;
                        const dojNextCompany = nextCompany.details["Joining Date"];

                        // Get last contribution transaction date from passbook
                        const transactions = Object.values(passbookData?.[memberId] || {})
                            .flatMap((year: any) => year.transactions || []);

                        const contributionTransactions = transactions.filter((t: any) => t.transactionType === '+');
                        if (contributionTransactions.length === 0) return;

                        const lastTxn = contributionTransactions[contributionTransactions.length - 1];
                        const lastTxnDate = lastTxn.transactionDate; // Format: DD-MM-YYYY

                        // Compare dates
                        const [dd1, mm1, yyyy1] = lastTxnDate.split('-').map(Number);
                        const [dd2, mmm2, yyyy2] = dojNextCompany.split('-');
                        const dojDate = new Date(`${mmm2} ${dd2}, ${yyyy2}`);
                        const txnDate = new Date(yyyy1, mm1 - 1, dd1);

                        let additionalMsg = "";

                        if (txnDate > dojDate) {
                            additionalMsg = `Depending on - Reliving Letter or Service Certificate or F&F Statement, we will update DOE of ${companyAName} ${lastTxnDate} or change DOJ of ${nextCompanyName} by filing a Joint Declaration`;
                        } else {
                            additionalMsg = `Depending on - Reliving Letter or Service Certificate or F&F Statement, we will update DOE of ${companyAName} ${lastTxnDate} by filing a Joint Declaration`;
                        }

                        messages.push(`${companyAName} - ${msg.replace(/\(([^)]+)\)/, "").trim()}
${additionalMsg}`);
                        issueFlags.push("Issue");
                    });
                }
            });
        }

        if (employmentHistory) {
            employmentHistory.subCategory?.forEach((sub: any) => {
                if (sub.name === "Service_Overlap") {
                    const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                    allMessages.forEach((msg) => {
                        if (!msg.includes("Service overlap between")) return;

                        const match = msg.match(/Service overlap between (.*?), (.*?), ₹.*? - {(.*?), (.*?), ₹/);
                        if (!match) return;

                        const [_, firstCompanyName, , secondCompanyName] = match;

                        const companyA = firstCompanyName.trim();
                        const companyB = secondCompanyName.trim();

                        if (companyA === companyB) return; // Ignore same company

                        const firstCompany = historyData.find(h => h.company === companyA);
                        const secondCompany = historyData.find(h => h.company === companyB);

                        const doe = firstCompany?.details?.["Exit Date"] || "-";
                        const doj = secondCompany?.details?.["Joining Date"] || "-";

                        messages.push(`${msg}
Depending on - Relieving Letter or Service Certificate or F&F Statement, either DOE of ${companyA} ${doe} or DOJ of ${companyB} ${doj} needs to be changed by filing a Joint Declaration`);
                        issueFlags.push("Issue");
                    });
                }
            });
        }


        // --- EPF Pension Records ---
        if (pensionCategory) {
            pensionCategory.subCategory?.forEach((sub: any) => {
                const isEpsMember = pensionCategory.isEpsMember;
                const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                allMessages.forEach((msg) => {
                    if (msg.includes("EPS not deducted by") && isEpsMember !== "Y") {
                        const match = msg.match(/EPS not deducted by (.*?) for /);
                        const extractedCompany = match?.[1]?.trim() || "-";
                        const cleanedMsg = cleanErrorMessage(msg);
                        const baseMsg = cleanedMsg.split(" for ")[0].trim();
                        messages.push(`${extractedCompany} - ${baseMsg}\nThis is a trust company, we need to transfer funds from this to latest company & then obtain Annexure K for this transfer.`);
                        issueFlags.push("Issue");
                    }

                    if (isEpsMember === "Y" && msg.includes("EPS not deducted")) {
                        const match = msg.match(/EPS not deducted by (.*?) for /);
                        const extractedCompany = match?.[1]?.trim() || "-";
                        const cleanedMsg = cleanErrorMessage(msg);
                        const baseMsg = cleanedMsg.split(" for ")[0].trim();
                        messages.push(`${extractedCompany} - ${baseMsg}\nWe will get clarification and Form 3A correction for missing pensions contributions and file correction with EPFO. Also we will apply regular grievances to followup and expedite process at EPF office.`);
                        issueFlags.push("Issue");
                    }

                    const memberIdMatch = msg.match(/\(([A-Z0-9]{10,})\)/i);
                    const memberId = memberIdMatch?.[1];
                    if (!memberId) return;

                    const history = historyData.find((entry) => entry?.details?.["Member Id"] === memberId);
                    const companyName = history?.company || "-";
                    const cleanedMsg = cleanErrorMessage(msg);

                    if (isEpsMember === "Y" && msg.includes("EPS deducted even when wages are more than 15000")) {
                        messages.push(`${companyName} - ${cleanedMsg}\nWe will collect Annexure K from previous employers and Submit while applying transfer.`);
                        issueFlags.push("Issue");
                    }

                    

                    if (isEpsMember === "N" && msg.includes("EPS deducted in all transactions for the Employer")) {
                        messages.push(`${companyName} - ${cleanedMsg}\nWe will get clarification and Form 3A correction for missing pensions contributions and file correction with EPFO. Also we will apply regular grievances to followup and expedite process at EPF office.`);
                        issueFlags.push("Issue");
                    }

                    if (msg.includes("Inferred Company")) {
                        messages.push(`${companyName} - ${'Inferred Company'}\nWe will collect Annexure K and Submit while applying transfer.`);
                        issueFlags.push("Issue");
                    }
                });
            });
        }

        // --- Passbook Records ---
        // if (passbookCategory) {
        //     const destinationCompany = historyData?.[0]?.company || "-";
        //     const sourceCompany = historyData?.[1]?.company || "-";

        //     passbookCategory.subCategory?.forEach((sub: any) => {
        //         const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

        //         allMessages.forEach((msg) => {
        //             const memberIdMatch = msg.match(/\(([A-Z0-9]{10,})\)/i);
        //             const memberId = memberIdMatch?.[1];
        //             if (!memberId) return;

        //             const history = historyData.find((entry) => entry?.details?.["Member Id"] === memberId);
        //             const companyName = history?.company || "-";
        //             const cleanedMsg = cleanErrorMessage(msg);

        //             if (msg.includes("transferred out but not settled in")) {
        //                 messages.push(`${companyName} - ${cleanedMsg}\nWe will collect Annexure K of ${sourceCompany} and submit it to EPF office of ${destinationCompany}. This will either credit the amount or reject the transfer. If rejected, we use the rejection to get the fund reverted back to ${sourceCompany} and then apply for transfer again`);
        //                 issueFlags.push("Issue");
        //             }
        //         });
        //     });
        // }

        // --- PF Contributions ---
        if (pfContributionsCategory) {
            // const pendingTransfers: any[] = [];
            const missingContributionByCompany: Record<string, Record<number, string[]>> = {};

            pfContributionsCategory.subCategory?.forEach((sub: any) => {
                const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                allMessages.forEach((msg) => {
                    const memberIdMatch = msg.match(/\(([A-Z0-9]{10,})\)/i);
                    const memberId = memberIdMatch?.[1];
                    if (!memberId) return;

                    const history = historyData.find((entry) => entry?.details?.["Member Id"] === memberId);
                    const companyName = history?.company || "-";
                    const cleanedMsg = cleanErrorMessage(msg);

                    // Track transfer-related issues
                    // if (msg.startsWith("Amount not yet transferred")) {
                    //     pendingTransfers.push({ msg, cleanedMsg });
                    //     return;
                    // }

                    
                    // Group NCP-related issues
                    if (msg.includes("and NCP days not marked for")) {
                        const monthMatches = cleanedMsg.match(/for (.*?) missing/);
                        const rawMonths = monthMatches?.[1]?.split(",").map((m: any) => m.trim()) || [];

                        rawMonths.forEach((monthYear: any) => {
                            const [month, yearStr] = monthYear.split("-");
                            const year = parseInt(yearStr);
                            if (!missingContributionByCompany[companyName]) {
                                missingContributionByCompany[companyName] = {};
                            }
                            if (!missingContributionByCompany[companyName][year]) {
                                missingContributionByCompany[companyName][year] = [];
                            }
                            missingContributionByCompany[companyName][year].push(month);
                        });

                        issueFlags.push("Issue");
                        return;
                    }

                    // Handle other error types
                    if (
                        msg.includes("Contribution made post Employment Termination") ||
                        msg.includes("Transaction made before Date of Joining") ||
                        msg.includes("Transaction delayed post Date of Joining")
                    ) {
                        messages.push(`${companyName} - ${cleanedMsg}\n${messageTemplates.postTermination}`);
                        issueFlags.push("Issue");
                        return;
                    }

                    if (msg.includes("Suspected VPF membership in")) {
                        const baseMsg = cleanedMsg.replace(/\s*-\s*\[Months:[^\]]+\]/, "").trim();
                        const updatedMessage = messageTemplates.suspectedVPF.replace("A", companyName);                      
                        messages.push(`${companyName} - ${baseMsg}\n${updatedMessage}`);
                        issueFlags.push("Issue");
                        return;
                    }

                    // Handle Amount_Consolidation transfer messages 
                    if (sub.name === "Amount_Consolidation" && msg.startsWith("Amount not yet transferred from")) {
                        const memberIdMatches = [...msg.matchAll(/\(([^)]+)\)/g)];

                        const fromMatches = [...msg.matchAll(/from (.*?) to/gi)];
                        const toMatches = [...msg.matchAll(/to (.*?)$/gi)];

                        const fromString = fromMatches?.[0]?.[1] || "";
                        const toString = toMatches?.[0]?.[1] || "";

                        const destinationCompanyId = memberIdMatches[memberIdMatches.length - 1]?.[1];
                        const destinationCompanyRaw = toString.split("(")[0].trim();
                        const destinationCompany =
                            historyData.find(h => h?.details?.["Member Id"] === destinationCompanyId)?.company || destinationCompanyRaw;

                        const sourceCompaniesRaw = fromString.split(",").map((s: any) => s.trim());

                        const sourceNames = sourceCompaniesRaw.map((src: any, index: any) => {
                            const srcId = memberIdMatches[index]?.[1];
                            const srcNameRaw = src.split("(")[0].trim();
                            return historyData.find(h => h?.details?.["Member Id"] === srcId)?.company || srcNameRaw;
                        });

                        // Message depends on issueFlags presence
                        const transferMsgTemplate = issueFlags.length > 0
                            ? "Initiate transfer from {{sources}} to {{destination}} post corrections"
                            : "Initiate transfer from {{sources}} to {{destination}}";

                        const transferMessage = transferMsgTemplate
                            .replace("{{sources}}", sourceNames.join(", "))
                            .replace("{{destination}}", destinationCompany);

                        messages.push(transferMessage);

                        return;
                    }
//                     
                });
            });

            //Format grouped NCP + missing contribution messages
            Object.entries(missingContributionByCompany).forEach(([company, yearMap]) => {
                const sortedYears = Object.keys(yearMap).sort((a, b) => +a - +b);
                const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                sortedYears.forEach(yearStr => {
                    const year = parseInt(yearStr);
                    const months = yearMap[year];

                    months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
                    const monthYearList = months.map(m => `${m}-${year}`).join(", ");

                    messages.push(`${company} - Contribution for ${monthYearList} missing in ${year} and NCP days not marked for ${company}\nWe will take clarification letter and file a grievance to EPFO`);
                });

            });
        }

        if (employmentHistory) {
            employmentHistory.subCategory?.forEach((sub: any) => {
                if (sub.name === "Full_Withdrawability") {
                    const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

                    allMessages.forEach((msg) => {
                        const latestCompany = historyData[0]?.company || "the latest company";
                        const amountWithdrawableWithin30Days = "₹" + reportData?.data?.updatedCalculation?.amountImmediatelyAvailableWithin22Days;
                        const maximumWithdrawableLimit = "₹" + reportData?.data?.updatedCalculation?.maxAmountPostCorrection;

                        // Case 1: No Issue in Partially Withdrawability
                        if (msg.includes("No Issue in Partially Withdrawability")) {
                            if (issueFlags.length === 0) {
                                messages.push(`Apply Form 19 on ${latestCompany}`);
                            } else {
                                messages.push(`Apply Form 19 on ${latestCompany} after above steps are completed`);
                                issueFlags.push("Issue");
                            }
                        }

                        // Case 2: Only partial withdrawable is allowed
                        if (msg.includes("Only partial withdrawable is allowed")) {
                            if (issueFlags.length === 0) {
                                messages.push(`As you are still working you can only withdraw max ${maximumWithdrawableLimit}
We can either withdraw ${amountWithdrawableWithin30Days} within 22 days, and then withdraw the rest, or withdraw the entire amount now`);
                            } else {
                                messages.push(`As you are still working you can only withdraw max ${maximumWithdrawableLimit}
We can either withdraw ${amountWithdrawableWithin30Days} within 22 days, then fix all issues and then withdraw the rest or Fix all issues and withdraw in one go`);
                                issueFlags.push("Issue");
                            }
                        }
                    });
                }
            });
        }



        return messages.map((msg, idx) => {
            const lines = msg.split("\n");
            const prefix = `${idx + 1}. `;
            const indent = " ".repeat(prefix.length);
            return lines.map((line:any, i:any) => (i === 0 ? prefix + line : indent + line)).join("\n");
        });
    }

    function getErrorMessagesBoxSecond(data: any, historyData: any) {
        if (!Array.isArray(data) || !Array.isArray(historyData)) return [];
        const warningMessages: string[] = [];

        const pfContributionsCategory = data.find((cat) => cat.category === "PF Contributions");
        const passbookRecordsCategory = data.find((cat) => cat.category === "Passbook Records");
        const pensionCategory = data.find((cat) => cat.category === "EPF Pension Records");

        function cleanErrorMessage(msg: string) {
            return msg.replace(/\([^)]*\)/g, '').trim(); // removes text within parentheses (e.g., member id)
        }

        // --- PF Contributions category warnings ---

        pfContributionsCategory?.subCategory?.forEach((sub: any) => {
            const allMessages = [...(sub.errorMessages || []), ...(sub.successMessage || [])];

            allMessages.forEach((msg) => {
                if (sub.name === "Amount_Consolidation" && msg.includes("Exempted Organisation, need further assessment")) {
                    const match = msg.match(/\(([A-Z0-9]{10,})\)/i);
                    const memberId = match?.[1];

                    const company = historyData.find(
                        (h: any) => h.details?.["Member Id"] === memberId
                    )?.company || "Unknown Company";
                    warningMessages.push(`Check if transfer from ${company} has happened if not then initiate transfer before applying claim`);
                }

                if (sub.name === "Missing_Contribution" && msg.includes("and NCP days of")) {
                    const match = msg.match(/\(([A-Z0-9]{10,})\)/i);
                    const memberId = match?.[1];

                    const company = historyData.find(
                        (h: any) => h.details?.["Member Id"] === memberId
                    )?.company || "Unknown Company";

                    warningMessages.push(`${company}
Match NCP days with missing period & Collect clarification letter from ${company} and file a grievance to EPFO`);
                }

                if (sub.name === "Incorrect_Contribution") {
                    if (
                        msg.includes("Incorrect Employee contribution") ||
                        msg.includes("Incorrect Employer share")
                    ) {
                        // const match = msg.match(/\(([^)]+)\)/); 
                        // const memberId = match?.[1];
                        const match = msg.match(/\(([A-Z0-9]{10,})\)/i);
                        const memberId = match?.[1];
                        if (!memberId) return;

                        const company = historyData.find(
                            (h: any) => h.details?.["Member Id"] === memberId
                        )?.company || "Unknown Company";
                        function cleanErrorMessageRemoveMonth(msg: string) {
                            return msg
                                .replace(/\([^)]*\)/g, '')  // Remove text in parentheses (e.g., member ID)
                                .replace(/\[Months:[^\]]*\]/gi, '')  // Remove text in brackets starting with "Months:"
                                .replace(/\s+-\s+$/, '') // Remove trailing hyphen and spaces if left behind
                                .trim(); // Final trim to clean whitespace
                        }
                        warningMessages.push(`${cleanErrorMessageRemoveMonth(msg)}\n Collect clarification letter from ${company} and file a grievance to EPFO`);
                    }
                }

            });
        });

        // --- Passbook Records category warnings ---
        const allPassbookMessages = [
            ...(passbookRecordsCategory?.errorMessages || []),
            ...(passbookRecordsCategory?.successMessage || [])
        ];

        allPassbookMessages.forEach((msg: string) => {
            const cleanMsg = cleanErrorMessage(msg);

            if (msg.includes("Transfer to exempted organization")) {
                warningMessages.push("Check transfer with trust if not done then collect annexure k of source company if needed");
            }

            if (msg.includes("EPS transferred from")) {
                const match = msg.match(/\(([A-Z0-9]{10,})\)/i); // extract Member ID
                const memberId = match?.[1];
                const company = historyData.find((h: any) => h.details?.["Member Id"] === memberId)?.company || "Unknown Company";

                warningMessages.push(`${company} - ${cleanMsg}
We will verify if tranfer has been settled, if not we need to collect Annexure K and Submit while applying transfer`);
            }
        });

        // --- EPF Pension Records warning: Inferred Company ---
        const pensionMessages = [
            ...(pensionCategory?.errorMessages || []),
            ...(pensionCategory?.successMessage || [])
        ];

        pensionMessages.forEach((msg: string) => {
            if (msg.includes("is Inferred Company")) {
                const match = msg.match(/\(([A-Z0-9]{10,})\)/i); // extract Member ID
                const memberId = match?.[1];
                const company = historyData.find((h: any) => h.details?.["Member Id"] === memberId)?.company || "Unknown Company";

                warningMessages.push(`${company}
We will verify if tranfer has been settled, if not we need to collect Annexure K and Submit while applying transfer`);
            }
        });

        // Format as numbered list
        return warningMessages.map((msg, idx) => {
            const lines = msg.split("\n");
            const prefix = `${idx + 1}. `;
            const indent = " ".repeat(prefix.length);
            return lines.map((line, i) => (i === 0 ? prefix + line : indent + line)).join("\n");
        });
    }

    return (
        <>
         {loading ? (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                    <div className="text-center p-4 bg-white rounded shadow">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">{loadingText}</p>
                    </div>
                </div>
             ) : (
        <>
            {message.type && <ToastMessage message={message.content} type={message.type} />}

            <button className="btn p-0 d-flex align-items-center mt-4 mb-md-3" onClick={onBack}>
                <ArrowLeft size={20} className="me-1" /> Back
            </button>
            <div className="container my-5">

                {/* General Information */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="text-center my-4">General Information</h3>
                        <div className="row">
                            <div className="col-md-6">
                                <p>User Name: <strong>{jsonData?.data?.profile?.fullName}</strong></p>
                                <p>UAN: <strong>{jsonData?.meta?.uan}</strong></p>
                                <p>Current Employment Status: <strong>{statusLabels[reportData?.data?.userSelectedValues?.status] || "N/A"}</strong></p>
                                {/* <p>Current Employment Status: <strong>{reportData?.data?.updatedCalculation?.employment_status}</strong></p> */}
                                <p>Total PF Balance: <strong>{formatCurrency(reportData?.data?.updatedCalculation?.totalPfBalanceWithPension)||"₹ 0"}</strong></p>
                                <p>Total Employee Share: <strong>{formatCurrency(reportData?.data?.amountContributed?.totalEmployeeShare)||"₹ 0"}</strong></p>
                                <p>Total Employer Share: <strong>{formatCurrency(reportData?.data?.amountContributed?.totalEmployerShare)||"₹ 0"}</strong></p>
                                <p>Total Pension Share: <strong>{formatCurrency(reportData?.data?.amountContributed?.totalPensionShare)||"₹ 0"}</strong></p>
                            </div>
                            <div className="col-md-6">
                                <p>Total Interest: <strong>{formatCurrency(reportData?.data?.amountContributed?.totalInterestShare)||"₹ 0"}</strong></p>
                                <p>Last Interest Recieved: <strong>{formatCurrency(reportData?.data?.amountContributed?.currentYearInterestShare)||"₹ 0"}</strong></p>
                                <p>Max Withdrawal Amount (post correction): <strong>{formatCurrency(reportData?.data?.updatedCalculation?.maxAmountPostCorrection)||"₹ 0"}</strong></p>
                                <p>Amount Available to Withdraw (pre correction): <strong>{formatCurrency(reportData?.data?.updatedCalculation?.amountAvailablePreCorrection)||"₹ 0"}</strong></p>
                                <p>Amount Stuck: <strong>{formatCurrency(reportData?.data?.updatedCalculation?.totalAmountStuck)||"₹ 0"}</strong></p>
                                <p>Amount Immediately Available (within 22 days): <strong>{formatCurrency(reportData?.data?.updatedCalculation?.amountImmediatelyAvailableWithin22Days)||"₹ 0"}</strong></p>
                                <p>Amount Secured for Future: <strong>{formatCurrency(reportData?.data?.updatedCalculation?.amountSecuredForFuture)||"₹ 0"}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Report Section*/}
                            <div
                                className="card mb-4 p-3 position-relative"
                                style={{ minHeight: "300px" }}
                            >
                                <div className="card-body pb-5">
                                    {isEditing ? (
                                        <>

                                            {editableMessageBoxFirst.length > 0 && (
                                                <div className="alert alert-warning mt-4">
                                                    {editableMessageBoxFirst.map((msg, index) => (
                                                        <textarea
                                                            key={index}
                                                            className="form-control mb-2"
                                                            value={msg}
                                                            onChange={(e) => {
                                                                const newMsgs = [...editableMessageBoxFirst];
                                                                newMsgs[index] = e.target.value;
                                                                setEditableMessageBoxFirst(newMsgs);
                                                            }}
                                                            rows={3}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {editableMessageBoxSecond.length > 0 && (
                                                <>
                                                    <p>Additionally, below are some checks that we will perform. These do not warrant any immediate concern, but if any issues are found during the check,
                                                         we will resolve them as well. After all, with EPFO, it's better to be safe than sorry!</p>
                                                    <div className="alert alert-warning mt-4">
                                                        {editableMessageBoxSecond.map((msg, index) => (
                                                            <textarea
                                                                key={index}
                                                                className="form-control mb-2"
                                                                value={msg}
                                                                onChange={(e) => {
                                                                    const newMsgs = [...editableMessageBoxSecond];
                                                                    newMsgs[index] = e.target.value;
                                                                    setEditableMessageBoxSecond(newMsgs);
                                                                }}
                                                                rows={3}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                            <p>Dear {jsonData?.data?.profile?.fullName} : {jsonData?.meta?.uan}</p>
                                            <p>Below is the plan of action to ensure get all your issues resolved and ensure that you can access your Provident Fund to the maximum.</p>
                                            {messageBoxFirst.length > 0 && (
                                                <div className="alert alert-warning mt-4">
                                                    {messageBoxFirst.map((msg, index) => (
                                                        <p key={index} style={{ marginBottom: "1rem" }}>{msg}</p>
                                                    ))}
                                                </div>
                                            )}

                                            {messageBoxSecond.length > 0 && (
                                                <>
                                                    <p>Additionally, below are some checks that we will perform. These do not warrant any immediate concern, but if any issues are found during the check,
                                                         we will resolve them as well. After all, with EPFO, it's better to be safe than sorry!</p>
                                                    <div className="alert alert-warning mt-4">
                                                        {messageBoxSecond.map((msg, index) => (
                                                            <p key={index} style={{ marginBottom: "1rem" }}>{msg}</p>
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            <p>We are committed to resolving your PF issue. You can sit back and relax while we work on it. 
                                                If you have any questions, please let us know.</p>
                                                <p>Note: The timelines are estimates based on typical EPFO turnaround times. Due to factors like server issues, 
                                                    they may vary slightly. We will use escalation channels if there are any delays.
                                                </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Center Buttons */}
                                <div
                                    className="d-flex justify-content-center gap-3"
                                    style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: 0,
                                        right: 0,
                                    }}
                                >
                                    <button
                                        className={`btn ${isEditing ? "btn-secondary" : "btn-danger"} px-4 fw-semibold`}
                                        style={{ minWidth: "8rem" }}
                                        onClick={() => {
                                            if (isEditing) {
                                                setMessageBoxFirst(editableMessageBoxFirst);
                                                setMessageBoxSecond(editableMessageBoxSecond);
                                                handleSave();
                                            }
                                            setIsEditing(!isEditing);
                                        }}
                                    >
                                        {isEditing ? "Save" : "Edit"}
                                    </button>
                                    <button
                                        className="btn btn-success px-4 fw-semibold"
                                        style={{ minWidth: "8rem" }}
                                        onClick={handleSaveZohoNotes}
                                        disabled={isEditing}
                                    >
                                        Send to Zoho
                                    </button>
                                </div>
                            </div>

               {/* intrest deatils */}
               <div className="card mb-4">
    <div className="card-body">
        <h3 className="text-center my-4">Interest Details</h3>
        <div className="table-responsive">
            <table className="table table-bordered">
                <thead className="thead-light">
                    <tr>
                        <th>Company</th>
                        <th>Member ID</th>
                        <th>Interest Amount</th>
                        <th>Interest Received till</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Map through the data to populate the rows */}
                    {reportData?.data?.interestReport?.map((item:any, index:any) => (
                        <tr key={index}>
                            <td>{item.Company}</td>
                            <td>{item["Member ID"]}</td>
                            <td>{item["Interest Amount"]}</td>
                            <td>{item["Interest Received till"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
</div>


                {/* Additional Information */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="text-center my-4">Last Contribution Information</h3>
                        <div className="row">
                            <div className="col-md-6">
                                <p>Average of Last 6 Contribution: <strong>{formatCurrency(reportData?.data?.averageOfLastSixTransactions)||"₹ 0"}</strong></p>
                                <p>Transaction Date: <strong>{reportData?.data?.lastContribution?.transactionDate || "-"}</strong></p>
                                <p>Transaction Type: <strong>{reportData?.data?.lastContribution?.transactionType || "-"}</strong></p>
                            </div>
                            <div className="col-md-6">
                                <p>EPF Wage: <strong>{reportData?.data?.lastContribution?.epfWages || 0}</strong></p>
                                <p>EPS Wage: <strong>{reportData?.data?.lastContribution?.epsWages || 0}</strong></p>
                                <p>Employee Share: <strong>{reportData?.data?.lastContribution?.employeeShare || 0}</strong></p>
                                <p>Employer Share: <strong>{reportData?.data?.lastContribution?.employerShare || 0}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="text-center my-4">Pension</h3>
                        <div className="row">
                            <div className="col-md-6">
                                <p>EPS Member (Y/N): <strong>{reportData?.data?.withdrawabilityCheckupReport.find((item:any) => item.category === "EPF Pension Records")?.isEpsMember || "-"}</strong></p>
                                <p>Total Pension Balance: <strong>{formatCurrency(reportData?.data?.epsDetails?.pensionStats?.totalPensionShare)|| "₹ 0"}</strong></p>
                                <p>Pension Withdrawn: <strong>{formatCurrency(reportData?.data?.epsDetails?.pensionStats?.totalPensionWithdrawnAmt)|| "₹ 0"}</strong></p>
                            </div>
                            <div className="col-md-6">
                                <p>Pension Available to Withdraw: <strong>{formatCurrency(reportData?.data?.epsDetails?.pensionStats?.totalPensionAvailableToWithdraw)|| "₹ 0"}</strong></p>
                                <p>Monthly Pension at 58 Years of Age: <strong>{formatCurrency(reportData?.data?.epsDetails?.pensionStats?.monthlyPensionAfter58) || "₹ 0"}</strong></p>
                                <p>EPS Service History: <strong>{reportData?.data?.epsDetails?.pensionStats?.epsServiceInYears!=null ? `${reportData.data.epsDetails.pensionStats.epsServiceInYears} ${
                                 reportData.data.epsDetails.pensionStats.epsServiceInYears > 1 ? "Yrs" : "Yr"
                                }`:"-"}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="text-center my-4">Service History</h3>
                        <div className="table-responsive">
                            <table className="table table-bordered">
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
                                                {reportData?.data?.epsDetails?.chronologicallyOrderedCompanies.map((item: any, index: any) => {
                                                     const memberId = item.memberId;
                                                    const transferToList = reportData?.data?.epsDetails?.transferChainMap
                                                        ?.filter((t: any) => t.from === memberId && t.linked===true)
                                                        ?.map((t: any) => {
                                                            const targetCompany = reportData?.data?.epsDetails?.chronologicallyOrderedCompanies
                                                                ?.find((comp: any) => comp.memberId === t.to)
                                                            return targetCompany?.establishmentName || t.to;
                                                        });;

                                                    const transferTo = transferToList?.length > 0 ? transferToList.join(", ") : "No Transfer";
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.establishmentName || "-"}</td>
                                                            <td>{item.memberId || "-"}</td>
                                                            <td>
                                                                {item.doj || "-"} - {item.doe || "Present"}
                                                            </td>
                                                            <td>{formatCurrency(item.shareDetails?.employeeShare) || "₹ 0" }</td>
                                                            <td>{formatCurrency(item.shareDetails?.employerShare) || "₹ 0"}</td>
                                                            <td>{formatCurrency(item.shareDetails?.pensionShare) || "₹ 0"}</td>
                                                            <td>{item.is10cCompany ? "Amount Withdrawn" : transferTo}</td>
                                                            <td>{item.is10cCompany ? "Yes" : "No"}</td>
                                                            <td>{item.lastContributionDetails?.epfWages || "0"}</td>
                                                            <td>{reportData?.data?.epsDetails?.overallEpsMemberFlag ? "No" : "Yes"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                            <div className="card mb-4">
                                <div className="card-body">
                                    <h3 className="text-center my-4">Withdrawability Checkup Report</h3>
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Company Name</th>
                                                    <th>Member ID</th>
                                                    <th>Error Category</th>
                                                    <th>Error sub Category</th>
                                                    <th>Error Type</th>
                                                    <th>Error Message</th>
                                                    <th>Wage Month</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const allRows: any[] = [];

                                                    const memberOrderMap = new Map<string, number>(
                                                        historyData.map((entry: any, index: number) => [
                                                            entry?.details["Member Id"],
                                                            index,
                                                        ])
                                                    );
                                                    
                                                    reportData?.data?.withdrawabilityCheckupReport
                                                        ?.filter((item: any) =>
                                                            item?.category === "PF Contributions" ||
                                                            item?.category === "EPF Pension Records"
                                                        )
                                                        ?.forEach((item: any) => {
                                                            item?.subCategory.forEach((sub: any) => {
                                                                const messages = sub?.errorMessages || [];

                                                                messages.forEach((msg: string) => {
                                                                    //Unified Member ID extraction from message
                                                                    // const match = msg.match(/\(([A-Z0-9]+)\)/i);
                                                                    // const memberId = match ? match[1] : "-";
                                                                    const allMatches = [...msg.matchAll(/\(([A-Z0-9]+)\)/gi)];
                                                                    const memberId = allMatches.length > 0 ? allMatches[allMatches.length - 1][1] : "-";
                                                                    
                                                                    const history = historyData.find(
                                                                        (entry: any) => entry?.details["Member Id"] === memberId
                                                                    );

                                                                    const companyName = history?.company || "-";
                                                                    // const doj = history?.details["Joining Date"];
                                                                    // const exitDate = history?.details["Exit Date"] || null;

                                                                    let errorType = "-";
                                                                    let cleanedMsg = msg;
                                                                    let wageMonth = "-";

                                                                    if (
                                                                        item?.category === "PF Contributions" &&
                                                                        sub?.name === "Amount_Consolidation"
                                                                    ) {
                                                                        // Extract all member IDs from the message (alphanumeric, 10+ chars)
                                                                        const memberIds = [...msg.matchAll(/\(([A-Z0-9]{10,})\)/gi)].map(m => m[1]);

                                                                        memberIds.forEach((id, idx) => {
                                                                            const isLast = idx === memberIds?.length - 1;
                                                                            const message = isLast
                                                                                ? "PF not transferred to latest company"
                                                                                : "Amount not yet transferred";

                                                                            // Find matching history entry by Member Id
                                                                            const matchedHistory = historyData.find(
                                                                                (entry: any) => entry?.details["Member Id"] === id
                                                                            );

                                                                            allRows.push({
                                                                                companyName: matchedHistory?.company || "-",
                                                                                memberId: id,
                                                                                category: item?.category,
                                                                                subCategory: sub?.name,
                                                                                errorType: "Medium",
                                                                                errorMessage: message,
                                                                                wageMonth: "-",
                                                                                // doj: matchedHistory?.details["Joining Date"],
                                                                                // exit: matchedHistory?.details["Exit Date"] || null,
                                                                                orderIndex: memberOrderMap.get(id) ?? Infinity,
                                                                            });
                                                                        });

                                                                        return;
                                                                    }


                                                                    if (sub?.name === "Contribution_DOE_Anomalies") {
                                                                        const monthMatch = msg.match(/\[(\w{3}-\d{4})\]/);
                                                                        wageMonth = monthMatch ? monthMatch[1] : "-";

                                                                        if (msg.includes("Contribution made post Employment Termination in")) {
                                                                            cleanedMsg = "Contribution made post Employment Termination";
                                                                            errorType = "Critical";
                                                                        } else if (msg.includes("is Exempted Organisation")) {
                                                                            cleanedMsg = msg.replace(/^is\s+/, "");
                                                                            errorType = "Medium";
                                                                        }
                                                                    } else if (sub?.name === "Contribution_DOJ_Anomalies") {
                                                                        const monthMatch = msg.match(/\[(\w{3}-\d{4})\]/);
                                                                        wageMonth = monthMatch ? monthMatch[1] : "-";

                                                                        if (msg.includes("Transaction made before Date of Joining at")) {
                                                                            cleanedMsg = "Transaction made before Date of Joining at";
                                                                            errorType = "Critical";
                                                                        } else if (msg.includes("is Exempted Organisation")) {
                                                                            cleanedMsg = msg.replace(/^is\s+/, "");
                                                                            errorType = "Medium";
                                                                        }
                                                                    } else if (sub?.name === "Missing_Contribution") {
                                                                        const monthsMatch = msg.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}/g);
                                                                        wageMonth = monthsMatch?.join(", ") || "-";

                                                                        if (msg.includes("and NCP days of")) {
                                                                            const year = msg.match(/missing in (\d{4})/)?.[1] || "-";
                                                                            const ncp = msg.match(/NCP days of (\d+)/)?.[1] || "-";
                                                                            cleanedMsg = `Contribution for missing in ${year} and NCP days of ${ncp} marked`;
                                                                            errorType = "Medium";
                                                                        } else if (msg.includes("and NCP days not marked for")) {
                                                                            const year = msg.match(/missing in (\d{4})/)?.[1] || "-";
                                                                            cleanedMsg = `Contribution for missing in ${year} and NCP days not marked`;
                                                                            errorType = "Critical";
                                                                        }
                                                                    } else if (sub?.name === "Incorrect_Contribution") {
                                                                        const monthsMatch = msg.match(/\[Months:\s*([^\]]+)\]/);
                                                                        wageMonth = monthsMatch?.[1]?.trim() || "-";

                                                                        if (msg.includes("Suspected VPF membership")) {
                                                                            cleanedMsg = "Suspected VPF membership";
                                                                            errorType = "Medium";
                                                                        } else if (msg.includes("Incorrect Employee contribution")) {
                                                                            cleanedMsg = "Incorrect Employee contribution";
                                                                            errorType = "Critical";
                                                                        } else if (msg.includes("Incorrect Employer share")) {
                                                                            cleanedMsg = "Incorrect Employer share";
                                                                            errorType = "Critical";
                                                                        }
                                                                    } else {
                                                                        let isHandledMessage = false;

                                                                        if (msg.includes("EPS deducted even when wages are more than 15000")) {
                                                                            cleanedMsg = "EPS deducted even when wages are more than 15000";
                                                                            errorType = "Medium";
                                                                            isHandledMessage = true;
                                                                        } else if (/is Inferred Company$/.test(msg)) {
                                                                            cleanedMsg = "Inferred Company";
                                                                            errorType = "Critical";
                                                                            isHandledMessage = true;
                                                                        } else if (/from .*?\(.*?\)/.test(msg)) {
                                                                            cleanedMsg = msg.replace(/ from .*?\(.*?\)/, "").trim();
                                                                            errorType = "Medium";
                                                                            isHandledMessage = true;
                                                                        }

                                                                        if (item?.category === "EPF Pension Records" && !isHandledMessage) {
                                                                            return;
                                                                        }

                                                                        // if (item?.category === "EPF Pension Records") {
                                                                        //     errorType = msg.includes("EPS transferred from") ? "Medium" : "Critical";
                                                                        // }
                                                                    }

                                                                    allRows.push({
                                                                        companyName,
                                                                        memberId,
                                                                        category: item.category,
                                                                        subCategory: sub.name,
                                                                        errorType,
                                                                        errorMessage: cleanedMsg,
                                                                        wageMonth,
                                                                        // doj,
                                                                        // exit: exitDate,
                                                                        orderIndex: memberOrderMap.get(memberId) ?? Infinity,
                                                                    });
                                                                });
                                                            });
                                                        });

                                                    allRows.sort((a, b) => a.orderIndex - b.orderIndex);

                                                    return allRows.map((row, index) => (
                                                        <tr key={index}>
                                                            <td>{row.companyName}</td>
                                                            <td>{row.memberId}</td>
                                                            <td>{row.category}</td>
                                                            <td>{row.subCategory}</td>
                                                            <td className={row.errorType === "Critical" ? "text-danger" : row.errorType === "Medium" ? "text-warning" : ""}>
                                                                {row.errorType}
                                                            </td>
                                                            <td>{row.errorMessage}</td>
                                                            <td>{row.wageMonth}</td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className=" text-center my-4">Withdrawability Checkup Report</h3>
                        {renderWithdrawabilityReport(reportData?.data?.withdrawabilityCheckupReport)}
                    </div>
                </div>

                <div className="card mb-4">
                <div className="card-body">
                <h3 className="text-center my-4" >Claims Data</h3>
                {sortedMemberIds.length > 0 ? (
                    <div>
                       
                        {sortedMemberIds.map((memberId) => (
                            <div key={memberId} className="mb-4">
                                <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>Member ID: {memberId} || Company Name: {memberIdToCompanyMap[memberId]}</p>
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Claim ID</th>
                                            <th>Receipt Date</th>
                                            <th>Approved Date</th>
                                            <th>Form Type</th>
                                            <th>Description</th>
                                            <th>Claim Amount</th>
                                            <th>Rejection Date</th>
                                            <th>Rejection Reason</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedClaims[memberId].map((claim, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{claim.claimId}</td>
                                                <td>{claim.receiptDate}</td>
                                                <td>{claim.approvedDate || "N/A"}</td>
                                                <td>{claim.formType}</td>
                                                <td>{claim.claimDescription}</td>
                                                <td>{claim.totalAmount || "N/A"}</td>
                                                <td>{claim.rejectDate || "N/A"}</td>
                                                <td className="text-danger">{claim.rejectionReason || "N/A"}</td>
                                                <td>{claim.location || "N/A"}</td>
                                                <td>{claim.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5">
                        <h6 className="text-center text-muted">
                                        No Claims Found!!
                                    </h6>       
                    </div>
                )}
                </div>
                </div>

            </div>
             </>
             )}
        </>
    );
};

export default Pfreport;