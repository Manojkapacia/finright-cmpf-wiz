import { decryptData } from "../components/common/encryption-decryption";
import { post } from "../components/common/api";
import { load } from "@cashfreepayments/cashfree-js";
import MESSAGES from "../components/constant/message";

export const handlePayToInitiate = async ({
  setLoading,
  setMessage,
  amount = "2000",
}: {
  setLoading: (loading: boolean) => void;
  setMessage: (msg: { type: string; content: string }) => void;
  amount?: string;
}) => {
  const CASHFREE_MODE = MESSAGES.CASHFREE_MODE as "production" | "sandbox";
  setLoading(true);
  setMessage({ type: "", content: "" });

  try {
    const relativeUrl = window.location.pathname + window.location.search;
    localStorage.setItem("lastVisitedUrl", relativeUrl);
    const mobileNumber = decryptData(localStorage.getItem("user_mobile") || "");
    // const amount = "2000";
    const redirectKey = "CMPF";

    // 1. Call backend to create order
    const response = await post("payment/create-payment", {
      mobileNumber,
      amount,
      redirectKey,
    });

    if (response?.data?.payment_session_id) {
      setLoading(false);

      // 2. Load Cashfree SDK
      const cashfree = await load({
        mode: CASHFREE_MODE,
        showLoader: true,
        style: {
          backgroundColor: "#FFFFFF",
          color: "#1F2937",
          fontFamily: "'Inter', sans-serif",
          button: {
            backgroundColor: "#FF5C5C",
            color: "#FFFFFF",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            fontWeight: "600",
          },
        },
      });

      // 3. Start checkout
      cashfree.checkout({
        paymentSessionId: response.data.payment_session_id,
        redirectTarget: "_self",
        onSuccess: () => {
          console.log("✅ Payment success");
          setMessage({ type: "success", content: "Payment successful!" });
        },
        onFailure: (err: any) => {
          console.error("❌ Payment failed:", err);
          setMessage({ type: "error", content: "Payment failed. Please try again !!" });
        },
        onClose: () => {
          console.log("⚠️ Payment modal closed by user");
        },
      });
    } else {
      setLoading(false);
      console.error("No payment_session_id in response:", response);
      setMessage({
        type: "error",
        content: "Something went wrong. Please try again !!",
      });
    }
  } catch (error) {
    setLoading(false);
    console.error("Payment initiation failed:", error);
    setMessage({
      type: "error",
      content: "Something went wrong. Please try again !!",
    });
  }
};
