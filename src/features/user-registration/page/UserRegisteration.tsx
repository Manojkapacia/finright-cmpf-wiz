import EmployementStatus from "../../../components/user-registeration/EmployementStatus"
import EnterOtp from "../../../components/user-registeration/EnterOtp"
import EpfoDown from "../../../components/auth-full-scrapper/EpfoDown"
import { CircularLoading } from "../../../components/user-registeration/Loader"
import LoginError from "../../../components/user-registeration/LoginError"
import LoginMultipleUan from "../../../components/user-registeration/LoginMultipleUan"
import LoginNoUan from "../../../components/user-registeration/LoginNoUan"
import LoginSingleUan from "../../../components/user-registeration/LoginSingleUan"
import OtherUanChooseUan from "../../../components/user-registeration/OtherUanChooseUan"
import OtherUanOnlyOne from "../../../components/user-registeration/OtherUanOnlyOne"
import OtherUanOtp from "../../../components/user-registeration/OtherUanOtp"
import OtpExpire from "../../../components/user-registeration/OtpExpire"
import ResendOtp from "../../../components/user-registeration/ResendOtp"
import Searching from "../../../components/auth-full-scrapper/login"
import SearchingUan from "../../../components/user-registeration/SearchingUan"
import WrongOtp from "../../../components/user-registeration/WrongOtp"

const UserRegisteration = () => {
  return (
    <div className="min-vh-100" style={{  height: "100%",backgroundColor: "#E6ECFF" }}>
      <SearchingUan />
      <LoginMultipleUan />
      <CircularLoading />
      <EmployementStatus />
      <OtherUanChooseUan />
      <LoginSingleUan />
      <OtherUanOnlyOne />
      <LoginNoUan />
      <LoginError />
      <EnterOtp />
      <OtherUanOtp />
      <OtpExpire />
      <ResendOtp />
      <WrongOtp />
      <Searching/>
      <EpfoDown/>
    </div>
  )
}

export default UserRegisteration
