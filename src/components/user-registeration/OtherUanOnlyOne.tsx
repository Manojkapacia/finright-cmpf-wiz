import { ChooseUanContainer, EpfMemberLogo, SkipButton, UserRegisterationOtherUanTextContent } from "../../features/user-registration/helpers/ExportingText"
// #11
const OtherUanOnlyOne = () => {
  return (
    <div className="to-margin-top min-vh-100 d-flex flex-column align-items-center gap-2 py-4"
    style={{
      position: "fixed", // Fixes the container in place
      left: 0,
      width: "100%", // Ensures full width
    }}
    >
          <UserRegisterationOtherUanTextContent headText="Fetch details of your other UAN" singleviewText="Merge UAN for a through analysis"/>
          <EpfMemberLogo epfMemberLogoTextContent="Your UAN"/>
          <ChooseUanContainer/>
          <div className="d-flex justify-content-center mt-auto mb-5 py-4">
          <SkipButton/>
         </div>
         
        </div>
  )
}

export default OtherUanOnlyOne