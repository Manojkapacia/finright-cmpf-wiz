import { motion } from "framer-motion";
import { useEffect } from "react";
import TickMark from "../../../assets/correct.png"; 
// import { FaTimes } from "react-icons/fa";
import { CompleteProfileButton } from "../../../helpers/helpers";

interface ConnectNowModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<{ show: boolean; type: "withdraw" | "connectNow" | "" }>>;
}

const ConnectNowModel: React.FC<ConnectNowModelProps> = ({ setShowModal }) => {
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
        className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg px-5 gap-3 py-5 rounded-top"
        style={{ zIndex: 1050, maxWidth: "500px" }}
        initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
      >
        {/* Close Button */}
           {/* <motion.button
                  className="btn btn-light position-absolute top-0 end-0 m-2"
                  onClick={handleClose}
                >
                  <FaTimes className="fs-5 text-dark" />
                </motion.button> */}
        <motion.div
          className="d-flex flex-column align-items-center text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* <p className="modalHeadText w-100" style={{ textAlign: "start" }}>
            Withdrawal Request Registered!
            <span className="underline mb-3"></span>
          </p> */}

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
                width: 80,
                height: 80,
                backgroundColor: "#e6ecff",
              }}
            />

            {/* Larger Center Image */}
            <img
              src={TickMark}
              alt="Success"
              width={70} // Increased from 60
              height={70}
              className="position-absolute"
              style={{ zIndex: 2, objectFit: "contain" }}
            />
          </motion.div>

          <p style={{ fontSize: "1.125rem", fontWeight: 400, textAlign: "center" }}>
              Withdrawal Request Registered          </p>
          <p style={{ fontSize: "0.8125rem", fontWeight: 400, textAlign: "center" }}>
            One of our expert will reach out to you within 12 hours between 8:30 AM to 7:00 PM from Monday - Saturday.
          </p>

          <motion.div className="mt-4 mb-3 w-100" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <CompleteProfileButton text="OK" onClick={handleClose} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConnectNowModel;
