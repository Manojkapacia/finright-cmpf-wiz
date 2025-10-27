import { motion } from "framer-motion";
import { CompleteProfileButton, PFSuccessCard } from "../../../helpers/helpers";
import "../../../App.css";
import { useEffect } from "react";
import TriangleDanger from "../../../assets/dangerTriangle.png";

interface KycDetailsContinueModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onContinue: () => void;
  headText?: string;
}

const KycDetailsContinueModel: React.FC<KycDetailsContinueModelProps> = ({
  setShowModal,
  onContinue,
  headText = "Please verify your KYC details to ensure your PF account KYC is seeding is correct",
}) => {
  console.log(setShowModal)
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
          className="d-flex flex-column align-items-center justify-content-center px-4 py-5 text-center"
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

          <PFSuccessCard />

          <div
            style={{
              fontWeight: 400,
              fontSize: "1.125rem",
              marginTop: "1rem",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
              padding: "0 1rem",
            }}
          >
            {headText}
          </div>

          <CompleteProfileButton text="Continue" onClick={onContinue} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default KycDetailsContinueModel;