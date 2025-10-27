
import "./App.css"
import { Route, Routes, useLocation } from "react-router-dom";
import SearchingUan from "./components/user-registeration/SearchingUan";
import LoginMultipleUan from "./components/user-registeration/LoginMultipleUan";
import EmployementStatus from "./components/user-registeration/EmployementStatus";
import EnterOtp from "./components/user-registeration/EnterOtp";
import PFPassbookMainPage from "./features/dashboard/page/PFPassbookMainPage";
import Login from "./components/auth-full-scrapper/login";
import PassboolReport from "./features/dashboard/page/passbook-report-details";
import Header from "./components/common/header/header";
import ScrapperOtp from "./components/auth-full-scrapper/otp";
import KycDetails from "./components/auth-full-scrapper/kyc-details";
import KycDetailsBank from "./components/auth-full-scrapper/kyc-details-bank";
import ScrollTop, { ScrollToTop } from "./components/common/header/scroll-top";
import ForgotPassword from "./components/auth-full-scrapper/forgot-password";
import AdminLogin from "./admin/components/admin-login"
import { AuthGuard, GuestGuard } from "./components/guards/auth-guard";
import ViewDetailsByUan from "./admin/components/view-details-by-uan";
import PageNotFound from "./components/common/page-not-found";
import AutoLogoutHandler from "./components/guards/AutoLogoutHandler";
import EPFODownNew from "./components/user-registeration/EPFODownNew";
import HighRiskReport from "./features/dashboard/page/high-risk-report";
import HowCanHelp from "./components/user-registeration/HowCanHelp";
import CMP from "./CMP";
// import ExpressWithdraw from "./features/dashboard/page/ExpressWithdraw";
// import Checking from "./Checking";
// import { EpfoLogin } from './components/claim-my-pf/epfo/index';
// import LoginOTPPage from "./components/claim-my-pf/LoginOTPPage";
// import { FinalClaimPage } from "./components/claim-my-pf/FinalClaimPage";
// import { ErrorPage } from "./components/claim-my-pf/ErrorPage";
// import UpdateKyc from "./components/claim-my-pf/UpdateKyc";
// import NoBankDetails from "./components/claim-my-pf/NoBankDetails";
// import EPFOCredentialError from "./components/claim-my-pf/EPFOCredentialError";
import MonitoringOpsDashboard from "./admin/components/monitoring-ops-dashboard";
// import SupportUser from "./components/user-registeration/supportUser";
import FinrightOtp from "./components/user-registeration/Onboarding2.0/FinrightOtp";
import HowCanHelpUser from "./components/user-registeration/Onboarding2.0/howCanHelp";
import TellYourName from "./components/user-registeration/Onboarding2.0/TellYourName";
import { useEffect, useState } from "react";
import AddOpsUser from "./admin/add-ops-user";
import { get } from "./components/common/api";
import { AdminloginRoute, AdminRoutes } from "./components/guards/AdminRouteProtection";
import LoaderCard from "./components/user-registeration/Onboarding2.0/common/loader-card";
import ArchivedModule from "./admin/archived_module";
import SimpleEmployeeReport from "./admin/components/report-new";
import CronLogViewer from "./admin/CronLogViewer";
import GrievanceTracker from "./admin/components/grievance/grievanceTracker";
import SearchingFynprintDetails from "./SearchingFynprintDetails";
import PaymentInitiate from "./components/payment/PaymentInitiate";
import FynprintPayment from "./components/payment/fynprintPayment";
import EPFOLogin from "./shareableUrl/call_booking/epfoLogin";
import OTPPage from "./shareableUrl/call_booking/otpPage";
import CalendarBooking from "./components/dashboard/Models/CalendarBooking";
import { encryptData } from "./components/common/encryption-decryption";
import ClaimTracker from "./admin/components/claim/claimTracker";

