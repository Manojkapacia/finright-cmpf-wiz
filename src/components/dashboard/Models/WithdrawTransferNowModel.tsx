import { motion } from "framer-motion";
import {  FaTimes } from "react-icons/fa";
import Money from "../../../assets/Money.png"; // Update the path if needed
import "../../../App.css";
import { useEffect } from "react";
import { CompleteProfileButton } from "../../../helpers/helpers";
import { RiHandCoinLine, RiTeamFill } from "react-icons/ri";
import { TbChartGridDots } from "react-icons/tb";
import { MdWallet } from "react-icons/md";

interface WithdrawTransferNowModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<{ show: boolean; type: "withdraw" | "connectNow" | "" }>>;
  onTalkToExpert?: () => void;
}

const WithdrawTransferNowModel: React.FC<WithdrawTransferNowModelProps> = ({ setShowModal, onTalkToExpert }) => {
  const steps = [
    {
      text: "Connect with Expert",
      icon: <RiTeamFill className="fs-5" style={{ color: "#858585" }} />,
    },
    {
      text: "Get clarity on the withdrawal process",
      icon: <TbChartGridDots  className="fs-5" style={{ color: "#858585" }} />,
    },
    {
      text: "Pay service fee",
      icon: <MdWallet className="fs-5" style={{ color: "#858585" }} />,
    },
    {
      text:"Get amount settled",
      icon: <RiHandCoinLine      className="fs-5" style={{ color: "#858585" }} />,
    },
  ];

  const handleClose = () => {
    setShowModal({ show: false, type: "" });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="position-relative text-center">
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
      />

      <motion.div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg rounded-top"
        style={{ zIndex: 1050, maxWidth: "500px" }}
        initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
      >
        <motion.button
          className="btn btn-light position-absolute top-0 end-0 m-2"
          onClick={handleClose}
        >
          <FaTimes className="fs-5 text-dark" />
        </motion.button>

        <motion.div
          className="d-flex flex-column align-items-center text-start p-4 mt-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Icon stack */}
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
                      width: 80,
                      height: 80,
                      backgroundColor: "#e6ecff",
                    }}
                  />
      
                  {/* Larger Center Image */}
                  <img
                    src={Money}
                    alt="Money"
                    width="250%"// Increased from 60
                    height="250%"
                    className="position-absolute"
                    style={{ zIndex: 2, objectFit: "contain" }}
                  />
                </motion.div>


          {/* Main Title */}
          <p style={{ fontSize: "1.125rem", fontWeight: 400 }} className="text-center mb-4">
            Withdrawing PF was never this simple
          </p>

          {/* Step List */}
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="d-flex align-items-center mb-2 w-100"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="me-3" style={{ minWidth: "24px" }}>{step.icon}</div>
              <span style={{ fontSize: "1rem", color: "#858585", fontWeight: 400 }}>{step.text}</span>
            </motion.div>
          ))}
          <motion.div
            className="mb-4 mt-3 w-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CompleteProfileButton text="Withdraw Now" onClick={onTalkToExpert} />
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default WithdrawTransferNowModel;
