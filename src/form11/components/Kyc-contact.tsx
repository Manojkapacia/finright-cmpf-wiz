import React, { useEffect, useState } from 'react';
import { ReusableButton } from '../common/Helper';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import { KYCProgressLoader } from '../common/Helper';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';



interface VerificationFieldProps {
    label: string;
    value: string;
    verified: boolean | null;
    onVerify: (isCorrect: boolean) => void;
    onUpdate: (value: string) => void;
}

const VerificationField: React.FC<VerificationFieldProps> = ({
    label,
    value,
    verified,
    onVerify,
    onUpdate
}) => {
    const [showInput, setShowInput] = useState(false);
    const [updatedValue, setUpdatedValue] = useState(value);
    const [error, setError] = useState('');

    // Field validation logic
    const validate = (val: string) => {
        if (label.toLowerCase().includes('email')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(val) ? '' : 'Please enter a valid email address';
        } else if (label.toLowerCase().includes('contact')) {
            const contactRegex = /^[6-9]\d{9}$/;
            return contactRegex.test(val) ? '' : 'Please enter a valid 10-digit mobile number';
        }
        return '';
    };

    useEffect(() => {
        if (showInput) {
            setError(validate(updatedValue));
        }
    }, [updatedValue]);

    const handleVerify = (isCorrect: boolean) => {
        onVerify(isCorrect);
        if (isCorrect) {
            setShowInput(false);
        } else {
            setShowInput(true);
        }
    };

    const handleSubmit = () => {
        const validationError = validate(updatedValue);
        if (validationError) {
            setError(validationError);
            return;
        }

        onUpdate(updatedValue);
        setShowInput(false);
        onVerify(true);
    };

    return (
        <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>
                {label}
            </label>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{value}</div>
                <div className="d-flex gap-2">
                    <button
                        className="btn"
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            border: `1px solid ${verified === true ? '#00C7A5' : '#00C7A5'}`,
                            backgroundColor: verified === true ? '#00C7A5' : '#e9fcfa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleVerify(true)}
                    >
                        <FaCheck
                            style={{
                                color: verified === true ? '#FFFFFF' : '#00C7A5',
                                fontSize: '1.25rem'
                            }}
                        />
                    </button>
                    <button
                        className="btn"
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            border: `1px solid ${verified === false ? '#ff3b30' : '#ff3b30'}`,
                            backgroundColor: verified === false ? '#ff3b30' : '#ffebea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleVerify(false)}
                    >
                        <FaTimes
                            style={{
                                color: verified === false ? '#FFFFFF' : '#ff3b30',
                                fontSize: '0.9rem'
                            }}
                        />
                    </button>
                </div>
            </div>

            {showInput && (
                <>
                    <div className="d-flex gap-2 align-items-center">
                        <input
                            type="text"
                            className="form-control"
                            value={updatedValue}
                            onChange={(e) => setUpdatedValue(e.target.value)}
                            placeholder="Enter updated value"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn"
                            style={{
                                backgroundColor: '#07115B',
                                color: '#FFFFFF',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                padding: '0.5rem 1rem'
                            }}
                            onClick={handleSubmit}
                            disabled={!!error}
                        >
                            Submit
                        </button>
                    </div>
                    {error && <small style={{ color: '#ff3b30' }}>{error}</small>}
                </>
            )}
        </div>
    );
};

export default VerificationField;


export const KycContact: React.FC = () => {
    const location = useLocation();
    const {verifiedData,processedUan,mobile_number,currentUanData,currentEmploymentUanData}=location?.state;
    const [formData, setFormData] = useState({
        email: { value: '', verified: null, correct: true, showInput: false },
        contactNumber: { value: '', verified: null, correct: true, showInput: false },
    });
    const isAllVerified = Object.values(formData).every(field => field.verified !== null);
  
    const navigate = useNavigate();

        
    useEffect(() => {
        if (currentUanData) {
          setFormData({
            email: {
              value: currentUanData.rawData?.data?.profile?.email || '',
              verified: null,
              correct: true,
              showInput: false
            },
            contactNumber: {
              value: currentUanData.rawData?.data?.profile?.phone|| '',
              verified: null,
              correct: true,
              showInput: false
            },
           
          });
        }
      }, [currentUanData]);

    const handleVerify = (field: keyof typeof formData, isCorrect: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                verified: isCorrect,
                correct: isCorrect
            }
        }));
    };

    const handleUpdate = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                value
            }
        }));
    };

    const handleContinue = () => {
        const combinedData = {
            ...verifiedData,
            contactDetails: {
              email: formData.email,
              contactNumber: formData.contactNumber
            }
          };
          // Clear any previous KYC data (optional but safe)
          localStorage.removeItem("kycData");

          // Save to localStorage
          localStorage.setItem("kycData", JSON.stringify(combinedData));
          navigate('/form11/kyc-bank', {
            state: {
              combinedData,
              processedUan,
              mobile_number,
              currentUanData,
              currentEmploymentUanData
            }
          });};

    return (
        <div className="container-fluid px-2">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff', height: '100vh', overflowY: 'auto' }}>
                    <Header />
                    <CoustomCard />
                    <KYCProgressLoader fromPercent={10} toPercent={50} />
                    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                        <div className="card-body">
                            <h5 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Contact Details                            </h5>
                            <p style={{
                                fontSize: '1rem',
                                fontWeight: 400,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Please confirm if following contact detailsa re correct and Active                            </p>

                            <div className="mt-4">
                                <VerificationField
                                    label="Email ID"
                                    value={formData.email.value}
                                    verified={formData.email.verified}
                                    onVerify={(isCorrect) => handleVerify('email', isCorrect)}
                                    onUpdate={(value) => handleUpdate('email', value)}
                                />
                                <VerificationField
                                    label="Contact Number(must be linked to Aadhar)"
                                    value={formData.contactNumber.value}
                                    verified={formData.contactNumber.verified}
                                    onVerify={(isCorrect) => handleVerify('contactNumber', isCorrect)}
                                    onUpdate={(value) => handleUpdate('contactNumber', value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 mb-5">
                        <ReusableButton
                            text="Continue"
                            onClick={handleContinue}
                            disabled={!isAllVerified}
                        />
                    </div>
                </div>

            </div>



        </div>
    );
};