import { motion } from "framer-motion";
import { CustomButtonAll } from "../../../helpers/helpers";
import "../../../App.css";
import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ConnectEPFOModelProps {
    setShowModal: React.Dispatch<React.SetStateAction<{ show: boolean; type: "withdraw" | "connectNow" | "" }>>;
    onContinue: () => void;
  }

const ConnectEPFOModel: React.FC<ConnectEPFOModelProps> = ({ setShowModal,onContinue }) => {
    const data: string[] = [
        '1. Connect your EPFO account<span style="color:#858585;"> (requires EPFO portal password)</span>',
        '2. FinRight Expert Connect with you',
        '3. Issues get resolved',
    ];


    const handleClose = () => {
        setShowModal({ show: false, type: "" });
    };

   
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
                    className="btn btn-light position-absolute top-0 end-0 m-2"
                    onClick={handleClose}
                >
                    <FaTimes className="fs-5 text-dark" />
                </motion.button>

                <motion.div
                    className="d-flex flex-column  text-start p-4  py-3 mt-5"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p className="modalHeadText w-100 px-2" style={{ textAlign: "start" }}>
                        Resolving issues
                        <span className="underlinered mb-2" style={{ backgroundColor: "#FF0000" }} ></span>
                    </p>

                    <p className="modalSubText  px-2 py-3" style={{ textAlign: "start" }}>Resolving issues is a simple 3 step process</p>

                    {data.map((text, index) => (
                        <motion.div
                            key={index}
                            className="d-flex w-100 py-2 px-2"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div style={{ flex: 1 }}>
                                <span
                                    className="modalSubText text-start d-block"
                                    dangerouslySetInnerHTML={{ __html: text }}
                                />
                            </div>
                        </motion.div>
                    ))}


                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="mt-4 mb-2">
                        <CustomButtonAll
                            content="Connect EPFO account"
                            color="null"
                            onClick={onContinue}

                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ConnectEPFOModel;
