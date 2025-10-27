import { FaExclamationCircle } from "react-icons/fa";
// import { useLocation } from "react-router-dom";
import { CustomButtonWithIcons } from "../../helpers/helpers";

// interface LocationState {
//     userId?: string;
//     uanData?: any;
//     selectedAmount?: any
// }

const NoBankDetails = () => {
  // const location = useLocation();
  // const state = location.state as LocationState || {};
  // const [selectedAmount] = useState(state.selectedAmount)

  const handleTalkToExpert = () => {
    console.log("handled handleTalkToExpert..");
  };

  return (
    <div className="container-fluid pt-3">
      <div className="row" style={{ height: "90vh" }}>
        <div
          className="col-md-4 offset-md-4 d-flex flex-column justify-content-between"
          style={{ height: "90vh", backgroundColor: "#E6ECFF" }}
        >
          {/* Centered error box */}
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div
              className="rounded p-4 d-flex flex-column gap-2"
              style={{ backgroundColor: "#FFEBEA", borderRadius: "10px" }}
            >
              <div className="d-flex align-items-start gap-2">
                <FaExclamationCircle
                  style={{
                    fontSize: "1.125rem",
                    marginTop: "0.08rem",
                    color: "#FF3B30",
                  }}
                />
                <div>
                  <p
                    className="mb-0 text-black"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      lineHeight: "1.2",
                    }}
                  >
                    Account not Linked with UAN
                  </p>
                </div>
              </div>

              <div className="ps-4 mt-2">
                <p
                  className="mb-0 text-black text-start"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    lineHeight: "1.4",
                  }}
                >
                  Looks like your UAN does not have any bank account linked
                </p>
              </div>
              <div className="ps-4">
                <p
                  className="mb-0 text-black text-start"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    lineHeight: "1.4",
                  }}
                >
                  Connect with our Experts to get your account linked before
                  placing withdrawal request
                </p>
              </div>
            </div>
          </div>

          {/* Bottom fixed button */}
          <div className="mb-5">
            <p
              className="text-center mb-1"
              style={{ fontSize: "1rem", color: "#858585" }}
            >
              Need help? Get in touch with PF expert
            </p>
            <div className="d-flex justify-content-center">
              <CustomButtonWithIcons
                name="Connect Now"
                onClick={handleTalkToExpert}
              />
            </div>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoBankDetails;
