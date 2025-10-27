import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './styles/kyc.module.css'
import { FaCheckCircle } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { setClarityTag } from '../../helpers/ms-clarity';
import "../../App.css"
function KycDetails() {
    const location = useLocation();
    const navigate = useNavigate()
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [message, setMessage] = useState({ type: "", content: "" });
    const isMessageActive = useRef(false);

    const { mobile_number, processedUan, currentUanData, currentEmploymentUanData, type } = location.state || {};
    const [kycStatus, setKycStatus] = useState({
        fullName: true,
        gender: true,
        fatherHusbandName: true,
        physicallyHandicapped: true,
        bankAccountNumber: true,
        UAN: true,
        dateOfBirth: true,
        aadhaar: true,
        pan: true,
        ifscNumber: true
    });

    useEffect(() => {
        if (message.type) {
            isMessageActive.current = true; // Set active state when a message is displayed
            const timer = setTimeout(() => {
                setMessage({ type: "", content: "" });
                isMessageActive.current = false; // Reset active state
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const maskAdharNumber = (number: any) => {
        if (number) {
            const lastFourDigits = number.slice(-4);
            return `XXXXXXXX${lastFourDigits}`;
        }
    };

    const maskPanNumber = (number: any) => {
        if (number) {
            const lastFourDigits = number.slice(-4);
            return `XXXXXX${lastFourDigits}`;
        }
    };

    const handleIncorrect = () => {
        setClarityTag("BUTTON_INCURRECT", "Inside Kyc page Basic details");
        const fieldsToCheck = ['fullName', 'gender', 'fatherHusbandName', 'physicallyHandicapped', 'UAN', 'dateOfBirth', 'aadhaar', 'pan'];
        setKycStatus((prev) => {
            const updatedStatus: any = { ...prev };
            fieldsToCheck.forEach((field) => {
                if (field === 'UAN') {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.[field])) {
                        updatedStatus[field] = false;
                    }
                } else if (field === 'aadhaar' || field === 'pan') {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.kycDetails?.[field])) {
                        updatedStatus[field] = false;
                    }
                } else {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.basicDetails?.[field])) {
                        updatedStatus[field] = false;
                    }
                }
            });
            return updatedStatus;
        });
        setShowCheckbox(true)
        setShowContinueButton(true);
    };

    const handleCorrect = () => {
        setClarityTag("BUTTON_CURRECT", "Inside Kyc page Basic details");
        const fieldsToCheck = ['fullName', 'gender', 'fatherHusbandName', 'physicallyHandicapped', 'bankAccountNumber', 'UAN', 'dateOfBirth', 'aadhaar', 'pan', "IFSC"];
        setKycStatus((prev) => {
            const updatedStatus: any = { ...prev };
            fieldsToCheck.forEach((field) => {
                if (field === 'UAN') {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.[field])) {
                        updatedStatus[field] = false;
                    }
                } else if (field === 'aadhaar' || field === 'pan') {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.kycDetails?.[field])) {
                        updatedStatus[field] = false;
                    }
                } else {
                    if (["-", "N/A", ""].includes(currentUanData?.rawData?.data?.profile?.basicDetails?.[field])) {
                        updatedStatus[field] = false;
                    }
                }
            });
            return updatedStatus;
        });
        setShowContinueButton(false);
        navigate('/kyc-details/bank', { state: { mobile_number, processedUan, currentUanData, currentEmploymentUanData, type, kycStatus } })

    }

    const handleCheckboxChange = (field: any) => {
        setKycStatus((prev: any) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleContinueBtn = () => {
        setClarityTag("BUTTON_CONTINUE", "Inside Kyc page Basic details");
        navigate('/kyc-details/bank', { state: { mobile_number, processedUan, currentUanData, currentEmploymentUanData, type, kycStatus } })
    };

    return (
        <div className="container pt-5 to-margin-top" >
            <div className="row d-flex justify-content-center align-items-center">
                <div className="col-lg-6 col-md-8">
                    <div className="row">
                        <div className="col-md-12 text-center">
                            <span className={`${styles.kycHeading} d-flex justify-content-center`}>
                                {showCheckbox
                                    ? 'Select details that don’t match'
                                    : 'Do these details match your Aadhaar and PAN Card?'}
                            </span>
                        </div>
                    </div>

                    <div className="row mt-lg-5 mt-3">
                        <div className="col-md-10 offset-md-1">
                            <div className="card shadow-sm mx-lg-5">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6 px-3">
                                            <div className="mb-2">
                                                <label className="cardTitle">Name</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.fullName || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('fullName')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.fullName}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">UAN Number:</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.UAN || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('UAN')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.UAN}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">
                                                    {currentUanData?.rawData?.data?.profile?.basicDetails?.relation === 'F'
                                                        ? "Father's Name"
                                                        : "Husband's Name"}
                                                </label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.basicDetails?.fatherHusbandName || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('fatherHusbandName')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.fatherHusbandName}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">Gender</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.basicDetails?.gender
                                                            ? currentUanData?.rawData?.data?.profile?.basicDetails?.gender === 'M'
                                                                ? 'Male'
                                                                : 'Female'
                                                            : '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('gender')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.gender}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 px-3">
                                            <div className="mb-2">
                                                <label className="cardTitle">Physically Handicapped:</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.basicDetails?.physicallyHandicapped
                                                            ? currentUanData?.rawData?.data?.profile?.basicDetails?.physicallyHandicapped === 'N'
                                                                ? 'No'
                                                                : 'Yes'
                                                            : '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('physicallyHandicapped')}
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={!kycStatus.physicallyHandicapped}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">Date of Birth:</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {currentUanData?.rawData?.data?.profile?.basicDetails?.dateOfBirth || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('dateOfBirth')}
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={!kycStatus.dateOfBirth}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">Aadhaar Number:</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {maskAdharNumber(currentUanData?.rawData?.data?.profile?.kycDetails?.aadhaar) || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('aadhaar')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.aadhaar}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label className="cardTitle">PAN Number:</label>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="cardBody form-check-label mb-0">
                                                        {maskPanNumber(currentUanData?.rawData?.data?.profile?.kycDetails?.pan) || '--'}
                                                    </p>
                                                    {showCheckbox && (
                                                        <input
                                                            onChange={() => handleCheckboxChange('pan')}
                                                            className={`${styles.changeCheckbox} form-check-input`}
                                                            type="checkbox"
                                                            checked={!kycStatus.pan}
                                                            style={{ transform: 'scale(1.5)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!showContinueButton && (
                        <div className="col-md-10 offset-md-1">
                            <div className="row mt-4 mb-3 mt-lg-5 mx-lg-3">
                                <div className="col-md-6 col-sm-6">
                                    <button
                                        className={`${styles.incorrectButton} btn w-100 py-lg-3 py-2 d-flex align-items-center justify-content-center`}
                                        onClick={handleIncorrect}
                                    >
                                        <RxCrossCircled size={17} className="me-2 text-danger" />
                                        No
                                    </button>
                                </div>
                                <div className="col-md-6 col-sm-6 mt-3 mt-sm-0">
                                    <button
                                        className={`${styles.correctButton} btn w-100 py-lg-3 py-2 d-flex align-items-center justify-content-center`}
                                        onClick={handleCorrect}
                                    >
                                        <FaCheckCircle size={17} className="me-2 text-success" />
                                        Yes, They Match
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showContinueButton && (
                        <div className="row mt-4 mt-lg-5 mb-3">
                            <div className="col-md-4 offset-md-4">
                                <button
                                    className={`${styles.correctButton} btn w-100 py-lg-3 py-2`}
                                    onClick={handleContinueBtn}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default KycDetails;