import { FaExclamationCircle } from "react-icons/fa"
import { CustomButton } from "../../helpers/helpers"
import { useLocation, useNavigate } from "react-router-dom";

const EPFOCredentialError = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state || {}; // received from login page
    const { currentUanData } = state; // only get uanData

    const handleClick = () => {
        
        navigate("/login-uan", {
            state: {
                type: "refresh",
                currentUan: currentUanData?.profileData?.data?.uan,
                mobile_number:
                currentUanData?.profileData?.data?.phoneNumber.replace(
                        /^91/,
                        ""
                    ),
                dashboard: true
            },
        });
    }

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
                                        EPFO Credential Error

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
                                    Looks like your credentials has changed since you last fetched your data.
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
                                    Please refresh your passbook data once and try again!.

                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom fixed button */}
                    <div className="mb-5">
                        <div className="d-flex justify-content-center">
                            <CustomButton
                                name="Refresh Data"
                                onClick={handleClick}
                            />
                        </div>
                        <br />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EPFOCredentialError