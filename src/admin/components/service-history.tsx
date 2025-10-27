import React from "react";
import { Eye, EyeSlash, ArrowLeft } from "react-bootstrap-icons";
interface ServiceHistoryProps {
    jsonData: any;
    onBack: () => void;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ jsonData, onBack }) => {
    // const data = getData.data.serviceHistory.history;
    const data = jsonData?.data?.serviceHistory?.history;
    const overView = jsonData?.data?.serviceHistory?.overview;
    const balance = jsonData?.data?.home
    const passbooks = jsonData?.data?.passbooks
    console.log(jsonData)
    // const handleOpenModal = (details) => {
    //     setCurrentDetails(details);
    // };

    const formatDate = (dateString: any) => {
        if (!dateString) return null;
        const ddMmYyyyPattern = /^\d{2}\/\d{2}\/\d{4}$/;
        if (ddMmYyyyPattern.test(dateString)) {
            return dateString;
        }

        const split = dateString.includes('/') ? dateString.split('/') : dateString.split('-');
        if (split.length === 3 && split[0].length === 4) {
            const [yyyy, mm, dd] = split;
            return `${dd}/${mm}/${yyyy}`;
        }

        return dateString;
    };


    // Add this helper function near the top of the component

    const calculateTotalShares = () => {
        let totalEmployeeShare = 0;
        let totalEmployerShare = 0;
        let totalPensionShare = 0;

        if (passbooks) {
            Object.values(passbooks as Record<string, any>).forEach(passbook => {
                const years = Object.keys(passbook).filter(key => !isNaN(Number(key)));

                if (years.length > 0) {
                    const latestYear = Math.max(...years.map(Number));
                    const closingBalance = passbook[latestYear]?.closingBalance;

                    if (closingBalance) {
                        const employeeShare = typeof closingBalance.employeeShare === "string"
                            ? Number(closingBalance.employeeShare.replace(/[₹,\s]/g, ""))
                            : Number(closingBalance.employeeShare || 0);

                        const employerShare = typeof closingBalance.employerShare === "string"
                            ? Number(closingBalance.employerShare.replace(/[₹,\s]/g, ""))
                            : Number(closingBalance.employerShare || 0);

                        const pensionShare = typeof closingBalance.pensionShare === "string"
                            ? Number(closingBalance.pensionShare.replace(/[₹,\s]/g, ""))
                            : Number(closingBalance.pensionShare || 0);

                        totalEmployeeShare += employeeShare;
                        totalEmployerShare += employerShare;
                        totalPensionShare += pensionShare;
                    }
                }
            });
        }

        return {
            totalEmployeeShare: `₹ ${totalEmployeeShare.toLocaleString()}`,
            totalEmployerShare: `₹ ${totalEmployerShare.toLocaleString()}`,
            totalPensionShare: `₹ ${totalPensionShare.toLocaleString()}`,
            totalBalance: `₹ ${(totalEmployeeShare + totalEmployerShare + totalPensionShare).toLocaleString()}`
        };
    };

    const {
        totalEmployeeShare,
        totalEmployerShare,
        totalPensionShare,
        totalBalance
    } = calculateTotalShares();

    const getLastContributionMonth = (memberId: any) => {
        if (passbooks && passbooks[memberId]) {
            const passbook = passbooks[memberId];
            const years = Object.keys(passbook).filter(key => !isNaN(Number(key)));

            // Sort years in descending order to check most recent first
            const sortedYears = years.sort((a, b) => Number(b) - Number(a));

            for (const year of sortedYears) {
                const transactions = passbook[year]?.transactions || [];
                // Filter transactions that have "Cont." in particulars and get the most recent one
                const contributionTransactions = transactions.filter((t: any) =>
                    t.particulars && t.particulars.includes('Cont.')
                );

                if (contributionTransactions.length > 0) {
                    // Return the wage month of the last contribution transaction
                    return contributionTransactions[contributionTransactions.length - 1].wageMonth || "N/A";
                }
            }
        }
        return "N/A";
    };

    console.log(getLastContributionMonth('BGBNG00268580000268966'), "last month")
    const [expandedRows, setExpandedRows] = React.useState(data?.map((_: any, index: any) => index));
    const toggleRow = (index: any) => {
        setExpandedRows((prevState: any) => {
            if (prevState.includes(index)) {
                return prevState.filter((row: any) => row !== index);
            } else {
                // Add it to the array (expand)
                return [index, ...prevState];
            }
        });
    };


    return (
        <div className="container">
            <div className="row">
                <div className="col-md-10 offset-md-1">
                    <button className="btn p-0 d-flex align-items-center mt-5" onClick={onBack}>
                        <ArrowLeft size={20} className="me-1" /> Back
                    </button>
                </div>
            </div>
            {/* new one below */}
            {(data == null && overView == null) ?
                <table className="table table-hover mt-5">
                    <tbody><tr><td colSpan={5} className="text-center">No Data Found!!</td></tr></tbody>
                </table> :
                <>
                    <div className="row">
                        <div className="col-md-10 offset-md-1 mt-3">

                            <h3>Balance </h3>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th className="text-center">Member ID</th>
                                        <th className="text-center">Company Name</th>
                                        <th className="text-center">Employee Share</th>
                                        <th className="text-center">Employer Share</th>
                                        <th className="text-center">Pension Share</th>
                                        <th className="text-center">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balance?.memberWiseBalances.map((memberBalance: any) => {
                                        let employeeShare = 'N/A';
                                        let employerShare = 'N/A';
                                        let pensionShare = 'N/A';
                                        let balanceSum = null;
                                        let companyName = 'N/A';

                                        // Get closing balances from passbook
                                        if (passbooks && passbooks[memberBalance?.memberId]) {
                                            const passbook = passbooks[memberBalance.memberId];
                                            const years = Object.keys(passbook).filter(key => !isNaN(Number(key))).map(Number);
                                            if (years.length > 0) {
                                                const latestYear = Math.max(...years);
                                                const closingBalance = passbook[latestYear]?.closingBalance;

                                                if (closingBalance) {
                                                    employeeShare = closingBalance?.employeeShare || 'N/A';
                                                    employerShare = closingBalance?.employerShare || 'N/A';
                                                    pensionShare = closingBalance?.pensionShare || 'N/A';

                                                    const eShare = parseFloat(employeeShare?.toString().replace(/[₹,\s]/g, '')) || 0;
                                                    const rShare = parseFloat(employerShare?.toString().replace(/[₹,\s]/g, '')) || 0;
                                                    const pShare = parseFloat(pensionShare?.toString().replace(/[₹,\s]/g, '')) || 0;
                                                    balanceSum = eShare + rShare + pShare;
                                                }
                                            }
                                        }

                                        // Match company name from history
                                        if (data && Array.isArray(data)) {
                                            const matchedEntry = data.find((entry: any) =>
                                                entry?.details?.['Member Id'] === memberBalance.memberId
                                            );
                                            if (matchedEntry?.company) {
                                                companyName = matchedEntry.company;
                                            }
                                        }

                                        return (
                                            <tr key={memberBalance?.memberId}>
                                                <td className="text-center">{memberBalance.memberId || '-'}</td>
                                                <td className="text-center">{companyName}</td>
                                                <td className="text-center">{employeeShare}</td>
                                                <td className="text-center">{employerShare}</td>
                                                <td className="text-center">{pensionShare}</td>
                                                <td className="text-center">
                                                    {balanceSum !== null ? `₹ ${balanceSum.toLocaleString()}` : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Total Row */}
                                    <tr>
                                        <td className="text-center"><strong>Total</strong></td>
                                        <td className="text-center">-</td>
                                        <td className="text-center"><strong>{totalEmployeeShare}</strong></td>
                                        <td className="text-center"><strong>{totalEmployerShare}</strong></td>
                                        <td className="text-center"><strong>{totalPensionShare}</strong></td>
                                        <td className="text-center"><strong>{totalBalance}</strong></td>
                                    </tr>
                                </tbody>
                            </table>


                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 offset-md-1 mt-3">
                            <h3>Summary </h3>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th className="text-center">Total Experience</th>
                                        <th className="text-center">Date of Joining</th>
                                        <th className="text-center">Total NCP days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center">
                                            {overView["Total Experience"]}
                                        </td>
                                        <td className="text-center">
                                            {overView["Date of Joining"]}
                                        </td>
                                        <td className="text-center">
                                            {overView["Total NCP Days"]}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-10 offset-md-1 mt-3">
                            <h3>History </h3>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th className="text-center">Sr. No.</th>
                                        <th className="text-center">Period</th>
                                        <th className="text-center">Company</th>
                                        <th className="text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item: any, index: any) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td className="text-center">
                                                    {item.heading}
                                                </td>
                                                <td className="text-center">
                                                    {item.period}
                                                </td>
                                                <td className="text-center">
                                                    {item.company}
                                                </td>
                                                <td className="text-center">
                                                    {expandedRows.includes(index) ? (
                                                        <Eye
                                                            size={20}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => toggleRow(index)}
                                                        />
                                                    ) : (
                                                        <EyeSlash
                                                            size={20}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => toggleRow(index)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Accordions Section */}
                    <div className="row mt-3">
                        <div className="col-md-10 offset-md-1">
                            {expandedRows.map((index: any) => {
                                const item = data[index];
                                return (
                                    <div key={index} className="accordion-item mb-3">
                                        <div className="accordion-header bg-light p-3 border">
                                            <h5>Details for: {item.company}</h5>
                                        </div>
                                        <div className="accordion-body border p-3" style={{ backgroundColor: '#ffffff' }}>
                                            <p><strong>Member ID:</strong> {item.details['Member Id'] || "N/A"}</p>
                                            <p><strong>Est Id:</strong> {item.details['Est Id'] || "N/A"}</p>
                                            <p><strong>NCP Days:</strong> {item.details['NCP Days'] || "N/A"}</p>
                                            <p><strong>Joining Date:</strong> {formatDate(item.details['Joining Date']) || "N/A"}</p>
                                            <p><strong>Total Service:</strong> {item.details['Total Service'] || "N/A"}</p>
                                            <p><strong>Last Contribution Month:</strong> {getLastContributionMonth(item.details['Member Id'])}</p>
                                            <p><strong>Exit Date:</strong> {item.details['Exit Date'] || "N/A"}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            }

            {/* <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <table className="table table-bordered">
                                <tbody>
                                    {Object.entries(currentDetails).map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{value || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>


    );
}

export default ServiceHistory