import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import styles from './styles/kyc.module.css'
import { post } from '../common/api';
import { CircularLoading } from '../user-registeration/Loader';
import ToastMessage from '../common/toast-message';
import { decryptData, encryptData } from '../common/encryption-decryption';
import "../../App.css"

function KycDetailsBank() {
    const navigate = useNavigate();
    const location = useLocation();
    const { mobile_number, processedUan, currentUanData, currentEmploymentUanData, type, kycStatus } = location.state || {};
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [showIFSCNumber, setIFSCNumber] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', content: '' })
    // const [BankStatus, setBankStatus] = useState({
    //     bankAccountNumber: true,
    //     bankIFSC: true
    // });

    
    // Helper to check invalid values
    const isInvalidValue = (val: any) => ["", "N/A", "NA", "-", "--"].includes(val);

    
    const initialBankAccount = currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber || "";
    const initialIFSC = currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC || "";

    const [BankStatus, setBankStatus] = useState({
        bankAccountNumber: !isInvalidValue(initialBankAccount),
        bankIFSC: !isInvalidValue(initialIFSC),
    });

    const [autoTriggered, setAutoTriggered] = useState(false);

    useEffect(() => {
        if (isInvalidValue(initialBankAccount) && isInvalidValue(initialIFSC) && !autoTriggered) {
            setBankStatus({
                bankAccountNumber: false,
                bankIFSC: false,
            });
            setAutoTriggered(true); // prevent re-trigger
            handleAutoContinue();
        }
    }, [initialBankAccount, initialIFSC, autoTriggered]);

    const handleAutoContinue = async () => {
        localStorage.setItem("is_scrapped_fully", encryptData("true"));
        setIsLoading(true);
        const mergedStatues = { ...kycStatus, ...BankStatus };
        const dataToSend = currentEmploymentUanData?.length
            ? { kycStatus: mergedStatues, type: 'full', uan: processedUan, userMobileNumber: mobile_number, ...currentEmploymentUanData[0] }
            : { kycStatus: mergedStatues, type: 'full', uan: processedUan, userMobileNumber: mobile_number, ...currentEmploymentUanData };
        try {
            const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
                setIsLoading(false);
                navigate('/dashboard', { state: { mobile_number, processedUan: processedUan ? processedUan : decryptData(localStorage.getItem("user_uan")), type } });
            } else {
                setIsLoading(false);
                navigate('/epfo-down');
                setMessage({ type: 'error', content: "Oops!! Some issue processing RULE ENGINE at moment!!" });
            }
        } catch (error) {
            setIsLoading(false);
            navigate('/epfo-down');
            setMessage({ type: 'error', content: "Oops!! Some issue processing RULE ENGINE at moment!!" });
        }
    };


    const handleCheckboxChange = (field: any) => {
        setBankStatus((prev: any) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const toggleAccountVisibility = () => {
        setShowFullAccountNumber(!showFullAccountNumber);
    };

    const toggleIFSCVisibility = () => {
        setIFSCNumber(!showIFSCNumber);
    }

    const formatAccountNumber = (account: any) => {
        if (account && account.length > 4) {
            return `${account.slice(0, 2)}XXXXXXX${account.slice(-2)}`;
        }
        return account;
    };

    const formatIFSCNumber = (IFSC: any) => {
        if (IFSC && IFSC.length > 4) {
            return `${IFSC.slice(0, 2)}XXXXXXX${IFSC.slice(-2)}`;
        }
        return IFSC
    }

    const handleIncorrect = () => {
        // const fieldsToCheck = ['bankAccountNumber', 'bankIFSC'];
        // setBankStatus((prev: any) => {
        //     const updatedStatus = { ...prev };
        //     fieldsToCheck.forEach((field: any) => {
        //         if (currentUanData?.rawData?.data?.profile?.kycDetails?.[field] === '-' || currentUanData?.rawData?.data?.profile?.kycDetails?.[field] === 'N/A') {
        //             updatedStatus[field] = false;
        //         }
        //     });
        //     return updatedStatus;
        // });

        setShowCheckbox(true)
        setShowContinueButton(true);
    };

    const handleContinueBtn = async () => {   
        localStorage.setItem("is_scrapped_fully", encryptData("true"))
        setIsLoading(true)
        const mergedStatues = { ...kycStatus, ...BankStatus }
        const dataToSend = currentEmploymentUanData?.length ? {kycStatus: mergedStatues, type: 'full', uan: processedUan,userMobileNumber: mobile_number, ...currentEmploymentUanData[0]} : {kycStatus: mergedStatues, type: 'full', uan: processedUan,userMobileNumber: mobile_number, ...currentEmploymentUanData}
        try {
            const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
                setIsLoading(false)
                navigate('/dashboard', { state: { mobile_number, processedUan: processedUan ? processedUan : decryptData(localStorage.getItem("user_uan")), type } })
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
    };

    const handleCorrect = async () => {
        localStorage.setItem("is_scrapped_fully", encryptData("true"))
        // const fieldsToCheck = ['bankAccountNumber', 'bankIFSC'];
        // setBankStatus((prev: any) => {
        //     const updatedStatus = { ...prev };
        //     fieldsToCheck.forEach((field) => {
        //         if (currentUanData?.rawData?.data?.kycDetails?.[field] === '-') {
        //             updatedStatus[field] = false;
        //         }
        //     });
        //     return updatedStatus;
        // });

        setShowContinueButton(false);
        const mergedStatues = { ...kycStatus, ...BankStatus }
        const dataToSend = currentEmploymentUanData?.length ? {kycStatus: mergedStatues, type: 'full', uan: processedUan,userMobileNumber: mobile_number, ...currentEmploymentUanData[0]} : {kycStatus: mergedStatues, type: 'full', uan: processedUan,userMobileNumber: mobile_number, ...currentEmploymentUanData}
        try {
            const withdrawabilityCheckUpReportResponse = await post('withdrawability-check', dataToSend);
            if (withdrawabilityCheckUpReportResponse) {
                setIsLoading(false)
                navigate('/dashboard', { state: { mobile_number, processedUan } })
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
                <div className="container" style={{position:"fixed",marginTop:"-1rem"}}>
                    <div className="row d-flex justify-content-center align-items-center vh-100">
                        <div className="col-lg-6 col-md-8">
                            <div className='row'>

                                <div className='col-md-12 text-center'>
                                    <span className={`${styles.kycHeading} d-flex justify-content-center`}>
                                        {showCheckbox ? 'Select incorrect details' : 'Are your Bank a/c details correct ?'}
                                    </span>
                                </div>
                            </div>
                            <div className='row mt-lg-5 mt-3 '>
                                <div className='col-md-10 offset-md-1'>
                                    <div className={`card shadow-sm mx-lg-5`}>
                                        <div className="card-body">
                                            <div className='row py-4 px-2 my-4'>
                                                 {!isInvalidValue(initialBankAccount) && (
                                                    <div className='col-md-6'>
                                                    <label className={`cardTitle mt-3`}>Bank A/C number</label>

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className='cardBody d-flex justify-content-start align-items-center'>
                                                            {currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber ? (showFullAccountNumber ? currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber
                                                                : formatAccountNumber(currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber)) : '-'}
                                                            {!(["N/A", "-", ""].includes(currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber)) && (showFullAccountNumber ? (
                                                                <BsEyeSlashFill className="text-primary fs-5 mx-2 cursor-pointer" onClick={toggleAccountVisibility} />
                                                            ) : (
                                                                <BsEyeFill className="text-primary fs-5 mx-2 cursor-pointer"
                                                                    onClick={toggleAccountVisibility} />
                                                            ))}
                                                        </div>
                                                        {showCheckbox && (
                                                            <input className={`${styles.changeCheckbox} form-check-input`} type="checkbox" checked={!BankStatus.bankAccountNumber} onChange={() => handleCheckboxChange('bankAccountNumber')}
                                                                id="flexCheckDefault" style={{
                                                                    transform: 'scale(1.5)'
                                                                }} />
                                                        )}
                                                    </div>
                                                </div>
                                                 )}
                                                
                                                 {!isInvalidValue(initialIFSC) && (
                                                    <div className='col-md-6'>
                                                    <label className={`cardTitle mt-3`}>IFSC Number: </label>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className={`cardBody form-check-label  fw-normal mb-0`}>
                                                            {currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC ? (showIFSCNumber ? currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC : formatIFSCNumber(currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC)) : '-'}
                                                            {!(["N/A", "-", ""].includes(currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC)) && (showIFSCNumber ? (
                                                                <BsEyeSlashFill className="text-primary fs-5 mx-2 cursor-pointer" onClick={toggleIFSCVisibility} />
                                                            ) : (
                                                                <BsEyeFill className="text-primary fs-5 mx-2 cursor-pointer"
                                                                    onClick={toggleIFSCVisibility} />
                                                            ))}
                                                        </div>
                                                    {showCheckbox && (
                                                        <input className={`${styles.changeCheckbox} form-check-input`} type="checkbox" checked={!BankStatus.bankIFSC} onChange={() => handleCheckboxChange('bankIFSC')}
                                                            id="flexCheckDefault" style={{
                                                                transform: 'scale(1.5)'
                                                            }} />
                                                    )}
                                                    </div>
                                                </div>
                                                 )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!showContinueButton && (
                                    <div className='col-md-10 offset-md-1'>
                                        <div className='row mt-4 mb-3 mb-lg-0 mt-lg-5 mx-lg-3'>
                                            <div className='col-md-6 col-sm-6'>
                                                <button className={`${styles.incorrectButton} btn w-100 py-lg-3 py-2`} onClick={handleIncorrect}>
                                                    <i className="bi bi-x-circle text-danger me-2"></i>
                                                    No</button>
                                            </div>
                                            <div className='col-md-6 col-sm-6 mt-3 mt-sm-0'>
                                                <button className={`${styles.correctButton} btn  w-100 py-lg-3 py-2`} onClick={handleCorrect}>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Yes</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showContinueButton && (
                                    <div className="row mb-3 mb-lg-0 mt-4 mt-lg-5">
                                        <div className="col-md-4 offset-md-4 ">
                                            <button className={`${styles.correctButton} btn w-100 py-lg-3 py-2`} onClick={handleContinueBtn}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default KycDetailsBank;