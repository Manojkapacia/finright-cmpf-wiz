import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AiFillEdit from "../../../assets/AiFillEdit.png";
import { decryptData } from "../../common/encryption-decryption";
import { useNavigate } from "react-router-dom";
import { ZohoLeadApi } from "../../common/zoho-lead";
import { get, post } from "../../common/api";

interface SupportModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  userReturnNavigate?: boolean;
}

const SupportModel: React.FC<SupportModelProps> = ({ setShowModal, userReturnNavigate }) => {
  const [mobile, setMobile] = useState<any>();
  const [isNewUIToggleEnabled, setIsNewUIToggleEnabled] = useState<boolean>(false);
  
  const navigate = useNavigate()
   useEffect(() => {
      const getToggleValue = async () => {
        try {
          const response = await get("/data/toggle/keys");
          const newUIToggle = response?.allTogglers?.find((item: any) => item.type === "new-ui");
          setIsNewUIToggleEnabled(newUIToggle?.isEnabled);
        } catch (err) {}
      };
      getToggleValue();
    }, []);

  const handleClose = async() => {
    setShowModal(false);
    zohoUpdateLead();
    if(userReturnNavigate){
      navigate('/dashboard')
    }else{
      if(isNewUIToggleEnabled){
        navigate('/enter-name', { state: { mobile_number: mobile } })
      }else{
        navigate('/searching-uan', { state: { mobile_number: mobile } })
      }
    }
    if (mobile.length) {
      const mobileNumber= mobile
      await post('lead/knowlarity-lead', { mobileNumber, tag: "Support Query" });
    }
  };


  useEffect(() => {
    document.body.style.overflow = "hidden";
    const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    setMobile(mobileNumber);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const zohoUpdateLead = async () => {
      const rawData = decryptData(localStorage.getItem("lead_data"));
      const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
      const userName = decryptData(localStorage.getItem("user_name"));
      const userBalance = decryptData(localStorage.getItem("user_balance"));
  
      const newUser = rawData ? JSON.parse(rawData) : null;
      const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
      const user = existUser || newUser;
  
      if (!user) return;
     
      if(user){
      const zohoReqData = {
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: user?.CheckMyPF_Status,
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance,
      };
  
      ZohoLeadApi(zohoReqData);
    }
    };
  
  return (
    <div className="position-relative text-center">
      {/* Overlay */}
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Modal */}
      <motion.div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg px-3 gap-3 py-5 rounded-top"
        style={{ zIndex: 1050, maxWidth: "500px" }}
        initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
      >
        <motion.div
          className="d-flex flex-column align-items-center text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >

          {/* tick Icon Stack */}
          <motion.div
            className="position-relative d-flex align-items-center justify-content-center mb-4 mt-4"
            style={{ width: 120, height: 120 }} // Reduced from 150
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >

            {/* Outer Circle */}
            <div
              className="position-absolute rounded-circle"
              style={{
                width: 120,
                height: 120,
                backgroundColor: "#f2f5ff",
              }}
            />

            {/* Inner Circle */}
            <div
              className="position-absolute rounded-circle"
              style={{
                width: 95,
                height: 95,
                backgroundColor: "#e6ecff",
              }}
            />



            {/* Larger Center Image */}
            <img
              src={AiFillEdit}
              alt="Success"
              width={70} // Increased from 60
              height={70}
              className="position-absolute"
              style={{ zIndex: 2, objectFit: "contain" }}
            />
          </motion.div>

          <p style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "center" }}>
            We have registered your request         </p>
          <p style={{ fontSize: "0.8125rem", fontWeight: 400, textAlign: "center", color: "#858585" }}>
            One of our agent will reach out to you within 12 hours between 8.30 Am to 7.00 PM from Monday - Saturday
          </p>

          <motion.div className="mt-4 mb-3 w-100" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <button
              className="clickeffect"
              onClick={handleClose}
              style={{
                backgroundColor: `${"#00124F"}`,
                borderRadius: "0.3125rem",
                width: "100%",
                color: "white",
                border: "none",
                padding: "0.625rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Ok
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SupportModel;
