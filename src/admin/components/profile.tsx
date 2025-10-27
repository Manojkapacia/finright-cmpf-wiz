import moment from "moment";
import React from "react";
import { ArrowLeft } from 'react-bootstrap-icons';
import { BsCheck2Circle, BsXLg } from "react-icons/bs";
interface ProfileProps {
    jsonData: any; 
    profileData: any; 
    onBack: () => void;
  }

  const Profile: React.FC<ProfileProps> = ({ jsonData, profileData, onBack }) => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8 offset-md-2 mt-5">

                    <div className="card mt-3">
                        <div className="d-flex justify-content-between align-items-center mt-2 ms-2">
                            {/* <button className="btn" style={{
                                color: '#ffffff',
                                backgroundColor: '#2f6870'
                            }} onClick={onBack}>Back</button> */}
                            <button className="btn p-0 d-flex align-items-center" onClick={onBack}>
                                <ArrowLeft size={20} className="me-1" /> Back
                            </button>
                            <h3 className="text-center flex-grow-1">Profile</h3>
                            <div style={{ width: '3.1rem' }}></div>
                        </div>
                        <div className="card-body">
                            <p><strong>UAN:</strong> {jsonData?.data?.profile?.UAN}</p>
                            <p><strong>Full Name:</strong> {jsonData?.data?.profile?.fullName}</p>
                            <p><strong>Phone:</strong> {jsonData?.data?.profile?.phone}</p>
                            <p><strong>Email:</strong> {jsonData?.data?.profile?.email}</p>
                            <p>
                                <strong>Payment Status:</strong> {profileData?.isPaymentDone ? (
                                <span style={{ color: "green" }}>
                                    <BsCheck2Circle /> Done
                                </span>
                                ) : (
                                    <span style={{ color: "red" }}>
                                    <BsXLg /> Pending
                                    </span>
                                )}
                            </p>
                            <p><strong>Payment Processed At:</strong> {profileData?.paymentProcessedAt ? moment(profileData?.paymentProcessedAt).format("DD-MM-YYYY HH:MM:SS") : 'Not Initiated Yet!!'}</p>

                            <div className="accordion" id="accordionExample">
                                {/* Accordion Item 1 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingOne">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseOne"
                                            aria-expanded="true"
                                            aria-controls="collapseOne"
                                        >
                                            <strong>BasicDetails:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseOne"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingOne"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Full Name:</strong> {jsonData.data.profile.basicDetails?.fullName}</p>
                                            <p><strong>DOB:</strong> {jsonData.data.profile.basicDetails?.dateOfBirth}</p>
                                            <p><strong>Gender:</strong> {jsonData.data.profile.basicDetails?.gender}</p>
                                            <p><strong>Father's / Husband Name:</strong> {jsonData.data.profile.basicDetails?.fatherHusbandName}</p>
                                            <p><strong>Relation:</strong> {jsonData.data.profile.basicDetails?.relation}</p>
                                            <p><strong>Physically Handicapped:</strong> {jsonData.data.profile.basicDetails?.physicallyHandicapped}</p>
                                            <p><strong>International Worker:</strong> {jsonData.data.profile.basicDetails?.internationalWorker}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Item 2 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingTwo">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseTwo"
                                            aria-expanded="true"
                                            aria-controls="collapseTwo"
                                        >
                                            <strong>KYC Details:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseTwo"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingTwo"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Aadhar Card:</strong> {jsonData.data.profile.kycDetails?.aadhaar}</p>
                                            <p><strong>Pan Card:</strong> {jsonData.data.profile.kycDetails?.pan}</p>
                                            <p><strong>Bank Account:</strong> {jsonData.data.profile.kycDetails?.bankAccountNumber}</p>
                                            <p><strong>IFSC Code:</strong> {jsonData.data.profile.kycDetails?.bankIFSC}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Item 3 */}
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingThree">
                                        <button
                                            className="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseThree"
                                            aria-expanded="true"
                                            aria-controls="collapseThree"
                                        >
                                            <strong>KYC Verification Details:</strong>
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseThree"
                                        className="accordion-collapse collapse show"
                                        aria-labelledby="headingThree"
                                    >
                                        <div className="accordion-body">
                                            <p><strong>Bio Metric Status:</strong> {jsonData.data.profile?.kycVerificationDetails?.bioMetricVerificationStatus}</p>
                                            <p><strong>Demo Graphic Verification Status:</strong> {
                                                jsonData.data.profile?.kycVerificationDetails?.demographicVerificationStatus !== undefined &&
                                                    jsonData.data.profile?.kycVerificationDetails?.demographicVerificationStatus !== null ?
                                                    jsonData.data.profile?.kycVerificationDetails?.demographicVerificationStatus : "N"
                                            }</p>
                                            <p><strong>OTP Based Verification Status:</strong> {jsonData.data.profile?.kycVerificationDetails?.otpBasedVerificationStatus}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;