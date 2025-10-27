import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import styles from "./../styles/dashboard.module.css"
import { formatCurrency } from "../common/currency-formatter";
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyPdfDocument from './download-pdf-template'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ViewDetailModel from "./Models/ViewDetailModel";
import ToWithdrawAmountModel from "./Models/ToWithdrawAnalysisModel";
import { decryptData } from "../common/encryption-decryption";
import ZohoModal from "./Models/ZohoModal";
// import { ZohoLeadApi } from "../common/zoho-lead";
import "../../styles/global.css"

export const SummaryCardMore = (props: any) => {
    const [, setIsScrappedFully] = useState(false);
    const showAlternate = props.currentUanData == null;

    useEffect(() => {
        setIsScrappedFully(
            !!props?.currentUanData?.rawData?.isScrappedFully
        );
    }, [props.currentUanData]);
    

    return (
        <Swiper
            spaceBetween={6}
            slidesPerView={1.065}
        >
            <SwiperSlide>
                <div className={`${styles.pfCard} card border-none text-center text-white py-4`}>
                    <div className="card-body">
                        <p className={`vanity-text mb-0 mt-1`}>
                            UAN : {props?.currentUanData?.rawData?.data?.profile?.UAN || "- -"}
                        </p>
                        <p className={`vanity-title mb-0 mt-1`}>{props?.currentUanData?.rawData?.data?.profile?.fullName || "- -"}</p>
                        <p className={`vanity-text mb-0 mt-4`}>PF Balance</p>
                        <p className={`vanity-title mt-0 mb-0`}>
                        {showAlternate ? (
                            <p>- -</p>
                        ):(
                         <>
                            {formatCurrency(props?.currentUanData?.reportData?.totalPfBalance || "₹ 0")}
                         </>
                        )}
                        </p>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
    )
}


export const SummaryCardOne = (props: any) => {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState<any>({ show: false, type: 'view report' })
    const [isZohoModalOpen, setZohoModalOpen] = useState(false);
    const slidesCount = props?.currentUanData ? 1 : 0; // Determine number of slides
    const [, setZohoUserID] = useState<any>();
    const showAlternate = props.currentUanData == null;


    useEffect(() => {
        const storedData = localStorage?.getItem("zohoUserId");
        if (storedData) {
          const zohoUser = decryptData(storedData);
          setZohoUserID(zohoUser);
        }
      }, []);
    
    const navigateToScrapper = () => {
        navigate('/login-uan', { state: { type: 'partial', currentUan: props?.currentUanData?.profileData?.data?.uan, mobile_number: props?.currentUanData?.profileData?.data?.phoneNumber.replace(/^91/, '') } })
    }

    const goToLoginPage=()=>{
        navigate("/login-uan", {
            state: {
              type: "refresh",
              currentUan: props?.currentUanData?.profileData?.data?.uan,
              mobile_number:
                props?.currentUanData?.profileData?.data?.phoneNumber.replace(
                  /^91/,
                  ""
                ),
            },
          });
    }

    const handleConnectNow = () => {
        setShowModal({ show: false, type: 'withdraw' });
        setTimeout(() => setZohoModalOpen(true), 300);
        // update Zoho Lead
        // zohoUpdateLead("Withdraw Now");
    }
    const handleCloseZohoModal = () => {
        setZohoModalOpen(false); // Close ZohoModal
    };
    // zoho lead creation
    // const zohoUpdateLead = async (tag: any) => {
    //       const rawData = decryptData(localStorage.getItem("lead_data"));
    //       const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));
    //       const userName = decryptData(localStorage.getItem("user_name"))
      
    //       const newUser = rawData ? JSON.parse(rawData) : null;
    //       const existUser = rawExistUser ? JSON.parse(rawExistUser) : null;
    //       const user = existUser || newUser;
      
    //       if (!user) {
    //         return;
    //       }
    //       if (user) {
    //         const zohoReqData = {
    //           Last_Name: userName || props?.currentUanData?.rawData?.data?.profile?.fullName || user?.Last_Name,
    //           Mobile: user?.Mobile,
    //           Email: user?.Email,
    //           Wants_To: user?.Wants_To,
    //           Lead_Status: existUser ? "Reopen" : user?.Lead_Status,
    //           Lead_Source: user?.Lead_Source,
    //           Campaign_Id: user?.Campaign_Id,
    //           CheckMyPF_Status: tag,
    //         };
    //         ZohoLeadApi(zohoReqData);
    //       }
    //     }

    return (
        <>
            {showModal?.show && showModal?.type === 'view report' && <ViewDetailModel isOpen={showModal?.show} onClose={() => { setShowModal({ show: false, type: 'view report' }) }} onContinue={() => { navigateToScrapper() }} />}
            {showModal?.show && showModal?.type === 'withdraw' && <ToWithdrawAmountModel isOpen={showModal?.show} onClose={() => { setShowModal({ show: false, type: 'withdraw' }) }} onConnectNow={() => { handleConnectNow() }} />}
            <ZohoModal isOpen={isZohoModalOpen} onClose={handleCloseZohoModal} />
            <Swiper
                spaceBetween={slidesCount > 1 ? 6 : 0} // No space when only one slide
                slidesPerView={slidesCount > 1 ? 1.065 : 1} // Full width if only one slide
                centeredSlides={slidesCount === 1} // Center only if there’s one slide
            >
                <SwiperSlide>

                    <div className={`${styles.pfCard} card border-none text-center text-white py-4`} style={{ width: slidesCount === 1 ? "100%" : "auto" }} >
                        <div className="card-body">
                            <p className={`vanity-text mb-0 mt-1`}>
                                UAN : <span style={{ fontFamily: 'roboto' }}>{props?.currentUanData?.rawData?.data?.profile?.UAN || "- -"}</span>
                            </p>
                            <p className={`vanity-title mb-0 mt-1`}>{props?.currentUanData?.rawData?.data?.profile?.fullName || "- -"}</p>
                            <p className={`vanity-text mb-0 mt-3`}>PF Balance</p>
                            <p className={`vanity-title mt-0 mb-0`} style={{ fontFamily: 'roboto' }}> 
                            {showAlternate ? (
                            <p>- -</p>
                        ):(
                         <>
                            {formatCurrency(props?.currentUanData?.reportData?.totalPfBalance || "0")}
                         </>
                        )}                                 
                                 </p>

                            <div className="d-flex justify-content-center gap-4 mx-3 mt-4">
                                <button className={`${styles.downloadButton} btn flex-fill`} onClick={goToLoginPage}>
                                    Refresh data
                                </button>
                                {props?.currentUanData?.rawData?.isScrappedFully ?
                                    <PDFDownloadLink className={`${styles.downloadButton} btn flex-fill`}
                                        document={<MyPdfDocument currentUanData={props?.currentUanData} />}
                                        fileName={`${props?.currentUanData?.rawData?.data?.profile?.fullName}_report.pdf`}
                                    >
                                        Download Report
                                    </PDFDownloadLink> :
                                    <button className={`${styles.downloadButton} btn flex-fill`}  onClick={goToLoginPage}>
                                        Download Report
                                    </button>
                                }
                            </div>
                        </div>
                    </div>

                </SwiperSlide>
            </Swiper>
        </>
    );
};

