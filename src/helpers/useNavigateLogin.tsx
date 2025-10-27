
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useNavigateLogin = () => {
      const navigate = useNavigate();
    
      useEffect(() => {
        const disableBackButton = () => {
          window.history.pushState(null, "", window.location.href);
          window.onpopstate = () => {
            navigate("/login-uan");
          };
        };
    
        disableBackButton();
    
        return () => {
          window.onpopstate = null;
        }; 
      }, [navigate]);
    };
    
    


export default useNavigateLogin