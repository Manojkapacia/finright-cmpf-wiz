import React, { useState } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
interface PFPassbookClaims {
    jsonData?: any
    onBack: () => void;
}
interface PassbookTotals {
    employeeShare: number;
    employerShare: number;
    pensionShare: number;
}
const PFPassbook: React.FC<PFPassbookClaims> = ({ jsonData, onBack }) => {
    const data = jsonData?.data;

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const handleCompanyChange = (event: any) => {
        // setSelectedCompany(event.target.value);
        const companyId = event.target.value;
        setSelectedCompany(companyId);
        setSelectedYear(null);
    };

    const handleYearChange = (event: any) => {
        setSelectedYear(event.target.value);
    };

    const hasServiceHistory =
        Array.isArray(data?.serviceHistory?.history) &&
        data.serviceHistory.history.length > 0;

    const allPassbookIds =
        data?.passbooks ? Object.keys(data.passbooks) : [];


    // const companyHasPassbook = selectedCompany && data.passbooks[selectedCompany];
    // const passbookData = selectedCompany && selectedYear ? data.passbooks[selectedCompany][selectedYear] : null;
    // const isPassbookEmpty = passbookData === null || Object.keys(passbookData)?.length === 0;
    const companyPassbookRaw: any = selectedCompany && data?.passbooks?.[selectedCompany];
    const isTrustPassbook = companyPassbookRaw?.isTrust === "true";
    const isNormalPassbook = companyPassbookRaw && typeof companyPassbookRaw === "object" && !isTrustPassbook;
    const passbookData = isNormalPassbook && selectedYear
        ? companyPassbookRaw?.[selectedYear] ?? null
        : null;
    const isPassbookEmpty = !passbookData || Object.keys(passbookData || {}).length === 0;

    return (

        <>
            <button className="btn p-0 d-flex align-items-center mt-5 mb-md-3" onClick={onBack}>
                <ArrowLeft size={20} className="me-1" /> Back
            </button>
            <div>
                <h3>Passbook Details</h3>
                <div className="d-flex mb-4" style={{ gap: "1rem" }}>

                    <select
                        className="form-select w-75"
                        onChange={handleCompanyChange}
                        value={selectedCompany || ""}
                    >
                        <option value="">Select Company</option>
                        {hasServiceHistory
                            ? data?.serviceHistory.history.map((historyItem: any, index: number) => {
                                const memberId = historyItem.details["Member Id"];
                                const company = historyItem.company;
                                const joiningDate = historyItem.details["Joining Date"];
                                const endDate = historyItem.details["Exit Date"] || (index === 0 ? "Present" : "NA");

                                return (
                                    <option key={index} value={memberId}>
                                        {company} - {memberId} ({joiningDate} to {endDate})
                                    </option>
                                );
                            })
                            : allPassbookIds.map((memberId, index) => (
                                <option key={index} value={memberId}>
                                    Passbook ID - {memberId}
                                </option>
                            ))}
                    </select>

                    {isNormalPassbook && (
                        <select
                            className="form-select w-25"
                            onChange={handleYearChange}
                            value={selectedYear || ""}
                            disabled={!selectedCompany}
                        >
                            <option value="">Select Year</option>
                            {Object.keys(companyPassbookRaw || {})
                                .map(year => Number(year))
                                .sort((a, b) => b - a)
                                .map((year, index) => (
                                    <option key={index} value={year}>{year}</option>
                                ))}
                        </select>
                    )}
                </div>
                {selectedCompany && isTrustPassbook && (
                    <h6 className="text-danger">
                        No Passbook Data Found!! Either this is a Trust OR Transferred Service History
                    </h6>
                )}

                {selectedCompany && isNormalPassbook && selectedYear && isPassbookEmpty && (
                    <h6 className="text-danger">Sorry, We have no record found</h6>
                )}

                {selectedCompany && isNormalPassbook && selectedYear && !isPassbookEmpty && (
                    <div>
                        <h5>Year: {selectedYear}</h5>
                        <div className="accordion" id="passbookAccordion">
                            <div className="accordion-body">
                                <h4>Opening Balance</h4>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>Employee Share</th>
                                            <th>Employer Share</th>
                                            <th>Pension Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{passbookData?.openingBalance?.particulars}</td>
                                            <td>{passbookData?.openingBalance?.employeeShare}</td>
                                            <td>{passbookData?.openingBalance?.employerShare}</td>
                                            <td>{passbookData?.openingBalance?.pensionShare}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h4>Transactions</h4>
                                <table className="table table-hover table-bordered text-center">
                                    <thead>
                                        <tr>
                                            <th>Wage Month</th>
                                            <th>Transaction Date</th>
                                            <th>Transaction Type</th>
                                            <th>Particulars</th>
                                            <th>EPF Wages</th>
                                            <th>EPS Wages</th>
                                            <th>Employee Share</th>
                                            <th>Employer Share</th>
                                            <th>Pension Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {passbookData?.transactions?.map((txn: any, index: any) => (
                                            <tr key={index}>
                                                <td>{txn?.wageMonth}</td>
                                                <td>{txn?.transactionDate}</td>
                                                <td>{txn?.transactionType}</td>
                                                <td>{txn?.particulars}</td>
                                                <td>{txn?.epfWages}</td>
                                                <td>{txn?.epsWages}</td>
                                                <td>{txn?.employeeShare}</td>
                                                <td>{txn?.employerShare}</td>
                                                <td>{txn?.pensionShare}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h4>Totals</h4>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>Employee Share</th>
                                            <th>Employer Share</th>
                                            <th>Pension Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(passbookData?.totals || {}).map(([key, total], index) => {
                                            const typedTotal = total as PassbookTotals;
                                            return (
                                                <tr key={index}>
                                                    <td>{key}</td>
                                                    <td>{typedTotal.employeeShare}</td>
                                                    <td>{typedTotal.employerShare}</td>
                                                    <td>{typedTotal.pensionShare}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <h4>Interest Details</h4>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>Employee Share</th>
                                            <th>Employer Share</th>
                                            <th>Pension Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.interestDetails?.particulars}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.interestDetails?.employeeShare}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.interestDetails?.employerShare}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.interestDetails?.pensionShare}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h4>Closing Balance</h4>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>Employee Share</th>
                                            <th>Employer Share</th>
                                            <th>Pension Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.closingBalance?.particulars}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.closingBalance?.employeeShare}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.closingBalance?.employerShare}</td>
                                            <td>{data.passbooks[selectedCompany][selectedYear]?.closingBalance?.pensionShare}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PFPassbook;
