import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaChartLine, FaSignOutAlt, FaBars, FaTimes, FaUserPlus, FaArchive,  FaChevronRight } from "react-icons/fa";
import HeaderLogo from "../assets/headerLogo.svg";
import { post } from "../components/common/api";
import ToastMessage from "../components/common/toast-message";
import { decryptData } from "../components/common/encryption-decryption";
import { BiCalendarCheck } from 'react-icons/bi';
import { MdTrackChanges } from "react-icons/md";

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showActivitySubmenu, setShowActivitySubmenu] = useState(false);

// Timer countdown effect
useEffect(() => {
  // Open submenu automatically if we are on any subpath
  if (
    location.pathname.includes("/operation/grievance-tracker") ||
    location.pathname.includes("/operation/claim-tracker")
  ) {
    setShowActivitySubmenu(true);
  } else {
    setShowActivitySubmenu(false);
  }
}, [location.pathname]);


  const handleLogout = async () => {
    // try {
    //   setMessage({ type: "success", content: "Logged out successfully!!" });
    //   setTimeout(() => setMessage({ type: "", content: "" }), 2000);
    //   await logout();
    //   window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    // } catch (error) {
    //   console.error("Unexpected error during logout:", error);
    //   window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    // }
    const opsMobileNumber = decryptData(localStorage.getItem("opsMobileNumber"));
          if (opsMobileNumber) {
            localStorage.clear();
            try {
              const result = await post('ops-logout', { mobileNumber: opsMobileNumber });
              if(result.status === 200){
                setMessage({ type: "success", content: "Logged out successfully!!" });
                navigate("/operation/login");
                localStorage.clear();
              }
            } catch (err) {
              // navigate("/operation/login")
              setMessage({ type: "error", content: "Failed to logout user" });
            }
          }
  };
  const opsType = decryptData(localStorage.getItem("opsType"));

  const menuItems = [
    { path: "/operation/uan-list", label: "Home", icon: <FaHome /> },
    { path: "/operation/monitering-api", label: "Monitoring", icon: <FaChartLine /> },
    ...(opsType !== "ops" ? [{ path: "/operation/ops-user", label: "User", icon: <FaUserPlus /> }] : []),
   { path: "/operation/archived-module", label: "Archived Module", icon: <FaArchive /> },
   { path: "/operation/cron-log", label: "Cron Logs", icon: < BiCalendarCheck/> },
   {
    label: "Activity Tracker",
    icon: <MdTrackChanges />,
    subMenu: [
      { path: "/operation/grievance-tracker", label: "Grievance" },
      { path: "/operation/claim-tracker", label: "Claims" } // same route for now
    ]
  }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Toast Message */}
      {message.type && <ToastMessage message={message.content} type={message.type} />}

      {/* Mobile Hamburger Toggle */}
      <button
        className="btn d-md-none position-fixed top-0 start-0 m-3 z-3"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FaBars />
      </button>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          onClick={() => setIsSidebarOpen(false)}
          style={{ zIndex: 998 }}
        ></div>
      )}

      {/* Main Layout */}
      <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          className={`d-flex flex-column justify-content-between ${
            isSidebarOpen ? "d-flex" : "d-none"
          } d-md-flex`}
          style={{
            width: isSidebarOpen ? "80%" : "250px",
            maxWidth: "230px",
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRight: "1px solid #dee2e6",
            height: "100vh",
            position: isSidebarOpen ? "fixed" : "sticky",
            top: 0,
            left: 0,
            zIndex: 999,
          }}
        >
          {/* Close (X) icon for mobile */}
          {isSidebarOpen && (
            <FaTimes
              className="d-md-none"
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "#000",
                zIndex: 1000,
              }}
            />
          )}

          {/* Top Section */}
          <div>
            <div className="d-flex gap-3 mb-4 px-1">
              <img
                src={HeaderLogo}
                alt="Logo"
                style={{ height: "32px", objectFit: "contain" }}
              />
              <span className="fw-semibold fs-5 text-center">Welcome</span>
            </div>

            <ul className="list-unstyled mt-2">
              {menuItems.map((item) => (
                <li key={item.label} style={{ marginTop: "1.5rem" }}>
                  {!item.subMenu ? (
                    <div
                      onClick={() => {
                        setIsSidebarOpen(false);
                        navigate(item.path);
                      }}
                      className={`d-flex align-items-center mb-2 px-2 fs-6 ${
                        isActive(item.path) ? "fw-bold text-primary" : "text-dark"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="me-2 fs-6">{item.icon}</span>
                      {item.label}
                    </div>
                  ) : (
                    <>
                      {/* Parent item (Activity Tracker) */}
                      <div
                        onClick={() => setShowActivitySubmenu(!showActivitySubmenu)}
                        className={`d-flex align-items-center justify-content-between mb-2 px-2 fs-6 ${
                          location.pathname.includes("/operation/grievance-tracker") || location.pathname.includes("/operation/claim-tracker")
                            ? "fw-bold text-primary"
                            : "text-dark"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center">
                          <span className="me-2 fs-6">{item.icon}</span>
                          {item.label}
                        </div>
                        <FaChevronRight
                          style={{
                            transition: "transform 0.3s",
                            transform: showActivitySubmenu
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </div>

                      {/* Submenu */}
                      {showActivitySubmenu && (
                        <ul className="list-unstyled ms-4 mt-2">
                          {item.subMenu.map((sub) => (
                            <li
                              key={sub.label}
                              onClick={() => {
                                setIsSidebarOpen(false);
                                navigate(sub.path);
                              }}
                              className={`d-flex align-items-center mb-2 fs-6 ${
                                isActive(sub.path)
                                  ? "text-primary fw-semibold"
                                  : "text-dark"
                              }`}
                              style={{
                                cursor: "pointer",
                                paddingLeft: "0.5rem",
                                transition: "color 0.2s ease",
                              }}
                            >
                              • {sub.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Logout Section */}
          <div
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
            className="d-flex align-items-center text-danger"
          >
            <FaSignOutAlt className="me-2" /> Logout
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>

    </>
  );
};

export default SidebarLayout;
