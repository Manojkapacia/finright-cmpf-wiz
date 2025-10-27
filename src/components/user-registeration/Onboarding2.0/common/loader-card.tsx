import { LoaderBar } from "./helpers";
import Lottie from 'lottie-react';
import animationData from "./../../../../assets/loaderImage.json"
import { TermsConditionsModal } from "./helpers";
import { useState } from "react";
import fingerprintAnimation from "./../../../../assets/OTPMicroAnimation.json"
import './../../../../App.css'

interface LoaderCardProps {
  apiFinished?: boolean;
}

const LoaderCard = ({ apiFinished }: LoaderCardProps) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  return (
    <>
    <TermsConditionsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
    <div className="container-fluid p-0 responsive-height">
      <div className="row g-0" style={{ height: "100%" }}>
        <div
          className="col-md-4 offset-md-4 d-flex flex-column"
          style={{
            backgroundColor: "#FFFFFF",
            height: "100%",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ flexGrow: 1, paddingBottom: "45vh" /* reserve space */ }}
          >
            <Lottie animationData={animationData} loop={true} style={{ height: 200 }} />
          </div>


          <div
            className="position-fixed bottom-0 start-50  d-flex flex-column"
            style={{
              transform: 'translateX(-50%)',
              borderTopLeftRadius: '1.25rem', // 20px
              borderTopRightRadius: '1.25rem',
              height: '45vh', // 280px
              maxWidth: '31.25rem', // 500px
              width: '100%',
              padding: '1.25rem', // 20px
              gap: '0.625rem', // 10px
              zIndex: 1050,
              backgroundColor: '#4255CB'
            }}
          >
            <div className="text-center">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{ width: '7.25rem', height: '7.25rem' }} 
              >
                <Lottie
                  animationData={fingerprintAnimation}
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>

            {/* Middle Section */}
              <LoaderBar
                duration={5}
                titleText="Almost there.."
                footerText="Calling EPF Office"
                apiDone={apiFinished}
              />

              {/* Bottom Terms & Conditions */}
            <div
              className="text-center text-white pb-3"
              style={{
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: '100%',
                // marginTop: '0.75rem',
              }}
            >
              <p style={{ marginBottom: 0 }}>By Log in, you agree to our</p>
                <p
                  style={{
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                  }}
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms & Conditions
                </p>
              {/* By Log in, you agree to our{" "}
              <span style={{ fontWeight: 400, cursor: 'pointer' }} onClick={() => setShowTermsModal(true)}>
                Terms & Conditions
              </span> */}
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default LoaderCard;
