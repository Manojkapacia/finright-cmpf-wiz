import { useEffect, useState } from "react";
import ToastMessage from "./../../common/toast-message";
import { useLocation, useNavigate } from "react-router-dom";
// import FinRightlogo from "./../../../assets/FinRightlogo.png";
import { AiOutlineLogout } from "react-icons/ai";
import { MdOutlineSupportAgent } from "react-icons/md";
import { logout, post } from './../../common/api'
import MESSAGES from "../../constant/message";
import { decryptData, encryptData } from "../encryption-decryption";
import HeaderLogo from "./../../../assets/headerLogo.svg";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutButton = ["/", "/operation/login"];
  const howToHelpBtn = ["/operation/view-details"];
  const HideLogoutButtons = logoutButton.includes(location.pathname);
  const HidehowToHelpBtn = howToHelpBtn.includes(location.pathname);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [userFullname, setUserFullname] = useState<any>("");
  const [currentUan, setCurrentUan] = useState<any>("");
  const [userUan, setUserUan] = useState(null);



  useEffect(() => {
    setTimeout(() => {
      const pathParts = location.pathname.split('/').filter(Boolean);
      const isDashboard = pathParts[0]?.toLowerCase() === 'dashboard';

      let nameToShow = "Welcome";

      if (isDashboard) {
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

  // useEffect(()=>{
  //   setTimeout(()=>{
  //     const userUan = decryptData(localStorage.getItem("user_uan"));
  //     getUserTotalBalance(userUan);
  //     setCurrentUan(userUan)
  //   },1000)
  // })
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
  const handleNavigate = () => {
    navigate("/how-can-help", {state: {currentUan}})
  }
  const handleLogout = async () => {
    try {
      // clearing 
      const userMobile = decryptData(localStorage.getItem("user_mobile"));
      if (userMobile && userMobile === MESSAGES.test_mobile) {
        await post('auth/reset-user-data', { mobile_number: MESSAGES.test_mobile })
      }
      localStorage.clear()
      setMessage({ type: "success", content: "Logged out successfully!!" });
      setTimeout(() => setMessage({ type: "", content: "" }), 2000);
      await logout();
      window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    }
  };
  return (
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
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: '#00C7A5',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '0.2rem',
                      cursor: 'pointer',
                    }}
                    onClick={handleNavigate}
                    title="Support"
                  >
                    <MdOutlineSupportAgent size={17} />
                  </div>
                }
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: '#FF3B30',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.2rem',
                    cursor: 'pointer',
                  }}
                  onClick={handleLogout}
                  title="Logout"
                >
                  <AiOutlineLogout size={17} />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>


    </div>
  );
};

export default Layout;
