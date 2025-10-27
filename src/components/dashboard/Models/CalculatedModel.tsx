import { motion } from "framer-motion";
import { ModelButton } from "../../../helpers/helpers";
import { HiCheckBadge } from "react-icons/hi2";
import "../../../App.css"
import { useEffect } from "react";

const CalculatedModel = (props: any) => {
  const data = ["Connect with an expert to get unparalleled guidance"];
  
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
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 150,
              damping: 12,
            }}
          >
          

            {/* Modal Content */}
            <motion.div
              className="d-flex flex-column align-items-center text-center gap-2 px-2 py-2 mt-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p
                className=" modalHeadText w-100"
               
              >
                How is this calculated?
              </p>
              {data.map((index: any) => (
                <motion.div
                  key={index}
                  className="modalSubText d-flex align-items-start w-100 px-2 py-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <HiCheckBadge
                    className="fs-4 me-3 flex-shrink-0"
                    style={{ color: "#304DFF" }}
                  />
                  <span className="fw-medium text-start">{props.content}</span>
                </motion.div>
              ))}

              {/* Continue Button */}
              <ModelButton
                content="Got It"
                arrow={false}
                onClick={() => props.onClose()}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CalculatedModel;
