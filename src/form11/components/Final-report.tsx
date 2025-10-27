import React, { useEffect, useState } from 'react';
import { ReusableButton } from '../common/Helper';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import TickMark from '../assets/correct.png';
import { AiOutlineExclamation } from 'react-icons/ai';
import TriangleDanger from '../assets/dangerTriangle.png';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyPdfDocument from './MyPdfDocument';
import { useLocation } from 'react-router-dom';

export const FinalReport: React.FC = () => {
  const [kycData, setKycData] = useState<any>(null);
  const [isIssues, setIssues] = useState(true);
  const [issuesList, setIssuesList] = useState<string[]>([]);
  const location = useLocation();

  const {
    currentUanData,
  } = location.state;
  useEffect(() => {
    const stored = localStorage.getItem("kycData");
    if (stored) {
      setKycData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {

    if (!currentUanData) return;

    const raw = currentUanData.rawData?.data?.profile?.basicDetails || {};
    const contact = currentUanData.rawData?.data?.profile || {};

    const issues: string[] = [];

    if (raw.fullName?.trim() !== kycData?.name?.value.trim()) {
      issues.push("Incorrect name");
    }

    if (raw.fatherHusbandName?.trim() !== kycData?.spouseFatherName?.value.trim()) {
      issues.push("Incorrect Father’s/Spouse’s name");
    }

    const gender = raw.gender === "M" ? "Male" : raw.gender === "F" ? "Female" : "";
    if (gender.trim().toLowerCase() !== kycData?.gender?.value.trim().toLowerCase()) {
      issues.push("Incorrect gender");
    }

    if (raw.dateOfBirth?.trim() !== kycData?.dob?.value.trim()) {
      issues.push("Incorrect date of birth");
    }

    const maritalStatus = raw.maritalStatus?.trim() || '';
    if (maritalStatus.toLowerCase() !== kycData?.maritalStatus?.value.trim().toLowerCase()) {
      issues.push("Incorrect marital status");
    }

    if ((contact.email?.trim() || '').toLowerCase() !== kycData?.contactDetails?.email?.value.trim().toLowerCase()) {
      issues.push("Incorrect email");
    }

    if ((contact.phone?.trim() || '') !== kycData?.contactDetails?.contactNumber?.value.trim()) {
      issues.push("Incorrect contact number");
    }

    if (issues.length > 1) {
      setIssues(true);
      setIssuesList(issues);
    } else {
      setIssues(false);
      setIssuesList([]);
    }
  }, [currentUanData, kycData]);

  const handleContinue = () => {
    console.log("Continue clicked");
  };

  return (
    <div className="container-fluid px-2">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff' }}>
          <Header />
          <CoustomCard />

          <div className="card w-100 mt-3 border-0 py-2" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
            <div className="card-body d-flex flex-column align-items-center py-2">

              {/* Top Text */}
              <div style={{ fontSize: '1rem', fontWeight: 400 }}>
                <p className="mb-3 text-start">
                  EPF details found successfully, let's verify the details while we fill the form..
                </p>
              </div>

              {/* Circle Stack Icon */}
              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{ width: 120, height: 120 }}
              >
                {/* Outer Circle */}
                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "#f2f5ff",
                  }}
                />

                {/* Inner Circle */}
                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#e6ecff",
                  }}
                />

                {/* Center Image */}
                <img
                  src={TickMark}
                  alt="Success"
                  width={70}
                  height={70}
                  className="position-absolute"
                  style={{ zIndex: 2, objectFit: "contain" }}
                />
              </div>

              {/* Line 2: Form Completion Text */}
              <div
                className="text-center mb-3 mt-3"
                style={{
                  fontSize: "1.125rem", // 18px
                  fontWeight: 500,
                  letterSpacing: 0,
                  lineHeight: "100%",
                }}
              >
                Your Form 11 is now complete
              </div>

              {/* Line 3: Download Text */}
              {/* <div
                  className="text-center mb-2"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: 0,
                    color: "#00C7A5",
                  }}
                >
                  Download Form
                </div> */}
              <PDFDownloadLink
                document={<MyPdfDocument currentUanData={currentUanData} kycData={kycData} />}
                fileName={`${kycData?.name?.value}_Form11.pdf`}
              >

                <div
                  className="text-center mb-2"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: 0,
                    color: "#00C7A5",
                    textDecoration: "none"
                  }}
                >
                  Download Form
                </div>

              </PDFDownloadLink>
            </div>
          </div>
          {isIssues && (
            <>
              <div className="card w-100 mt-3 border-0 py-2" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                <div className="card-body d-flex flex-column align-items-center py-2">

                  {/* Warning Icon Stack */}
                  <div
                    className="position-relative d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 120, height: 120 }}
                  >
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        width: 120,
                        height: 120,
                        backgroundColor: "#f2f5ff",
                      }}
                    />
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#e6ecff",
                      }}
                    />
                    <img
                      src={TriangleDanger}
                      alt="Warning"
                      width={50}
                      height={50}
                      className="position-absolute"
                    />
                  </div>

                  {/* Main Warning Message */}
                  <div
                    className="text-start mb-3"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 400,
                      letterSpacing: 0,
                      lineHeight: "140%",
                      maxWidth: 400,
                    }}
                  >
                    We have found some issues in the details submitted by your previous employer. Not getting them rectified can get your EPF withdrawal request rejected when you need it.
                  </div>

                  {/* Highlighted Issue Block with Rounded Icon */}
                  {/* <div
                  className="d-flex align-items-center p-2 mb-2"
                  style={{
                    backgroundColor: "#FFECBD",
                    borderRadius: "0.3125rem", // 5px
                    padding: "", // 10px vertical, 5px horizontal in rem
                    fontSize: "0.8125rem", // 13px
                    fontWeight: 500,
                    gap: "0.75rem",
                    width: "100%",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      //   backgroundColor: "#FB7900",
                      border: "2px solid #FB7900",
                      color: "#FB7900",
                      width: 20,
                      height: 20,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    <AiOutlineExclamation />
                  </div>
                  <div style={{ lineHeight: "1" }}>Incorrect bank account details</div>
                </div>
                <div
                  className="d-flex align-items-center p-2 mb-2"
                  style={{
                    backgroundColor: "#FFECBD",
                    borderRadius: "0.3125rem", // 5px
                    padding: "", // 10px vertical, 5px horizontal in rem
                    fontSize: "0.8125rem", // 13px
                    fontWeight: 500,
                    gap: "0.75rem",
                    width: "100%",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      //   backgroundColor: "#FB7900",
                      border: "2px solid #FB7900",
                      color: "#FB7900",
                      width: 20,
                      height: 20,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    <AiOutlineExclamation />
                  </div>
                  <div style={{ lineHeight: "1" }}>Date fo Exit Not marked by ABC Pvt. Ltd.</div>
                </div> */}
                  {issuesList && issuesList.map((issue, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center p-2 mb-2"
                      style={{
                        backgroundColor: "#FFECBD",
                        borderRadius: "0.3125rem", // 5px
                        padding: "", // 10px vertical, 5px horizontal in rem
                        fontSize: "0.8125rem", // 13px
                        fontWeight: 500,
                        gap: "0.75rem",
                        width: "100%",
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          //   backgroundColor: "#FB7900",
                          border: "2px solid #FB7900",
                          color: "#FB7900",
                          width: 20,
                          height: 20,
                          fontSize: "1rem",
                          flexShrink: 0,
                        }}
                      >
                        <AiOutlineExclamation />
                      </div>
                      <div style={{ lineHeight: "1" }}>{issue}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 mb-5">
                <ReusableButton
                  text="Get these issues resolved"
                  onClick={handleContinue}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};