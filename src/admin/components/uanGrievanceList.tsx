import { useEffect, useState } from "react";
import { IoEyeOutline, IoPencil } from "react-icons/io5";
import { post } from "../../components/common/api";
import ToastMessage from "../../components/common/toast-message";

function UanGrievanceList({ jsonData }: any) {
    const uanNumber = jsonData?.data?.profile?.UAN;
    const [grievancesList, setGrievancesList] = useState<any[]>([]);
    const [message, setMessage] = useState({ type: "", content: "" });
    const [selectedRawData, setSelectedRawData] = useState<string | null>(null);
    const [showLoader, setShowLoader] = useState(false);
    const [grievanceLoginError, setGrievanceLoginError] = useState<any>(null);

    useEffect(() => {
        fetchGrievances();
    }, []);
    const fetchGrievances = async (page: number = 1) => {
        try {
            setShowLoader(true);
            const payload: any = {
                page,
                limit: 10,
                search: uanNumber,
                grievanceId: "",
                status: "",
                fromDate: null,
                toDate: null,
                closeYesterday: false,
            };

            const response: any = await post("list", payload);

            if (response.status === 200 && response.success) {
                setGrievancesList(response?.data);
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
    const handleUpdateAppeal = async (grievanceId: string, status: string, appealStatus: string) => {
        try {
            const res = await post("update-status", {
                grievanceId,
                status,
                appealStatus,
            });

            if (res.success) {
                setGrievancesList((prev: any) =>
                    prev.map((g: any) =>
                        g._id === grievanceId ? { ...g, status, appealStatus } : g
                    )
                );

                setMessage({
                    type: "success",
                    content: res.message || "Grievance updated successfully!",
                });
            } else {
                setMessage({
                    type: "error",
                    content: res.message || "Failed to update grievance.",
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

    const handleShowRawData = (grievance: any) => {
        setSelectedRawData(grievance?.rawData);
        setGrievanceLoginError(grievance?.grievanceLoginError);
        const modal = new (window as any).bootstrap.Modal(
            document.getElementById("rawDataModal")
        );
        modal.show();
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
                                        <th>Grievance Number</th>
                                        <th>Grievance ID</th>
                                        <th>Mobile Number</th>
                                        <th>Agent Name</th>
                                        <th>Applied On</th>
                                        <th>Status</th>
                                        <th>Appeal</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grievancesList.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center text-muted py-4">
                                                No grievances found matching your criteria!!
                                            </td>
                                        </tr>
                                    ) : (
                                        grievancesList.map((grievance: any) => (
                                            <tr key={grievance._id}>
                                                <td className="uan-cell">{grievance?.uan}</td>
                                                <td>{grievance?.userName}</td>
                                                <td>{grievance?.grievanceNumber}</td>
                                                <td>{grievance?.grievanceId}</td>
                                                <td>{grievance?.mobileNumber ? grievance?.mobileNumber : "--"}</td>
                                                <td>{grievance?.agentName ? grievance?.agentName : "--"}</td>
                                                <td>{new Date(grievance?.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${getStatusColor(grievance?.status)}`}>
                                                        {grievance?.status}
                                                    </span>
                                                    {grievance?.status.toLowerCase() === "case closed" && (

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
                                                                        onClick={() => handleUpdateAppeal(grievance._id, "appeal raised", "appeal raised")}
                                                                    >
                                                                        ✏️ Appeal Raised
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item d-flex align-items-center gap-2"
                                                                        onClick={() => handleUpdateAppeal(grievance._id, "appeal closed", "completed")}
                                                                    >
                                                                        ✅ Completed
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusColor(grievance?.appealStatus)}`}>
                                                        {grievance?.appealStatus}
                                                    </span>
                                                </td>
                                                <td className="ps-3">
                                                    <IoEyeOutline
                                                        size={20}
                                                        role="button"
                                                        className={grievance?.rawData ? "text-primary" : "text-muted"}
                                                        onClick={() => handleShowRawData(grievance)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>


                    </div>
                    {/* Bootstrap Modal */}
                    <div
                        className="modal fade"
                        id="rawDataModal"
                        tabIndex={-1}
                        aria-labelledby="rawDataModalLabel"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="rawDataModalLabel">Grievance Details</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {selectedRawData ? (
                                        <div dangerouslySetInnerHTML={{ __html: selectedRawData }} />
                                    ) : (
                                        <p className={`${grievanceLoginError? "text-danger" : "text-muted"} text-center`}>{grievanceLoginError ? grievanceLoginError : "No data available for this grievance!!"}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default UanGrievanceList;


