import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeartPhoneIcon from "../../../assets/status.png";
import { trackClarityEvent } from "../../../helpers/ms-clarity";
import { getForEpfoStatus, post } from "../../common/api";
import MESSAGES from "../../constant/message";
import { useNavigate } from "react-router-dom";
import { CurrentWorkingCompany } from "../../../features/user-registration/helpers/ExportingText";
import { ZohoLeadApi } from "../../common/zoho-lead";
import { decryptData } from "../../common/encryption-decryption";
import { LoaderBar, TermsConditionsModal } from "../../user-registeration/Onboarding2.0/common/helpers";
import Lottie from "lottie-react";
import fingerprintAnimation from "../../../assets/OTPMicroAnimation.json"
import animationData from "../../../assets/loaderImage.json"

interface EmployementStatusProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalData: {
    mobile_number: string;
    processedUan: string;
    currentEmploymentUanData: any;
    type: string;
    partialPassbook?: any;
    newUIEnabled?: any;
    uanLinkedPhoneNumber?: any;
  };
}

const EmployementStatusModel: React.FC<EmployementStatusProps> = ({ modalData, setShowModal }) => {
  const navigate = useNavigate()
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [, setIsModalOpen] = useState(false);
  const [isdisableContinueBtn, setIsdisableContinueBtn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const zohoUpdateLead = async (status: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    const userName = decryptData(localStorage.getItem("user_name"));
    const userBalance = decryptData(localStorage.getItem("user_balance"))

    const newUser = rawData ? JSON.parse(rawData) : null;
    const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    const user = existUser || newUser;
    if (
      userBalance > 50000 &&
      user?.CheckMyPF_Intent &&
      user.CheckMyPF_Intent.toLowerCase() !== "none"
    ) {
      let intent = user.CheckMyPF_Intent;

      if (intent.includes("1lakh")) {
        intent = intent.replace(/1lakh/gi, "").trim();
      }

      if (!intent.includes("50K")) {
        intent = intent.length ? `${intent} 50K` : "50K";
      }

      // user.CheckMyPF_Intent = intent;
    }


    if (!user) {
      return;
    }

    if (user) {
      const zohoReqData = {
        Last_Name: userName || user?.Last_Name,
        Mobile: user?.Mobile,
        Email: user?.Email,
        Wants_To: user?.Wants_To,
        Lead_Status: user?.Lead_Status,
        Lead_Source: user?.Lead_Source,
        Campaign_Id: user?.Campaign_Id,
        CheckMyPF_Status: status === "Partial Report" ? "Partial Report" : existUser && existUser !== "" ? user?.CheckMyPF_Status : status,
        CheckMyPF_Intent:
        user.CheckMyPF_Intent === "Scheduled"
          ? "Scheduled"
          : "Not Scheduled",
        Call_Schedule: user.Call_Schedule || "", 
        Total_PF_Balance: userBalance > 0 ? userBalance : user?.Total_PF_Balance,
      };
      ZohoLeadApi(zohoReqData);
    }
  }

  const handleEmployementClick = async (status: any) => {
    trackClarityEvent(MESSAGES.ClarityEvents.CHOOSE_EMPLOYMENT_STATUS);
    setIsdisableContinueBtn(true);
    setIsSubmitting(true);
    const finalMobile = modalData?.uanLinkedPhoneNumber ? modalData?.uanLinkedPhoneNumber : modalData?.mobile_number;
    const navigateToLoginUanWithEpfoCheck = async (statePayload: any) => {
      try {
        const epfoStatus = await getForEpfoStatus("/epfo/status");
        if (!epfoStatus?.isAvailable) {
          setShowModal(false);
          navigate("/epfo-down");
          return;
        }
      } catch (err) {
        console.error("EPFO check failed", err);
        // setIsLoading(false);
        setShowModal(false);
        navigate("/epfo-down");
        return;
      }

      // setIsLoading(false);
      setShowModal(false);
      navigate('/login-uan', { state: statePayload });
    };

    const normalized = selectedCompany.trim().toLowerCase();
    if (["retired", "i am retired"].includes(normalized)) {
      status = "retired";
    } else if (normalized === "i am currently not working") {
      status = "notworking";
    } else if (normalized === "i have multiple uans") {
      status = "notlisted";
    } else if (normalized === "pf not deducted by current employer") {
      status = "notdeducted";
    } else {
      status = "working";
    }

    const employeeStatusData = {
      uan: modalData?.processedUan,
      userEmpHistoryCorrect: status === 'working',
      userStillWorkingInOrganization: status === 'working',
      currentOrganizationMemberId: status === 'working'
        ? (modalData?.type.toLowerCase() !== 'full'
          ? modalData?.currentEmploymentUanData[0]?.member_id
          : modalData?.currentEmploymentUanData[0]?.currentOrganizationMemberId)
        : "",
      status,
      type: modalData?.type,
      userMobileNumber: modalData?.mobile_number,
      uanLinkedPhoneNumber: modalData?.uanLinkedPhoneNumber,
    };


    try {
      const type = modalData?.type?.toLowerCase();
      if (!['full', 'newui'].includes(type)) {

        try {
          if (modalData?.partialPassbook && modalData?.partialPassbook.toLowerCase() === 'true') {
            try {
              const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', employeeStatusData);
              if (withdrawabilityCheckUpReportResponse) {
                trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
                zohoUpdateLead("Partial Report");
                setIsSubmitting(false);
                setShowModal(false);
                navigate('/dashboard', { state: { mobile_number: finalMobile, processedUan: modalData?.processedUan, type: "full" } });
              } else {
                if (modalData?.newUIEnabled) {
                  setIsSubmitting(false);
                  setShowModal(false);
                  navigate('/dashboard', { state: { type: 'full', apiFailure: true, processedUan: modalData?.processedUan, mobile_number: finalMobile } });
                } else {
                  setIsSubmitting(false);
                  await navigateToLoginUanWithEpfoCheck({
                    type: 'full',
                    apiFailure: true,
                    currentUan: modalData?.processedUan,
                    mobile_number: finalMobile,
                  });
                }
              }
            } catch (error) {
              setIsSubmitting(false);
              if (modalData?.newUIEnabled) {
                setShowModal(false);
                navigate('/dashboard', { state: { type: 'full', apiFailure: true, processedUan: modalData?.processedUan, mobile_number: finalMobile } });
              } else {
                await navigateToLoginUanWithEpfoCheck({
                  type: 'full',
                  apiFailure: true,
                  currentUan: modalData?.processedUan,
                  mobile_number: finalMobile,
                });
              }
            }
          } else {
            const passbookResponse = await post('/surepass/getAdvancePassbook', { mobile_number: modalData?.mobile_number, uanLinkedPhoneNumber: modalData?.uanLinkedPhoneNumber, uan: modalData?.processedUan });

            if (passbookResponse && passbookResponse.success) {
              zohoUpdateLead("Partial Report");
              try {
                const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', employeeStatusData);
                if (withdrawabilityCheckUpReportResponse) {
                  // zohoUpdateLead("Partial Report");
                  trackClarityEvent(MESSAGES.ClarityEvents.PARTIAL_REPORT);
                  setIsSubmitting(false);
                  setShowModal(false);
                  navigate('/dashboard', { state: { mobile_number: finalMobile, processedUan: modalData?.processedUan, type: "full" } });
                } else {
                  setIsSubmitting(false);
                  await navigateToLoginUanWithEpfoCheck({
                    type: 'full',
                    apiFailure: true,
                    currentUan: modalData?.processedUan,
                    mobile_number: finalMobile,
                  });
                }
                
              } catch (error) {
                setIsSubmitting(false);
                if (modalData?.newUIEnabled) {
                  setShowModal(false);
                  navigate('/dashboard', { state: { type: 'full', apiFailure: true, processedUan: modalData?.processedUan, mobile_number: finalMobile } });
                } else {
                  await navigateToLoginUanWithEpfoCheck({
                    type: 'full',
                    apiFailure: true,
                    currentUan: modalData?.processedUan,
                    mobile_number: finalMobile,
                  });
                }
              }
            } else {
              zohoUpdateLead("API down");

              if (modalData?.newUIEnabled) {
                setIsSubmitting(false);
                setShowModal(false);
                navigate('/dashboard', { state: { type: 'full', apiFailure: true, processedUan: modalData?.processedUan, mobile_number: finalMobile } });
              } else {
                setIsSubmitting(false);
                await navigateToLoginUanWithEpfoCheck({
                  type: 'full',
                  apiFailure: true,
                  currentUan: modalData?.processedUan,
                  mobile_number: finalMobile,
                });
              }
            }
          }
        } catch (error) {
          if (modalData?.newUIEnabled) {
            setIsSubmitting(false);
            setShowModal(false);
            navigate('/dashboard', { state: { type: 'full', apiFailure: true, processedUan: modalData?.processedUan, mobile_number: finalMobile } });
          } else {
            setIsSubmitting(false);
            await navigateToLoginUanWithEpfoCheck({
              type: 'full',
              apiFailure: true,
              currentUan: modalData?.processedUan,
              mobile_number: finalMobile,
            });
          }
        }
      } else {
        try {
          // const responseUan = await get('/data/fetchByUan/' + modalData?.processedUan);
          trackClarityEvent(MESSAGES.ClarityEvents.SERVICE_HISTORY_FETCHED);
          const dataToSend: any = {
            type: "full",
            uan: modalData?.processedUan,
            userMobileNumber: modalData?.mobile_number,
            establishment_name: modalData?.currentEmploymentUanData?.establishmentName,
            currentOrganizationMemberId: modalData?.currentEmploymentUanData?.memberId,
            userEmpHistoryCorrect: !!modalData?.currentEmploymentUanData?.memberId,
            userStillWorkingInOrganization: !!modalData?.currentEmploymentUanData?.memberId,
            isFromFullScrapper: true,
            uanLinkedPhoneNumber: modalData?.uanLinkedPhoneNumber
          };
          const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', dataToSend)
          if(withdrawabilityCheckUpReportResponse){
            setShowModal(false);
            navigate(0);
            // navigate('/dashboard', {
            //   state: {
            //     mobile_number: finalMobile,
            //     processedUan: modalData?.processedUan,
            //     type: 'full',
            //   },
            // });
          }else {
            // Fallback behavior
            setShowModal(false);
            navigate(0);
          }
        } catch (error) {
          navigate(0);
          await navigateToLoginUanWithEpfoCheck({
            type: 'full',
            apiFailure: true,
            currentUan: modalData?.processedUan,
            mobile_number: finalMobile,
          });
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      navigate(0);
      await navigateToLoginUanWithEpfoCheck({
        type: 'full',
        apiFailure: true,
        currentUan: modalData?.processedUan,
        mobile_number: finalMobile,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting ? (
        <>
          <TermsConditionsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              zIndex: 2000, // ensure it's above all modals/dialogs
              backgroundColor: "#fff", // optional white overlay
              overflow: "hidden",
              marginTop: "3rem"
            }}
          >
            <div className="container-fluid p-0 responsive-height">
              <div className="row g-0" style={{ height: "100%" }}>
                <div
                  className="col-md-4 offset-md-4 d-flex flex-column"
                  style={{
                    backgroundColor: "#FFFFFF",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ flexGrow: 1, paddingBottom: "45vh" /* reserve space */ }}
                  >
                    <Lottie animationData={animationData} loop={true} style={{ height: 200 }} />
                  </div>


                  <div
                    className="position-fixed bottom-0 start-50 d-flex flex-column"
                    style={{
                      transform: 'translateX(-50%)',
                      borderTopLeftRadius: '1.25rem', // 20px
                      borderTopRightRadius: '1.25rem',
                      height: '45vh', // 280px
                      maxWidth: '31.25rem', // 500px
                      width: '100%',
                      padding: '1.25rem', // 20px
                      gap: '0.625rem', // 10px
                      zIndex: 1050,
                      backgroundColor: '#4255CB'
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{ width: '7.25rem', height: '7.25rem' }}
                      >
                        <Lottie
                          animationData={fingerprintAnimation}
                          loop
                          autoplay
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>

                    {/* Middle Section */}
                    <LoaderBar
                      duration={5}
                      titleText="Almost there.."
                      footerText="Calling EPF Office"
                    // apiDone={apiFinished}
                    />

                    {/* Bottom Terms & Conditions */}
                    <div
                      className="text-center text-white pb-3"
                      style={{
                        fontWeight: 400,
                        fontSize: '1rem',
                        lineHeight: '100%',
                        // marginTop: '0.75rem',
                      }}
                    >
                      <p style={{ marginBottom: 0 }}>By Log in, you agree to our</p>
                      <p
                        style={{
                          fontWeight: 500,
                          cursor: 'pointer',
                          marginTop: '0.3rem',
                        }}
                        onClick={() => setShowTermsModal(true)}
                      >
                        Terms & Conditions
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="position-relative text-center">
          {/* Overlay */}
          {!isdisableContinueBtn &&
            <motion.div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          }

          {/* Modal from bottom with rounded-top */}
          <motion.div
            className="position-fixed bottom-0 start-50 translate-middle-x w-100 bg-white shadow-lg px-3 gap-3 py-4"
            style={{
              zIndex: 1050, maxWidth: "500px", borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem"
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: 0.9, // slow and smooth
              delay: 0.2
            }}
          >
            {/* Centered icon with 2 circles */}
            <motion.div
              className="position-relative d-flex align-items-center justify-content-center mb-3"
              style={{ width: 100, height: 100, margin: "0 auto" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Outer Circle */}
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: 110,
                  height: 110,
                  backgroundColor: "#f2f5ff",
                }}
              />

              {/* Inner Circle */}
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: 90,
                  height: 90,
                  backgroundColor: "#e6ecff",
                }}
              />

              {/* Icon Image */}
              <img
                src={HeartPhoneIcon}
                alt="Status"
                width={70}
                height={70}
                style={{ zIndex: 2, objectFit: "contain" }}
              />
            </motion.div>

            {/* Title */}
            <p style={{ fontSize: "1.13rem", marginBottom: "1rem" }}>
              Choose your employment status
            </p>

            {/* Employment Box with edit icon */}

            {modalData?.currentEmploymentUanData?.length > 0 && (
              <CurrentWorkingCompany
                currentEmploymentUanData={modalData?.currentEmploymentUanData}
                type={modalData?.type}
                onCompanySelect={setSelectedCompany}
                setIsModalOpen={setIsModalOpen}
              />
            )}

            {/* Continue Button */}
            <motion.div className="w-100">
              <button className="clickeffect"
                disabled={isdisableContinueBtn}
                onClick={() => {
                  handleEmployementClick("working");
                }}
                style={{
                  backgroundColor: "#00124F",
                  borderRadius: "5px",
                  width: "100%",
                  color: "white",
                  border: "none",
                  paddingTop: "0.9rem",
                  paddingBottom: "0.9rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: isdisableContinueBtn ? "not-allowed" : "pointer",
                  opacity: isdisableContinueBtn ? 0.6 : 1,
                }}
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}

    </>
  );
};

export default EmployementStatusModel;
