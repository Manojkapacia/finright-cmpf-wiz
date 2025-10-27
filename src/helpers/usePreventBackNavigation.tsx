import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const usePreventBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
 // console.log(location)
  useEffect(() => {
    const handleBackButton = () => {
      navigate(location.pathname, { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate, location.pathname]);
};

export default usePreventBackNavigation;
