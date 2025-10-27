import { motion } from "framer-motion";
import { useState, FC } from "react";
import HeartPhoneIcon from "../../../assets/status.png";

interface Props {
  onSelect: (status: string) => void;
  options: string[];
  onClose: () => void;
}

const EmploymentStatusSelectorSlider: FC<Props> = ({ options, onSelect, onClose }) => {
  const specialOptions = [
    "I am retired",
    "I am currently not Working",
    "I have multiple UANs",
    "PF not deducted by current employer"
  ];
  const companyOptions = options.filter(opt => !specialOptions.includes(opt));
  const staticOptions = options.filter(opt => specialOptions.includes(opt));

  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleRadioClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      onSelect(selectedOption);
      onClose(); // close the slider
    }
  };

  return (
    <>
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="position-fixed bottom-0 start-50 translate-middle-x bg-white shadow-lg px-4 py-4"
        style={{
          zIndex: 1050,
          width: "100%",
          maxWidth: "500px",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.7 }}
      >
        <motion.div
          className="position-relative d-flex align-items-center justify-content-center mb-3"
          style={{ width: 100, height: 100, margin: "0 auto" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="position-absolute rounded-circle" style={{ width: 110, height: 110, backgroundColor: "#f2f5ff" }} />
          <div className="position-absolute rounded-circle" style={{ width: 90, height: 90, backgroundColor: "#e6ecff" }} />
          <img src={HeartPhoneIcon} alt="Status" width={70} height={70} style={{ zIndex: 2, objectFit: "contain" }} />
        </motion.div>

        <p style={{ fontSize: "1.13rem", textAlign: "center" }}>
          Choose your employment status
        </p>
        {/* Company Options */}
        {companyOptions.map((company, index) => {
          return (
            <label
              key={`company-${index}`}
              className="d-flex align-items-center py-3 mx-2"
              style={{
                borderTop: "1px solid #BCC2E6",
                cursor: "pointer",
                gap: "0.75rem",
                textAlign: "left",
              }}
              onClick={() => handleRadioClick(company)} // pass only company name
            >
              <input
                className="form-check-input mx-2"
                type="radio"
                name="employment"
                checked={selectedOption === company} // match only company name
                onChange={() => handleRadioClick(company)}
                style={{
                  transform: "scale(1.4)",
                  accentColor: "#00124F",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.13rem", color: "#333" }}>Working at :</span>
                <span style={{ fontSize: "1rem", color: "#6D75A7" }}>{company}</span>
              </div>
            </label>
          );
        })}


        {/* Static Options */}
        {staticOptions.map((option, index) => (
          <div
            key={`static-${index}`}
            className="d-flex align-items-center py-3 mx-2"
            style={{
              borderTop: "1px solid #BCC2E6",
              cursor: "pointer",
              gap: "0.75rem",
              textAlign: "left",
            }}
            onClick={() => handleRadioClick(option)}
          >
            <input
              className="form-check-input mx-2"
              type="radio"
              name="employment"
              checked={selectedOption === option}
              onChange={() => handleRadioClick(option)}
              style={{
                transform: "scale(1.4)",
                accentColor: "#00124F",
                marginTop: "4px",
              }}
            />
            <label
              style={{
                fontSize: "1.13rem",
                color: "#333",
              }}
            >
              {option}
            </label>
          </div>
        ))}


        <button
          className="mt-3 w-100 clickeffect"
          onClick={handleContinue}
          disabled={!selectedOption}
          style={{
            backgroundColor: "#00124F",
            borderRadius: "5px",
            color: "white",
            border: "none",
            paddingTop: "0.9rem",
            paddingBottom: "0.9rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            cursor: selectedOption ? "pointer" : "not-allowed",
            opacity: selectedOption ? 1 : 0.6,
          }}
        >
          Continue
        </button>
      </motion.div>
    </>
  );
};

export default EmploymentStatusSelectorSlider;
