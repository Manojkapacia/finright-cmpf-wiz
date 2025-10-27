import React from 'react';
import CoustomCard from '../common/CustomCard';
import form11Image from './../assets/form11.svg'
import { ReusableButton } from '../common/Helper';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const handleStartForm = () => {
        navigate('/form11/login')
    };


    return (
        <div className="container-fluid px-2">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4" style={{ backgroundColor: '#e5ecff', }}>
                    <Header />
                    <CoustomCard />

                    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                        <div className="card-body d-flex justify-content-between align-items-center px-3 py-2">
                            <div className="" style={{ fontSize: '0.8rem' }}>
                                <p className="mb-0">Hello! Filling Form 11 is an important activity for your employment.
                                    Form 11 is a critical document in the EPF onboarding process, with major
                                    implications on your Employees’ Pension Scheme (EPS) eligibility. An
                                    incorrect declaration can lead to long-term financial and bureaucratic
                                    problems.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF', borderRadius: "1rem" }}>
                        <div className="card-body d-flex justify-content-between align-items-center px-3 py-2">
                            <div className="" style={{ fontSize: '0.8rem' }}>
                                <p className="mb-0">Please keep following things handy before filling the form:
                                </p>
                                <ol className="ps-3 mb-0">
                                    <li>Your UAN number</li>
                                    <li>EPFO portal password</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <ReusableButton text="Start Filling Form 11" onClick={handleStartForm} />

                    <img
                        src={form11Image}
                        alt="Form illustration"
                        className="img-fluid w-100 mt-3"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
