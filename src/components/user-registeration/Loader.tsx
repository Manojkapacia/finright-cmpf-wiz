import { useEffect, useState } from 'react';
import thumbPrimary from './../../assets/thumbPrimary.svg'

// #6
export const CircularLoading = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev >= 100 ? 1 : prev + 1)); // Restart from 1 after reaching 100
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100vw",
        height: "100vh"
      }}
    >
      <div
        className="position-relative rounded-circle d-flex justify-content-center align-items-center"
        style={{
          width: 'min(50vw, 10rem)', 
          height: 'min(50vw, 10rem)',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '2px solid #EDEDED',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            background: `conic-gradient(#304DFF ${count * 3.6}deg, #EDEDED 0deg)`,
            position: 'absolute',
            top: 8.7,
            left: 8.3
          }}
        ></div>

        <span
          className="fw-bold text-dark d-flex justify-content-center align-items-center"
          style={{
            fontSize: 'clamp(14px, 2vw, 20px)', 
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            width: '80%',
            height: '80%',
            zIndex: 1
          }}
        >
          {/* {count} */}
          <img
            src={thumbPrimary}
            alt="Loading Icon"
            style={{ width: "60%", height: "60%" }}
          />
        </span>
      </div>

      <span 
        className="text-secondary text-center" 
        style={{ fontSize: 'clamp(15px, 1.5vw, 16px)', marginTop: '5px' }}
      >
        Fetching Details, please wait...
      </span>
    </div>
  );
};
