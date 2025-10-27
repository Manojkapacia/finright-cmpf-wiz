import { FaArrowLeft } from "react-icons/fa6";
import colors from "../../../styles/colors";
import "../../../styles/global.css";
import { formatCurrency } from "../../common/currency-formatter";
import { IoMdRefresh } from "react-icons/io";
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyPdfDocument from "../download-pdf-template";
import { MdChevronRight, MdOutlineDownloading } from "react-icons/md";
import { trackClarityEvent } from "../../../helpers/ms-clarity";
import MESSAGES from "../../constant/message";


interface VanityCardProps {
  fullNameDownload?: string;
  isScrappedFully?: boolean;
  currentUanData?: any;
  uan?: string;
  fullName?: string;
  totalPfBalance?: number | string;
  totalInterest?: number | string;
  companyName?: string;
  timeLine?: string | number;
  lastUpdated?: string;
  handleCurrentBalance?: () => void;
  handleBack?: () => void;
  icon?: boolean;
  chevron?: boolean;
  amountAvailable?: string;
  onRefresh?: () => void;
}

const VanityCard = ({
  fullNameDownload,
  isScrappedFully,
  currentUanData,
  uan,
  fullName,
  totalPfBalance,
  totalInterest,
  companyName,
  timeLine,
  lastUpdated,
  handleCurrentBalance,
  handleBack,
  icon,
  chevron,
  amountAvailable,
  onRefresh,
}: VanityCardProps) => {
  return (
    <div className="d-flex flex-column align-items-center" style={{ position: "relative", marginBottom: "-1rem" }}>
      {/* Main Vanity Card */}
      <div
        className="card border-none text-center text-white position-relative"
        style={{
          width: "100%",
          backgroundColor: colors.vanityCardPrimary,
          borderRadius: "1.25rem",
          overflow: "hidden",
          zIndex: 2,
          height: "12.5rem", // 200px
          border: "none"
        }}
      >
        {/* Decorative Bubbles */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-7.5rem",
            width: "12rem",
            height: "12rem",
            backgroundColor: colors.vanityBlackBubble,
            borderRadius: "50%",
            opacity: 0.1,
            zIndex: 0,
          }}
        ></div>

        <div
          style={{
            position: "absolute",
            bottom: "-40%",
            left: "-10%",
            width: "90%",
            height: "100%",
            backgroundColor: colors.vanityWhiteBubble,
            borderRadius: "50%",
            opacity: 0.1,
            zIndex: 0,
          }}
        ></div>

        {/* Back Arrow Icon (padded) */}
        {icon && (
          <div
            className="clickeffect"
            style={{
              position: "absolute",
              top: "0.1rem",
              left: "0.3rem",
              zIndex: 2,
              cursor: "pointer",
              padding: "0.2rem",
            }}
            onClick={handleBack}
          >
            <FaArrowLeft size={17} color="#ffffff" />
          </div>
        )}

        {/* Main Card Body with vertical margin */}
        <div
          className="card-body position-relative text-start px-4 d-flex flex-column justify-content-between py-4"
          style={{
            zIndex: 1,
            height: "100%",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {/* Top Content */}
          <div>
            {companyName ? (
              <p className="mb-0 vanity-label-text">{companyName ?? "--"}</p>
            ) : (
              <p className="mb-0 vanity-label-text">
                UAN : <span>{uan ?? "--"}</span>
              </p>
            )}

            {timeLine ? (
              <p className="mb-0 vanity-label-text">{timeLine ?? "--"}</p>
            ) : (
              <div className="d-flex justify-content-between align-items-center w-100">
                <p className="mb-0 vanity-name-text">{fullName ?? "--"}</p>

                <div className="d-flex" style={{ gap: "1.2rem", marginRight: "0.8rem" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle clickeffect"
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      cursor: "pointer",
                    }}
                    onClick={onRefresh}
                  >
                    <IoMdRefresh color="#ffffff" className="fs-6" />
                  </div>
                  {isScrappedFully ?
                    <PDFDownloadLink
                      document={<MyPdfDocument currentUanData={currentUanData} />}
                      fileName={`${fullNameDownload}_report.pdf`}
                    >

                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle clickeffect"
                        style={{
                          width: "1.5rem",
                          height: "1.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          cursor: "pointer",
                        }}
                        onClick={() => trackClarityEvent(MESSAGES.ClarityEvents.DOWNLOAD_BUTTON_PRESS)}
                      >
                        <MdOutlineDownloading color="#ffffff" className="fs-6" />
                      </div>
                    </PDFDownloadLink>
                    : <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle clickeffect"
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        cursor: "pointer",
                      }}
                      onClick={onRefresh}
                    >
                      <MdOutlineDownloading color="#ffffff" className="fs-6" />
                    </div>}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Content */}
          <div>
            {amountAvailable ? <p className="mb-0 vanity-label-text mt-2">{amountAvailable}</p> :
              <p className="mb-0 vanity-label-text mt-2">Current Balance</p>
            }
            <div className="d-flex align-items-center mb-" style={{ marginBottom: "-0.3rem" }} >
              <p className="mb-0 vanity-amount-text">
                {totalPfBalance ? formatCurrency(totalPfBalance) : "- -"}
              </p>
              {chevron && (
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle ms-2 clickeffect"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                  }}
                  onClick={handleCurrentBalance}
                >
                  <MdChevronRight color="#ffffff" className="fs-6" />
                </div>
              )}
            </div>

            {totalInterest && (
              <p className="vanity-uan-text mt-1">
                Total Interest Earned :{" "}
                <span style={{ color: colors.vanityInterestColor }}>
                  {formatCurrency(totalInterest)}
                </span>
              </p>
            ) }
            {lastUpdated && <p className="vanity-uan-text mt-1">
              Last updated {" "}
              <span style={{ color: colors.vanityInterestColor }}>
              {new Date(lastUpdated).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '-')}
              </span>
            </p>}
          </div>
        </div>
      </div>
    </div>

  );
};

export default VanityCard;
