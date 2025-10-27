import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { decryptData, encryptData } from "../common/encryption-decryption";
import MESSAGES from "../constant/message";

interface AuthGuardProps {
    children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        // Get stored session data
        const storedMobile = decryptData(localStorage.getItem("user_mobile"));
        const isAuthenticated = !!decryptData(localStorage.getItem("is_logged_in_user"));

        // Get the latest mobile number from the external app
        const queryParams = new URLSearchParams(window.location.search);
        const encodedMobileNumber = queryParams.get("mobile_number");
        const extractedMobile = encodedMobileNumber ? atob(encodedMobileNumber) : "";

        // Only redirect if explicitly logged out or mobile number changes
        if (!isAuthenticated && !storedMobile) {
            localStorage.clear()
            window.location.href = MESSAGES.CHEKC_MY_PF_URL; // Redirect to login
            return;
        }
        
        // If mobile number changes, update it instead of logging out
        if (extractedMobile && storedMobile !== extractedMobile) {
            localStorage.setItem("user_mobile", encryptData(extractedMobile));
        }
        
        setIsVerified(true);
    }, []);

    if (!isVerified) {
        return null; // Prevent rendering until verification is complete
    }

    return children;
};

export const GuestGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const location = useLocation();

    // Get stored session data
    const storedMobileRaw = decryptData(localStorage.getItem("user_mobile"));
    const storedMobile = storedMobileRaw?.replace(/^\+91/, '');

    const isAuthenticated = !!decryptData(localStorage.getItem("is_logged_in_user"));

    // Get the latest mobile number from the external app
    const queryParams = new URLSearchParams(window.location.search);
    const encodedMobileNumber = queryParams.get("mobile_number");
    const extractedMobileRaw = encodedMobileNumber ? atob(encodedMobileNumber) : "";
    const extractedMobile = extractedMobileRaw?.replace(/^\+91/, '');

    // Redirect to external website if the route is "/" and no mobile number is found
    if (location.pathname === "/" && !extractedMobile) {
        localStorage.clear()
        window.location.href = MESSAGES.CHEKC_MY_PF_URL; // Redirect to the required website
        return null;
    }
    if ((location.pathname === "/call-booking/otp" || location.pathname === "/payment-auth/otp") && !storedMobile) {
        localStorage.clear()
        window.location.href = MESSAGES.CHEKC_MY_PF_URL; // Redirect to the required website
        return null;
    }
    // If the user is already logged in AND the mobile number matches, send to dashboard
    if (isAuthenticated && ((storedMobile === extractedMobile) || (extractedMobile === "" && storedMobile))) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export const AuthGuardScrapper: React.FC<AuthGuardProps> = ({ children }) => {
    const isAuthenticated = !!decryptData(localStorage.getItem("is_logged_in_user"));
    const isScrappedFully = !!decryptData(localStorage.getItem("is_scrapped_fully"))

    // if scrapping is done & user is already authenticated
    if (isAuthenticated && isScrappedFully) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// auto logout starts here.
// 15 minutes
// Event	When it triggers
// visibilitychange	When the user switches tabs or minimizes/restores the window
// focus	When the window/tab gains focus (user comes back)
// resize	When the user resizes the window (often a sign of activity)
// wheel	Mouse wheel scrolls (some users use scroll wheel instead of scrollbar)

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export const useAutoLogout = (): void => {
    const timeoutRef = useRef<number | null>(null);

    const logout = () => {
        console.warn("Logging out due to inactivity...");
        localStorage.clear();
        window.location.href = MESSAGES.CHEKC_MY_PF_URL;
    };

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            const isAuthenticated = !!decryptData(localStorage.getItem("is_logged_in_user"));
            if (isAuthenticated) logout();
        }, INACTIVITY_LIMIT);
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") resetTimer();
        };

        const events: (keyof WindowEventMap)[] = [
            "mousemove", "keydown", "click",
            "scroll", "touchstart", "wheel",
            "resize", "focus"
        ];

        events.forEach(event =>
            window.addEventListener(event, resetTimer)
        );
        document.addEventListener("visibilitychange", handleVisibilityChange);

        resetTimer(); // Initial timer set

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            events.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);
};


