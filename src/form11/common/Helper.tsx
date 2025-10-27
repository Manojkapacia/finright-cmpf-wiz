import React, { useEffect, useState } from 'react';

import './Helper.css';
interface ReusableButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ReusableButton: React.FC<ReusableButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button
      className="btn mt-3 w-100 py-2"
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#AAB2C8" : "#07115B",
        color: "#FFFFFF",
        fontSize: "1rem",
        fontWeight: "700",
        paddingTop: "0.8rem",
        paddingBottom: "0.8rem",
        cursor: disabled ? "not-allowed" : "pointer"
      }}
    >
      {text}
    </button>
  );
};



interface KYCProgressLoaderProps {
  fromPercent: number;
  toPercent: number;
}


export function KYCProgressLoader({ fromPercent, toPercent }: KYCProgressLoaderProps) {
  const [progress, setProgress] = useState(fromPercent);

  useEffect(() => {
    let interval: number;

    if (progress < toPercent) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= toPercent) {
            clearInterval(interval);
            return toPercent;
          }
          return prev + 1;
        });
      }, 20); // Speed of animation: 20ms per increment
    }

    return () => clearInterval(interval);
  }, [fromPercent, toPercent]);

  return (
    <div className="card w-100 mt-3 border-0 py-2" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
      <div className="card-body d-flex justify-content-between align-items-center py-2">
        <div style={{ fontSize: '1rem', fontWeight: "400" }}>
          <p className="mb-0">EPF details found successfully, let's verify the details while we fill the form..</p>

          <div className="mt-2">
            <p className="mb-2" style={{ fontSize: "1.125rem", fontWeight: "400" }}>
              Verify details
            </p>

            <div
              className="progress-container position-relative w-100 rounded-pill overflow-hidden"
              style={{
                height: "0.5rem",
                background: "linear-gradient(90deg, #E0E7FF 25%, #F0F4FF 100%)",
                boxShadow: "inset 0 0 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #304DFF 0%, #5A78FF 100%)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>

            <div className="d-flex justify-content-end mt-1">
              <span className="text-muted fw-medium" style={{ fontSize: "1rem", fontWeight: "400" }}>
                {progress===10?0:progress}% completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
