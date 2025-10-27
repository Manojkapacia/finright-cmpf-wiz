import React, { useState } from 'react';
import { ReusableButton } from '../common/Helper';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import { KYCProgressLoader } from '../common/Helper';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImUpload } from 'react-icons/im';

export const KycBank: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        combinedData,
        processedUan,
        mobile_number,
        currentUanData,
        currentEmploymentUanData
    } = location.state;

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);

            // Only generate preview if image
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setPreviewUrl(null);
        const input = document.getElementById('fileInput') as HTMLInputElement;
        if (input) input.value = ''; // Reset file input
    };

    const handleContinue = () => {
        navigate('/form11/kyc-upload-proof', {
            state: {
                combinedData,
                processedUan,
                mobile_number,
                currentUanData,
                currentEmploymentUanData,
                uploadedFile
            }
        });
    };
    return (
        <div className="container-fluid px-2">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff', height: '100vh', overflowY: 'auto' }}>
                    <Header />
                    <CoustomCard />
                    <KYCProgressLoader fromPercent={50} toPercent={75} />
                    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                        <div className="card-body">
                            <h5 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Bank Account Details                            </h5>
                            <p style={{
                                fontSize: '1rem',
                                fontWeight: 400,
                                lineHeight: '100%',
                                letterSpacing: '0'
                            }}>
                                Please upload a cancelled cheque as proof of bank account.
                            </p>
                            <div className='px-2'>

                                <div className='mb-4 py-2' style={{ marginTop: '0.7rem' }}>
                                    <p style={{
                                        fontSize: '0.8125rem', // 13px in rem
                                        fontWeight: 400,
                                        lineHeight: '100%',
                                        letterSpacing: '0'
                                    }}>
                                        Bank Account
                                    </p>
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        lineHeight: '100%',
                                        letterSpacing: '0'
                                    }}>
                                        {currentUanData?.rawData?.data?.profile?.kycDetails?.bankAccountNumber}
                                    </p>
                                </div>

                                <div className='mb-4' style={{ marginTop: '1rem' }}>
                                    <p style={{
                                        fontSize: '0.8125rem', // 13px in rem
                                        fontWeight: 400,
                                        lineHeight: '100%',
                                        letterSpacing: '0'
                                    }}>
                                        IFSC Code
                                    </p>
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        lineHeight: '100%',
                                        letterSpacing: '0'
                                    }}>
                                        {currentUanData?.rawData?.data?.profile?.kycDetails?.bankIFSC}
                                    </p>
                                </div>

                                <p style={{
                                    fontSize: '0.8125rem', // 13px in rem
                                    fontWeight: 400,
                                    lineHeight: '100%',
                                    letterSpacing: '0'
                                }}>
                                    Are your bank details incorrect?{' '}
                                    <span style={{
                                        color: '#304DFF',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}>
                                        Click here
                                    </span>
                                </p>

                                <div className="mt-4">
                                    <div className="d-flex justify-content-center">
                                        <div
                                            className="text-center"
                                            style={{
                                                backgroundColor: '#E6ECFF99',
                                                padding: '2rem',
                                                borderRadius: '1rem',
                                                minHeight: '150px',
                                                width: '100%'
                                            }}
                                        >
                                            {!uploadedFile ? (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept=".png,.jpg,.jpeg,.pdf"
                                                        style={{ display: 'none' }}
                                                        id="fileInput"
                                                        onChange={handleFileChange}
                                                    />
                                                    <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                                                        <ImUpload style={{ fontSize: '2.5rem', color: '#7E9DFF' }} />
                                                        <p className="mt-2" style={{ fontSize: '0.8125rem' }}>
                                                            Upload Cancelled Cheque with your name printed
                                                        </p>
                                                    </label>
                                                </>
                                            ) : (
                                                <>
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Uploaded preview"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '150px',
                                                                borderRadius: '0.5rem',
                                                                 marginBottom: '0.5rem'
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="mb-2">{uploadedFile.name}</p>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger mt-2"
                                                        onClick={handleRemoveFile}
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="mt-2 mb-5">
                        <ReusableButton
                            text="Continue"
                            onClick={handleContinue}
                            disabled={!uploadedFile}
                        />
                    </div>
                </div>

            </div>



        </div>
    );
};