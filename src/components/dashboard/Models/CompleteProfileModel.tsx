import { motion } from "framer-motion";
import { CompleteProfileButton } from "../../../helpers/helpers";
import "../../../App.css";
import { useEffect } from "react";
import TriangleDanger from "../../../assets/dangerTriangle.png"

interface CompleteProfileModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onContinue: () => void;
  bodyText?:string;
  headText?:string;
}

const CompleteProfileModel: React.FC<CompleteProfileModelProps> = ({
  setShowModal,
  onContinue,
  headText,
  bodyText,
}) => {
  const handleClose = () => {
    setShowModal(false);
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
      

        <motion.div
          className="d-flex flex-column align-items-center p-4 mt-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className="position-relative d-flex align-items-center justify-content-center mb-4"
            style={{ width: 120, height: 120 }}
          >
            <div
              className="position-absolute rounded-circle"
              style={{
                width: 120,
                height: 120,
                backgroundColor: "#f2f5ff",
            }}
            />
            <div
              className="position-absolute rounded-circle"
              style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#e6ecff",
              }}
            />
            <img
              src={TriangleDanger} 
              alt="Warning"
              width={50}
              height={50}
              className="position-absolute"
            />
          </div>

          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: 400,
              marginBottom: "0.5rem",
              color:headText ? "#FF0000":"null",
            }}
          >
           {headText ? headText : "Your Profile Is Not Completed"}
          </p>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 400,
              color: "#858585",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {bodyText}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="mt-3 mb-2 w-100"
          >
            <CompleteProfileButton
              text={headText? "Ok":"Complete Profile Now"}
              onClick={onContinue}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompleteProfileModel;
