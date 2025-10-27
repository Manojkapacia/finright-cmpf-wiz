import Styles from "./styles/forgot-password.module.css"
import { Link, ChatSquareDots, Key, PersonCheck, Clipboard, CreditCard } from "react-bootstrap-icons";
import { CustomButton, CustomOutlinedButton } from '../../helpers/helpers';
import { useLocation, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUan = location.state?.currentUan || '';
    const goToEpfoPortal = () => {
        window.open("https://unifiedportal-mem.epfindia.gov.in/memberinterface", "_blank");
    }

    return (
        <div className="container-fluid ">
            <div className="row  d-flex justify-content-center align-items-center">
                <div className="col-md-7  col-lg-6 mt-4 mt-lg-5">
                    <div className="row">
                        <span className={`${Styles.labelHeading}`} style={{ lineHeight: '1.2' }}>Follow the steps below to reset your password</span>
                        <div className='col-md-6'>
                            <div className="card border-0 shadow-sm my-2 my-lg-3  d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <Link className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-1</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Go to EPFO website</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm  d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <Key className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-2</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Click on Forgot Password</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm my-2 my-lg-3 d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <PersonCheck className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-3</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Enter Your UAN and Captcha</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm  d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <Clipboard className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-4</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Enter Name, Date of Birth, Gender and
                                            click in verify</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="card border-0 shadow-sm my-2 my-lg-3  d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '6rem' }}>
                                <div className="card-body pe-0 d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <CreditCard className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-5</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Enter Captcha code, Aadhaar Number, give consent and click 'verify'</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <ChatSquareDots className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-6</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>verify the Mobile Number on which OTP will be sent</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm my-2 my-lg-3 d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <ChatSquareDots className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-7</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Submit the OTP that you received</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card border-0 shadow-sm d-flex justify-content-center align-items-start" style={{ backgroundColor: '#F9F9F9', height: '5.3rem' }}>
                                <div className="card-body d-flex align-items">
                                    <div className='iconbody d-flex justify-content-center align-items-center'>
                                        <ChatSquareDots className={`${Styles.iconSet} p-2`} size={30} title="Chat Icon" />
                                    </div>
                                    <div className={`${Styles.textClasses} ms-3`}>
                                        <span className={`${Styles.iconHeading}`}>Step-8</span><br></br>
                                        <span className={`${Styles.iconSubHeading}`}>Enter new password and click on 'Confirm'</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-center mt-4">
                        <CustomButton name="Go to EPFO Portal" onClick={goToEpfoPortal} />
                    </div>
                    <div className="d-flex justify-content-center my-3">
                        <CustomOutlinedButton name="Back to login" onClick={() => navigate('/login-uan', {state: {currentUan}})} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;