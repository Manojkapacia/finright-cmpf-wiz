
import "./App.css"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SearchingUan from "./components/user-registeration/SearchingUan";
import LoginMultipleUan from "./components/user-registeration/LoginMultipleUan";
import EmployementStatus from "./components/user-registeration/EmployementStatus";
import OtherUanChooseUan from "./components/user-registeration/OtherUanChooseUan";
import EnterOtp from "./components/user-registeration/EnterOtp";
import PFPassbookMainPage from "./features/dashboard/page/PFPassbookMainPage";
import Login from "./components/auth-full-scrapper/login";
// import EpfoDown from "./components/auth-full-scrapper/EpfoDown";
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
import ExpressWithdraw from "./features/dashboard/page/ExpressWithdraw";
import Checking from "./Checking";

import {
  EpfoLogin,
} from './components/claim-my-pf/epfo/index';
import LoginOTPPage from "./components/claim-my-pf/LoginOTPPage";
import { FinalClaimPage } from "./components/claim-my-pf/FinalClaimPage";
import { ErrorPage } from "./components/claim-my-pf/ErrorPage";
import UpdateKyc from "./components/claim-my-pf/UpdateKyc";
import NoBankDetails from "./components/claim-my-pf/NoBankDetails";
import EPFOCredentialError from "./components/claim-my-pf/EPFOCredentialError";


function App() {
  return (
    <div className="appContainer">
      <BrowserRouter>
       <ScrollTop/>
       <ScrollToTop/>
       <AutoLogoutHandler/>
        <Header />
        <div className="contentWrapper" style={{marginTop: '3rem' }}>
          <Routes>
            <Route path="/" element={<GuestGuard><EnterOtp /></GuestGuard>} />
            <Route path="/searching-uan" element={<AuthGuard><SearchingUan /></AuthGuard>} />
            <Route path="/uan-list" element={<AuthGuard><LoginMultipleUan /></AuthGuard>} />
            {/* <Route path="/uan-list" element={<GuestGuard><LoginMultipleUan /></GuestGuard>} /> */}
            <Route path="/employment-status" element={<AuthGuard><EmployementStatus /></AuthGuard>} />
            <Route path="/uan-list-other" element={<GuestGuard><OtherUanChooseUan /></GuestGuard>} />
            <Route path="/dashboard" element={<AuthGuard><PFPassbookMainPage /></AuthGuard>} />
            <Route path="/transaction-history" element={<AuthGuard><PassboolReport /></AuthGuard>} />
            <Route path="/risk-reports" element={<AuthGuard><HighRiskReport /></AuthGuard>} />
            {/* <Route path="/login-uan" element={<AuthGuardScrapper><Login /></AuthGuardScrapper>} /> */}
            <Route path="/login-uan" element={<AuthGuard><Login /></AuthGuard>} />
            <Route path='/forgot-password' element={<AuthGuard><ForgotPassword/></AuthGuard>} />
            <Route path="/submit-otp-scrapper" element={<ScrapperOtp />} />
            <Route path="/epfo-down" element={<AuthGuard><EPFODownNew /></AuthGuard>} />
            <Route path="/how-can-help" element={<AuthGuard><HowCanHelp /></AuthGuard>} />
            <Route path="/kyc-details" element={<AuthGuard><KycDetails /></AuthGuard>} />
            <Route path="/kyc-details/bank" element={<AuthGuard><KycDetailsBank /></AuthGuard>} />
            <Route path="/operation/login" element={<AdminLogin/>} />
            <Route path="/operation/view-details" element={<ViewDetailsByUan />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/cmp" element={<CMP />} />
            <Route path="express-withdraw" element={<ExpressWithdraw/>}/>
            <Route path="/check" element={<Checking />} />


        {/* Claim my pf  */}
        {/* EPFO Routes */}
        <Route path='/claim-epfo/login' element={<EpfoLogin />} />
        <Route path='/claim-epfo/login-otp' element={<LoginOTPPage />} />
        <Route path='/claim-epfo/update-kyc-page' element={<UpdateKyc />} />
        <Route path='/claim-epfo/invalid-credential' element={<EPFOCredentialError />} />
        <Route path='/claim-epfo/no-bank-details' element={<NoBankDetails />} />
        <Route path='/claim-epfo/final-page' element={<FinalClaimPage />} />
        <Route path='/claim-epfo/error-page' element={<ErrorPage />} />
      </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App
