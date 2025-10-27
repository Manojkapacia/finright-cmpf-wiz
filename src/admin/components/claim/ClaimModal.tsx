import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { get, post } from '../../../components/common/api';
import ToastMessage from '../../../components/common/toast-message';
import { Modal } from 'bootstrap';
import { toCamelCase } from '../../../components/common/data-transform';

type ClaimType = {
  uan: string;
  userName: string;
  mobileNumber: string;
  email: string;
  claimType: string;
  claimId: string;
  agentName: string;
};

type AgentOption = {
  value: string;
  label: string;
};

type ClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<ClaimType>;
  agentName: AgentOption[];
};

const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  agentName = [],
}) => {
  const [formData, setFormData] = useState<ClaimType>({
    uan: '',
    userName: '',
    mobileNumber: '',
    email: '',
    claimType: '',
    claimId: '',
    agentName: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uanNotFound, setUanNotFound] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [claimTypes, setClaimTypes] = useState<any[]>([]);
  const [newClaimType, setNewClaimType] = useState('');
  const [claimTypeError, setClaimTypeError] = useState('');
  const [claimTypeModal, setClaimTypeModal] = useState<Modal | null>(null);
  const [message, setMessage] = useState({ type: "", content: "" });

  // Fetch claim types on component mount
  useEffect(() => {
    fetchClaimTypes();
  }, []);
  
  const fetchClaimTypes = async () => {
    try {
      const response = await get('claims/get-claim-types');
      if (response.status === 200) {
        const claimTypeData = response.data.map((item: any) => ({
          value: item.claimsType,
          label: toCamelCase(item.claimsType),
        }));
        setClaimTypes(claimTypeData);
      }
    } catch (error) {
      console.error('Error fetching claim types:', error);
    }
  };

  // Reset form when modal is closed or reopened
  useEffect(() => {
    if (!isOpen) {
      // Reset form data and errors when modal closes
      setFormData({
        uan: initialData?.uan || '',
        userName: initialData?.userName || '',
        mobileNumber: initialData?.mobileNumber || '',
        email: initialData?.email || '',
        claimType: '',
        claimId: '',
        agentName: '',
      });
      setErrors({});
      setUanNotFound(false);
      setIsAutoPopulated(false);
      setNewClaimType('');
      setClaimTypeError('');
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      uan: '',
      userName: '',
      mobileNumber: '',
      email: '',
      claimType: '',
      claimId: '',
      agentName: '',
    });
    setErrors({});
    setUanNotFound(false);
    setIsAutoPopulated(false);
    setNewClaimType('');
    setClaimTypeError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const modalElement = document.getElementById('addClaimTypeModal');
    if (modalElement && !claimTypeModal) {
      const modal = new Modal(modalElement);
      setClaimTypeModal(modal);
    }
  }, [claimTypeModal]);

  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Don't reset form here - let parent handle it after successful API response
    }
  };

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

      case "claimType":
        if (!value) return "Select claim type";
        return "";

      case "claimId":
        if (!value.trim()) return "Claim ID is required";
        return "";

      case "agentName":
        if (!value) return "Select agent Name";
        return "";

      default:
        return "";
    }
  };

  // Full form validation on submit
  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key as keyof typeof formData]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (fieldName: string, selectedOption: any) => {
    const value = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Real-time validation for select fields
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  };

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

  const handleUanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // numeric only
    setFormData((prev) => ({ ...prev, uan: value }));

    // Validate field instantly
    const errorMsg = validateField("uan", value);
    setErrors((prev) => ({ ...prev, uan: errorMsg }));

    // Reset UAN status when field is empty or invalid
    if (!value || errorMsg) {
      setIsAutoPopulated(false);
      setUanNotFound(false);
      return;
    }

    // Call API only when value has 12 digits & valid
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

  const handleAddClaimType = async () => {
    if (!newClaimType.trim()) {
      setClaimTypeError('Claim type is required.');
      return;
    }

    try {
      const response = await post('claims/add-claim-type', {
        claimType: newClaimType.trim()
      });

      if (response.status === 200) {
        // Refresh claim types list
        await fetchClaimTypes();
        const modalElement = document.getElementById('addClaimTypeModal');
      if (modalElement) {
        const modalInstance = Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
      }

        // Show success toast
        setMessage({ type: 'success', content: response?.message || 'Claim type added successfully!' });

        // Reset form fields
        setNewClaimType('');
        setClaimTypeError('');
      } else {
        setClaimTypeError(response?.message || 'Error adding claim type.');
      }
    } catch (error: any) {
      console.error('Add claim type error:', error);
      setClaimTypeError(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong."
      );
    }
  };

  // Create claim type options with "Add New" option
  const claimTypeOptions = [
    { value: "ADD_NEW", label: "➕ Add New Claim Type" },
    ...claimTypes
  ];

  if (!isOpen) return null;

  return (
    <>
      {message.type && <ToastMessage message={message.content} type={message.type} />}
      <div className="modal-overlay">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Claim</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddClaim}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="uan" className="form-label">UAN *</label>
                    <input
                      id="uan"
                      className="form-control"
                      value={formData?.uan}
                      onChange={handleUanChange}
                      readOnly={!!initialData?.uan}
                      placeholder="Enter 12-digit UAN"
                      maxLength={12}
                    />
                    {errors.uan && <p className="text-danger mb-0">{errors.uan}</p>}
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
                      onChange={handleChange}
                      readOnly={!!initialData.userName}
                      placeholder="Enter full name"
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
                      readOnly={!!initialData.mobileNumber}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.mobileNumber && <p className="text-danger mb-0">{errors.mobileNumber}</p>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!!initialData.email}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p className="text-danger mb-0">{errors.email}</p>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="claimType" className="form-label">Claim Type *</label>
                    <Select
                      id="claimType"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={claimTypeOptions.find(option => option.value === formData.claimType) || null}
                      onChange={(selectedOption: any) => {
                        if (selectedOption?.value === "ADD_NEW") {
                          const modalElement = document.getElementById('addClaimTypeModal');
                          if (modalElement) {
                            const modalInstance = Modal.getOrCreateInstance(modalElement);
                            modalInstance.show();
                          }
                          setFormData((prev) => ({ ...prev, claimType: "" }));
                        } else {
                          handleSelectChange('claimType', selectedOption);
                        }
                      }}
                      options={claimTypeOptions}
                      isSearchable
                      placeholder="Select claim type"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (provided) => ({
                          ...provided,
                          overflowY: 'auto',
                        }),
                      }}
                    />
                    {errors.claimType && <p className="text-danger mb-0">{errors.claimType}</p>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="claimId" className="form-label">Claim ID *</label>
                    <input
                      id="claimId"
                      type="text"
                      className="form-control"
                      value={formData.claimId}
                      onChange={handleChange}
                      placeholder="Enter claim ID"
                    />
                    {errors.claimId && <p className="text-danger mb-0">{errors.claimId}</p>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="agentName" className="form-label">Agent Name *</label>
                    <Select
                      id="agentName"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={agentName.find(option => option.value === formData.agentName) || null}
                      onChange={(selectedOption: any) =>
                        handleSelectChange('agentName', selectedOption)
                      }
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Claim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Claim Type Modal */}
      <div className="modal fade" id="addClaimTypeModal" tabIndex={-1} aria-labelledby="addClaimTypeModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addClaimTypeModalLabel">Add New Claim Type</h5>
              {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Enter claim type name"
                value={newClaimType}
                onChange={(e) => setNewClaimType(e.target.value)}
              />
              {claimTypeError && <p className="text-danger mt-2">{claimTypeError}</p>}
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-secondary me-2"
                data-bs-dismiss="modal"
                // onClick={() => {
                //   setNewClaimType('');
                //   setClaimTypeError('');
                //   if (claimTypeModal) {
                //     claimTypeModal.hide();
                //   }
                // }}
                onClick={() => {
                  setNewClaimType('');
                  setClaimTypeError('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddClaimType}
              >
                Add Claim Type
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimModal;