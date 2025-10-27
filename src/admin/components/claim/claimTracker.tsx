import { useState, useEffect } from 'react';
import '../grievance/grievanceTracker.css';
import SidebarLayout from '../../SidebarLayout';
import { get, post } from '../../../components/common/api';
import ToastMessage from '../../../components/common/toast-message';
import { IoPencil } from 'react-icons/io5';
import { Modal } from 'bootstrap';
import Select from "react-select";
import ClaimModal from './ClaimModal';
import { toCamelCase } from '../../../components/common/data-transform';

interface Claim {
  id: string;
  uan: string;
  userName: string;
  mobileNumber: string;
  emailId: string;
  grievanceId: string;
  grievanceNumber: string;
  appliedDate: Date;
  status: 'applied' | 'in progress' | 'resolved' | 'closed';
}

type FilterType = 'all' | 'totalNewApplied' | 'pending' | 'rejected' | 'settled' | 'totalPendingMoreThan30Days' | 'totalSettledButNotClosed';

export default function ClaimTracker() {
  const [claimsList, setClaimsList] = useState<Claim[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>('');
  const [grievanceIdFilter, setGrievanceIdFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  // const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: "", content: "" });
  const [claimsTrackerStats, setClaimsTrackerStats] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [grievanceIdModal, setGrievanceIdModal] = useState<Modal | null>(null);
  const [agentName, setAgentName] = useState<any[]>([]);
  const [agentNameFilter, setAgentNameFilter] = useState<string>('all');
  const [totalListCount, setTotalListCount] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [claimstypes, setClaimstypes] = useState<any[]>([]);
  const limit = 10;


  useEffect(() => {
    fetchClaimstypes();
    getUserList();
  }, []);

  useEffect(() => {
    const modalElement = document.getElementById('addGrievanceModal');
    if (modalElement && !grievanceIdModal) {
      const modal = new Modal(modalElement);
      setGrievanceIdModal(modal);
    }
  }, [grievanceIdModal]);

  const handleClaimSubmit = async (formData: any) => {
    setMessage({ type: "", content: "" });
    
    try {
      const response: any = await post("claims/add-claims", formData);
      
      if (response.status === 200 && response.success) {
        // Success toast
        setMessage({
          type: "success",
          content: response.message || "Claim added successfully!",
        });
        
        // Refresh the claims list
        await fetchClaimsList(currentPage);
        
        // Close the modal (this will trigger form reset in ClaimModal)
        setShowAddForm(false);
      } else {
        setMessage({
          type: "error",
          content: response?.message || "Failed to add claim.",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      
      setMessage({
        type: "error",
        content:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (dateFromFilter && dateToFilter) {
      fetchClaimsList();
    }
  }, [dateFromFilter, dateToFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClaimsList();
    }, 1000);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchClaimsList();
  }, [statusFilter, grievanceIdFilter, agentNameFilter]);

  const getUserList = async () => {
    try {
      setShowLoader(true);
      // setLoadingText("Fetching User List...");
      const response = await get("admin/get-all-users");
      setShowLoader(false);
      if (response.status === 200) {
        setAgentName(response?.data?.map((item: any) => ({
          value: item?.userName,
          label: item?.userName
        })));
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching user list:", error);
    }
  };

  const fetchClaimstypes = async () => {
      try {
        const response = await get('claims/get-claim-types');
        const ids = response.data.map((item: any) => item?.claimsType);
        setClaimstypes(ids);
      } catch (error) {
        console.error('Error fetching claim types:', error);
      }
    };

  const claimstypesOptionsList = claimstypes.map((type) => ({
    value: type,
    label: toCamelCase(type.replace(/_/g, ' '))
  }));

  const fetchClaimsList = async (page: number = 1) => {
    try {
      const payload: any = {
        page,
        limit,
        search: searchTerm.trim(),
        claimType: grievanceIdFilter === "all" ? "" : grievanceIdFilter,
        status: statusFilter === "all" ? "" : statusFilter,
        fromDate: dateFromFilter || null,
        toDate: dateToFilter || null,
        agentName: agentNameFilter === "all" ? "" : agentNameFilter,
      };

      const response: any = await post("claims/get-claims-list", payload);

      if (response.status === 200 && response.success) {
        setClaimsList(response?.data);
        setTotalPages(response?.pagination?.totalPages);
        setCurrentPage(response?.pagination?.currentPage);
        setClaimsTrackerStats(response?.pagination);
        setTotalListCount(response?.pagination?.total);
      }
    } catch (error: any) {
      console.error("Error fetching claims list:", error);
      setMessage({
        type: "error",
        content:
          error?.response?.data?.message || "Failed to fetch claims list.",
      });
    }
  };

  const handleFilterChange = (filter: any) => {
    setActiveFilter(filter);

    let toDate = "";

    if (filter === "settled") {
      setDateFromFilter("");
      setDateToFilter("");
      setStatusFilter("settled");
    } else if (filter === "rejected") {
      setDateFromFilter("");
      setDateToFilter("");
      setStatusFilter("rejected");
    } else if (filter === "totalPendingMoreThan30Days") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      toDate = date.toISOString().split("T")[0];
      setDateFromFilter("");
      setDateToFilter(toDate);
      setStatusFilter("pending");
    }

    if (filter === "totalSettledButNotClosed") {
      setStatusFilter("updateStatusNotClose");
      setDateFromFilter("");
      setDateToFilter("");
    }
    if (filter === "pending") {
      setStatusFilter("pending");
      setDateFromFilter("");
      setDateToFilter("");
    }
    if (filter === "totalNewApplied") {
      setStatusFilter("applied");
      setDateFromFilter("");
      setDateToFilter("");
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



  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGrievanceIdFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setActiveFilter('all'); // Reset active filter to 'all' when clearing filters
    setAgentNameFilter('all');
    fetchClaimsList();
  };

  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  
  

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
    <SidebarLayout>
     {showLoader && (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 9999 }}>
        <div className="text-center p-4 bg-white rounded shadow">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {/* <p className="mt-3">Please wait...</p> */}
        </div>
      </div>
    )}
      <div className="grievance-tracker bg-light min-vh-100 py-4">
        <div className="container-fluid">
          {message.type && <ToastMessage message={message.content} type={message.type} />}
          {/* Header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h1 className="fw-bold text-dark mb-1">Claim Tracking Dashboard</h1>
              <p className="text-muted mb-0">Manage and track all claims in one place</p>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-md-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary btn-lg d-flex align-items-center"
              >
                <span className="me-2">+</span>
                Add Claim
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'totalNewApplied' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange("totalNewApplied")}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalNewApplied}</div>
                  <div className="stat-label">Total New Claims</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'pending' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalPending}</div>
                  <div className="stat-label">Total Pending</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === "rejected" ? "stat-active" : ""
                  }`}
                onClick={() => handleFilterChange("rejected")}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalRejected}</div>
                  <div className="stat-label">Total Rejected</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'settled' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('settled')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalSettled}</div>
                  <div className="stat-label">Total Settled</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'totalSettledButNotClosed' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('totalSettledButNotClosed')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalSettledButNotClosed}</div>
                  <div className="stat-label">Settled But Not Closed</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'totalPendingMoreThan30Days' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('totalPendingMoreThan30Days')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{claimsTrackerStats?.totalPendingMoreThan30Days}</div>
                  <div className="stat-label">Pending More Than 30 Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Claim List */}
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Claim List</h6>
                {activeFilter !== 'all' && (
                  <span className="badge bg-secondary">
                    {/* Filter: {activeFilter} */}
                  </span>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Search and Filters */}
              <div className="filters-section mb-4">
                <div className="row mb-3">
                  <div className="col-md-9 col-lg-10">
                    <h6 className="mb-2">Search</h6>
                    <div
                      className="input-group shadow-sm"
                      style={{
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        border: "1px solid #ccc", // custom border around both icon + input
                      }}
                    >
                      <span
                        className="input-group-text bg-white border-0"
                        style={{ fontSize: "1.2rem" }}
                      >
                        🔍
                      </span>
                      <input
                        id="search"
                        className="form-control border-0"
                        style={{
                          boxShadow: "none", // removes Bootstrap glow
                          outline: "none", // removes focus outline
                          padding: "0.6rem 0.8rem",
                        }}
                        placeholder="Search by name, UAN, or claim number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 col-lg-2 d-flex align-items-end mt-3 mt-sm-0">
                    <button
                      onClick={clearFilters}
                      className="btn btn-secondary w-100"
                      style={{ height: "2.8rem" }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="status-filter" className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="applied">Applied</option>
                      <option value="settled">Settled</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Case Closed</option>
                      <option value="updateStatusNotClose">Settled But Not Closed</option>
                      <option value="techanicalIssues">Technical Issues</option>

                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="claim-id-filter" className="form-label">Claim Type</label>
                    <Select
                      id="claimType"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={claimstypesOptionsList.find(opt => opt.value === grievanceIdFilter) || null}
                      onChange={(selectedOption) => setGrievanceIdFilter(selectedOption?.value || '')}
                      options={claimstypesOptionsList}
                      placeholder="Select claim type"
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({
                          ...base,
                          overflowY: 'auto'
                        }),
                      }}
                    />

                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="date-from" className="form-label">From Date</label>
                    <input
                      id="date-from"
                      type="date"
                      className="form-control"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="date-to" className="form-label">To Date</label>
                    <input
                      id="date-to"
                      type="date"
                      className="form-control"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="agent-name-filter" className="form-label">Agent Name</label>
                    <Select
                      id="agentName"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={agentName.find(opt => opt.value === agentNameFilter) || null}
                      onChange={(selectedOption) => setAgentNameFilter(selectedOption?.value || '')}
                      options={agentName}
                      placeholder="Select agent name"
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({
                          ...base,
                          overflowY: 'auto'
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Claim Table */}
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

            {totalListCount > limit && (
              <nav>
                <ul className="pagination justify-content-end me-3">
                  {/* Previous */}
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchClaimsList(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {(() => {
                    const pageWindow = 3; // number of visible pages
                    let startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2));
                    let endPage = startPage + pageWindow - 1;

                    if (endPage > totalPages) {
                      endPage = totalPages;
                      startPage = Math.max(1, endPage - pageWindow + 1);
                    }

                    const pageNumbers: number[] = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(i);
                    }

                    return (
                      <>
                        {/* Dynamic window */}
                        {pageNumbers.map((page) => (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => fetchClaimsList(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                      </>
                    );
                  })()}

                  {/* Next */}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchClaimsList(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}

          </div>

        </div>
      </div>
          <ClaimModal
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
              onSubmit={handleClaimSubmit}
              initialData={{
                  uan: '', // Pass initial data if needed
                  userName: '',
                  mobileNumber: '',
                  email: '',
              }}
              agentName={agentName} 
          />
       {/* </>
     )}  */}
    </SidebarLayout>
  );
}