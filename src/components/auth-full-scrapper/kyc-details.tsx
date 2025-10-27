import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../../App.css"
import { KycProfileCard } from '../../helpers/helpers';
import { decryptData, encryptData } from '../common/encryption-decryption';
import { post } from '../common/api';
import { CircularLoading } from '../user-registeration/Loader';
import ToastMessage from '../common/toast-message';
function KycDetails() {
    const location = useLocation();
    const navigate = useNavigate()
    const [message, setMessage] = useState({ type: "", content: "" });
    const isMessageActive = useRef(false);

    const { mobile_number, processedUan, currentUanData, currentEmploymentUanData, uanLinkedPhoneNumber='' } = location.state || {};
    
    // const { currentUanData } = location.state || {};

    type KycField =
        | 'fullName'
        | 'gender'
        | 'fatherHusbandName'
        | 'physicallyHandicapped'
        | 'bankAccountNumber'
        | 'dateOfBirth'
        | 'pan'
        | 'bankIFSC';
    const [kycStatus, setKycStatus] = useState<Record<KycField, boolean>>({
        fullName: true,
        gender: true,
        fatherHusbandName: true,
        physicallyHandicapped: true,
        bankAccountNumber: true,
        dateOfBirth: true,
        pan: true,
        bankIFSC: true,
    });
    const [kycStatus1, setKycStatus1] = useState<Record<KycField, boolean | null>>({
        fullName: null,
        gender: null,
        fatherHusbandName: null,
        physicallyHandicapped: false,
        bankAccountNumber: null,
        dateOfBirth: null,
        pan: null,
        bankIFSC: null,
    });
    
    const [isLoading, setIsLoading] = useState(false)
    
    const excludedFields: KycField[] = ['bankIFSC', 'bankAccountNumber', 'pan'];
    const excludedFieldsForPan: KycField[] = ['fullName', 'gender', 'fatherHusbandName','physicallyHandicapped','dateOfBirth'];

    
    const isAllNullExceptExcluded = Object.entries(kycStatus1)
    .filter(([key]) => !excludedFields.includes(key as KycField))
    .some(([, value]) => value === null);
    
    const isAllNullExceptExcludedForPan = Object.entries(kycStatus1)
    .filter(([key]) => !excludedFieldsForPan.includes(key as KycField))
    .some(([, value]) => value === null);

    const handleCorrectClick = (field: any) => {
        setKycStatus1((prev) => ({ ...prev, [field]: true }));
    };

    const handleIncorrectClick = (field: any) => {
        setKycStatus1((prev) => ({ ...prev, [field]: false }));
    };


useEffect(() => {
  const initialStatus: Record<KycField, boolean> = {
    fullName: true,
    gender: true,
    fatherHusbandName: true,
    physicallyHandicapped: true,
    bankAccountNumber: true,
    dateOfBirth: true,
    pan: true,
    bankIFSC: true,
  };

  const tempStatus1: Record<KycField, boolean | null> = {
    fullName: null,
    gender: null,
    fatherHusbandName: null,
    physicallyHandicapped: null,
    bankAccountNumber: null,
    dateOfBirth: null,
    pan: null,
    bankIFSC: null,
  };

  const checkValue = (value: any) =>
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== '-' &&
    value.toUpperCase?.() !== 'N/A' &&
    value.toUpperCase?.() !== 'NA';

  const profile = currentUanData?.rawData?.data?.profile;
  const basicDetails = profile?.basicDetails;
  const kycDetails = profile?.kycDetails;

  (Object.keys(initialStatus) as KycField[]).forEach((field) => {
    let value: any;

    if (field === 'fullName') {
      value = profile?.fullName;
    } else if (field === 'pan') {
      value = kycDetails?.pan;
    } else {
      value = basicDetails?.[field];
    }

    const isValid = checkValue(value);
    initialStatus[field] = isValid;

    //  Only update kycStatus1 if the field is invalid
    if (!isValid) {
      tempStatus1[field] = false;
    }
  });

  //  Special handling for bankAccountNumber & bankIFSC
  const bankAccount = kycDetails?.bankAccountNumber;
  const ifsc = kycDetails?.bankIFSC;

  const isBankValid = checkValue(bankAccount);
  const isIFSCValid = checkValue(ifsc);

  initialStatus.bankAccountNumber = isBankValid;
  initialStatus.bankIFSC = isIFSCValid;

   tempStatus1.bankAccountNumber = !isBankValid ? isBankValid : null;
   tempStatus1.bankIFSC = !isIFSCValid ? isIFSCValid : null;

  // Set state
  setKycStatus(initialStatus);
  setKycStatus1(tempStatus1);
}, [currentUanData]);


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
            const lastFourDigits = number.slice(-5);
            return `XXXXXX${lastFourDigits}`;
        }
    };



    const isValidValue = (value: any) => {
        if (!value) return false; // null, undefined, empty string
        const trimmed = value.trim().toUpperCase();
        return trimmed !== 'NA' && trimmed !== 'N/A' && trimmed !== '-' && trimmed !== '--' && trimmed !== '';
    };




    const [step, setStep] = useState(1);
    const [stepStatus, setStepStatus] = useState({ step1: 'orange', step2: 'grey' });
    const getStabberClass = (stabberStep: any) => {
        const color = stabberStep === 1 ? stepStatus.step1 : stepStatus.step2;
        return `stabber ${color}`;
    };
    const handleNextButton = () => {
        setStep(2);
        setStepStatus({ step1: 'green', step2: 'orange' });
    }

    const handleCompleteButton = async () => {
        setStepStatus((prev) => ({ ...prev, step2: 'green' }));
        localStorage.setItem("is_scrapped_fully", encryptData("true"))
        setTimeout(() => {
            setIsLoading(true)
        }, 1000);
        const mergedStatues = { ...kycStatus1 }
        const dataToSend = currentEmploymentUanData?.length ? { kycStatus: mergedStatues, type: 'full', uan: processedUan, userMobileNumber: mobile_number, ...currentEmploymentUanData[0] } : { kycStatus: mergedStatues, type: 'full', uan: processedUan, userMobileNumber: mobile_number, ...currentEmploymentUanData, uanLinkedPhoneNumber }
        try {
            const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
                // setTimeout(() => {
                    setIsLoading(false)
                    navigate('/dashboard', { state: { mobile_number, processedUan: processedUan ? processedUan : decryptData(localStorage.getItem("user_uan")), type:"null" } })
                // }, 2000);
            } else {
                setIsLoading(false)
                navigate('/epfo-down')
                setMessage({ type: 'error', content: "Oops!! Some issue processing RULE ENGINE at moment!!" })
            }
        } catch (error: any) {
            setIsLoading(false)
            navigate('/epfo-down')
            setMessage({ type: 'error', content: "Oops!! Some issue processing RULE ENGINE at moment!!" })
        }
    }
    return (
        <>
            {isLoading && <CircularLoading />}
            {message.type && <ToastMessage message={message.content} type={message.type} />}
            {!isLoading &&
                <div className="container-fluid to-margin-top">
                    <div className="row">
                        <div className="col-md-4 offset-md-4" style={{ backgroundColor: '#E6ECFF', minHeight: '94.5vh', position: 'relative' }}>

                            {/* Stabber Progress Row */}
                            <div className="stabber-row mt-4 pt-2">
                                <div className="stabber-bar-container">
                                    <div className={getStabberClass(1)}></div>
                                </div>
                                <div className="stabber-bar-container">
                                    <div className={getStabberClass(2)}></div>
                                </div>
                            </div>

                            {/* Step Heading */}
                            <h5 style={{ fontSize: '1.125rem', fontWeight: 500 }} className="mb-4">
                                {step === 1 ? 'Step 1: Verify KYC as per Aadhar Card' : 'Step 2: Verify PAN and Bank details'}
                            </h5>

                            {/* KYC View */}
                            {step === 1 ? (
                                <div>
                                    {isValidValue(currentUanData?.rawData?.data?.profile?.fullName) &&
                                        (kycStatus.fullName) && (
                                            <KycProfileCard
                                                label="Name"
                                                name={currentUanData.rawData.data.profile.fullName}
                                                onCorrectClick={() => handleCorrectClick('fullName')}
                                                onIncorrectClick={() => handleIncorrectClick('fullName')}
                                                status={kycStatus1.fullName}
                                            />
                                        )}
                                    {isValidValue(currentUanData?.rawData?.data?.profile?.basicDetails?.relation) &&
                                        (kycStatus.fatherHusbandName) && (
                                            <KycProfileCard
                                                label={
                                                    currentUanData.rawData.data.profile.basicDetails.relation === 'F'
                                                        ? "Father's Name"
                                                        : "Husband's Name"
                                                }
                                                name={
                                                    currentUanData.rawData.data.profile.basicDetails.fatherHusbandName || '--'
                                                }
                                                onCorrectClick={() => handleCorrectClick('fatherHusbandName')}
                                                onIncorrectClick={() => handleIncorrectClick('fatherHusbandName')}
                                                status={kycStatus1.fatherHusbandName}
                                            />
                                        )}

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.basicDetails?.gender) &&
                                        (kycStatus.gender) && (
                                            <KycProfileCard
                                                label="Gender"
                                                name={
                                                    currentUanData.rawData.data.profile.basicDetails.gender === 'M'
                                                        ? 'Male'
                                                        : 'Female'
                                                }
                                                onCorrectClick={() => handleCorrectClick('gender')}
                                                onIncorrectClick={() => handleIncorrectClick('gender')}
                                                status={kycStatus1.gender}
                                            />
                                        )}

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.basicDetails?.physicallyHandicapped) &&
                                        (kycStatus.physicallyHandicapped) && (
                                            <KycProfileCard
                                                label="Physically Handicapped"
                                                name={
                                                    currentUanData.rawData.data.profile.basicDetails.physicallyHandicapped === 'N'
                                                        ? 'No'
                                                        : 'Yes'
                                                }
                                                onCorrectClick={() => handleCorrectClick('physicallyHandicapped')}
                                                onIncorrectClick={() => handleIncorrectClick('physicallyHandicapped')}
                                                status={kycStatus1.physicallyHandicapped}
                                            />
                                        )}

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.basicDetails?.dateOfBirth) &&
                                        (kycStatus.dateOfBirth) && (
                                            <KycProfileCard
                                                label="Date of Birth"
                                                name={currentUanData.rawData.data.profile.basicDetails.dateOfBirth}
                                                onCorrectClick={() => handleCorrectClick('dateOfBirth')}
                                                onIncorrectClick={() => handleIncorrectClick('dateOfBirth')}
                                                status={kycStatus1.dateOfBirth}
                                            />
                                        )}
                                        <div className='mb-4 pt-3'>

                                    <button
                                        className={`${isAllNullExceptExcluded ? "null" : "clickeffect"}`}
                                        onClick={handleNextButton}
                                        disabled={isAllNullExceptExcluded}
                                        style={{
                                            backgroundColor: "#00124F",
                                            borderRadius: "0.3125rem",
                                            width: "100%",
                                            color: "white",
                                            border: "none",
                                            padding: "0.625rem",
                                            fontSize: "0.8125rem",
                                            fontWeight: "600",
                                            cursor: isAllNullExceptExcluded ? "not-allowed" : "pointer",
                                            opacity: isAllNullExceptExcluded ? 0.6 : 1
                                        }}
                                    >
                                        Next
                                    </button>
                                        </div>

                                </div>

                            ) : (
                                <div>

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.kycDetails?.pan) &&
                                        (kycStatus.pan) && (
                                            <KycProfileCard
                                                label="PAN Number"
                                                name={maskPanNumber(currentUanData.rawData.data.profile.kycDetails.pan)}
                                                onCorrectClick={() => handleCorrectClick('pan')}
                                                onIncorrectClick={() => handleIncorrectClick('pan')}
                                                status={kycStatus1.pan}
                                            />
                                        )}

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber) &&
                                        (kycStatus.bankAccountNumber) && (
                                            <KycProfileCard
                                                label="Bank A/C Number"
                                                name={maskAdharNumber(currentUanData.rawData.data.profile.kycDetails.bankAccountNumber)}
                                                onCorrectClick={() => handleCorrectClick('bankAccountNumber')}
                                                onIncorrectClick={() => handleIncorrectClick('bankAccountNumber')}
                                                status={kycStatus1.bankAccountNumber}
                                            />
                                        )}

                                    {isValidValue(currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC) &&
                                        (kycStatus.bankIFSC) && (
                                            <KycProfileCard
                                                label="IFSC Number"
                                                name={maskAdharNumber(currentUanData.rawData.data.profile.kycDetails.bankIFSC)}
                                                onCorrectClick={() => handleCorrectClick('bankIFSC')}
                                                onIncorrectClick={() => handleIncorrectClick('bankIFSC')}
                                                status={kycStatus1.bankIFSC}
                                            />
                                        )}

                                    <div 
                                    className='mb-4'
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: "1rem",
                                        backgroundColor: "#E6ECFF"
                                    }}>
                                        <button
                                            className={`${isAllNullExceptExcludedForPan ? "null" : "clickeffect"}`}
                                            onClick={handleCompleteButton}
                                            disabled={isAllNullExceptExcludedForPan}
                                            style={{
                                                backgroundColor: "#00124F",
                                                borderRadius: "0.3125rem",
                                                width: "100%",
                                                color: "white",
                                                border: "none",
                                                padding: "0.625rem",
                                                fontSize: "0.8125rem",
                                                fontWeight: "600",
                                                cursor: isAllNullExceptExcludedForPan ? "not-allowed" : "pointer",
                                                opacity: isAllNullExceptExcludedForPan ? 0.6 : 1
                                            }}          
                                        >
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>}
        </>

    );


}


export default KycDetails;