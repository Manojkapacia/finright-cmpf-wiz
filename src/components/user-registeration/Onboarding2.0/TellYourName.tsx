import { useEffect, useState } from "react";
import { CustomButton, TitleSubtitleBlock, PFInfoSlider } from "./common/helpers";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { decryptData, encryptData } from "../../common/encryption-decryption";
import ToastMessage from "../../common/toast-message";
import { ToTitleCase } from "../../common/title-case";
import './../../../App.css'

const TellYourName = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState<'Mr.' | 'Ms.'>('Mr.');
  const navigate = useNavigate();
  const location = useLocation()
  const [message, setMessage] = useState({ type: '', content: '' })
  const [name, setName] = useState('')
  let { mobile_number } = location.state || {};
  
  useEffect(() => {
    const mobileNumber = decryptData(localStorage.getItem("user_mobile"));
    if(mobileNumber){
      mobile_number = mobile_number || mobileNumber;
    }
  }, [mobile_number])

    const handleSelect = (title: 'Mr.' | 'Ms.') => {
        setSelectedTitle(title);
        setDropdownOpen(false);
    };

    const handleNameSubmit = () => {
        if (!name.trim()) {
            setMessage({ type: 'error', content: 'Please enter your name' });
            return;
          }
          localStorage.setItem("user_name", encryptData(name));
          navigate("/how-can-help", {
            state: {
              mobile_number,
              name: `${selectedTitle} ${ToTitleCase(name.trim())}`,
            },
          });   
         }

    return (
        <>
        {message.type && <ToastMessage message={message.content} type={message.type} />}
        <div className="container-fluid p-0 responsive-height">
            <div className="row g-0" style={{ height: "100%" }}>
                <div
                    className="col-md-4 offset-md-4 d-flex flex-column"
                    style={{
                        backgroundColor: "#FFFFFF",
                        height: "100%",
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <div className="d-flex flex-column flex-grow-1">
                        {/* Title remains at top */}
                        <div className="pt-5">

                            <TitleSubtitleBlock
                                title="tell us about you"
                            />
                        </div>

                        {/* Card centered in remaining space */}
                        <div className="d-flex justify-content-center align-items-center flex-grow-1 px-4" style={{ marginBottom: '45vh' }}>
                            {/* <PFInfoReminderCard activeIndex={1} /> */}
                            <PFInfoSlider initialIndex={2} /> 
                        </div>
                    </div>


                    <div
                        className="position-fixed bottom-0 start-50 d-flex flex-column"
                        style={{
                            transform: 'translateX(-50%)',
                            borderTopLeftRadius: '1.25rem', // 20px
                            borderTopRightRadius: '1.25rem',
                            height: '45vh', // 280px
                            maxWidth: '31.25rem', // 500px
                            width: '100%',
                            padding: '1.25rem', // 20px
                            gap: '0.625rem', // 10px
                            zIndex: 1050,
                            backgroundColor: '#4255CB'
                        }}
                    >
                        {/* Label */}
                        <div
                            className="text-white text-center mt-3"
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 400,
                                lineHeight: '1',
                            }}
                        >
                            Please enter your full name
                        </div>

                        {/* Dropdown + Input Section */}
                        <div className="d-flex flex-grow-1 align-items-center justify-content-center w-100 px-3">
                        <div
                            className="d-flex align-items-center justify-content-center w-100"
                            style={{ gap: '0.625rem', position: 'relative' }}
                        >
                            <div
                                className="d-flex align-items-center justify-content-between px-3 position-relative"
                                style={{
                                    borderRadius: '6.25rem',
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    height: '2.75rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    width: '5rem',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                                onClick={() => setDropdownOpen((prev) => !prev)}
                            >
                                <span>{selectedTitle}</span>
                                {dropdownOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                {dropdownOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '2.75rem',
                                            left: 0,
                                            width: '100%',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '0.625rem',
                                            boxShadow: '0 0.25rem 0.5rem rgba(0,0,0,0.1)',
                                            zIndex: 10,
                                        }}
                                    >
                                        {['Mr.', 'Ms.'].map((title) => (
                                            <div
                                                key={title}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // <-- this line is key!
                                                    handleSelect(title as 'Mr.' | 'Ms.');
                                                }}
                                                style={{
                                                    padding: '0.625rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {title}
                                            </div>
                                        ))}
                                    </div>
                                )}


                            </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type your name here"
                                    value={name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const alphabetOnly = value.replace(/[^a-zA-Z\s]/g, ''); // allows letters and spaces only
                                        setName(alphabetOnly);
                                      }}
                                    style={{
                                        borderRadius: '6.25rem',
                                        padding: '0.625rem 1.875rem',
                                        fontSize: '1rem',
                                        fontWeight: 400,
                                        flex: 1,
                                    }}
                                />

                        </div>
                        </div>
                        <div
                            className="mt-auto"
                        >
                            <CustomButton label="Next" onClick={handleNameSubmit} />

                        </div>
                    </div>

                </div>
            </div>
        </div>
        </>
    );
};

export default TellYourName;
