
const MESSAGES = {
    environment : "uat",
    test_mobile: "9769708326",
    success: {
        otpSent: "OTP has been sent successfully.",
        otpVerified: "OTP has been verified successfully.",
        loginSuccess: "Logged in successfully",
        paymentSuccess: "🥳 Woohoo, Payment Successful! You can access the FULL report now."
        // paymentSuccess: "🥳 Woohoo! As a valued beta user, this report is absolutely FREE for you! 🎁"
    },
    error: {
        invalidEpfoCredentials: "Invalid UAN or password. Try resetting password with the mobile number registred with finright or EPFO",
        invalidOtp: "The OTP entered is invalid. Please try again.",
        invalidOtpServer: "The OTP entered is invalid. Please try again by clicking on Resend.",
        correctEmail:"Please enter the correct email",
        uanInvalidLength: "UAN must be a 12-digit number.",        
        password: {
            length: "Password must be at least 8 characters long.",
            upperCase: "Password must contain at least one uppercase letter.",
            lowerCase: "Password must contain at least one lowercase letter.",
            specialCharacter: "Password must contain at least one special character."
        },
        invalidUanPassword: 'Either UAN or Password is incorrect',
        unauthorized: 'Session Expired! Please login again',
        invalidOpnLogin: 'Invalid Credentails',
        logoutError : 'Session expired, Logged out succesfully!!',
        ZOHOError: "Provide new details",
        generic: "Oops!! We encountered an error processing your request at moment.",
        paymentUrlNotFound: "We encountered an issue while processing your payment. Please try again later.",
        paymentProcessingIssue: "Oops!! There is some issue processing your payment currently. Please try again later.",
        paymentFailed: "Oops, Payment Failed!! Please try again later",
        tooManyRequest: "Access blocked due to multiple attempts, please try again after 10 mins",
        general: "Oops!! something went wrong, Please try again later!!"
    },
    labels: {
        otp: "Enter OTP",
        resendOtp: "Resend OTP",
    },
    placeholders: {},
    required: {
        requiredField: (type : any) => `${type} is required.`,
    },
    api: {
        baseUrl: 'https://uat.finright.in/'
        // baseUrl: 'https://epf.finright.in/'
        // baseUrl: 'http://localhost:3001'
    },
    BASE_URL: 'http://localhost:',
    PF_CHECK_UP_BASE_URL: "https://uat.finright.in",
    PF_CHECK_UP_PROD_URL: "https://uat.finright.in/operation",
    CHEKC_MY_PF_URL: "https://pf.finright.in/check-pf-withdrawability"
    // CHEKC_MY_PF_URL: "http://localhost:5174/check-pf-withdrawability"
};

export default MESSAGES;