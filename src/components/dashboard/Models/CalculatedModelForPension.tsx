import { motion } from "framer-motion";
import { HiCheckBadge } from "react-icons/hi2";
import { ModelButton } from "../../../helpers/helpers";
import "../../../App.css"
import { useEffect } from "react";
const CalculatedModelForPension = (props: any) => {
  const data = [
    "If your total service is less than 10 years, you can withdraw the pension amount as a lump sum.",
    "If your service is 10 years or more, you cannot withdraw it, but will receive a monthly pension after age 58.",
    "Monthly Pension Formula:",
    "Pension = (Total Service × ₹15,000) ÷ 70"
  ];

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
      {props.isOpen && (
        <>
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
            className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg rounded-top gap-2 mt-3 px-3 py-2"
            style={{ zIndex: 1050, maxWidth: "500px" }}
            initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 15 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
          >
            <motion.div
              className="d-flex flex-column align-items-center text-center gap-2 mt-3 px-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p
                className="modalHeadText w-100 px-2"
                style={{ textAlign: "start", color: "#000000" }}
              >
                How is this calculated?
                <span className="underline mb-1"></span>
              </p>

              {data.map((line, index) => (
                <motion.div
                  key={index}
                  className="modalSubText d-flex w-100  py-2"
                  style={{ alignItems: "center" }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {index < 3 && (
                    <div
                      className="modalSubText d-flex align-items-center justify-content-center"
                      style={{ minWidth: "35px", marginRight: "10px" }}
                    >
                      <HiCheckBadge className="fs-4 flex-shrink-0" style={{ color: "#304DFF" }} />
                    </div>
                  )}

                  <span
                    className="text-start"
                    style={
                      index === 3
                        ? {  fontWeight: 600, marginLeft: "2.8rem", color: "#000000",marginTop:"-1.2rem" }
                        // 1px in rem
                        : {}
                    }
                  >
                    {line}
                  </span>
                </motion.div>
              ))}

              <p
                className=" w-100 px-2"
                style={{ textAlign: "start", }}
              >
                <p className="text-start px-0" style={{ color: "#858585", fontSize: " 0.625rem", fontWeight: 400, textAlign: "start" }}>This is an indicative calculation; EPFO determines the final pension amount.</p>
              </p>

              <motion.div className="mt-3 mb-3">
                <ModelButton content="Got It" arrow={false} onClick={() => props.onClose()} />
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CalculatedModelForPension;
