import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { EPFLoaderBar } from "../common/helpers";
import { decryptData } from "../../../common/encryption-decryption";
import Lottie from "lottie-react";
import fingerprintAnimation from "../../../../assets/OTPMicroAnimation.json"
import { get } from "../../../common/api";
import ManuallyEnterUanPws from "../../../dashboard/Models/ManuallyEnterUanPws";
import ManuallyEnterPws from "../../../dashboard/Models/manuallyEnterPws";
import NoUanFound from "../../../dashboard/Models/NoUanFound";
import ToastMessage from "../../../common/toast-message";

interface VerifyEpfoPassbookModelProps {
  setShowModal: React.Dispatch<React.SetStateAction<any>>;
  onVerify: (uan: string, password: string) => void; // backward compatibility
  onVerifyFromUanPws?: (uan: string, password: string) => void;
  onVerifyFromPws?: (uan: string, password: string) => void;
  processedUan: string;         
  epfoLoading: boolean;         
  selectedTags?: string[];      
  name?: string;                 
  apiDone?: boolean;             
  autoLogin?: boolean;       
  defaultPassword?: string; 
  currentUanData?: any;     
  emptyPageData?: any;   
  disableAutoVerification?: boolean; 
  noUanFound?: boolean;
  onEmploymentStatusSuccess?: (data: any) => void;
  lastAuthSource?: 'uanpws' | 'pws';
}


const VerifyEpfoPassbookModel: React.FC<VerifyEpfoPassbookModelProps> = ({
  setShowModal,
  onVerify,
  onVerifyFromUanPws,
  onVerifyFromPws,
  processedUan,
  epfoLoading,
  selectedTags,
  name,
  apiDone,
  autoLogin = false,
  defaultPassword = "",
  currentUanData,
  emptyPageData,
  disableAutoVerification = false,
  noUanFound = false,
  onEmploymentStatusSuccess,
  lastAuthSource
}) => {

  const [, setotpSuccessiveEnable] = useState<boolean | null>(null);
  const [TextChange, setTextChange] = useState(false);
  const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
  const [showManualUan, setShowManualUan] = useState(false);

  // Prevent background scroll while modal is open
  useEffect(() => {
    getToggleValue()
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const hasAutoFired = useRef(false);
  useEffect(() => {
    if (autoLogin && !hasAutoFired.current && processedUan && defaultPassword) {
      hasAutoFired.current = true;
      onVerify(processedUan, defaultPassword);
    }
  }, [autoLogin, processedUan, defaultPassword, onVerify]);

  const hasVerifiedOnce = useRef(false);
  const [toastMsg, setToastMsg] = useState<{ type: string; content: string }>({ type: "", content: "" });

useEffect(() => {
  const savedPassword = decryptData(localStorage.getItem("password"));


  if (!disableAutoVerification && !hasVerifiedOnce.current && savedPassword && processedUan) {
    hasVerifiedOnce.current = true;
    setTextChange(true);
    onVerify(processedUan, savedPassword);
  }
}, [processedUan, onVerify]);

const getToggleValue = async () => {
  try {
    const response = await get("/data/toggle/keys");
    const otpSuccessiveToggal = response?.allTogglers?.find((item:any) => item.type === "epfo_status");
    setotpSuccessiveEnable(otpSuccessiveToggal?.isEnabled);
  } catch (err) { }
}

  const renderLoader = (

    <div className="px-4 py-4 d-flex flex-column align-items-center" style={{ height: "45vh" }}>
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
        <div style={{ width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
        <EPFLoaderBar duration={12} apiCompleted={apiDone} textChange={TextChange} />
        </div>
    </div>
  );
  return (
    <div className="position-relative text-center">
      {toastMsg.type && <ToastMessage message={toastMsg.content} type={toastMsg.type} />}
      {/* Overlay (dim background) */}
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Bottom‑sheet modal */}
      <motion.div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100 shadow-lg"
        style={{
          zIndex: 1050,
          maxWidth: 500,
          backgroundColor: "#4255CB",
          color: "#ffffff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        initial={{ opacity: 0, y: 200, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 200, scale: 0.7, rotate: 10 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
      >
        {/* 🌀 Show loader when autoLogin OR epfoLoading is true */}
        {autoLogin || epfoLoading ? renderLoader : (
          // Inject onToast into NoUanFound via renderForm branches
          <>
            {disableAutoVerification ? (
              // If source is unknown but we have a processedUan (pf-report flow), default to reopening password-only slider
              ((lastAuthSource || (processedUan ? 'pws' : 'uanpws')) === 'pws') ? (
                // Incorrect from password-only -> reopen ManuallyEnterPws
                <ManuallyEnterPws
                  show={true}
                  processedUan={processedUan}
                  onClose={() => setShowModal({ show: false, type: "verifyEpfoPassbook" })}
                  onVerify={onVerifyFromPws || onVerify}
                  autoLogin={false}
                  defaultPassword={defaultPassword}
                  disableAutoVerification={true}
                  currentUanData={currentUanData}
                  emptyPageData={emptyPageData}
                  selectedTags={selectedTags}
                  name={name}
                  apiDone={apiDone}
                />
              ) : (
                // Incorrect from UAN+password -> reopen ManuallyEnterUanPws with prefilled UAN
                <ManuallyEnterUanPws
                  show={true}
                  processedUan={processedUan}
                  onClose={() => setShowModal({ show: false, type: "verifyEpfoPassbook" })}
                  onVerify={onVerifyFromUanPws || onVerify}
                  autoLogin={false}
                  defaultPassword={defaultPassword}
                  disableAutoVerification={true}
                  currentUanData={currentUanData}
                  emptyPageData={emptyPageData}
                  selectedTags={selectedTags}
                  name={name}
                  apiDone={apiDone}
                />
              )
            ) : noUanFound && !processedUan ? (
              showManualUan ? (
                <ManuallyEnterUanPws
                  show={true}
                  processedUan={processedUan}
                  onClose={() => setShowModal({ show: false, type: "verifyEpfoPassbook" })}
                  onVerify={onVerifyFromUanPws || onVerify}
                  autoLogin={autoLogin}
                  defaultPassword={defaultPassword}
                  disableAutoVerification={disableAutoVerification}
                  currentUanData={currentUanData}
                  emptyPageData={emptyPageData}
                  selectedTags={selectedTags}
                  name={name}
                  apiDone={apiDone}
                />
              ) : (
                <NoUanFound
                  show={true}
                  onClose={() => setShowModal({ show: false, type: "verifyEpfoPassbook" })}
                  oldMobileNumber={mobileNumber}
                  onEmploymentStatusSuccess={(data) => {
                    if (onEmploymentStatusSuccess) onEmploymentStatusSuccess(data);
                  }}
                  onManualUANPwsClick={() => setShowManualUan(true)}
                  onToast={(m) => setToastMsg(m)}
                />
              )
            ) : (
              <ManuallyEnterPws
                show={true}
                processedUan={processedUan}
                onClose={() => setShowModal(false)}
                onVerify={onVerifyFromPws || onVerify}
                autoLogin={autoLogin}
                defaultPassword={defaultPassword}
                disableAutoVerification={disableAutoVerification}
                currentUanData={currentUanData}
                emptyPageData={emptyPageData}
                selectedTags={selectedTags}
                name={name}
                apiDone={apiDone}
              />
            )}
          </>
        )}
      </motion.div>
      {/* EmploymentStatus modal is rendered by the parent (e.g., PFPassbookMainPage) via onEmploymentStatusSuccess */}
    </div>
  );
};

export default VerifyEpfoPassbookModel;

