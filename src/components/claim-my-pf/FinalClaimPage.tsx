import { BsWhatsapp } from "react-icons/bs"
import { FaExclamationCircle } from "react-icons/fa"
import { CustomButtonArrow } from "../../helpers/helpers"

export const FinalClaimPage = () => {
    return (
        <div
            className="container-fluid pt-3">
            <div className="row">
                <div className="col-md-4 offset-md-4" style={{ backgroundColor: "#E6ECFF" }}>
                    <div className="to-margin-top ">
                        <p className="px-4 text-center  py-4" style={{ fontSize: "2rem", fontWeight: 600,  lineHeight: '100%', letterSpacing: '0%',marginBottom:"2rem" }}>
                            Claim application applied with EPFO
                        </p>


                        <div className="card border-0 px-3 m-4 pt-3">
                            <div className="card-body  ">

                                <p className="mb-0" style={{ fontSize: "0.813rem", fontWeight: 400 }}>
                                    Claim ID:
                                </p>
                                <p className="mb-3" style={{ fontSize: "1rem", fontWeight: 400 }}>
                                    336565689
                                </p>

                                <p className="mb-0" style={{ fontSize: "0.813rem", fontWeight: 400 }}>
                                    Assigned FinRight Expert:
                                </p>
                                <p className="mb-0" style={{ fontSize: "1rem", fontWeight: 400 }}>
                                    Laxmi
                                </p>

                                <div className="d-flex align-items-center mb-4" style={{ fontSize: "1rem", fontWeight: 400 }}>
                                    <BsWhatsapp className="me-2" style={{ color: "green" }} />
                                    <span>9876543210</span>
                                </div>

                                <div className="position-relative ps-4">
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "0.45rem",
                                            top: "6.25rem",
                                            height: "3rem",
                                            width: "1px",
                                            marginTop: "-3rem",
                                            backgroundColor: "#0d6efd",
                                            borderRadius: "50px",
                                        }}
                                    ></div>

                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "0.25rem",
                                            top: "6.1rem",
                                            width: "0.425rem",
                                            height: "0.425rem",
                                            borderRadius: "50%",
                                            marginTop: "-3.1rem",
                                            backgroundColor: "#0d6efd",
                                            zIndex: 1,
                                        }}
                                    ></div>

                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "0.25rem",
                                            top: "9rem",
                                            width: "0.425rem",
                                            height: "0.425rem",
                                            borderRadius: "50%",
                                            marginTop: "-3rem",
                                            backgroundColor: "#0d6efd",
                                            zIndex: 1,
                                        }}
                                    ></div>

                                    <p className="mb-1" style={{ fontSize: "0.813rem", fontWeight: 400 }}>
                                        Apply Claim Online
                                    </p>
                                    <p className="mb-1" style={{ fontSize: "0.688rem", fontWeight: 400 }}>
                                        Claim applied on 03/03/2025
                                    </p>
                                    <p className="mb-4" style={{ fontSize: "0.688rem", fontWeight: 400 }}>
                                        Processing Time: 3 - 22 Days
                                    </p>

                                    <p className="mb-1 pt-2" style={{ fontSize: "0.813rem", fontWeight: 400 }}>
                                        Claim Settlement
                                    </p>
                                    <p className="mb-1" style={{ fontSize: "0.688rem", fontWeight: 400 }}>
                                        Settlement under process...
                                    </p>
                                    <p style={{ fontSize: "0.688rem", fontWeight: 400 }}>
                                        Expected settlement date: 4 April 2025
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="card border-0 px-3 m-4 pb-0 " style={{ backgroundColor: "#cff4ee", borderRadius: "0.5rem" }}>
                            <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <h5 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FaExclamationCircle style={{ color: "#00C7A5", marginRight: "0.5rem" }} />
                                    Prepare for settlement!
                                </h5>
                                <p style={{ fontSize: "0.688rem", fontWeight: 400 }}>
                                    Plan investing your fund for better returns
                                </p>
                            </div>
                        </div>
                        <center className="mb-3">
                     <CustomButtonArrow name={"Start Investing"}/>
                        </center>

                    </div>
                </div></div></div>
    )
}

