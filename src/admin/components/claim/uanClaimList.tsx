import { useEffect, useState } from "react";
import {  IoPencil } from "react-icons/io5";
import { post } from "../../../components/common/api";
import ToastMessage from "../../../components/common/toast-message";
import { toCamelCase } from "../../../components/common/data-transform";

function UanClaimList({ jsonData }: any) {
    const uanNumber = jsonData?.data?.profile?.UAN;
    const [claimsList, setClaimsList] = useState<any[]>([]);
    const [message, setMessage] = useState({ type: "", content: "" });
    const [showLoader, setShowLoader] = useState(false);
    useEffect(() => {
        fetchClaimsList();
    }, []);
    const fetchClaimsList = async (page: number = 1) => {
        try {
            setShowLoader(true);
            const payload: any = {
                page,
                limit: 10,
                search:uanNumber,
                claimType: "",
                status: "",
                fromDate: null,
                agentName: "",
            };

            const response: any = await post("claims/get-claims-list", payload);

            if (response.status === 200 && response.success) {
                setClaimsList(response?.data);
            }
        } catch (error: any) {
            console.error("Error fetching grievances:", error);
            setMessage({
                type: "error",
                content:
                    error?.response?.data?.message || "Failed to fetch grievances.",
            });
        } finally {
            setShowLoader(false);
        }
    };
    const handleUpdateclaimStatus = async (claimId: string, updateStatus: string) => {
        try {
          const res = await post("claims/update-claim-status", {
            claimId,
            updateStatus,
          });
    
          if (res.success) {
            fetchClaimsList();
            setClaimsList((prev: any) =>
              prev.map((g: any) =>
                g._id === claimId ? { ...g, updateStatus } : g
              )
            );
    
            setMessage({
              type: "success",
              content: res.message || "Claim updated successfully!",
            });
          } else {
            setMessage({
              type: "error",
              content: res.message || "Failed to update claim.",
            });
          }
        } catch (error: any) {
          console.error("Error updating appeal status:", error);
          setMessage({
            type: "error",
            content: error?.response?.data?.message || error?.message || "Something went wrong!"
          });
        }
      };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied': return 'status-applied';
            case 'in progress': return 'status-progress';
            case 'resolved': return 'status-resolved';
            case 'closed': return 'status-closed';
            default: return 'status-closed';
        }
    };
    return (
        <>
            {showLoader ? (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                    <div className="text-center p-4 bg-white rounded shadow">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Fetching Data, Please wait...</p>
                    </div>
                </div>
            ) : (
                <div className="container-fluid">
                    {message.type && <ToastMessage message={message.content} type={message.type} />}
                    <div className="row">
                        <div className="table-responsive">
                                       <table className="table table-hover">
                                         <thead className="table-light">
                                           <tr>
                                             <th>UAN</th>
                                             <th>User Name</th>
                                             <th>Claim Type</th>
                                             <th>Claim  ID</th>
                                             <th>Mobile Number</th>
                                             <th>Agent Name</th>
                                             <th>Applied On</th>
                                             <th>Status</th>
                                             <th>Update</th>
                                             {/* <th>Actions</th> */}
                                           </tr>
                                         </thead>
                                         <tbody>
                                           {claimsList.length === 0 ? (
                                             <tr>
                                               <td colSpan={10} className="text-center text-muted py-4">
                                                 No claims found matching your criteria!!
                                               </td>
                                             </tr>
                                           ) : (
                                             claimsList.map((claim: any) => (
                                               <tr key={claim._id}>
                                                 <td className="uan-cell">{claim?.uan}</td>
                                                 <td>{claim?.userName}</td>
                                                 <td>{toCamelCase(claim?.claimType)}</td>
                                                 <td>{claim?.claimId}</td>
                                                 <td>{claim?.mobileNumber ? claim?.mobileNumber : "--"}</td>
                                                 <td>{claim?.agentName ? claim?.agentName : "--"}</td>
                                                 <td>{new Date(claim?.createdAt).toLocaleDateString()}</td>
                                                 <td>
                                                   <span className={`badge ${getStatusColor(claim?.status)}`}>
                                                     {toCamelCase(claim?.status)}
                                                   </span>
                                                 </td>
                                                 <td>
                                                   <span className={`badge ${getStatusColor(claim?.updateStatus)}`}>
                                                     {toCamelCase(claim?.updateStatus)}
                                                   </span>
                                                   {claim?.updateStatus.toLowerCase() === "pending customer update" && (
                       
                                                     <div className="dropdown d-inline ms-2">
                                                       <button
                                                         className="btn btn-light btn-sm rounded-circle shadow-sm"
                                                         type="button"
                                                         data-bs-toggle="dropdown"
                                                         aria-expanded="false"
                                                       >
                                                         <IoPencil size={14} className="text-primary" />
                                                       </button>
                                                       <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                                         <li>
                                                           <button
                                                             className="dropdown-item d-flex align-items-center gap-2"
                                                             onClick={() => handleUpdateclaimStatus(claim._id, "closed")}
                                                           >
                                                             ✅ Case Closed
                                                           </button>
                                                         </li>
                                                       </ul>
                                                     </div>
                                                   )}
                                                 </td>
                                               </tr>
                                             ))
                                           )}
                                         </tbody>
                                       </table>
                                     </div>


                    </div>
                    {/* Bootstrap Modal */}
                </div>
            )}
        </>
    );
}
export default UanClaimList;


