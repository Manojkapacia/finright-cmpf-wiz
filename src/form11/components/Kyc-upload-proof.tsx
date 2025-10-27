import React, { useState } from 'react';
import { ReusableButton } from '../common/Helper';
import Header from '../common/Header';
import CoustomCard from '../common/CustomCard';
import { KYCProgressLoader } from '../common/Helper';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImUpload } from 'react-icons/im';


export const KycUploadProof: React.FC = () => {
  const location = useLocation();
  const { combinedData,
    processedUan,
    mobile_number,
    currentUanData,
    currentEmploymentUanData } = location.state;
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharPreviewUrl, setAadharPreviewUrl] = useState<string | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreviewUrl, setPanPreviewUrl] = useState<string | null>(null);
  const [fromPercent, setFromPercent] = useState(75);
  const [toPercent, setToPercent] = useState(90);
  
  const navigate = useNavigate();

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadharFile(file);
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setAadharPreviewUrl(previewUrl);
      } else {
        setAadharPreviewUrl(null);
      }
    }
  };

  const handlePanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanFile(file);
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setPanPreviewUrl(previewUrl);
      } else {
        setPanPreviewUrl(null);
      }
    }
  };

  const handleRemoveAadhar = () => {
    setAadharFile(null);
    setAadharPreviewUrl(null);
  };

  const handleRemovePan = () => {
    setPanFile(null);
    setPanPreviewUrl(null);
  };


  const handleContinue = () => {
    // You can add validation here to check if files are uploaded
    // if (!aadharFile || !panFile) {
    //     alert('Please upload both Aadhar and Pan Card documents');
    //     return;
    // }
    setFromPercent(90); //update progress range
    setToPercent(100);
  
    setTimeout(() => {
      navigate('/form11/final-report', { state: { combinedData, processedUan, mobile_number, currentUanData, currentEmploymentUanData } });
    }, 3000);
  };

  return (
    <div className="container-fluid px-2">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff', height: '100vh', overflowY: 'auto' }}>
          <Header />
          <CoustomCard />
          <KYCProgressLoader fromPercent={fromPercent} toPercent={toPercent} />
          <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
            <div className="card-body">
              <h5 style={{
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '0'
              }}>
                Upload required ID Proofs                          </h5>
              <p style={{
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: '100%',
                letterSpacing: '0'
              }}>
                Please upload a self attested copy of following required proofs                            </p>
              {/* For Aadhar Card section */}
              <div className="row mt-4">
                {/* Left column for document details */}
                <div className="px-3">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Aadhar Card Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 400 }}>Aadhar Card</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                          {currentUanData?.rawData?.data?.profile?.kycDetails?.aadhaar}
                        </p>
                      </div>

                      <div>
                        {!aadharFile ? (
                          <>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf"
                              id="aadharFileInput"
                              style={{ display: 'none' }}
                              onChange={handleAadharUpload}
                            />
                            <label htmlFor="aadharFileInput" className="btn" style={{
                              padding: '0.625rem',
                              borderRadius: '1000px',
                              border: '1px solid #85A2FF',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3125rem'
                            }}>
                              <ImUpload style={{ fontSize: '0.9375rem', color: '#85A2FF' }} />
                              <span style={{ fontSize: '0.875rem' }}>Upload</span>
                            </label>
                          </>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            {aadharPreviewUrl ? (
                              <img
                                src={aadharPreviewUrl}
                                alt="Aadhaar preview"
                                style={{ maxWidth: '100px', maxHeight: '150px', borderRadius: '0.5rem' }}
                              />
                            ) : (
                              <p>{aadharFile.name}</p>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={handleRemoveAadhar}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Pan Card Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 400 }}>PAN Card</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                          {currentUanData?.rawData?.data?.profile?.kycDetails?.pan}
                        </p>
                      </div>

                      <div>
                        {!panFile ? (
                          <>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf"
                              id="panFileInput"
                              style={{ display: 'none' }}
                              onChange={handlePanUpload}
                            />
                            <label htmlFor="panFileInput" className="btn" style={{
                              padding: '0.625rem',
                              borderRadius: '1000px',
                              border: '1px solid #85A2FF',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3125rem'
                            }}>
                              <ImUpload style={{ fontSize: '0.9375rem', color: '#85A2FF' }} />
                              <span style={{ fontSize: '0.875rem' }}>Upload</span>
                            </label>
                          </>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            {panPreviewUrl ? (
                              <img
                                src={panPreviewUrl}
                                alt="PAN preview"
                                style={{ maxWidth: '100px', maxHeight: '150px', borderRadius: '0.5rem' }}
                              />
                            ) : (
                              <p>{panFile.name}</p>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={handleRemovePan}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                  <p style={{
                    fontSize: '0.8125rem', // 13px in rem
                    fontWeight: 400,
                    lineHeight: '100%',
                    letterSpacing: '0',
                    marginTop: '1.5rem'
                  }}>
                    Are there details incorrect? {' '}
                    <span style={{
                      color: '#304DFF',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      Click here
                    </span>
                  </p>
                </div>
              </div>

            </div>
          </div>
          <div className="mt-2 mb-5">
            <ReusableButton
              text="Continue"
              onClick={handleContinue}
              disabled={!aadharFile || !panFile}
            />
          </div>
        </div>
      </div>

    </div>



  );
};