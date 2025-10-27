
import { motion } from "framer-motion";
import "./../styles/UserRegisteration.css";
import "./../../styles/global.css";

interface EmploymentOptionsModalProps {
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
}

export const EmploymentOptionsModal = ({ options, onSelect }: EmploymentOptionsModalProps) => {

  const specialOptions = [
    "I am retired",
    "I am currently not Working",
    "I have multiple UANs",
    "PF not deducted by current employer"
  ];
  const companyOptions = options.filter(opt => !specialOptions.includes(opt));
  const staticOptions = options.filter(opt => specialOptions.includes(opt))
  return (
    <motion.div
      className="modal-backdrop"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content-box shadow"
        initial={{ y: "-20%", opacity: 0 }}
        animate={{ y: "0", opacity: 1 }}
        exit={{ y: "-20%", opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center py-2" style={{fontSize: "1.2rem",color: '#000'}}>Choose option:</div>
        <div className="mb-3" style={{ borderTop: '0.1px solid #BCC2E6' }}>
          {companyOptions.map((opt, idx) => (
            
            <div
              key={`company-${idx}`}
              className="option-item"
              style={{ fontSize: '1rem', fontWeight: '400',color:'#6D75A7', borderBottom: '0.1px solid #BCC2E6' }}
              onClick={() => onSelect(opt)}
            >
              <p className="mb-0" style={{fontSize: "1.2rem",color: '#000'}}>Worked at:</p>
              {opt}
            </div>
          ))}

           {staticOptions.map((opt, idx) => (
            <div
              key={`static-${idx}`}
              className="option-item"
              style={{ fontSize: '1.2rem', fontWeight: '400', borderBottom: '0.1px solid #BCC2E6' }}
              onClick={() => onSelect(opt)}
            >
              {opt}
            </div>
          ))}

        </div>
      </motion.div>
    </motion.div>
  );
};
