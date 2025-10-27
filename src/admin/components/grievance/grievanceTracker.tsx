import { useState, useEffect } from 'react';
import './grievanceTracker.css';
import SidebarLayout from '../../SidebarLayout';
import { get, post, postBlob } from '../../../components/common/api';
import ToastMessage from '../../../components/common/toast-message';
import { IoEyeOutline, IoPencil } from 'react-icons/io5';
import { Modal } from 'bootstrap';
import Select from "react-select";
import { toCamelCase } from '../../../components/common/data-transform';

interface Grievance {
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

type FilterType = 'all' | 'outstanding' | 'pending15Days' | 'closedYesterday' | 'pending7Days' | 'pending30Days' | 'closedButNotCompleted';

export default function GrievanceTracker() {
  const [grievancesList, setGrievancesList] = useState<Grievance[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>('');
  const [grievanceIdFilter, setGrievanceIdFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: "", content: "" });
  const [grievanceTrackerStats, setGrievanceTrackerStats] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRawData, setSelectedRawData] = useState<string | null>(null);
  const [grievanceIds, setGrievanceIds] = useState<string[]>([]);
  const [newGrievanceId, setNewGrievanceId] = useState('');
  const [modalError, setModalError] = useState('');
  const [grievanceIdModal, setGrievanceIdModal] = useState<Modal | null>(null);
const [selectedGrievanceNumber, setSelectedGrievanceNumber] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<any[]>([]);
  const [agentNameFilter, setAgentNameFilter] = useState<string>('all');
  const [totalListCount, setTotalListCount] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [grievanceNumber, setGrievanceNumber] = useState<string>('');
  const [grievanceLoginError, setGrievanceLoginError] = useState<any>(null);
  const limit = 10;

