import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { formatCurrency, parseCurrency } from "../../common/currency-formatter";
import { ToTitleCase } from "../../common/title-case";
import "../../../styles/global.css"

const TransactionDetailsModel = (props:any) => {
  const [transactionData] = useState<any>([
    { label: "Transaction type:", value: props?.selectedTransaction?.transactionType == "+" ? "Credit" : "Debit" },
    { label: "Transaction Date:", value: props?.selectedTransaction?.transactionDate },
    { label: "Amount:", value: formatCurrency((parseCurrency(props.selectedTransaction?.employeeShare) || 0) + (parseCurrency(props.selectedTransaction?.employerShare) || 0)) },
    { label: "Employee Share:", value: formatCurrency(props?.selectedTransaction?.employeeShare)},
    { label: "Employer Share:", value: formatCurrency(props?.selectedTransaction?.employerShare) },
    { label: "Pension Share:", value: formatCurrency(props?.selectedTransaction?.pensionShare)},
    { label: "Description:", value: ToTitleCase(props?.selectedTransaction?.particulars) }
  ])

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
              className="d-flex flex-column align-items-start text-start gap-1 px-2 py-2 mt-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="slider-title-text py-2" style={{lineHeight: "100%", letterSpacing: "0px" }}>
                Transaction Details
                <span className="underline mb-3 mt-1"></span>
              </p>
              {transactionData.map((item:any, index:any) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <p className="slider-label-text mb-2" style={{color:"#858585", fontWeight: 500, lineHeight: "100%", letterSpacing: "0px" }}>
                    {item.label}
                  </p>
                  <p className="slider-value-text " style={{ lineHeight: "100%", letterSpacing: "0px" }}>
                    {item.value}
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

export default TransactionDetailsModel;

