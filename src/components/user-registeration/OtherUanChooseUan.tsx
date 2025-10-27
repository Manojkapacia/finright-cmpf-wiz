import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChooseUanContainer, DataEncryption, EpfMemberLogo, SkipButton, UserRegisterationOtherUanTextContent } from "../../features/user-registration/helpers/ExportingText"
import { CircularLoading } from "./Loader"
// #5
const OtherUanChooseUan = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(false)

  const { mobile_number, leftOverUans } = location.state || {};

  const handleUanClick = (clickedUan:any) => {
    try {
      // const response = await post('surepass/generateOtp', { mobile_number });
      const response : any = [
        {
          "success": true,
          "status": 200,
          "message": "OTP sent to your mobile number XXXXXX8489",
          "data": {
              "data": {
                  "client_id": "income_epfo_passbook_eYsgjqhuOlriyWqMdGsl",
                  "otp_sent": true,
                  "masked_mobile_number": "XXXXXX8489",
                  "is_async": false
              },
              "status_code": 200,
              "success": true,
              "message": "OTP Sent.",
              "message_code": "success"
        }
      }
      ]
      if (response) {
        setTimeout(() => {
          setIsLoading(false)
          const leftOverUansOther = leftOverUans.filter((uan:any) => uan.uan !== clickedUan.uan)
          navigate('/submit-otp', { state: { otpdetails: response, mobile_number, leftOverUans: leftOverUansOther, currentEmploymentUanData: clickedUan.employment_history } })
        }, 1000)
      } else {
        // handle error key
      }
    } catch (error) {
      // handle error key
    }
  }

  const handleSkipClick = () => {
    navigate("/dashboard", { state: { mobile_number, leftOverUans }});
  }
  
  return (
    <>
    {isLoading && <CircularLoading />}
    {!isLoading && 
      <div className="to-margin-top min-vh-100 d-flex flex-column align-items-center gap-1 py-4"
      // style={{
      //   position: "fixed", // Fixes the container in place
      //   left: 0,
      //   width: "100%", // Ensures full width
      // }}
      >
        <UserRegisterationOtherUanTextContent headText="Fetch details of your other UAN" singleviewText="Get single view into all your UANs"/>
        <EpfMemberLogo epfMemberLogoTextContent="Choose UAN"/>
        {/* <div className="overflow-auto" style={{ maxHeight: "120px" }}> */}

        {leftOverUans?.map((item: any, index: number) => (
          <ChooseUanContainer key={index} uanItem={item} onClick={() => {handleUanClick(item)}}/>
        ))}
                      {/* <ChooseUanContainer key={"index"} uanItem={"item"} />
                      <ChooseUanContainer key={"index"} uanItem={"item"} />
                      <ChooseUanContainer key={"index"} uanItem={"item"} />
                      <ChooseUanContainer key={"index"} uanItem={"item"} />
                      <ChooseUanContainer key={"index"} uanItem={"item"} /> */}

        {/* </div> */}
        <DataEncryption/>
        <div className="d-flex justify-content-center mt-auto">
        <SkipButton onClick={handleSkipClick}/>
        </div>
        <br />
        <br /><br /><br />
      </div>
    }
    </>
  )
}

export default OtherUanChooseUan
