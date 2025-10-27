import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VanityCard from "../../../components/dashboard/VanityCard/VanityCard";
import "../../../styles/global.css"
import "../styles/ExpressWithdraw.css"
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { CustomButtonArrow, CustomButtonWithIcons } from "../../../helpers/helpers";
import { FaExclamationCircle } from "react-icons/fa";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdEditOff } from "react-icons/md";
// import { motion, AnimatePresence } from "framer-motion";



const ExpressWithdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(1000);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();
  // const [loading, setLoading] = useState(false);
  const { currentUanData } = location.state || {};
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const kyc = currentUanData?.rawData?.data?.profile?.kycDetails;
    const hasIFSC = kyc?.bankIFSC;
    const hasAccount = kyc?.bankAccountNumber;

    if (kyc && (!hasIFSC || !hasAccount)) {
      navigate("/claim-epfo/no-bank-details");
    }
  }, [currentUanData?.rawData?.data?.profile?.kycDetails, navigate]);

// console.log(currentUanData)
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAuthorized(e.target.checked);
    if (e.target.checked) {
      setShowError(false); // clear error once checked
    }
  };
  //  console.log(currentUanData?.rawData?.data?.profile)
  useEffect(() => {
    // console.log("Received currentUanData:", currentUanData);
  }, [currentUanData]);
  const backPassbook = () => {

    navigate("/dashboard", { state: { processedUan: currentUanData?.rawData?.data?.profile?.UAN, openTab: "fromWithdrawNow" } });

  };
  // amountWithdrawableWithin30Days
  const maxAmount = currentUanData?.reportData?.maxWithdrawableLimit;
  const totalFee = 1050, platformFee = 500, processingFee = 500, taxes = 50;

  const handlePayment = async () => {
    if (!isAuthorized) {
      setShowError(true);
      return;
    }
    try {

      navigate('/claim-epfo/login', {
        state: {
          currentUanData,
          amount
        },
      });
    } catch (error) {
      console.error("Error during payment request:", error);
    } finally {
    }
  };

  const handleTalkToExpert = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("handleTalkToExpert clicked")
  }

  const handleToggleDetails = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowDetails((prev) => {
      // Close warning if opening details
      if (!prev) setShowWarning(false);
      return !prev;
    });
  };
  
  const handleToggleWarning = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowWarning((prev) => {
      // Close details if opening warning
      if (!prev) setShowDetails(false);
      return !prev;
    });
  };

  return (
    <>

      <div
        className="container-fluid pt-3">
        <div className="row">
          <div className="col-md-4 offset-md-4" style={{
            backgroundColor: "#E6ECFF",
            paddingLeft: "0", // Removes padding on the left side
            paddingRight: "0", // Removes padding on the right side
            fontFamily: "Poppins"
          }}>
            <div className="to-margin-top px-3">
              <VanityCard
                icon={true}
                fullNameDownload={currentUanData?.rawData?.data?.profile?.fullName}
                isScrappedFully={currentUanData?.rawData?.isScrappedFully}
                currentUanData={currentUanData}
                uan={currentUanData?.rawData?.data?.profile?.UAN}
                fullName={currentUanData?.rawData?.data?.profile?.fullName}
                totalPfBalance={currentUanData?.reportData?.maxWithdrawableLimit}
                handleBack={backPassbook}
                amountAvailable="Amount Available to Withdraw"
              />
            </div>
            <div style={{ marginTop: "2.4rem" }}>
              <p className="text-center express-withdraw-title" >
                Select Withdrawal Amount
              </p>
              <div className="text-center ">
                <label className="form-label express-withdraw-subtitle d-block" style={{ marginTop: "1rem" }}>
                  Use slider to set withdrawal amount
                </label>

                <div className="mx-auto" style={{ width: "75%" }}>
                  <input
                    type="range"
                    className="form-range custom-slider"
                    min="0"
                    max={maxAmount}
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />

                  <div className="d-flex justify-content-between  express-withdraw-range mt-1" >
                    <span style={{fontFamily: "Roboto"}}>₹0</span>
                    <span style={{fontFamily: "Roboto"}}>₹{maxAmount?.toLocaleString("en-IN")}</span>
                  </div>

                  {/* <div className="mt-2 fw-bold text-primary">Selected: ₹{amount.toLocaleString("en-IN")}</div> */}
                </div>
              </div>

              <div className="mt-3 text-center">
                <label className="form-label express-withdraw-subtitle mb-0 mt-2">
                  Or enter the value manually
                </label>
                <div className="rupee-input-wrapper d-flex align-items-center justify-content-center mt-0" style={{ width: "90%" }}>
                  <input
                    type="text"
                    style={{fontFamily: "Roboto"}}
                    className="manual-amount-input text-center"
                    value={`₹ ${amount.toLocaleString("en-IN")}`}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/[^0-9]/g, ""));
                      if (value <= maxAmount) setAmount(value);
                    }}
                    placeholder="Enter amount"
                  />
                </div>

              </div>
              <div
                className="form-check text-start mt-4 mb-4 mx-auto"
                style={{ width: "90%" }}
              >
                <input
                  className="form-check-input mt-1 border-dark"
                  type="checkbox"
                  id="authorizeCheckbox"
                  checked={isAuthorized}
                  onChange={handleCheckboxChange}
                  required
                />
                <label className="form-check-label" htmlFor="authorizeCheckbox">
                  I hereby authorize FinRight to apply, track and process Provident Fund withdrawal request with EPFO on my behalf.
                </label>
                {showError && (
                  <div
                    className="form-check-label text-danger text-start mx-auto mb-3"
                  >
                    Please authorize before proceeding.
                  </div>
                )}
              </div>



               <div
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  borderTopLeftRadius: "2rem",
                  borderTopRightRadius: "2rem",
                  padding: "1.5rem",
                  paddingBottom: "0.5rem",
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
                  marginTop: "2rem", // spacing from content above
                  // marginLeft: "-12px", // Remove left margin
                  // marginRight: "-12px", // Remove right margin
                }}
              >
                <div className="bg-white w-100">
                  <p className="express-card-title text-start m-0">Service Fee</p>

                  <div
                    className="d-flex justify-content-between align-items-center cursor-pointer"
                    onClick={handleToggleDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="express-card-subtitle" >Service fee including Tax</span>
                    <div className="d-flex align-items-center">
                      <span className="express-card-amount me-3" style={{fontFamily: "Roboto"}}>₹{totalFee}</span>
                      {showDetails ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
                    </div>
                  </div>

                  <div
                    className="d-flex justify-content-between align-items-center cursor-pointer mt-2"
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #858585",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  />

                  {showDetails && (
                    <div style={{marginTop:"-0.3rem"}}>
                      <div className="d-flex justify-content-between mt-0">
                        <span>Platform Fee</span>
                        <span style={{ fontWeight: 400,fontFamily: "Roboto" }}>₹{platformFee}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Processing Fee</span>
                        <span style={{ fontWeight: 400,fontFamily: "Roboto" }}>₹{processingFee}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Taxes</span>
                        <span style={{ fontWeight: 400,fontFamily: "Roboto" }}>₹{taxes}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="express-card-title m-0">Settlement Account</p>

                    <div className="d-flex justify-content-between align-items-center">
                      <div style={{ marginTop: "-0.2rem" }}>
                        <label className="express-account mb-0" >
                          A/C No : {currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber || "--"}
                        </label>
                        <div className="">
                          <label className="express-IFSC mb-1 mt-0">
                            IFSC Code : {currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC || "--"}
                          </label>
                        </div>
                      </div>

                      {showWarning ? (
                        <MdEditOff
                          className=" fs-5 cursor-pointer mt-2"
                        
                          role="button"
                          onClick={handleToggleWarning}
                        />
                      ) : (
                        <BiSolidEditAlt
                          className="fs-5 cursor-pointer mt-2"
                          role="button"
                          onClick={handleToggleWarning}
                        />
                      )}
                    </div>

                    {!showWarning && (
                      <center>
                        <div ref={bottomRef} className="express-custom-button-arrow mt-3">
                          <CustomButtonArrow name={`Pay ₹${totalFee} & Withdraw Now`} onClick={handlePayment} />
                        </div>
                      </center>
                    )}

                    {showWarning && (
                      <>
                        <div
                          className="d-flex flex-column justify-content-center align-items-center mt-3"
                          style={{ borderRadius: "10px" }}
                        >
                          <div className="rounded p-4 d-flex flex-column gap-2" style={{ backgroundColor: "#FFEBEA" }}>
                            <div className="d-flex align-items-start gap-2">
                              <FaExclamationCircle style={{ fontSize: "1.125rem", marginTop: "2px", color: "#FF3B30" }} />
                              <div>
                                <p className="mb-0 text-black " style={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: "1.2",marginTop:"0.2rem" }}>
                                  Restricted by EPFO
                                </p>
                              </div>
                            </div>

                            <div className="ps-4 mt-2">
                              <p className="mb-0 text-black text-start" style={{ fontSize: "0.875rem", fontWeight: 400, lineHeight: "1.4" }}>
                                EPFO does not allow transactions in unverified accounts
                              </p>
                            </div>
                            <div className="ps-4">
                              <p className="mb-0 text-black text-start" style={{ fontSize: "0.875rem", fontWeight: 400, lineHeight: "1.4" }}>
                                If you wish to change account number, our expert can help you get your new account verified by EPFO
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-2 mt-3" ref={bottomRef}>
                          <p className="text-center mb-1" style={{ fontSize: "1rem", color: "#858585" }}>
                            Need help? Get in touch with PF expert
                          </p>
                          <div className="d-flex justify-content-center" ref={bottomRef}>
                            <CustomButtonWithIcons name="Connect Now" onClick={handleTalkToExpert} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>


{/* <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: "2rem",
                borderTopRightRadius: "2rem",
                padding: "1.5rem",
                // paddingBottom:"0.5rem",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <p className="fw-bold mb-1">Service Fee</p>

              <div
                className="d-flex justify-content-between align-items-center"
                onClick={handleToggleDetails}
                style={{ cursor: "pointer" }}
              >
                <span className="text-muted">Service fee including Tax</span>
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">₹{totalFee}</span>
                  {showDetails ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
                </div>
              </div>

              {showDetails && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Processing Fee</span>
                    <span>₹{processingFee}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Taxes</span>
                    <span>₹{taxes}</span>
                  </div>
                </div>
              )}

              <p className="fw-bold mt-3 mb-1">Settlement Account</p>

              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-0">A/C No: {currentUanData.rawData?.data?.profile?.kycDetails?.bankAccountNumber}</p>
                  <p className="mb-2">IFSC Code: {currentUanData.rawData?.data?.profile?.kycDetails?.bankIFSC}</p>
                </div>

                {showWarning ? (
                  <MdEditOff size={20} className="cursor-pointer mt-1" onClick={handleToggleWarning} />
                ) : (
                  <BiSolidEditAlt size={20} className="cursor-pointer mt-1" onClick={handleToggleWarning} />
                )}
              </div>

              {!showWarning ? (
                <div className="text-center mt-3">
                  <button className="btn btn-primary w-100" onClick={handlePayment}>
                    Pay ₹{totalFee} & Withdraw Now
                  </button>
                </div>
              ) : (
                <div className="bg-danger-subtle p-3 rounded mt-3">
                  <div className="d-flex align-items-start gap-2">
                    <FaExclamationCircle color="#FF3B30" size={18} />
                    <div>
                      <p className="fw-semibold mb-1">Restricted by EPFO</p>
                      <p className="mb-1">
                        EPFO does not allow transactions in unverified accounts.
                      </p>
                      <p>
                        Our expert can help verify your account if you wish to change it.
                      </p>
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <button className="btn btn-outline-danger" onClick={handleTalkToExpert}>
                      Connect Now
                    </button>
                  </div>
                </div>
              )}
            </motion.div> */}


            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExpressWithdraw