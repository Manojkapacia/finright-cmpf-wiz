import { motion } from "framer-motion";
import { CustomButtonAll} from "../../../helpers/helpers";
import "../../../App.css";
import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface HighRiskModelEPFOModelModelProps {
    setShowModal: React.Dispatch<React.SetStateAction<{ show: boolean; type: "highriskepfo" | "connectEpfo" | "" }>>;
    issuesCount: any
}

const HighRiskModelEPFOModel: React.FC<HighRiskModelEPFOModelModelProps> = ({ setShowModal, issuesCount }) => {

    const handleClose = () => {
        setShowModal({ show: false, type: "" });
    };

    const handleConnectEpfo = () => {
        setShowModal({ show: true, type: "connectEpfo" });
    }
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto"; // Reset when modal is closed
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
                className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg rounded-top "
                style={{ zIndex: 1050, maxWidth: "500px" }}
                initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
            >
              <motion.button
          className="btn btn-light position-absolute top-0 end-0 m-2 "
          onClick={handleClose}
        >
          <FaTimes className="fs-5 text-dark" />
        </motion.button>

                <motion.div
                    className="d-flex flex-column  text-start p-4  py-2 mt-2"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p className="modalHeadText w-100 px-2 mt-5" style={{ textAlign: "start" }}>
                        Your withdrawal might get stuck!
                        <span className="underlinered mb-2" style={{ backgroundColor: "#FF0000" }}></span>
                    </p>

                    {issuesCount && <p className="w-100 px-2 py-3" style={{fontSize:"1.25rem",fontWeight:400,textAlign: "start", color: "#FF0000" }}>
                        {issuesCount} issues identified
                    </p>}

                    <p className="modalSubText px-2 mt-2 text-start d-block" style={{color:"#858585"}}> We've found issues that could block your withdrawal.</p>
                    <p className="modalSubText px-2  text-start d-block " style={{color:"#858585",marginTop:"-0.5rem"}}> Resolve them now to secure access to your PF account.</p>

                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="mt-4 mb-2">
                        {/* <ModelButton content="Connect EPFO account" arrow={true} onClick={handleConnectEpfo} /> */}
                        <div className="mb-3" >
                            <CustomButtonAll
                                content="Resolve Issues"
                                color="#FF0000"
                                onClick={handleConnectEpfo}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HighRiskModelEPFOModel;
