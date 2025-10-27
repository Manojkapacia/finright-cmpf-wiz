import { useState } from "react";
import { ArrowLeft } from 'react-bootstrap-icons';
interface ClaimsProps {
    jsonData?:any 
    onBack: () => void;
}

const Claims: React.FC<ClaimsProps> = ({ jsonData, onBack }) => {
    let claimsData = jsonData?.data?.claims;
    let summary = jsonData?.data?.claims?.summary;

    const [selectedTab, setSelectedTab] = useState("Pending Claims");

    // Data access functions
    const getPendingClaims = () => {
        const pendingClaims = claimsData?.details?.["Pending Claims"];
        console.log(Array.isArray(pendingClaims))

        if (!Array.isArray(pendingClaims)) {
            // Return an empty array or handle the message appropriately
            return pendingClaims?.message ? [] : [];
        }
        console.log(pendingClaims);

        // Filter claims if it's an array
        return pendingClaims.filter(claim => claim.claimId);
    };
    const getSettledClaims = () => {
        const seteledClaims = claimsData?.details?.["Settled Claims"];
        if (!Array.isArray(seteledClaims)) {
            return seteledClaims?.message ? [] : [];
        }
        return seteledClaims.filter(claim => claim.claimId);
    };
    const getRejectedClaims = () => {
        const rejectedClaims = claimsData?.details?.["Rejected Claims"];
        if (!Array.isArray(rejectedClaims)) {
            return rejectedClaims?.message ? [] : [];
        }
        return rejectedClaims.filter(claim => claim.claimId);
    };

    return (
        <>
            {claimsData == null ? (
                <>
                    <button className="btn p-0 d-flex align-items-center mt-5 mb-md-3" onClick={onBack}>
                        <ArrowLeft size={20} className="me-1" /> Back
                    </button>
                    <table className="table table-hover mt-5">
                        <tbody><tr><td colSpan={5} className="text-center">No Data Found!!</td></tr></tbody>
                    </table>
                </>
            )

                :
                (<>
                    <button className="btn p-0 d-flex align-items-center mt-4 mb-md-3" onClick={onBack}>
                        <ArrowLeft size={20} className="me-1" /> Back
                    </button>
                    <div className="container my-4">
                        <h3>Claim Summary</h3>
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Summary Item</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total Claims</td>
                                    <td>{summary?.totalClaims}</td>
                                </tr>
                                <tr>
                                    <td>Approved Settled Claims</td>
                                    <td>{summary?.approvedSettledClaims}</td>
                                </tr>
                                <tr>
                                    <td>Approved Settled Amount</td>
                                    <td>{summary?.approvedSettledAmount}</td>
                                </tr>
                                <tr>
                                    <td>Rejected Claims</td>
                                    <td>{summary?.rejectedClaims}</td>
                                </tr>
                                <tr>
                                    <td>Pending In-Process Claims</td>
                                    <td>{summary?.pendingInProcessClaims}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        {/* Button Controls */}
                        <div className="btn-group mb-3">
                            <button className="btn btn-primary" onClick={() => setSelectedTab("Pending Claims")}>
                                Pending Claims
                                <span className="ms-2">
                                {
                                    Array.isArray(claimsData?.details?.["Pending Claims"])
                                        ? claimsData.details["Pending Claims"].filter(claim => claim.claimId).length
                                        : 0
                                }
                                </span>
                            </button>
                            <button className="btn btn-success" onClick={() => setSelectedTab("Settled Claims")}>
                                Settled Claims 
                                <span className="ms-2">
                                {
                                    Array.isArray(claimsData?.details?.["Settled Claims"])
                                        ? claimsData.details["Settled Claims"].filter(claim => claim.claimId).length
                                        : 0
                                }
                                </span>
                            </button>
                            <button className="btn btn-danger" onClick={() => setSelectedTab("Rejected Claims")}>
                                Rejected Claims
                                <span className="ms-2"> 
                                {
                                    Array.isArray(claimsData?.details?.["Rejected Claims"])
                                        ? claimsData.details["Rejected Claims"].filter(claim => claim.claimId).length
                                        : 0
                                }
                                </span> 
                            </button>
                        </div>

                        {/* Table Rendering */}
                        {selectedTab === "Pending Claims" && (
                            <div>
                                <h3>Pending Claims</h3>
                                <table className="table table-hover">
                                    <thead>
                                        {claimsData?.details?.["Pending Claims"]?.["message"] ?
                                            (<tr>
                                                <th>Category</th>
                                                <th>Message</th>
                                            </tr>) : (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Claim ID</th>
                                                    <th>Receipt Date</th>
                                                    <th>Member ID</th>
                                                    <th>Form Type</th>
                                                    <th>Description</th>
                                                    <th>Location</th>
                                                </tr>
                                            )}
                                    </thead>
                                    <tbody>
                                        {claimsData?.details?.["Pending Claims"]?.["message"] ?
                                            (
                                                <tr>
                                                    <td>Pending Claims</td>
                                                    <td>{claimsData?.details["Pending Claims"]?.message}</td>
                                                </tr>
                                            ) : (
                                                getPendingClaims().map((claim, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{claim.claimId}</td>
                                                        <td>{claim.receiptDate}</td>
                                                        <td>{claim.memberId}</td>
                                                        <td>{claim.formType}</td>
                                                        <td>{claim.claimDescription}</td>
                                                        <td>{claim.location || "N/A"}</td>
                                                    </tr>
                                                ))
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedTab === "Settled Claims" && (
                            <div>
                                <h3>Settled Claims</h3>
                                <table className="table table-hover">
                                    <thead>
                                        {claimsData?.details?.["Settled Claims"]?.["message"] ?
                                            (<tr>
                                                <th>Category</th>
                                                <th>Message</th>
                                            </tr>) : (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Claim ID</th>
                                                    <th>Receipt Date</th>
                                                    <th>Approved Date</th>
                                                    <th>Member ID</th>
                                                    <th>Form Type</th>
                                                    <th>Description</th>
                                                    <th>Claim Amount</th>
                                                    <th>Approved Date </th>
                                                </tr>
                                            )}
                                    </thead>
                                    <tbody>
                                        {claimsData?.details?.["Settled Claims"]?.["message"] ?
                                            (
                                                <tr>
                                                    <td>Settled Claims</td>
                                                    <td>{claimsData?.details["Settled Claims"]?.message}</td>
                                                </tr>
                                            ) : (
                                                getSettledClaims().map((claim, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{claim.claimId}</td>
                                                        <td>{claim.receiptDate}</td>
                                                        <td>{claim.approvedDate}</td>
                                                        <td>{claim.memberId}</td>
                                                        <td>{claim.formType}</td>
                                                        <td>{claim.claimDescription}</td>
                                                        <td>{claim.totalAmount}</td>
                                                        <td>{claim.approvedDate}</td>
                                                    </tr>
                                                ))
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedTab === "Rejected Claims" && (
                            <div>
                                <h3>Rejected Claims</h3>
                                <table className="table table-hover">
                                    <thead>
                                        {claimsData?.details?.["Rejected Claims"]?.["message"] ?
                                            (<tr>
                                                <th>Category</th>
                                                <th>Message</th>
                                            </tr>) : (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Claim ID</th>
                                                    <th>Receipt Date</th>
                                                    <th>Rejection Date</th>
                                                    <th>Member ID</th>
                                                    <th>Form Type</th>
                                                    <th>Description</th>
                                                    <th>Rejection Reason</th>
                                                </tr>
                                            )}

                                    </thead>
                                    <tbody>
                                        {claimsData?.details?.["Rejected Claims"]?.["message"] ?
                                            (
                                                <tr>
                                                    <td>Rejected Claims</td>
                                                    <td>{claimsData?.details["Rejected Claims"]?.message}</td>
                                                </tr>
                                            ) : (
                                                getRejectedClaims().map((claim, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{claim.claimId}</td>
                                                        <td>{claim.receiptDate}</td>
                                                        <td>{claim.rejectDate}</td>
                                                        <td>{claim.memberId}</td>
                                                        <td>{claim.formType}</td>
                                                        <td>{claim.claimDescription}</td>
                                                        <td className="text-danger">{claim.rejectionReason || "N/A"}</td>
                                                    </tr>
                                                ))
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>)
            }

        </>
    );
}
export default Claims