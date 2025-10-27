import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { encryptData } from "./components/common/encryption-decryption";
import LoaderCard from "./components/user-registeration/Onboarding2.0/common/loader-card";

// Example encryption function (replace with your real one
const SearchingFynprintDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const mobileNumber = searchParams.get("mobileNumber");
    const selectedUan = searchParams.get("selectedUan");

    if (mobileNumber && selectedUan) {
      // Save encrypted values
      localStorage.setItem("is_logged_in_user", encryptData("true"));
      // localStorage.setItem("user_mobile", encryptData(mobileNumber));
      localStorage.setItem("user_uan", encryptData(selectedUan));

      // Redirect to dashboard with state
      navigate("/dashboard", {
        replace: true,
        state: {
          type: "camefromfynprint",
          mobileNumber,
          processedUan:selectedUan,
        },
      });
    }
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Loader */}
      {/* <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div> */}
      <LoaderCard />
    </div>
  );
};

export default SearchingFynprintDetails;
