import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { IoCheckmarkCircleSharp } from "react-icons/io5";

export const OTPOverlay = ({ verificationStatus }: any) => {
  const isVerified = verificationStatus === 'verified';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVerified) {
      let value = 0;
      const interval = setInterval(() => {
        value += 1;
        if (value >= 90) {
          value = 90;
          clearInterval(interval);
        }
        setProgress(value);
      }, 10); // adjust speed as needed
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isVerified]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: '150px',
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        zIndex: 10,
        marginTop: "5rem",
        boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 mb-3">
        <div
          className="fw-semibold"
          style={{ color: isVerified ? '#34A853' : '#F56905', fontSize: '1rem' }}
        >
          {isVerified ? 'OTP successfully verified' : 'Verifying OTP...'}
        </div>
        <div>
          {isVerified ? (
            <IoCheckmarkCircleSharp style={{ color: '#34A853' }} className="fs-4" />
          ) : (
            <FaSpinner
              style={{ color: '#F56905' }}
              className="fs-4 spinner-border spinner-border-sm"
            />
          )}
        </div>
      </div>

      <div className="progress w-100" style={{ height: '8px', borderRadius: '10px' }}>
        <div
          className={`progress-bar ${!isVerified ? 'progress-bar-striped progress-bar-animated' : ''}`}
          role="progressbar"
          style={{
            width: `${progress}%`,
            backgroundColor: isVerified ? '#34A853' : '#F56905'
          }}
        ></div>
      </div>
    </div>
  );
};
  
export const ClaimOverlay = ({ verificationStatus }: any) => {
  const isReady = verificationStatus === 'ready';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isReady) {
      let value = 0;
      const interval = setInterval(() => {
        value += 1;
        if (value >= 90) {
          value = 90;
          clearInterval(interval);
        }
        setProgress(value);
      }, 250); 
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isReady]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: '150px',
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        zIndex: 10,
        marginTop: "5rem",
        boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 mb-3">
        <div
          className="fw-semibold"
          style={{ color: isReady ? '#34A853' : '#F56905', fontSize: '1rem' }}
        >
          {isReady ? 'Claim Application ready' : 'Preparing Claim Application...'}
        </div>
        <div>
          {isReady ? (
            <IoCheckmarkCircleSharp style={{ color: '#34A853' }} className="fs-4" />
          ) : (
            <FaSpinner
              style={{ color: '#F56905' }}
              className="fs-4 spinner-border spinner-border-sm"
            />
          )}
        </div>
      </div>

      <div className="progress w-100" style={{ height: '8px', borderRadius: '10px' }}>
        <div
          className={`progress-bar ${!isReady ? 'progress-bar-striped progress-bar-animated' : ''}`}
          role="progressbar"
          style={{
            width: `${progress}%`,
            backgroundColor: isReady ? '#34A853' : '#F56905'
          }}
        ></div>
      </div>
    </div>
  );
};
  
  interface FinalOtpOverlayProps {
    verificationStatus: 'verifying' | 'verified' | null;
  }
  
  export const FinalOtpOverlay = ({ verificationStatus }: FinalOtpOverlayProps) => {
    const isVerified = verificationStatus === 'verified';
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      if (verificationStatus === 'verifying') {
        let value = 0;
        const interval = setInterval(() => {
          value += 1;
          if (value >= 90) {
            value = 90;
            clearInterval(interval);
          }
          setProgress(value);
        }, 100);
        return () => clearInterval(interval);
      } else if (isVerified) {
        setProgress(100);
      }
    }, [verificationStatus, isVerified]);
  
    const greenShades = [
      '#e0fce0',
      '#c8facc',
      '#a5f5a5',
      '#7df07d',
      '#56ea56',
      '#34A853'
    ];
  
    const radii = [100, 90, 80, 70, 60, 50];
  
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          height: '250px',
          width: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          marginTop: "7rem",
          zIndex: 10,
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          padding: '1rem 2rem',
        }}
      >
        {isVerified ? (
          <>
            <svg width="250" height="200" viewBox="0 0 250 200">
              {radii.map((radius, index) => (
                <circle
                  key={index}
                  cx="125"
                  cy="100"
                  r={radius}
                  fill={greenShades[index]}
                />
              ))}
              <foreignObject x="90" y="75" width="70" height="70">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: '70px', height: '70px' }}
                >
                  <IoCheckmarkCircleSharp style={{ color: '#ffffff', fontSize: '3rem', marginBottom: "1.3rem" }} />
                </div>
              </foreignObject>
            </svg>
            <div
              className="text-center mt-2 fw-semibold"
              style={{ fontSize: '1rem', color: '#34A853' }}
            >
              Claim Applied successfully!..
            </div>
          </>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center w-100">
            <div className="fw-semibold mb-3" style={{ color: '#F56905', fontSize: '1.2rem' }}>
              Verifying OTP...
            </div>
            <div className="progress w-100" style={{ height: '10px', borderRadius: '10px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progress}%`, backgroundColor: '#F56905' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };


  export const LoginStatusOverlay = ({
    statusMessage,
    isReady,
    isError,
  }: {
    statusMessage: string;
    isReady: boolean;
    isError: boolean;
  }) => {
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      if (!isReady) {
        let value = 0;
        const interval = setInterval(() => {
          value += 1;
          if (value >= 90) {
            value = 90;
            clearInterval(interval);
          }
          setProgress(value);
        }, 250);
        return () => clearInterval(interval);
      } else {
        setProgress(100);
      }
    }, [isReady]);
  
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center w-100"
        style={{
          height: '160px',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          padding: '1rem 2rem',
          zIndex: 10,
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100 mb-3">
          <div
            className="fw-semibold"
            style={{
              color: isError ? '#dc3545' : isReady ? '#34A853' : '#F56905',
              fontSize: '1rem',
            }}
          >
            {statusMessage}
          </div>
          <div>
            {isReady ? (
              <IoCheckmarkCircleSharp style={{ color: '#34A853' }} className="fs-4" />
            ) : (
              <FaSpinner
                style={{ color: '#F56905' }}
                className="fs-4 spinner-border spinner-border-sm"
              />
            )}
          </div>
        </div>
  
        <div className="progress w-100" style={{ height: '8px', borderRadius: '10px' }}>
          <div
            className={`progress-bar ${!isReady ? 'progress-bar-striped progress-bar-animated' : ''}`}
            role="progressbar"
            style={{
              width: `${progress}%`,
              backgroundColor: isError ? '#dc3545' : isReady ? '#34A853' : '#F56905',
            }}
          ></div>
        </div>
      </div>
    );
  };
  
  
