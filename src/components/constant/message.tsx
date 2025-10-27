const MESSAGES = {
    environment : "prod",
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
    ClarityEvents : {
        USER_AUTHENTICATED: "User authenticated",
        FINRIGHT_OTP_TRIGGERED: "Finright OTP triggered",
        FINRIGHT_RESEND_OTP: "Finright resend OTP pressed",
        RETURNING_USER_SIGN_IN: "Returning user sign in",
        UAN_FOUND: "UAN found",
        UAN_NOT_FOUND: "UAN not found",
        SERVICE_HISTORY_FETCHED: "Service history API fetched",
        PARTIAL_REPORT: "Partial report",
        COMPLETE_PROFILE_BUTTON_PRESS: "Complete profile button press",
        REFRESH_BUTTON_PRESS: "refresh button press",
        DOWNLOAD_BUTTON_PRESS: "Download button press",
        SCRAPPER_OTP_SENT: "Scrapper OTP sent",
        SCRAPPER_OTP_VERIFIED: "Scrapper OTP verified",
        KYC_VERIFIED: "KYC verified",
        CHOOSE_EMPLOYMENT_STATUS: "choose employement status",
        FULL_REPORT_GENERATED: "full report generated",
      },
    labels: {
        otp: "Enter OTP",
        resendOtp: "Resend OTP",
    },
    CASHFREE_MODE : "sandbox", //sandbox or production
    placeholders: {},
    required: {
        requiredField: (type : any) => `${type} is required.`,
    },
    api: {
       baseUrl: 'https://api.uat.finright.in/v1'
    //    baseUrl: 'https://api.epf.finright.in/v1'
        // baseUrl: 'http://localhost:3001/v1'
    },
    BASE_URL: 'http://localhost:',
    PF_CHECK_UP_BASE_URL: "https://uat.finright.in",
    PF_CHECK_UP_PROD_URL: "https://uat.finright.in/operation",
    CHEKC_MY_PF_URL: "https://pf.finright.in/check-pf-withdrawability",
    // CHEKC_MY_PF_URL: "http://localhost:5174/check-pf-withdrawability" , 
    THEFYNPRINT_URL: "https://uat.thefynprint.com/service"

};

export default MESSAGES;
