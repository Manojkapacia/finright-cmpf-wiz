import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { ToTitleCase } from "../../common/title-case";
import "../../../styles/global.css"

const AccountDetaillsModel = (props:any) => {
  const [accountData] = useState<any>({
    "Company Name": ToTitleCase(props?.companyName) || "-",
    "Service": props?.serviceDetails[0]?.period || "-",
    "Member Id": props?.serviceDetails[0]?.details["Member Id"] || "-",
    "Establishment ID": props?.serviceDetails[0]?.details["Est Id"] || "-",
  //   "Total Amount": formatCurrency(props?.passbookSharesData?.totalAmountWithInterest) || "₹ 0",
  //   "Employee Share": formatCurrency(props?.passbookSharesData?.employeeShare) || "₹ 0", 
  //   "Employer Share": formatCurrency(props?.passbookSharesData?.employerShare) || "₹ 0", 
  //   "Pension Share": formatCurrency(props?.passbookSharesData?.pensionShare) || "₹ 0", 
  //   "Interest Earned": formatCurrency(props?.passbookSharesData?.interestShare) || "₹ 0"
   })

  useEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  
    return () => {
      document.body.style.overflow = "auto"; // Reset when component unmounts
    };
  }, [props.isOpen]);

  return (
    <div className="position-relative text-center">
      {/* Modal Overlay & Content */}
      {props.isOpen && (
        <>
          {/* Click Outside to Close */}
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => props.onClose()}
          ></motion.div>

          <motion.div
            className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg p-4 rounded-top"
            style={{ zIndex: 1050, maxWidth: "500px" }}
            initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
          >
            {/* Close "X" Icon */}
            <motion.button
              className="btn btn-light position-absolute top-0 end-0 m-2"
              onClick={() => props.onClose()}
            >
              <FaTimes className="fs-5 text-dark" />
            </motion.button>

            {/* Modal Content */}
            <motion.div
              className="d-flex flex-column align-items-start text-start  gap-1 px-2 py-2 mt-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="slider-title-text" style={{lineHeight: "100%", letterSpacing: "0px" }}>
               Employer Details  <span className="underline mb-3 mt-1"></span>
              </p>
              {Object.entries(accountData).map(([key, value], index) => (
                <motion.div
                  key={index}
                  className="d-flex flex-column"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <p className="slider-label-text mb-2" style={{color:"#858585", lineHeight: "100%", letterSpacing: "0px" }}>
                    {key}:
                  </p>
                  <p className="slider-value-text" style={{lineHeight: "100%", letterSpacing: "0px" }}>
                    {value as React.ReactNode}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AccountDetaillsModel;

