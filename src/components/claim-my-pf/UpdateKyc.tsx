import { useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { CustomButtonWithIcons } from "../../helpers/helpers";

interface LocationState {
    userId?: string;
    uanData?: any;
    selectedAmount?: any

}
const UpdateKyc = () => {
    const location = useLocation();
    const state = location.state as LocationState || {};
    const [selectedAmount] = useState(state.selectedAmount)

    const handleTalkToExpert = () => {
        console.log("handled handleTalkToExpert..")
    }
    return (
        <div
            className="container-fluid pt-3">
            <div className="row" style={{ height: "90vh", }}>
                <div className="col-md-4 offset-md-4" style={{ height: "90vh", backgroundColor: "#E6ECFF" }}>
                    <div className="to-margin-top">
                        {/* <div className="text-center w-100 mb-4 mt-5"> */}
                        <div className="text-center w-100 mb-4 mt-4">
                <h5 style={{ fontWeight: 400, fontSize: "0.875rem" }}>Claim Amount</h5>
                <div className="express-amount mt-2 mb-2" style={{fontFamily: "Roboto"}}>₹ {selectedAmount}</div>
                <div className="" style={{color:"#858585"}}>
                  <div className="express-account-IFSC">A/C No: {state?.uanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber || "--"}</div>
                  <div className="express-account-IFSC mt-1">IFSC Code: {state?.uanData?.rawData?.data?.profile?.kycDetails?.bankIFSC || "--"}</div>
                </div>



                                <div className="d-flex flex-column justify-content-center align-items-center bg-light mt-5">
                                    <div className=" rounded p-4 d-flex flex-column gap-2" style={{backgroundColor: "#FFEBEA", borderRadius: "10px"}}>
                                        <div className="d-flex align-items-start gap-2">
                                            <FaExclamationCircle 
                                            style={{ fontSize: "1.125rem",
                                        marginTop: "0.08rem",
                                        color: "#FF3B30", }} />
                                            <div>
                                                <p className="fw-semibold mb-0 text-black" style={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: "1.2" }}>
                                                    KYC Details Not Found
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ps-4 mt-2">
                                            <p className="mb-0 text-black text-start" style={{ fontSize: "0.875rem", fontWeight: 400, lineHeight: "1" }}>
                                                Looks like your KYC details are not updated yet
                                            </p>
                                        </div>
                                        <div className="ps-4">
                                            <p className="mb-0 text-black text-start" style={{ fontSize: "0.875rem", fontWeight: 400, lineHeight: "1" }}>
                                                Please update KYC details in your EPFO member portal before applying claim.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="fixed-bottom  p-3  mb-4 py-5">
                                    <p className="text-center mb-2" style={{ fontSize: "1rem", color: "#858585" }}>
                                        Need help? Get in touch with PF expert
                                    </p>
                                    <div className="d-flex justify-content-center">
                                        <CustomButtonWithIcons name="Connect Now" onClick={handleTalkToExpert} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div> </div> 
    )
}

export default UpdateKyc