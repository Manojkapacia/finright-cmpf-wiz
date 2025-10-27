import {
  ChooseUanContainerSingle,
  DataEncryption,
  EpfMemberLogo,
  PoweredBy,
  UserRegisterTextContent,
} from "../../features/user-registration/helpers/ExportingText";
import { CustomButton } from "../../helpers/helpers";
import "../styles/UserRegisteration.css"
// #9

const LoginSingleUan = () => {
  const handleClick=()=>{
    console.log("clicked")
  }
  return (
    <div className="to-margin-top min-vh-100 d-flex flex-column justify-content-between gap-2 py-4"
    style={{
      position: "fixed", // Fixes the container in place
      left: 0,
      width: "100%", // Ensures full width
    }}
    >
      <div className=" d-flex flex-column align-items-center">
        <UserRegisterTextContent />
        <EpfMemberLogo epfMemberLogoTextContent="UAN found" />
        <ChooseUanContainerSingle />
        <DataEncryption />
        <br/>
        {/* <div className="d-flex flex-column align-items-center gap-2">
          <button
            className="btn text-white fw-bold clickeffect"
            style={{
              width: "350px",
              height: "51px",
              maxHeight: "72px",
              borderRadius: "1000px",
              backgroundColor: "#00124F",
              padding: "16px 32px",
            }}
          >
            Continue
          </button>
        </div> */}

      </div>
 
      <div className="d-flex justify-content-center mt-auto  mb-2">
          <CustomButton name="Continue" onClick={handleClick}/>
        {/* <UserRegistrationSubmitButto /> */}
      </div>
      <div className="d-flex justify-content-center  mb-3">
        <PoweredBy />
      </div>
      <br /><br /><br /><br />
    </div>
  );
};

export default LoginSingleUan;
