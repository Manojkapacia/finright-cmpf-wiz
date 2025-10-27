import { useState } from "react";
import { formatCurrency } from "../common/currency-formatter";
import "../styles/dashboard.module.css";
import styles from "../../features/dashboard/styles/pf-report.module.css";
import CalculatedModelForPension from "./Models/CalculatedModelForPension";
import CalculatedModelForFundROI from "./Models/CalculatedModelForFundROI";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const PfAnalysisPensionReport = (props: any) => {
  const [showModal, setShowModal] = useState<any>({
    show: false,
    type: "calculated pension",
  });
  const [calculatedContent, setCalculatedContent] = useState<any>("");
  const showAlternate = props?.currentUanData == null;

  const handleHowCalculatedPensionDetailClick = () => {
    setShowModal({ show: true, type: "calculated pension" });
    setCalculatedContent(
      <div className="w-100">
        <ul className={`${styles.withdrawalText} list-group`}>
          <li>
            <u>Employment less than 10 years?</u> Entire pension share can be
            withdrawn as a lump sum.
          </li>
          <li>
            <u>Employment 10+ years?</u> Pension is available post-retirement
            (age 58) as per:
          </li>
          <p className="my-2 text-center fw-bold mb-0">
            {" "}
            <i>Monthly Pension = Total Service × (15,000 ÷ 70) </i>{" "}
          </p>
        </ul>
        <p className="my-2  mb-0">
          {" "}
          <i>
            This is an indicative calculation; EPFO determines the final pension
            amount.
          </i>
        </p>
      </div>
    );
  };

  const handleHowCalculatedRoiDetailClick = () => {
    setShowModal({ show: true, type: "calculated roi" });
    setCalculatedContent(
      <div className="w-100">
        <ul className={`${styles.withdrawalText} list-group`}>
          <li>
            <u>Employed for 5+ years under the same UAN?</u> No TDS will be
            deducted.
          </li>
          <li>
            <u>Employed for less than 5 years? </u>TDS at 10% applies to the
            total PF balance.
          </li>
        </ul>
      </div>
    );
  };


  return (
    <>
      {showModal?.show && showModal?.type === "calculated pension" && (
        <CalculatedModelForPension
          isOpen={showModal?.show}
          onClose={() => {
            setShowModal({ show: false, type: "calculated pension" });
          }}
          content={calculatedContent}
        />
      )}
      {showModal?.show && showModal?.type === "calculated roi" && (
        <CalculatedModelForFundROI
          isOpen={showModal?.show}
          onClose={() => {
            setShowModal({ show: false, type: "calculated roi" });
          }}
          content={calculatedContent}
        />
      )}
      <div className="mt-3">
        {/* pension */}

        <div className=" bg-white px-3 py-3 shadow-sm" style={{borderRadius:"1rem"}}>
          <div className="d-flex align-items-center">
            <p className="cardTitle mb-0" style={{ marginLeft: "0.5rem" }}>
              Pension Amount
            </p>
            <AiOutlineExclamationCircle
              color="#999999"
              style={{ cursor: "pointer" }}
              className="fs-6 ms-2"
              onClick={handleHowCalculatedPensionDetailClick}
            />
          </div>
          <div style={{ marginBottom: "-0.85rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th className="cardTitle">Particular</th>
                  <th className="cardTitle text-end">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cardBody">Total Pension Balance</td>
                  <td
                    className="cardBody text-end"
                    style={{ fontFamily: "roboto" }}
                  >
                    {formatCurrency(
                      props?.currentUanData?.reportData?.amountContributed
                        ?.totalPensionShare
                    ) || "--"}
                  </td>
                </tr>

                <tr>
                  <td className="cardBody">
                    Lump Sum Pension Withdrawal Limit
                  </td>
                  <td
                    className="cardBody text-end"
                    style={{ fontFamily: "roboto" }}
                  >
                    {showAlternate ? (
                   "--"
                     ) : (
                     <>
                    {formatCurrency(
                      props?.currentUanData?.reportData?.pensionWithdrability
                      ?.withdrawableAmount
                    ) || "Not Eligible"}
                    </>
                  )}
                  </td>

                </tr>

                <tr>
                  <td className="cardBody">
                    Monthly Pension Amount at Retirement
                  </td>
                  <td
                    className="cardBody text-end"
                    style={{ fontFamily: "roboto" }}
                  >
                    {showAlternate ? (
                       "--"
                     ) : (
                     <>
                    {props?.currentUanData?.reportData?.pensionWithdrability
                      ?.message === ""
                      ? formatCurrency(
                        props?.currentUanData?.reportData
                          ?.pensionWithdrability?.pensionAmountPerMonth
                      ) || "-_"
                      : props?.currentUanData?.reportData?.pensionWithdrability
                        ?.message}
                    </>
                  )}
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>

        {/* Fund ROI Section */}
        <div className=" bg-white px-3 py-3 mt-3 shadow-sm "style={{borderRadius:"1rem"}}>
          <div className="d-flex align-items-center">
            <p className="cardTitle mb-0" style={{ marginLeft: "0.5rem" }}>
              Fund ROI
            </p>
            <AiOutlineExclamationCircle
              style={{ cursor: "pointer",marginBottom:"0.1rem" }}
              color="#999999"
              className="fs-6 ms-2"
              onClick={handleHowCalculatedRoiDetailClick}
            />
          </div>
          <div style={{ marginBottom: "-0.85rem" }}>
            <table className="table" style={{ marginLeft: "" }}>
              <thead>
                <tr>
                  <th className="cardTitle">Particular</th>
                  <th className="cardTitle text-end">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cardBody"> Total Amount Contributed by You</td>
                  <td
                    className="cardBody text-end"
                    style={{ fontFamily: "roboto" }}
                  >
                    {formatCurrency(
                      props?.currentUanData?.reportData?.amountContributed
                        ?.totalEmployeeShare
                    ) || "--"}
                  </td>
                </tr>

                <tr>
                  <td className="cardBody">PF Interest Rate</td>
                  <td
                    className="cardBody text-end"
                    style={{ fontFamily: "roboto" }}
                  >
                      {showAlternate?"--":"8.25%"}
                  </td>
                </tr>

                <tr>
                  <td className="cardBody">TDS on Withdrawal </td>
                  <td className="text-end" style={{ fontFamily: "roboto" }}>
                    
                    {showAlternate ? (
                        <>--</>
                    ):(
                     <>
                       {formatCurrency(props?.currentUanData?.reportData?.tdsOnWithdrawal)||"0"}
                     </>
                    )}
                    
                  </td>
                </tr>
                <tr>
                  <td className="cardBody">XIRR </td>
                  <td className="text-end"> {showAlternate?"--":"Coming Soon"}</td>
                </tr>
              </tbody>
            </table>

            {/* <p className="text-primary text-end mb-0 " style={{ fontSize: "0.6875rem",cursor:"pointer" }} onClick={handleHowCalculatedRoiDetailClick}>
              How is this calculated?
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PfAnalysisPensionReport;