// import Home from "./form11/components/home";
// import OtpSubmit from "./form11/components/Otp-submit";
// import {KycContact} from "./form11/components/Kyc-contact";
// import { KycUploadProof } from "./form11/components/Kyc-upload-proof";
// import { KycBank } from "./form11/components/kyc-bank";
// import { Kyc } from "./form11/components/Kyc";
// import { FinalReport } from "./form11/components/Final-report";
// import LoginForm11 from "./form11/components/Login";

function App() {
  const location = useLocation();
  const [newUIEnabled, setNewUIEnabled] = useState<boolean | null>(null);
  const hideHeaderAndMarginRoutes = ['/operation/uan-list', '/operation/monitering-api','/operation/view-details', '/operation/ops-user', '/operation/archived-module', '/operation/cron-log', '/operation/grievance-tracker', '/fynprint-payment', '/operation/claim-tracker'];
  const shouldHideHeader = hideHeaderAndMarginRoutes.includes(location.pathname);
  const state = location.state as { fromArchive?: boolean; archiveData?: any } | undefined;

  useEffect(() => {
    (async () => {
      try {
        const { allTogglers = [] } = await get("/data/toggle/keys");
        const toggle = allTogglers.find((t: any) => t.type === "new-ui");
        const calendlyToggle = allTogglers.find((t: any) => t.type === "tidycal-calendar");
        localStorage.setItem("calendlyToggle", encryptData(calendlyToggle?.isEnabled));
        setNewUIEnabled(!!toggle?.isEnabled);   // true | false
      } catch {
        setNewUIEnabled(false);                 // fail‑safe: old UI
      }
    })();
  }, [])

  const isOperationRoute = location.pathname.startsWith("/operation");
  const isFynprintPaymentRoute = location.pathname.startsWith("/fynprint-payment");

  if (newUIEnabled === null && !isOperationRoute && !isFynprintPaymentRoute) {
    return <LoaderCard />;
  }

  return (
    <div className="appContainer">
      <ScrollTop />
      <ScrollToTop />
      <AutoLogoutHandler />
      {window.location.pathname.includes('/form11') || shouldHideHeader ? null : <Header />}
      <div className="contentWrapper" style={{ marginTop: window.location.pathname.includes('/form11') || shouldHideHeader ? '0' : '3rem' }}>
        <Routes>
          {newUIEnabled ? (
            // ---------- NEW On‑boarding ----------
            <>
              <Route path="/" element={<GuestGuard><FinrightOtp /></GuestGuard>} />
              <Route path="/enter-name" element={<TellYourName />} />
              <Route path="/how-can-help" element={<HowCanHelpUser />} />
            </>
          ) : (
            // ---------- CURRENT On‑boarding ----------
            <>
              <Route path="/" element={<GuestGuard><EnterOtp /></GuestGuard>} />
              <Route path="/searching-uan" element={<AuthGuard><SearchingUan /></AuthGuard>} />
              <Route path="/uan-list" element={<AuthGuard><LoginMultipleUan /></AuthGuard>} />
              <Route path="/how-can-help" element={<AuthGuard><HowCanHelp /></AuthGuard>} />
            </>
          )}
          <Route path="/employment-status" element={<AuthGuard><EmployementStatus /></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><PFPassbookMainPage /></AuthGuard>} />
          <Route path="/transaction-history" element={<AuthGuard><PassboolReport /></AuthGuard>} />
          <Route path="/risk-reports" element={<AuthGuard><HighRiskReport /></AuthGuard>} />
          <Route path="/login-uan" element={<AuthGuard><Login /></AuthGuard>} />
          <Route path='/forgot-password' element={<AuthGuard><ForgotPassword /></AuthGuard>} />
          <Route path="/submit-otp-scrapper" element={<AuthGuard><ScrapperOtp /></AuthGuard>} />
          <Route path="/epfo-down" element={<AuthGuard><EPFODownNew /></AuthGuard>} />
          {/* <Route path="/user-support" element={<AuthGuard><SupportUser /></AuthGuard>} /> */}
          <Route path="/kyc-details" element={<AuthGuard><KycDetails /></AuthGuard>} />
          <Route path="/kyc-details/bank" element={<AuthGuard><KycDetailsBank /></AuthGuard>} />
          
          <Route path="/operation/login" element={<AdminloginRoute><AdminLogin /></AdminloginRoute>} />
          <Route path="/operation/uan-list" element={<AdminRoutes><ViewDetailsByUan
               isFromArchive={state?.fromArchive || false} 
               archiveData={state?.archiveData} 
           /></AdminRoutes>} />
          <Route path="/operation/view-details" element={<AdminRoutes><SimpleEmployeeReport /></AdminRoutes>} />
          <Route path="/operation/monitering-api" element={<AdminRoutes><MonitoringOpsDashboard /></AdminRoutes>} />
          <Route path="/operation/ops-user" element={<AdminRoutes><AddOpsUser /></AdminRoutes>} />
          <Route path="/operation/archived-module" element={<AdminRoutes><ArchivedModule /></AdminRoutes>} />
          <Route path="/operation/cron-log" element={<AdminRoutes><CronLogViewer /></AdminRoutes>} />
          <Route path="/operation/grievance-tracker" element={<AdminRoutes><GrievanceTracker /></AdminRoutes>} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/cmp" element={<CMP />} />
          <Route path="/finding-details" element={<SearchingFynprintDetails/>}/>
          <Route path="/payment-initiate" element={<AuthGuard><PaymentInitiate/></AuthGuard>}/>
          <Route path="/fynprint-payment" element={<FynprintPayment/>}/>
          <Route path="/operation/claim-tracker" element={<AdminRoutes><ClaimTracker/></AdminRoutes>} />

          {/* <Route path="express-withdraw" element={<ExpressWithdraw />} /> */}
          {/* <Route path="/check" element={<Checking />} /> */}
          {/* Claim my pf  */}
          {/* EPFO Routes */}
          {/* <Route path='/claim-epfo/login' element={<EpfoLogin />} />
            {/* Claim My PF Routes */}
          {/* <Route path="express-withdraw" element={<ExpressWithdraw />} />
            <Route path='/claim-epfo/login' element={<EpfoLogin />} />
            <Route path='/claim-epfo/login-otp' element={<LoginOTPPage />} />
            <Route path='/claim-epfo/update-kyc-page' element={<UpdateKyc />} />
            <Route path='/claim-epfo/invalid-credential' element={<EPFOCredentialError />} />
            <Route path='/claim-epfo/no-bank-details' element={<NoBankDetails />} />
            <Route path='/claim-epfo/final-page' element={<FinalClaimPage />} />
            <Route path='/claim-epfo/error-page' element={<ErrorPage />} /> */}

          {/* Form 11 Routes  */}
          {/* <Route path="/form11" element={<Home />} />
            <Route path="/form11/login" element={<LoginForm11 />} />
            <Route path="/form11/otp-submit" element={<OtpSubmit />} />
            <Route path="/form11/kyc" element={<Kyc />} />
            <Route path="/form11/kyc-contact" element={<KycContact />} />
            <Route path="/form11/kyc-bank" element={<KycBank />} />
            <Route path="/form11/kyc-upload-proof" element={<KycUploadProof />} />
            <Route path="/form11/final-report" element={<FinalReport />} /> */}

            {/* Call Booking Routes */}
            <Route path="/call-booking" element={<EPFOLogin />} />
            <Route path="/call-booking/otp" element={<GuestGuard><OTPPage /></GuestGuard>} />

            <Route path="/payment-auth" element={<EPFOLogin/>}/>
            <Route path="/payment-auth/otp" element={<GuestGuard><OTPPage/></GuestGuard>}/>
            <Route path="/booking" element={<CalendarBooking/>}/>
          </Routes>
      </div>
    </div>
  );
}

export default App
