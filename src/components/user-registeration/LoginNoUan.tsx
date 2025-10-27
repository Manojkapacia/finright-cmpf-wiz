import { useNavigate } from "react-router-dom"
import {  NoUanFoundContainer, PoweredBy, UserRegisterTextContent } from "../../features/user-registration/helpers/ExportingText"
import { CustomButton, CustomOutlinedButtonWithIcons } from "../../helpers/helpers"
import "../styles/UserRegisteration.css"
import { useEffect, useState } from "react"
import Epf_Member_Logo from "../../assets/pf-member-logo.png";


const LoginNoUan = () => {
  const [addBreaks, setAddBreaks] = useState(false);
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login-uan', { state: { type: 'full' } })
  }

  const handlePfExpertClick = () => {
    navigate('/how-can-help')
  }

  useEffect(() => {
    if (window.innerHeight > 700) {
      setAddBreaks(true);
    }
  }, []);

  return (
    <div
    className="to-margin-top-extra d-flex flex-column align-items-center justify-content-center text-center w-100 px-3 py-4"
    style={{
      position:"fixed",
      paddingBottom: "20px",
      overflowY: "auto",
    }}
  >
    {/* Top Content */}
    <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: "21rem" }}>
      <UserRegisterTextContent />
      <div className="text-center mt-0">
      <img
        src={Epf_Member_Logo}
        alt="uan-member-logo"
        className="img-fluid rounded-circle border border-3"
        style={{ width: "100px", height: "100px" }}
      />
      </div>
      <NoUanFoundContainer />
    </div>
  
    {/* Center Buttons */}
    {addBreaks && (
        <>
          <br />
          <br />
        </>
      )}
    <div className="d-flex flex-column align-items-center w-100 mt-3" style={{ maxWidth: "22rem" }}>
  
      <CustomButton name="Login using UAN and Password" onClick={handlePfExpertClick}/>
      {/* <CustomButtonArrow name="Contact PF expert" onClick={handlePfExpertClick} /> */}
  
      <p className="fw-semibold mt-2" style={{ fontSize: "0.9rem", color: "#858585" }}>
        Or
      </p>
  
      <p className="text-center mb-1" style={{ fontSize: "1rem", color: "#858585",marginTop:"-1rem" }}>
         Get in touch with PF expert
      </p>
      <CustomOutlinedButtonWithIcons name="Connect Now" onClick={handleLoginClick} />
    </div>
  
    {/* Footer */}
    <div className="d-flex justify-content-center mt-2">
      <PoweredBy />
    </div>
   
  </div>
  

  )
}

export default LoginNoUan