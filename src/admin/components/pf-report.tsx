import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'react-bootstrap-icons';
import { get } from "../../components/common/api";
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
  const isMessageActive = useRef(false);
  const [reportData, setReportData] = useState<any>(null);
    const claimsData = jsonData?.data?.claims?.details;
    const historyData = jsonData?.data?.serviceHistory?.history || [];
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

    return (
        <>
         {loading ? (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                    <div className="text-center p-4 bg-white rounded shadow">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Fetching Report, Please wait...</p>
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
                                                            <td>{transferTo}</td>
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