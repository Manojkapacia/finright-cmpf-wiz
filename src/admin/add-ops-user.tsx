import React, { useEffect, useState } from 'react';
import { MdDelete,MdEdit } from "react-icons/md";
import ToastMessage from "./../components/common/toast-message";
import { get, post } from '../components/common/api';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './components/style/react-confirm-box.css';
import SidebarLayout from "./SidebarLayout";
import Select from "react-select";

const AddOpsUser = () => {
    const [message, setMessage] = useState({ type: "", content: "" });
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Fetching Report, Please wait...");
    const [userList, setUserList] = useState<any[]>([]);
    const [formData, setFormData] = useState({ userName: '', mobileNumber: '', role: '', type: "ops user", calendlyLink: '', calendlyToken: '' });
    const [errors, setErrors] = useState<{ userName?: string; mobileNumber?: string; role?: string }>({});
    const [, setServerError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const openModal = () => {
        setFormData({ userName: '', mobileNumber: '', role: '', type: "ops user", calendlyLink: '', calendlyToken: '' });
        setErrors({});
        setServerError(null);
        setIsEditing(false);
        setEditingUserId(null);
        setShowModal(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUserId(user._id);
        setFormData({
          userName: user.userName || "",
          mobileNumber: user.mobileNumber || "",
          role: user.role || "",
          type: user.type || "ops user",
          calendlyLink: user.calendlyLink || "",
          calendlyToken: user.calendlyToken || ""
        });
        setErrors({});
        setIsEditing(true); 
        setShowModal(true);
      };
    const closeModal = () => {
        setShowModal(false);
        setEditingUserId(null);
    };

    const hasFetchedRef = React.useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            getUserList();
        }
    }, []);

    useEffect(() => {
        if (message.type) {
            const timeout = setTimeout(() => {
                setMessage({ type: "", content: "" });
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [message]);

    const getUserList = async () => {
        try {
            setLoading(true);
            setLoadingText("Fetching User List...");
            const response = await get("admin/get-all-users");

            if (response.status === 200) {
                setUserList(response.data);
            }
        } catch (error) {
            console.error("Error fetching user list:", error);
        } finally {
            setLoading(false);
        }
    };

    const isFormEmpty = !formData.userName.trim() || !formData.mobileNumber.trim();

    type InputEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  | { target: { name: string; value: string } };

    const handleInputChange = (e: InputEvent) => {
        const { name, value } = e.target;
        const newValue = name === "mobileNumber" ? value.replace(/\D/g, "") : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setServerError(null);
    };

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!formData.userName.trim()) {
            newErrors.userName = "User name is required";
        } else if (formData.userName.trim().length < 5) {
            newErrors.userName = "User name must be at least 5 characters";
        }
        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = "Mobile number is required";
        } else if (formData.mobileNumber.length !== 10) {
            newErrors.mobileNumber = "Mobile number must be exactly 10 digits";
        }
        if (!formData.role.trim()) {
            newErrors.role = "Role is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        setLoading(true);
        setLoadingText("Adding User...");

        try {
            const response = await post("admin/add-user", formData);

            if (response.status === 200) {
                setMessage({ type: "success", content: "User added successfully" });
                getUserList();
                setFormData({ userName: '', mobileNumber: '', role: '', type: "ops user", calendlyLink: '', calendlyToken: '' });
                setShowModal(false);
            }
        } catch (error: any) {
            if (error?.response?.status === 409) {
                setMessage({ type: "error", content: error.response.data.message });
                // setServerError("This mobile number is already registered.");
            } else {
                setMessage({ type: "error", content: "Failed to add user" });
                setShowModal(false);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteUser = async (mobileNumber: string) => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete this user?',
            buttons: [
                {
                    label: 'Confirm',
                    onClick: async () => {
                        try {
                            setLoading(true);
                            setLoadingText("Deleting user...");
                            const response = await post("admin/delete-user", { mobileNumber });

                            if (response.status === 200) {
                                setMessage({ type: "success", content: "User deleted successfully" });
                                getUserList();
                            } else {
                                setMessage({ type: "error", content: response.message });
                            }
                        } catch (error) {
                            console.error("Delete user error:", error);
                            setMessage({ type: "error", content: "Something went wrong while deleting the user." });
                        } finally {
                            setLoading(false);
                        }
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {
                        // Cancel action
                    }
                }
            ]
        });
    };

    const handleUpdateUser = async () => {
        if (!editingUserId) return;
        try {
          setLoading(true);
          setLoadingText("Updating user...");
      
          const response = await post("update/ops-user", {
            userId: editingUserId,
            ...formData,
          });
      
          if (response.status === 200) {
            setMessage({ type: "success", content: "User updated successfully" });
            getUserList(); // refresh table
            setShowModal(false);
          } else {
            setMessage({ type: "error", content: "Failed to update user" });
          }
        } catch (error) {
          console.error("Update user error:", error);
          setMessage({ type: "error", content: "Something went wrong while updating." });
        } finally {
          setLoading(false);
        }
      };

      const roleOptions = [
        { value: "sales", label: "Sales" },
        { value: "execution", label: "Execution" },
        { value: "developer", label: "Developer" },
        { value: "customer success", label: "Customer Success" },
        { value: "manager", label: "Manager" },
        { value: "business", label: "Business" },
        { value: "operations", label: "Operations" },
        ...(isEditing ? [{ value: "away", label: "Away" }] : []),
      ];

    const toTitleCase = (str: string) =>
        str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());


    return (
        <SidebarLayout>
            <>
                {loading && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow text-center">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="mt-3">{loadingText}</p>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="container my-5">
                        {message.type && <ToastMessage message={message.content} type={message.type} />}
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col-lg-10 col-md-12">
                                <div className="d-flex justify-content-end mb-3">
                                    <button
                                        className="btn btn-primary"
                                        onClick={openModal}
                                    >
                                        Add User
                                    </button>
                                </div>

                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>User Name</th>
                                            <th>Phone Number</th>
                                            <th>Team</th>
                                            <th>Calendly Link</th>
                                            <th>Calendly Token</th>
                                            <th>Created At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userList?.length > 0 ? userList?.map((user, index) => (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user?.userName}</td>
                                                <td>{user?.mobileNumber}</td>
                                                <td>{user?.role ? toTitleCase(user?.role) : "--"}</td>
                                                <td>{user?.calendlyLink || "--"}</td>
                                                <td>{user?.calendlyToken ? "****" : "--"}</td>
                                                <td>{new Date(user?.createdAt).toLocaleDateString("en-IN", {
                                                    year: "numeric", month: "short", day: "2-digit"
                                                })}</td>
                                                <td className="align-middle">   {/* makes it align with row height */}
                                                    <div className="d-flex align-items-center">
                                                        <MdEdit
                                                            size={20}
                                                            style={{ color: "blue", cursor: "pointer" }}
                                                            onClick={() => handleEditUser(user)}
                                                        />
                                                        <MdDelete
                                                            size={20}
                                                            className="ms-2"
                                                            style={{ color: "red", cursor: "pointer" }}
                                                            onClick={() => handleDeleteUser(user?.mobileNumber)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center">No Data Found!!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Modal */}
                                {showModal && (
                                    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title">{isEditing ? "Edit User" : "Add User"}</h5>
                                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                                </div>

                                                <div className="modal-body">
                                                    <div className="row justify-content-center align-items-center">
                                                        <div className="col-md-12">
                                                            {loading ? (
                                                                <div className="text-center my-5">
                                                                    <div className="spinner-border text-primary" role="status" />
                                                                    <p className="mt-3">{loadingText}</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="mb-3">
                                                                        <label className="form-label">User Name</label>
                                                                        <input
                                                                            type="text"
                                                                            name="userName"
                                                                            className="form-control"
                                                                            value={formData.userName}
                                                                            onChange={handleInputChange}
                                                                        />
                                                                        {errors.userName && <div className="text-danger">{errors.userName}</div>}
                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <label className="form-label">Phone Number</label>
                                                                        <input
                                                                            type="tel"
                                                                            name="mobileNumber"
                                                                            inputMode="numeric"
                                                                            className="form-control"
                                                                            maxLength={10}
                                                                            value={formData.mobileNumber}
                                                                            onChange={handleInputChange}
                                                                            disabled={isEditing}
                                                                        />
                                                                        {errors.mobileNumber && <div className="text-danger">{errors.mobileNumber}</div>}
                                                                    </div>
                                                                        <div className="mb-3">
                                                                            <label className="form-label">Select Role</label>
                                                                            <Select
                                                                                name="role"
                                                                                className="react-select-container"
                                                                                classNamePrefix="react-select"
                                                                                value={roleOptions.find(opt => opt.value === formData.role) || null}
                                                                                onChange={(selectedOption) =>
                                                                                    handleInputChange({
                                                                                        target: { name: "role", value: selectedOption?.value || "" },
                                                                                    })
                                                                                }
                                                                                options={roleOptions}
                                                                                placeholder="-- Select Role --"
                                                                                isSearchable
                                                                                menuPortalTarget={document.body}
                                                                                menuPosition="fixed"
                                                                                styles={{
                                                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                                    menu: base => ({
                                                                                        ...base,
                                                                                        maxHeight: 200,     // 👈 sets scroll height
                                                                                        overflowY: "auto",
                                                                                    }),
                                                                                    menuList: base => ({
                                                                                        ...base,
                                                                                        maxHeight: 200,   // 👈 THIS is the correct place for scrollable options
                                                                                        overflowY: "auto",
                                                                                    }),
                                                                                }}
                                                                            />
                                                                            {errors.role && <div className="text-danger">{errors.role}</div>}
                                                                        </div>

                                                                        <div className="mb-3">
                                                                            <label className="form-label">Calendly link</label>
                                                                            <input
                                                                                type="text"
                                                                                name="calendlyLink"
                                                                                className="form-control"
                                                                                value={formData.calendlyLink}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                        </div>

                                                                        <div className="mb-3">
                                                                            <label className="form-label">Calendly Token</label>
                                                                            <input
                                                                                type="text"
                                                                                name="calendlyToken"
                                                                                className="form-control"
                                                                                value={formData.calendlyToken}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                        </div>
                                                                    <div className="text-center mt-4">
                                                                            {isEditing ? (
                                                                                <button
                                                                                    className="btn pfRiskButtons px-5"
                                                                                    type="button"
                                                                                    disabled={isFormEmpty}
                                                                                    onClick={handleUpdateUser}
                                                                                >
                                                                                    Update User
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    className="btn pfRiskButtons px-5"
                                                                                    type="button"
                                                                                    disabled={isFormEmpty}
                                                                                    onClick={handleSubmit}
                                                                                >
                                                                                    Add User
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </>

        </SidebarLayout>

    );
};

export default AddOpsUser;
