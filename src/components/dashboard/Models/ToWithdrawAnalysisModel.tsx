import { motion } from "framer-motion";
import { HiCheckBadge } from "react-icons/hi2";
import { ModelButton } from "../../../helpers/helpers";
import { useEffect } from "react";


const ToWithdrawAnalysisModel = (props: any) => {
  const data = [
    "If you're not currently working, your entire PF balance is withdrawable.",
    "If you're still employed, the maximum you can withdraw is the lowest of:",
    `a) Your total PF balance.\n
    b) Employee share + 36 × last EPF wage.\n
    c) Employee share + 80% of employee share.`,
    "The immediately withdrawable amount is 6 × last EPF wage",
  ];

  const handleClose = () => {
    props.onClose();
  };
  
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
      {props?.isOpen && (
        <>
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
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
            <motion.div
              className="d-flex flex-column align-items-center text-start gap-2  px-2 py-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p
                className=" w-100 modalHeadText"
            
              >
                How is this calculated?
                <span className="underline mb-2"></span>

              </p>

              {data.map((text, index) => (
                <motion.div
                  key={index}
                  className="modalSubText d-flex w-100 py-3"
                  style={{ alignItems: "center" }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Icon container with proper spacing */}
                  {index !== 2 && (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        minWidth: "35px",
                        height: "100%",
                      }}
                    >
                      <HiCheckBadge
                        className="fs-4 flex-shrink-0"
                        style={{ color: "#304DFF",marginRight:"1rem" }}
                      />
                    </div>
                  )}

                  {/* Text container */}
                  <div style={{ flex: 1 }}>
                    <span
                      className="text-start d-block"
                      style={
                        index === 2
                          ? {
                              // fontSize: "0.875rem",
                              // fontWeight: 400,
                              whiteSpace: "pre-line",
                              lineHeight: "1",
                              marginLeft: "2.4rem", // Adjusted spacing for multiline text
                              display: "block",
                              marginTop:"-1.9rem"
                            }
                          : {}
                      }
                    >
                      {text}
                    </span>
                  </div>
                </motion.div>
              ))}

              <motion.div className="mt-3">
                <ModelButton content="Got It" arrow={false} onClick={handleClose} />
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ToWithdrawAnalysisModel;