  const [formData, setFormData] = useState({
    uan: '',
    userName: '',
    mobileNumber: '',
    email: '',
    grievanceId: '',
    grievanceNumber: '',
    agentName: ''
  });
  const [uanNotFound, setUanNotFound] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);


  useEffect(() => {
    fetchGrievanceIds();
    getUserList();
  }, []);

  useEffect(() => {
    const modalElement = document.getElementById('addGrievanceModal');
    if (modalElement && !grievanceIdModal) {
      const modal = new Modal(modalElement);
      setGrievanceIdModal(modal);
    }
  }, [grievanceIdModal]);


  useEffect(() => {
    if (dateFromFilter && dateToFilter) {
      fetchGrievances();
    }
  }, [dateFromFilter, dateToFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGrievances();
    }, 1000);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchGrievances();
  }, [statusFilter, grievanceIdFilter, agentNameFilter]);

  const getUserList = async () => {
    try {
      // setLoading(true);
      // setLoadingText("Fetching User List...");
      const response = await get("admin/get-all-users");

      if (response.status === 200) {
        setAgentName(response?.data?.map((item: any) => ({
          value: item?.userName,
          label: item?.userName
        })));
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  const handleAddGrievanceId = async () => {
    if (!newGrievanceId.trim()) {
      setModalError('Grievance ID is required.');
      return;
    }

    try {
      const response = await post('add-grievance-id', {
        grievanceId: newGrievanceId.trim()
      });

      // const result = await response.json();

      if (response.status === 200) {
        setGrievanceIds((prev) => [...prev, newGrievanceId.trim()]);
        setFormData((prev) => ({
          ...prev,
          grievanceId: newGrievanceId.trim()
        }));

        // Close the modal
        const modalElement = document.getElementById('addGrievanceModal');
        const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement!);
        bootstrapModal?.hide();

        setNewGrievanceId('');
        setModalError('');
        setMessage({ type: 'success', content: response?.message || 'Grievance ID added.' });
      } else {
        setMessage({ type: 'error', content: response?.message || 'Error adding grievance ID.' });
      }
    } catch (err: any) {
      console.error('Add grievance error:', err);
      const errorMessage =
        err?.response?.data?.message || // Axios-style error
        err?.message ||                 // Fallback to JS error message
        "Something went wrong.";

      setMessage({ type: "error", content: errorMessage });
    }
  };
  const grievanceOptions = [
    { value: "ADD_NEW", label: "➕ Add New ID" }, // Special option
    ...grievanceIds.map((type) => ({
      value: type,
      label: type.replace(/_/g, " "),
    })),
  ];

  const grievanceOptionsList = grievanceIds.map((type) => ({
    value: type,
    label: type.replace(/_/g, ' ')
  }));

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "uan":
        if (!value) return "UAN is required";
        if (!/^\d+$/.test(value)) return "UAN must be numeric";
        if (value.length !== 12) return "UAN must be 12 digits";
        return "";

      case "mobileNumber":
        if (!value) return "Mobile number is required";
        if (!/^\d+$/.test(value)) return "Mobile must be numeric";
        if (value.length !== 10) return "Mobile must be 10 digits";
        return "";

      case "userName":
        if (!value.trim()) return "User name is required";
        return "";

      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email";
        return "";

      case "grievanceId":
        if (!value) return "Select grievance ID";
        return "";

      case "grievanceNumber":
        if (!value.trim()) return "Grievance number is required";
        return "";

      case "agentName":
        if (!value) return "Select agent Name";
        return "";

      default:
        return "";
    }
  };

  // ✅ Generic handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // Remove non-numeric characters for UAN & mobile
    const newValue =
      id === "uan" || id === "mobileNumber" ? value.replace(/\D/g, "") : value;

    setFormData((prev) => ({ ...prev, [id]: newValue }));

    // Validate this field immediately
    const errorMsg = validateField(id, newValue);
    setErrors((prev) => ({ ...prev, [id]: errorMsg }));

    // Remove error if field is valid
    if (!errorMsg) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // ✅ Full form validation on submit
  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key as keyof typeof formData]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleUanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // numeric only
    setFormData((prev) => ({ ...prev, uan: value }));

    // ✅ Validate field instantly
    const errorMsg = validateField("uan", value);
    setErrors((prev) => ({ ...prev, uan: errorMsg }));

    if (errorMsg) {
      setIsAutoPopulated(false);
      setUanNotFound(false);
      return;
    }

    // ✅ Call API only when value has 12 digits & valid 101699073532
    if (value.length === 12) {
      try {
        const response = await post("user-profile", { uan: value });
        if (response.success && response?.data && Object.keys(response?.data).length > 0) {
          setFormData((prev) => ({
            ...prev,
            userName: response?.data?.fullName || "",
            mobileNumber: response?.data?.mobileNumber || "",
            email: response?.data?.email || "",
          }));
          setIsAutoPopulated(true);
          setUanNotFound(false);
        } else {
          setIsAutoPopulated(false);
          setUanNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching UAN:", error);
        setIsAutoPopulated(false);
        setUanNotFound(true);
      }
    }
  };

  const handleAddGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    const isValid = validateForm();
    if (!isValid) return;

    try {
      const response: any = await post("add-grievance", formData);

      if (response.status === 200 && response.success) {
        fetchGrievances(1);
        // ✅ Success toast
        setMessage({
          type: "success",
          content: response.message || "Grievance added successfully!",
        });

        // Reset form
        setFormData({
          uan: "",
          userName: "",
          mobileNumber: "",
          email: "",
          grievanceId: "",
          grievanceNumber: "",
          agentName: ""
        });
        setUanNotFound(false);
        setIsAutoPopulated(false);

        setTimeout(() => {
          setShowAddForm(false);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          content: response?.message || "Failed to add grievance.",
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

  const resetForm = () => {
    setFormData({
      uan: "",
      userName: "",
      mobileNumber: "",
      email: "",
      grievanceId: "",
      grievanceNumber: "",
      agentName: ""
    });
    setErrors({});
    setUanNotFound(false);
    setIsAutoPopulated(false);
  };

  const fetchGrievances = async (page: number = 1) => {
    try {
      const payload: any = {
        page,
        limit,
        search: searchTerm.trim(),
        grievanceId: grievanceIdFilter === "all" ? "" : grievanceIdFilter,
        status: statusFilter === "all" ? "" : statusFilter,
        fromDate: dateFromFilter || null,
        toDate: dateToFilter || null,
        agentName: agentNameFilter === "all" ? "" : agentNameFilter,
        closeYesterday: activeFilter === "closedYesterday" ? true : false,
      };

      const response: any = await post("list", payload);

      if (response.status === 200 && response.success) {
        setGrievancesList(response?.data);
        setTotalPages(response?.pagination?.totalPages);
        setCurrentPage(response?.pagination?.currentPage);
        setGrievanceTrackerStats(response?.pagination);
        setTotalListCount(response?.pagination?.total);
      }
    } catch (error: any) {
      console.error("Error fetching grievances:", error);
      setMessage({
        type: "error",
        content:
          error?.response?.data?.message || "Failed to fetch grievances.",
      });
    }
  };

  const handleFilterChange = (filter: any) => {
    setActiveFilter(filter);

    let toDate = "";
    // const toDate = new Date().toISOString().split("T")[0]; // today's date

    if (filter === "pending7Days") {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      toDate = date.toISOString().split("T")[0];
      setDateFromFilter("");
      setDateToFilter(toDate);
      setStatusFilter("notCompleted");
    } else if (filter === "pending15Days") {
      const date = new Date();
      date.setDate(date.getDate() - 15);
      toDate = date.toISOString().split("T")[0];
      setDateFromFilter("");
      setDateToFilter(toDate);
      setStatusFilter({ $not: /^completed$/i });
    } else if (filter === "pending30Days") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      toDate = date.toISOString().split("T")[0];
      setDateFromFilter("");
      setDateToFilter(toDate);
      setStatusFilter("notCompleted");
    }

    if (filter === "closedButNotCompleted") {
      setStatusFilter("case closed");
      setDateFromFilter("");
      setDateToFilter("");
    }
    if (filter === "closedYesterday") {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const yesterday = date.toISOString().split("T")[0];
      setStatusFilter("case closed");
      setDateFromFilter(yesterday);
      setDateToFilter(yesterday);
    }
    if (filter === "outstanding") {
      setStatusFilter("notCompleted");
      setDateFromFilter("");
      setDateToFilter("");
    }
    // Reset search and status filters only if needed
    // setStatusFilter("all");
    // setGrievanceIdFilter("all");
    // setDateFromFilter("");
    // setDateToFilter("");
    // fetchGrievances();
  };

  const handleUpdateAppeal = async (grievanceId: string, status: string, appealStatus: string) => {
    try {
      const res = await post("update-status", {
        grievanceId,
        status,
        appealStatus,
      });

      if (res.success) {
        fetchGrievances();
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

  const fetchGrievanceIds = async () => {
    try {
      const response = await get('grievance-list');
      const ids = response.data.map((item: any) => item?.grievanceId);
      setGrievanceIds(ids);
    } catch (error) {
      console.error('Error fetching grievance IDs:', error);
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
    fetchGrievances();
  };

  const handleShowRawData = (grievance: any) => {
    setPhoneNumber(grievance?.mobileNumber);
    setGrievanceNumber(grievance?.grievanceNumber);
      setSelectedGrievanceNumber(grievance?.grievanceNumber);
      setSelectedRawData(grievance?.rawData);
      setGrievanceLoginError(grievance?.grievanceLoginError);
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById("rawDataModal")
      );
      modal.show();
  };

  const handleDownloadPdf = async () => {
    if (!selectedGrievanceNumber) return;
  
    try {
      const response = await postBlob("grievance-pdf", { 
        grievanceNumber: selectedGrievanceNumber 
      });
  
      // Blob type detection
      const blobType = response.data.type || response.headers["content-type"] || "";
  
      const isPdf =
        blobType.includes("application/pdf") ||
        blobType === "" || // sometimes empty in prod
        blobType === "application/octet-stream"; // generic binary
  
      if (isPdf) {
        // ✅ It's a PDF - download it
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedGrievanceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        window.URL.revokeObjectURL(url);
        return;
      }
  
      // ❌ Not a PDF - try to parse as error JSON/text
      const text = await response.data.text();
      let errorJson;
      try {
        errorJson = JSON.parse(text);
      } catch {
        errorJson = { message: text };
      }
      throw new Error(errorJson.message || "Failed to download PDF");
  
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to download PDF. Please try again."
      });
    }
  };  
  const handleRefresh = async () => {
    setShowLoader(true); // Show loader
    try {
      const response: any = await post("auth/grievance-handlelogin", {
        grievanceNumber: grievanceNumber,
        mobileNumber: phoneNumber
      });
  
      if (response?.success) {
        // If grievance-handlelogin API succeeds → call list API
        try {
          await fetchGrievances(currentPage); // Call your existing function
          setMessage({
            type: "success",
            content: "Data refreshed successfully!"
          });
        } catch (listError: any) {
          console.error("Error fetching updated grievances:", listError);
          setMessage({
            type: "error",
            content:
              "Failed to fetch updated grievance data."
          });
        }
      } else {
        // grievance-handlelogin API failed → show error
        setMessage({
          type: "error",
          content: "Failed to refresh grievance. Please try again."
        });
      }
    } catch (error: any) {
      console.error("Error in handleRefresh:", error);
      setMessage({
        type: "error",
        content:
          "Something went wrong while refreshing grievance."
      });
    } finally {
      setShowLoader(false); // Hide loader
    }
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
          <p className="mt-3">Refreshing Data, Please wait...</p>
        </div>
      </div>
    )}
      <div className="grievance-tracker bg-light min-vh-100 py-4">
        <div className="container-fluid">
          {message.type && <ToastMessage message={message.content} type={message.type} />}
          {/* Header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h1 className="fw-bold text-dark mb-1">Grievance Tracking Dashboard</h1>
              <p className="text-muted mb-0">Manage and track all grievances in one place</p>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-md-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary btn-lg d-flex align-items-center"
              >
                <span className="me-2">+</span>
                Add Grievance
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'outstanding' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange("outstanding")}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.outstanding}</div>
                  <div className="stat-label">Total Outstanding</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'closedYesterday' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('closedYesterday')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.closedYesterday}</div>
                  <div className="stat-label">Closed Yesterday</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === "closedButNotCompleted" ? "stat-active" : ""
                  }`}
                onClick={() => handleFilterChange("closedButNotCompleted")}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.closedButNotCompleted}</div>
                  <div className="stat-label">Total Closed but Not Completed</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'pending30Days' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('pending30Days')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.pending30Days}</div>
                  <div className="stat-label">Pending More Than 30 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'pending15Days' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('pending15Days')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.pending15Days}</div>
                  <div className="stat-label">Pending More Than 15 Days</div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-3">
              <div
                className={`stat-card card h-100 cursor-pointer ${activeFilter === 'pending7Days' ? 'stat-active' : ''}`}
                onClick={() => handleFilterChange('pending7Days')}
              >
                <div className="card-body text-center">
                  <div className="stat-number">{grievanceTrackerStats?.pending7Days}</div>
                  <div className="stat-label">Pending More Than 7 Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance List */}
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                {/* <h3 className="card-title mb-0">Grievance List ({grievanceTrackerStats?.outstanding})</h3>  */}
                <h6 className="mb-0">Grievance List</h6>
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
                        placeholder="Search by name, UAN, or grievance number..."
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
                      <option value="under progress">Under progress</option>
                      <option value="case closed">Case Closed</option>
                      <option value="appeal raised">Appeal Raised</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="grievance-id-filter" className="form-label">Grievance ID</label>
                    <Select
                      id="grievanceId"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={grievanceOptionsList.find(opt => opt.value === grievanceIdFilter) || null}
                      onChange={(selectedOption) => setGrievanceIdFilter(selectedOption?.value || '')}
                      options={grievanceOptionsList}
                      placeholder="Select grievance ID"
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

              {/* Grievance Table */}
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
                              {toCamelCase(grievance?.status)}
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
                                      onClick={() => handleUpdateAppeal(grievance._id, "completed", "completed")}
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
                              {toCamelCase(grievance?.appealStatus)}
                            </span>
                          </td>
                          {/* <td className="ps-3"><IoEyeOutline size={20} /></td> */}
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

            {totalListCount > limit && (
              <nav>
                <ul className="pagination justify-content-end me-3">
                  {/* Previous */}
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchGrievances(currentPage - 1)}
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
                              onClick={() => fetchGrievances(page)}
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
                      onClick={() => fetchGrievances(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}

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
                <div className="modal-header d-flex align-items-center">
                  <h5 className="modal-title me-2" id="rawDataModalLabel">Grievance Details</h5>

                  {!selectedRawData && (
                    <button
                      className="btn btn-outline-danger me-2 d-flex align-items-center"
                      onClick={handleRefresh}
                    >
                      <span className="me-2">⟳</span>
                      Refresh
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>

                <div className="modal-body">
                  {selectedRawData ? (
                    <div>
                    <div dangerouslySetInnerHTML={{ __html: selectedRawData }} />
                    <button
                      className="btn btn-outline-danger mt-3"
                      onClick={handleDownloadPdf}
                    >
                      📄 Download PDF
                    </button>
                    <button
                      className="btn btn-outline-danger mt-3 ms-3"
                      onClick={handleRefresh}
                    >
                      <span className="me-2">⟳</span>
                      Refresh
                    </button>
                    </div>
                  ) : (
                    
                    <p className={`${grievanceLoginError? "text-danger" : "text-muted"} text-center`}>{grievanceLoginError ? grievanceLoginError : "No data available for this grievance!!"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add Grievance Form Modal */}
          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">Add New Grievance</h2>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddGrievance}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="uan" className="form-label">UAN Number *</label>
                          <input
                            id="uan"
                            className="form-control"
                            value={formData.uan}
                            onChange={handleUanChange}
                            placeholder="Enter 12-digit UAN"
                            maxLength={12}
                          />
                          {/* Show validation error (required/numeric/length) */}
                          {errors.uan && <p className="text-danger mb-0">{errors.uan}</p>}
                          {/* Show UAN not found message only when there is no validation error */}
                          {!errors.uan && uanNotFound && (
                            <p className="text-danger mb-0">UAN not found in records</p>
                          )}
                          {!errors.uan && isAutoPopulated && (
                            <p className="text-success mb-0">✅ UAN found in records</p>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="userName" className="form-label">User Name *</label>
                          <input
                            id="userName"
                            className="form-control"
                            value={formData.userName}
                            placeholder="Enter full name"
                            onChange={handleChange}
                            disabled={isAutoPopulated}
                          />
                          {errors.userName && <p className="text-danger mb-0">{errors.userName}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="mobileNumber" className="form-label">Mobile Number *</label>
                          <input
                            id="mobileNumber"
                            className="form-control"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Enter 10-digit mobile"
                            maxLength={10}
                            // disabled={isAutoPopulated}
                          />
                          {errors.mobileNumber && <p className="text-danger mb-0">{errors.mobileNumber}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">Email ID *</label>
                          <input
                            id="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            // disabled={isAutoPopulated}
                          />
                          {errors.email && <p className="text-danger mb-0">{errors.email}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="grievanceId" className="form-label">Grievance ID *</label>
                          <Select
                            id="grievanceId"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            value={
                              grievanceOptions.find(
                                (option) => option.value === formData.grievanceId
                              ) || null
                            }
                            onChange={(selectedOption: any) => {
                              if (selectedOption.value === "ADD_NEW") {
                                // Reset selection and open modal
                                setFormData((prev) => ({ ...prev, grievanceId: "" }));
                                const modal = new (window as any).bootstrap.Modal(document.getElementById('addGrievanceModal'));
                                modal.show();
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  grievanceId: selectedOption.value,
                                }));
                                setErrors((prev) => ({ ...prev, grievanceId: "" }));
                              }
                            }}
                            options={grievanceOptions}
                            isSearchable
                            placeholder="Select grievance ID"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              menu: (provided) => ({
                                ...provided,
                                overflowY: 'auto',
                                maxHeight: 300,
                              }),
                            }}
                          />

                          {errors.grievanceId && <p className="text-danger mb-0">{errors.grievanceId}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="grievanceNumber" className="form-label">Grievance Number *</label>
                          <input
                            id="grievanceNumber"
                            className="form-control"
                            value={formData.grievanceNumber}
                            onChange={handleChange}
                            placeholder="Enter grievance number"
                          />
                          {errors.grievanceNumber && <p className="text-danger mb-0">{errors.grievanceNumber}</p>}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="agent" className="form-label">Add Agent *</label>
                          <Select
                            id="agent"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            value={agentName.find((option) => option.value === formData.agentName) || null}
                            onChange={(selectedOption: any) => {
                              setFormData((prev) => ({ ...prev, agentName: selectedOption.value }));
                              setErrors((prev) => ({ ...prev, agentName: "" }));
                            }}
                            options={agentName}
                            isSearchable
                            placeholder="Select an agent"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              menu: (provided) => ({
                                ...provided,
                                overflowY: 'auto',
                                maxHeight: 300,
                              }),
                            }}
                          />
                          {errors.agentName && <p className="text-danger mb-0">{errors.agentName}</p>}
                        </div>

                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button type="button" onClick={() => {
                          resetForm();       // ✅ Clear all fields
                          setShowAddForm(false); // ✅ Close modal
                        }} className="btn btn-outline-secondary">
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Add Grievance
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>



          )}

          <div className="modal fade" id="addGrievanceModal" tabIndex={-1} aria-labelledby="addGrievanceModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="addGrievanceModalLabel">Add New Grievance ID</h5>
                  {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter grievance ID"
                    value={newGrievanceId}
                    onChange={(e) => setNewGrievanceId(e.target.value)}
                  />
                  {modalError && <p className="text-danger mt-2">{modalError}</p>}
                </div>
                <div className="modal-footer d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      setNewGrievanceId('');
                      setModalError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddGrievanceId}
                  >
                    Add ID
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
       {/* </>
     )}  */}
    </SidebarLayout>
  );
}