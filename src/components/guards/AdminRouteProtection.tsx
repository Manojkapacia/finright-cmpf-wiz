import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { decryptData } from "../common/encryption-decryption";
interface AuthGuardProps {
    children: ReactNode;
}

export const AdminRoutes: React.FC<AuthGuardProps> = ({children}) => {

    const isLoggedIn = decryptData(localStorage.getItem("isLoggedIn")) === "true";
    if (!isLoggedIn) {
        return <Navigate to="/operation/login" />;
    }

    return children;
}

export const AdminloginRoute: React.FC<AuthGuardProps> = ({ children }) => {
    const isLoggedIn = decryptData(localStorage.getItem("isLoggedIn")) === "true";
    if (isLoggedIn) {
      return <Navigate to="/operation/uan-list" />;
    }
    return children;
  };