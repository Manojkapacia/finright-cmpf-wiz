import { useAutoLogout } from "./auth-guard"

const AutoLogoutHandler = () => {
    useAutoLogout()
    return null

};

export default AutoLogoutHandler;
