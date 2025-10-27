import {
  PoweredBy,
  UserRegisterTextContent,
  UserRegistrationOtpInput,
  UserRegistrationSubmitButton,
} from "../../features/user-registration/helpers/ExportingText";
// #13
const ResendOtp = () => {
  return (
    <div className="to-margin-top min-vh-100 d-flex flex-column justify-content-between"
    style={{
      position: "fixed", // Fixes the container in place
      left: 0,
      width: "100%", // Ensures full width
    }}
    >
      <div className=" d-flex flex-column align-items-center gap-2 py-4">
        <UserRegisterTextContent />
        
        
        <UserRegistrationOtpInput
          resendText="Waiting for OTP? Resend in :"
          timerText="Resend OTP"
        />
      </div>
       <br />
     
      <div className="d-flex justify-content-center mt-auto  mb-3">
        <UserRegistrationSubmitButton />
      </div>
      <div className="d-flex justify-content-center  mb-3">
        <PoweredBy />
      </div>
      <br /><br /><br />
    </div>
  );
};

export default ResendOtp;
