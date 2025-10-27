import { motion, AnimatePresence } from "framer-motion";
import successImage from "./../../../assets/icons-success.gif"
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ZohoModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      
        return () => {
          document.body.style.overflow = "auto"; // Reset when component unmounts
        };
      }, [isOpen]);

    return (
        <AnimatePresence>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-body">
                            <div className='text-center'>
                                <img src={successImage} alt="Dynamic Description" height={"150rem"} width={"150rem"} />
                            </div>
                            <p>We have successfully recorded your request, one of our PF expert will reach out to you within 60 mins</p>
                        </div>
                        <div className='text-center my-3'>
                            <button className="pfRiskButtons py-2" onClick={onClose} style={{ paddingLeft: "5rem", paddingRight: "5rem" }}>
                                Ok
                            </button>
                        </div>

                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default ZohoModal;
