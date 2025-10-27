import {
  PoweredBy,
  UserRegisterationOtherUanTextContent,
  UserRegistrationOtpInput,
  UserRegistrationSubmitButton,
} from "../../features/user-registration/helpers/ExportingText";
// #7
const OtherUanOtp = () => {
  return (
    <div className="to-margin-top min-vh-100 d-flex flex-column justify-content-between"
    style={{
      position: "fixed", // Fixes the container in place
      left: 0,
      width: "100%", // Ensures full width
    }}
    >
      <div className=" otp-container d-flex flex-column align-items-center gap-3 py-4">
        <UserRegisterationOtherUanTextContent
          headText="Fetch details of your other UAN"
          singleviewText="Get single view into all your UANs"
        />
    
        <UserRegistrationOtpInput
          resendText="Waiting for OTP? Resend in"
          timerText="45 secs"
        />
      </div>
      <div className="d-flex justify-content-center mt-auto  mb-3">
        <UserRegistrationSubmitButton />
      </div>
      <div className="d-flex justify-content-center  mb-3">
        <PoweredBy />
      </div>
      <br /><br /><br /><br/>
    </div>
  );
};

export default OtherUanOtp;
