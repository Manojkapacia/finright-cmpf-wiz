import { FaExclamationCircle } from "react-icons/fa";
import { CustomButtonArrowBack } from "../../helpers/helpers";
import { useNavigate, useLocation } from "react-router-dom";

export const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state || {}; // received from login page
  const { uanData } = state; // only get uanData

  const handleClick = () => {
    navigate("/express-withdraw", {
      state: { currentUanData: uanData }, // send only currentUanData
    });
  };

  return (
    <div className="container-fluid pt-3">
    <div className="row">
      <div
        className="col-md-4 offset-md-4 position-relative"
        style={{
          backgroundColor: "#E6ECFF",
          paddingLeft: "0",
          paddingRight: "0",
          fontFamily: "Poppins",
          height: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Centered Content */}
        <div className="px-3 h-100 d-flex flex-column justify-content-center align-items-center" style={{marginTop:"-2rem"}}>
          <div className="border-0 rounded p-4 d-flex flex-column gap-2 w-100" style={{ backgroundColor: "#FFEBEA" }}>
            <div className="d-flex align-items-center gap-2">
              <FaExclamationCircle style={{ fontSize: "1.125rem", marginTop: "-0.5", color: "#FF3B30" }} />
              <p className="fw-semibold mb-0 text-black" style={{ fontSize: "	0.875rem", lineHeight: "1",fontWeight:700 }}>
                EPFO Servers are down.
              </p>
            </div>
            <div className="ps-4">
              <p className="mb-0 text-black" style={{ fontSize: "	0.875rem", lineHeight: "1.2", fontWeight: 400 }}>
                Please try again later!
              </p>
            </div>
          </div>
        </div>
  
        {/* Bottom Fixed, Centered Button with No Background */}
        <div className="position-absolute bottom-0 start-0 end-0 pb-5 d-flex justify-content-center">
          <CustomButtonArrowBack name="Back" onClick={handleClick} />
        </div>
      </div>
    </div>
  </div>
  
  
  );
};
