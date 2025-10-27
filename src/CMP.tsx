
import { useEffect } from "react";
import { CircularLoading } from "./components/user-registeration/Loader";

const CMP = () => {
  useEffect(() => {
    window.location.href = "https://finright.in/check-pf-withdrawability";
  }, []);

  return <CircularLoading/>; // Or you can return a loading spinner while redirecting
};

export default CMP;