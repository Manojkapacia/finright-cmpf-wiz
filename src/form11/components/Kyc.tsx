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
    type?: 'text' | 'select' | 'date';
    options?: string[]; // for select dropdowns
  }
  
const VerificationField: React.FC<VerificationFieldProps> = ({
    label,
    value,
    verified,
    onVerify,
    onUpdate,
    type = 'text',
    options = [],
  }) => {
    const [showInput, setShowInput] = useState(false);
    const [updatedValue, setUpdatedValue] = useState(value);
  
    const handleVerify = (isCorrect: boolean) => {
      onVerify(isCorrect);
      if (isCorrect) {
        setShowInput(false);
      } else {
        setShowInput(true);
      }
    };
  
    const handleSubmit = () => {
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
                cursor: 'pointer',
              }}
              onClick={() => handleVerify(true)}
            >
              <FaCheck
                style={{
                  color: verified === true ? '#FFFFFF' : '#00C7A5',
                  fontSize: '1.25rem',
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
                cursor: 'pointer',
              }}
              onClick={() => handleVerify(false)}
            >
              <FaTimes
                style={{
                  color: verified === false ? '#FFFFFF' : '#ff3b30',
                  fontSize: '0.9rem',
                }}
              />
            </button>
          </div>
        </div>
  
        {showInput && (
          <div className="d-flex gap-2 align-items-center">
            {type === 'select' ? (
              <select
                className="form-control"
                value={updatedValue}
                onChange={(e) => setUpdatedValue(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Select</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : type === 'date' ? (
              <input
                type="date"
                className="form-control"
                value={updatedValue}
                onChange={(e) => setUpdatedValue(e.target.value)}
                style={{ flex: 1 }}
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={updatedValue}
                onChange={(e) => setUpdatedValue(e.target.value)}
                placeholder="Enter updated value"
                style={{ flex: 1 }}
              />
            )}
            <button
              className="btn"
              style={{
                backgroundColor: '#07115B',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '700',
                padding: '0.5rem 1rem',
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    );
  };
  

export const Kyc: React.FC = () => {
const location = useLocation();
const{processedUan,mobile_number,currentUanData,currentEmploymentUanData}=location?.state;

    const [formData, setFormData] = useState<any>({
        name: { value: '', verified: null, correct: true, showInput: false },
        spouseFatherName: { value: '', verified: null, correct: true, showInput: false },
        gender: { value: '', verified: null, correct: true, showInput: false },
        dob: { value: '', verified: null, correct: true, showInput: false },
        maritalStatus: { value: '', verified: null, correct: true, showInput: false }
    });

    const isAllVerified = Object.values(formData).every((field: any) => field.verified !== null);
    const navigate = useNavigate();
    
useEffect(() => {
    if (currentUanData) {
      setFormData({
        name: {
          value: currentUanData.rawData.data.profile.basicDetails.fullName || '',
          verified: null,
          correct: true,
          showInput: false
        },
        spouseFatherName: {
          value: currentUanData.rawData.data.profile.basicDetails.fatherHusbandName || '',
          verified: null,
          correct: true,
          showInput: false
        },
        gender: {
            value: currentUanData?.rawData?.data?.profile?.basicDetails?.gender
            ? currentUanData.rawData.data.profile.basicDetails.gender === "M"
              ? "Male"
              : "Female"
            : "",
          verified: null,
          correct: true,
          showInput: false
        },
        dob: {
          value: currentUanData.rawData.data.profile.basicDetails.dateOfBirth || '',
          verified: null,
          correct: true,
          showInput: false
        },
        maritalStatus: {
          value: currentUanData?.rawData?.data?.profile?.basicDetails?.maritalStatus || 'married',
          verified: null,
          correct: true,
          showInput: false
        }
      });
    }
  }, [currentUanData]);
    const handleVerify = (field: keyof typeof formData, isCorrect: boolean) => {
        setFormData((prev:any) => ({
            ...prev,
            [field]: {
                ...prev[field],
                verified: isCorrect,
                correct: isCorrect
            }
        }));
    };

    const handleUpdate = (field: keyof typeof formData, value: string) => {
        setFormData((prev:any) => ({
            ...prev,
            [field]: {
                ...prev[field],
                value
            }
        }));
    };

    const handleContinue = () => {
        if (!isAllVerified) return; 
        navigate('/form11/kyc-contact', { state: { verifiedData:formData,processedUan,mobile_number,currentUanData,currentEmploymentUanData } });
    };


    return (
        <div className="container-fluid px-2">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff' }}>
                    <Header />
                    <CoustomCard />
                    <KYCProgressLoader fromPercent={0} toPercent={10} />
                    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                        <div className="card-body">
                            <h5 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Match Details with Aadhar Card
                            </h5>
                            <p style={{
                                fontSize: '1rem',
                                fontWeight: 400,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Please match each detail carefully with your Aadhar card and choose if they are correct or wrong.
                            </p>

                            <div className="mt-4">
                                <VerificationField
                                    label="Your Name"
                                    value={formData.name.value}
                                    verified={formData.name.verified}
                                    onVerify={(isCorrect) => handleVerify('name', isCorrect)}
                                    onUpdate={(value) => handleUpdate('name', value)}
                                />
                                <VerificationField
                                    label="Spouse's Name/Father's Name"
                                    value={formData.spouseFatherName.value}
                                    verified={formData.spouseFatherName.verified}
                                    onVerify={(isCorrect) => handleVerify('spouseFatherName', isCorrect)}
                                    onUpdate={(value) => handleUpdate('spouseFatherName', value)}
                                />
                                <VerificationField
                                    label="Gender"
                                    value={formData.gender.value}
                                    verified={formData.gender.verified}
                                    onVerify={(isCorrect) => handleVerify('gender', isCorrect)}
                                    onUpdate={(value) => handleUpdate('gender', value)}
                                    type="select"
                                    options={['Male', 'Female', 'Transgender']}
                                />

                                <VerificationField
                                    label="Date of Birth"
                                    value={formData.dob.value}
                                    verified={formData.dob.verified}
                                    onVerify={(isCorrect) => handleVerify('dob', isCorrect)}
                                    onUpdate={(value) => handleUpdate('dob', value)}
                                    type="date"
                                />

                                <VerificationField
                                    label="Marital Status"
                                    value={formData.maritalStatus.value}
                                    verified={formData.maritalStatus.verified}
                                    onVerify={(isCorrect) => handleVerify('maritalStatus', isCorrect)}
                                    onUpdate={(value) => handleUpdate('maritalStatus', value)}
                                    type="select"
                                    options={['Married', 'Unmarried', 'Widow', 'Divorcee']}
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