import { useEffect, useState } from "react";
import ToastMessage from "./../../common/toast-message";
import { useLocation, useNavigate } from "react-router-dom";
// import FinRightlogo from "./../../../assets/FinRightlogo.png";
import { AiOutlineLogout } from "react-icons/ai";
import { post } from './../../common/api'
import MESSAGES from "../../constant/message";
import { decryptData, encryptData } from "../encryption-decryption";
import HeaderLogo from "./../../../assets/headerLogo.svg";
import { BiSupport } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import SidebarPortal from "../SidebarPortal";
import ContactUsManager from "../ContactUsManager";
import { FaArrowAltCircleDown, FaRegCreditCard } from "react-icons/fa";


const Layout = () => {
  const location = useLocation();
  const logoutButton = ["/", "/operation/login", "/call-booking","/call-booking/otp", "/payment-auth", "/payment-auth/otp"];
  const howToHelpBtn = ["/operation/uan-list","/operation/ops-user","/enter-name","/how-can-help"];
  const HideLogoutButtons = logoutButton.includes(location.pathname);
  const HidehowToHelpBtn = howToHelpBtn.includes(location.pathname);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [userFullname, setUserFullname] = useState<any>("");
  const [, setCurrentUan] = useState<any>("");
  const [userUan, setUserUan] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false); // ✅ close menu after navigation
  };
  

  useEffect(() => {
    setTimeout(() => {
      const userScrappeData = decryptData(localStorage.getItem("isScrappePassbook"));

      let nameToShow = "Welcome";

      if (userScrappeData) {
        const fullName = decryptData(localStorage.getItem("Full_Name"));
        if (fullName) {
          nameToShow = fullName;
        }
      } else {
        const userName = decryptData(localStorage.getItem("user_name"));
        if (userName) {
          nameToShow = userName;
        }
      }
      setUserFullname(nameToShow);
    }, 1000)
  }, [location.pathname]);
  useEffect(() => {
    const checkUan = setInterval(() => {
      const storedUan = decryptData(localStorage.getItem("user_uan"));

      // Fire only when user_uan appears for the first time
      if (storedUan && !userUan) {
        setUserUan(storedUan);  // Triggers the second useEffect
        clearInterval(checkUan); // Stop polling after getting the value
      }
    }, 500); // Check every 500ms

    return () => clearInterval(checkUan); // Cleanup
  }, [userUan]);

  useEffect(() => {
    setTimeout(()=>{
      if (userUan) {
        getUserTotalBalance(userUan);
        setCurrentUan(userUan);
      }
    })
  }, [userUan]);

  const handleDownloadInvoice = () => {
    if (receiptUrl) {
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = "Invoice.pdf"; // suggested filename
      link.target = "_blank"; // open in new tab if browser blocks download
      link.click();
    }
  };

  const toggleMenu = async () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);

    if (nextState) {
      // 🔥 Call API only when menu is opening
      const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
      if (mobileNumber) {
        try {
          const result = await post("payment/receipt-cmpf", { mobileNumber });
          if (result?.success && result?.data?.receiptUrl) {
            setReceiptUrl(result.data.receiptUrl);
          } else {
            setReceiptUrl(null);
          }
        } catch (err) {
          console.error("Error fetching receipt:", err);
          setReceiptUrl(null);
        }
      }
    }
  };

  const getUserTotalBalance = (async(userUan:any)=>{
    if(userUan){
      const result = await post('lead/get-total-balance', {userUan});
      const totalBalance = result?.data?.totalBalance ?? 0;
      
      if(totalBalance >= 0){
        const updatedBalance = totalBalance;
        localStorage.setItem("user_balance", encryptData(JSON.stringify(updatedBalance)))
      }
    }
  })


  const handleLogout = async () => {
    try {
      // clearing 
        setMessage({ type: "success", content: "Logged out successfully!!" });
        setIsMenuOpen(false);
        window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    
      localStorage.clear();
      setTimeout(() => setMessage({ type: "", content: "" }), 2000);
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    }
  };


  return (
    <>
    <div>
      {message.type && <ToastMessage message={message.content} type={message.type} />}

      <nav className="p-2 p-md-3 fixed-top bg-white py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">

            {/* Left: Logo + Welcome/UserName */}
            <div className="d-flex align-items-center gap-1">
              <img src={HeaderLogo} alt="Logo" className="logoImage" />
              <p className="mb-0 fw-medium" style={{ fontSize: "1rem" }}>
                {userFullname
                  ?.toLowerCase()
                  .split(' ')
                  .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </p>
            </div>

            {/* Right: Support + Logout Buttons */}
            {!HideLogoutButtons && (
              <div className="d-flex align-items-center gap-3">
                {!HidehowToHelpBtn &&
                <>

                    <ContactUsManager
                      trigger={
                        <div
                          className="d-flex align-items-center gap-2 px-2 py-1 fw-medium"
                          style={{
                            fontSize: "0.75rem",
                            border: "1px solid rgba(133, 133, 133, 0.5)",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#B2F2E7",
                              borderRadius: "50%",
                              padding: "4px",
                            }}
                          >
                            <BiSupport size={14} color="#000" />
                          </div>
                          <span style={{ color: "#000" }}>Contact Us</span>
                        </div>
                      }
                  />

                </>
                }
                <div className="d-flex align-items-center">
                  <GiHamburgerMenu
                    size={24}
                    style={{ cursor: "pointer", color: "#D5DBEB" }}
                    onClick={toggleMenu}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

        {/* Hamburger Menu Drawer */}
        

        <SidebarPortal>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <div
                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                style={{ zIndex: 1060 }}
                onClick={toggleMenu}
              />

              {/* Sidebar */}
              <div
                className="position-fixed top-0 end-0 h-100 bg-white shadow p-3"
                style={{ width: "15rem", zIndex: 1061 }}
              >
                <div className="d-flex flex-column h-100">
                  {/* ❌ Close Icon */}
                  <div className="d-flex justify-content-end mb-4">
                    <IoClose size={28} style={{ cursor: "pointer" }} onClick={toggleMenu} />
                  </div>

                  {/* Payment */}
                  <button
                    onClick={() => handleNavigation("/payment-initiate")}
                    className="d-flex align-items-center mb-3 bg-transparent border-0 p-0"
                    style={{
                      fontSize: "1rem",
                      color: location.pathname === "/payment-initiate" ? "green" : "#000",
                      cursor: "pointer",
                    }}
                  >
                    <FaRegCreditCard className="me-2" size={18} />
                    <span>Payment</span>
                  </button>

                  {/* Download Invoice */}
                  {receiptUrl && (
                    <button
                      onClick={handleDownloadInvoice}
                      className="d-flex align-items-center mb-3 bg-transparent border-0 p-0"
                      style={{
                        border: "none",
                        // background: "#F0F7FF",
                        fontSize: "1rem",
                        color: "#000",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <FaArrowAltCircleDown className="me-2" size={18} />
                      <span>Download Invoice</span>
                    </button>
                  )}

                  {/* Logout (Push to bottom) */}
                  <div className="mt-auto">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#FF3B30",
                        color: "white",
                        borderRadius: "5px",
                        padding: "0.5rem",
                        cursor: "pointer",
                      }}
                      onClick={handleLogout}
                    >
                      <AiOutlineLogout size={20} />
                      <span className="ms-2">Logout</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SidebarPortal>


    </div>
    </>
  );
};

export default Layout;
