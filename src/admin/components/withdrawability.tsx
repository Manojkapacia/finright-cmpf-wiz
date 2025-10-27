import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from 'react-bootstrap-icons';
import './style/withdrawability.css'
import ToastMessage from "../../components/common/toast-message";
import { post } from "../../components/common/api";
import { formatCurrency } from "../../components/common/currency-formatter";
import { calculateEPFOProjections } from "../../helpers/growthProjection.js";
interface PassbookValues {
    totalEmployeeShare?: number;
    totalEmployerShare?: number;
    totalPensionShare?: number;
    totalInterestShare?: number;
}

const renderGrowthProjectionTable = (jsonData:any) => {
    const projections = calculateEPFOProjections(jsonData?.data);
    
    if (!projections?.historicalGrowth?.yearWiseGrowth?.length && 
        !projections?.futureProjections?.yearlyProjections?.length) {
        return null;
    }

    // Combine historical and projected data
    const allData = [
        ...projections.historicalGrowth.yearWiseGrowth,
        ...projections.futureProjections.yearlyProjections
    ];

    return (
        <div className="mb-4">
            <div className="alert alert-info">
                {projections.summary.croreStatus}
            </div>
            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>Type</th>
                        <th>Age</th>
                        <th>N</th>
                        <th>Year</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {allData.map((row, index) => (
                        <tr key={index} className={row.balance >= 10000000 ? "table-success" : ""}>
                            <td>{row.type}</td>
                            <td>{row.age}</td>
                            <td>{row.n}</td>
                            <td>{row.year}</td>
                            <td>{formatCurrency(row.balance)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="text-end mt-2">
                <small className="text-muted">
                    A : Actual,  P : Projected Monthly Contribution: {formatCurrency(projections.summary.monthlyContribution)}
                </small>
            </div>
        </div>
    );
};

function Withdrawability({ jsonData, onBack }: { jsonData: any; onBack: () => void }) {
    const [message, setMessage] = useState({ type: "", content: "" });
    const [loading, setLoading] = useState(false);
    const isMessageActive = useRef(false); // Prevents multiple messages from being displayed at the same time.
    const [isGrowthTableVisible, setIsGrowthTableVisible] = useState(true);
    const [reportData, setReportData] = useState<any>(null)

    const fetchReport = async () => {
        setLoading(true);
        try {
            const dataToSend = {
                userEmpHistoryCorrect: true,
                userStillWorkingInOrganization: true,
                currentOrganizationMemberId: jsonData?.data?.home?.currentEstablishmentDetails?.memberId || "",
                kycStatus: {
                    fullName: true,
                    gender: true,
                    fatherHusbandName: true,
                    physicallyHandicapped: true,
                    UAN: true,
                    dateOfBirth: true,
                    aadhaar: true,
                    pan: true,
                    bankAccountNumber: true,
                    bankIFSC: true
                },
                isReqFromAdmin: true,
                uanToSearch: jsonData?.meta.uan,
                userMobileNumber: jsonData?.data?.profile?.phone,
            };                 
            const response = await post('admin/withdrawability-check', dataToSend);
            setLoading(false);
            setReportData(response);
        } catch (error:any) {
            setLoading(false);
            setMessage({ type: "error", content: error.message });
        }
    };

    useEffect(() => {
        fetchReport();
    }, [jsonData]);

    // Toast Message Auto Clear
    useEffect(() => {
        if (message.type) {
            isMessageActive.current = true; // Set active state when a message is displayed
            const timer = setTimeout(() => {
                setMessage({ type: "", content: "" });
                isMessageActive.current = false; // Reset active state
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

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
                                    Success: {sub?.success} | Critical: {sub?.critical} | Medium: {sub?.medium}
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
                                {sub?.successMessage?.length > 0 && (
                                    <div className="text-success">
                                        Success Messages:
                                        {sub?.successMessage.map((msg:any, idx:any) => (
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

    const renderTable = (title:any, rows:any) => (
        <div className="mb-4">
            <h5 className="text-center my-4">{title}</h5>
            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>Year</th>
                        <th>Employee Share</th>
                        <th>Employer Share</th>
                        <th>Pension Share</th>
                        <th>Interest Share</th>
                    </tr>
                </thead>
                <tbody>
                    {rows &&
                        Object.entries(rows as Record<string, PassbookValues>)
                        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                            .map(([year, values]) => (
                                <tr key={year}>
                                    <td>{year}</td>
                                    <td>{values?.totalEmployeeShare}</td>
                                    <td>{values?.totalEmployerShare}</td>
                                    <td>{values?.totalPensionShare}</td>
                                    <td>{values?.totalInterestShare}</td>
                                </tr>
                            ))}
                    {/* {rows && (
                        <tr>
                            <td><b>Total</b></td>
                            <td>
                                <b>
                                    {Object.values(rows as Record<string, PassbookValues>).reduce(
                                        (acc, curr) => acc + (curr.totalEmployeeShare || 0),
                                        0
                                    )}
                                </b>
                            </td>
                            <td>
                                <b>
                                    {Object.values(rows as Record<string, PassbookValues>).reduce(
                                        (acc, curr) => acc + (curr.totalEmployerShare || 0),
                                        0
                                    )}
                                </b>
                            </td>
                            <td>
                                <b>
                                    {Object.values(rows as Record<string, PassbookValues>).reduce(
                                        (acc, curr) => acc + (curr.totalPensionShare || 0),
                                        0
                                    )}
                                </b>
                            </td>
                            <td>
                                <b>
                                    {Object.values(rows as Record<string, PassbookValues>).reduce(
                                        (acc, curr) => acc + (curr.totalInterestShare || 0),
                                        0
                                    )}
                                </b>
                            </td>
                        </tr>
                    )} */}
                </tbody>

            </table>
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
            <button className="btn p-0 d-flex align-items-center mt-5 mb-md-3" onClick={onBack}>
                <ArrowLeft size={20} className="me-1" /> Back
            </button>
            <div className="container my-5">
                {/* General Information */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-center my-4">General Information</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p>UAN: <strong>{reportData?.uan}</strong></p>
                                <p>Total PF Balance: <strong>{formatCurrency(reportData?.totalPfBalance) || 0}</strong></p>
                                <p>Maximum Withdrawable Limit: <strong>{formatCurrency(reportData?.maxWithdrawableLimit) || 0}</strong></p>
                                <p>Total Amount Stuck: <strong>{formatCurrency(reportData?.totalAmountStuck) || 0}</strong></p>
                                <p>Pension Withdrawable Amount : <strong>{formatCurrency(reportData?.pensionWithdrability?.withdrawableAmount) || 0}</strong></p>
                                <p>TDS on Amount : <strong>{formatCurrency(reportData?.tdsOnWithdrawal) || 0}</strong></p>
                            </div>
                            <div className="col-md-6">
                                <p>Estimated Resolution Time: <strong>{reportData?.estimatedResolutionTime || "-"}</strong></p>
                                <p>Amount Withdrawable Within 30 Days: <strong>{formatCurrency(reportData?.amountWithdrawableWithin30Days) || 0}</strong></p>
                                <p>Claim Rejection Probability: <strong>{reportData?.claimRejectionProbability || "-"}</strong></p>
                                <p>Last 6 Contribution Average: <strong>{formatCurrency(reportData?.averageOfLastSixTransactions) || 0}</strong></p>
                                <p>Pension Withdrawable Per Month : <strong>{formatCurrency(reportData?.pensionWithdrability?.pensionAmountPerMonth) || 0}</strong></p>
                                {reportData?.userSelectedValues?.userEpmloyementStatus?.currentCompanyCorrect === false && (
                                    <p>
                                        Employment Status:
                                        <strong> {reportData?.userSelectedValues?.userEpmloyementStatus?.employementStatus} </strong>
                                    </p>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Amount Contributed */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-center my-4">Amount Contributed Information</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p>Employee Share: <strong>{formatCurrency(reportData?.amountContributed?.totalEmployeeShare) || 0}</strong></p>
                                <p>Employer Share: <strong>{formatCurrency(reportData?.amountContributed?.totalEmployerShare) || 0}</strong></p>
                                <p>Pension Share: <strong>{formatCurrency(reportData?.amountContributed?.totalPensionShare) || 0}</strong></p>
                                <p>Total Interest: <strong>{formatCurrency(reportData?.amountContributed?.totalInterestShare) || 0}</strong></p>
                            </div>
                            <div className="col-md-6">
                                <p>Employee Share Interest: <strong>{formatCurrency(reportData?.amountContributed?.totalEmployeeShareInterest) || 0}</strong></p>
                                <p>Employer Share Interest: <strong>{formatCurrency(reportData?.amountContributed?.totalEmployerShareInterest) || 0}</strong></p>
                                <p>Pension Share Interest: <strong>{formatCurrency(reportData?.amountContributed?.totalPensionShareInterest) || 0}</strong></p>
                                <p>Current Year Interest: <strong>{formatCurrency(reportData?.amountContributed?.currentYearInterestShare) || 0}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Last Contribution */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-center my-4">Last Contribution</h5>
                        <p>Wage Month: <strong>{reportData?.lastContribution?.wageMonth || "-"}</strong></p>
                        <p>Transaction Date: <strong>{reportData?.lastContribution?.transactionDate || "-"}</strong></p>
                        <p>Transaction Type: <strong>{reportData?.lastContribution?.transactionType || "-"}</strong></p>
                        <p>EPF Wages: <strong>{reportData?.lastContribution?.epfWages || 0}</strong></p>
                        <p>EPS Wages: <strong>{reportData?.lastContribution?.epsWages || 0}</strong></p>
                        <p>Employee Share: <strong>{reportData?.lastContribution?.employeeShare || 0}</strong></p>
                        <p>Employer Share: <strong>{reportData?.lastContribution?.employerShare || 0}</strong></p>
                    </div>
                </div>

                {/* Withdrawability Checkup Report */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-center my-4">Withdrawability Checkup Report</h5>
                        {renderWithdrawabilityReport(reportData?.withdrawabilityCheckupReport)}
                    </div>
                </div>

                {/* Fund Values */}
                {renderTable('Fund Values', reportData?.fundValues)}
                <div className="card mb-4">
                <div 
                    className="card-header bg-white d-flex justify-content-between align-items-center" 
                    style={{ 
                        cursor: 'pointer',
                        padding: '15px 20px',
                        borderBottom: '1px solid #dee2e6'
                    }} 
                    onClick={() => setIsGrowthTableVisible(!isGrowthTableVisible)}
                >
                    <div style={{ flex: 1 }}>
                        <h5 
                            className="mb-0" 
                            style={{
                                textAlign: "center",
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#333",
                                margin: "0 auto"
                            }}
                        >
                            EPFO Growth Projections
                        </h5>
                    </div>
                    <button 
                        className="btn btn-link"
                        aria-expanded={isGrowthTableVisible}
                        style={{
                            textDecoration: 'none',
                            color: '#666',
                            padding: '0 10px',
                            fontSize: '16px',
                            border: 'none',
                            background: 'none',
                            minWidth: '40px'
                        }}
                    >
                        {isGrowthTableVisible ? '▼' : '▶'}
                    </button>
                </div>
                <div 
                    className={`card-body ${isGrowthTableVisible ? 'show' : 'collapse'}`}
                    style={{
                        transition: 'all 0.3s ease',
                        padding: '20px'
                    }}
                >
                    {renderGrowthProjectionTable(jsonData)}
                </div>
            </div>
            </div>
             </>
        )}
        </>
    );
}

export default Withdrawability;