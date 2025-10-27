import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from './../assets/loaderImage.json'; // your Lottie file

interface Props {
  show: boolean;
  onClose: () => void;
  // apiPromise: Promise<any>;
}

const LoadingCard: React.FC<Props> = ({ show, onClose }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!show) return;

    let interval: any;

    const startProgress = () => {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 100);
    };

    const handleApi = async () => {
      startProgress();
      try {
        // await apiPromise;
        clearInterval(interval);
        setProgress(100);
        setTimeout(onClose, 1500);
      } catch (err) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(onClose, 500);
      }
    };

    handleApi();

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
          <div className="d-flex flex-column align-items-center mt-3">
            <div className="w-100 px-3  py-4 rounded-4 shadow-sm" style={{ backgroundColor: '#F7F9FF', borderRadius: '1.5rem' }}>
              <div className="d-flex justify-content-center mb-2">
                <Lottie animationData={animationData} loop={true} style={{ height: 200 }} />
              </div>
              <p className="text-center mb-2" style={{fontSize: '1.13rem'}}>Almost there..</p>
              <div className="progress" style={{ height: 6, borderRadius: 4 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: '#2463EB',
                    transition: 'width 0.3s ease-in-out',
                  }}
                ></div>
              </div>
              <p className="text-center mt-2 mb-0" style={{fontSize: '1rem'}}>Calling EPF Office</p>
            </div>
          </div>

  );
};

export default LoadingCard;
