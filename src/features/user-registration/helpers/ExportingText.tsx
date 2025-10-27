import React, { useEffect, useState } from "react";
import color from "./../../../styles/colors";
import "./../../../styles/global.css";
import Epf_Member_Logo from "../../../assets/pf-member-logo.png";
import Umang from "../../../assets/umang.png";
import {
  CurrentWorkingCompanyProps,
  UserRegistrationEpfMemberLogoTextProps,
  UserRegistrationOtpInputProps,
  UserRegistrationTextContentProps,
} from "../../../components/interface/UserRegisteration.interface";
import { FaArrowRightLong } from "react-icons/fa6";
import "./ExportingText.css";
import { calculateServiceDetails } from "../../../components/common/dates-converter";
import { BiChevronRight } from "react-icons/bi";
import MESSAGES from "../../../components/constant/message";
import { FaRegEdit } from "react-icons/fa";
import { decryptData } from "../../../components/common/encryption-decryption";
import { AiFillEdit } from "react-icons/ai";
import { AnimatePresence } from "framer-motion";
import { EmploymentOptionsModal } from "./../../../components/user-registeration/EmployementPopupStatus";
import { ToTitleCase } from "../../../components/common/title-case";
import EmploymentStatusSelectorSlider from "../../../components/dashboard/Models/EmploymentStatusSelectorModel";

export const UserRegisterTextContent = () => {
  return (
    <div className="user-register-text text-center p-2">
      <p className="title fw-semibold text-dark text-center">
        Secure your Provident Fund
      </p>

      <p className="subtitle fw-semibold  pe-2  ps-2  text-center">
        Uncover hidden issues and ensure access to your funds
      </p>
    </div>
  );
};

export const UserRegisterationOtherUanTextContent = ({ headText,
  singleviewText, }: UserRegistrationTextContentProps) => {
  return (
    <div className="user-register-text text-center p-2">
      <p className="title fw-semibold text-dark   text-center" style={{fontSize: '2rem', fontWeight: '600', lineHeight:'1.3'}}>
        {headText}
      </p>

      <p className="subtitle fw-semibold  pe-2  ps-2  text-center">
        {singleviewText}

      </p>
    </div>
  );
};


export const EpfMemberLogo = ({
  epfMemberLogoTextContent,
}: UserRegistrationEpfMemberLogoTextProps) => {
  return (
    <div className="text-center">
      <img
        src={Epf_Member_Logo}
        alt="uan-member-logo"
        className="img-fluid rounded-circle border border-3"
        style={{ width: "100px", height: "100px" }}
      />
      <p
        className="fw-semibold text-center mt-2"
        style={{
          fontSize: "24px",
          lineHeight: "100%",
          letterSpacing: "0%",
        }}
      >
        {epfMemberLogoTextContent}{" "}
      </p>
    </div>
  );
};

export const ChooseUanContainer = (props: any) => {
  const serviceDetails: any = calculateServiceDetails(
    props?.uanItem?.employment_history
  );

  return (
    <div
      className="bg-white rounded-2 px-4 py-3 gap-2 mt-2 d-flex flex-column justify-content-center clickeffect"
      style={{
        width: "100%",
        minWidth: "17.1875rem", // 275px -> rem
        maxWidth: "19.5625rem", // 345px -> rem
        borderRadius: "5px",
        gap: "0.3125rem",
        overflow: "hidden",
        cursor: "pointer"
      }}
      onClick={props?.onClick}
    >
      <div
        className="fw-normal text-dark"
        style={{
          fontWeight: "400",
          fontSize: "20px",
          lineHeight: "100%",
          color: "#858585",
          textAlign: "left",
          wordBreak: "break-word",
          whiteSpace: "normal",
          maxWidth: "231px",
          width: "100%"
        }}
      >
        {props?.uanItem?.uan}
      </div>

      {props?.uanItem?.employment_history?.length > 0 &&
        <>
          <div
            className="text-secondary fw-normal mt-1"
            style={{
              fontWeight: "400",
              fontSize: "16px",
              lineHeight: "100%",
              color: "#858585",
              maxWidth: "231px",
              width: "100%",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            Service: {serviceDetails?.service}
          </div>

          <div
            className="text-secondary fw-normal mt-1 mb-1"
            style={{
              fontWeight: "400",
              fontSize: "16px",
              lineHeight: "100%",
              color: "#858585",
              maxWidth: "231px",
              width: "100%",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {serviceDetails?.year}
          </div>
        </>
      }
    </div>
  );
};


export const ChooseUanContainerSingle = (props: any) => {
  const serviceDetails: any = calculateServiceDetails(
    props?.uanItem?.employment_history
  );

  return (
    <div
    className="bg-white rounded-2 px-4 py-3 d-flex flex-column justify-content-center align-items-center"
    style={{
      width: "100%",
      minWidth: "17.1875rem", // 275px
      maxWidth: "19.5625rem", // 313px
      borderRadius: "0.3125rem", // 5px
      gap: "0.3125rem", // 5px
      overflow: "hidden",
    }}
    onClick={props?.onClick}
  >
    <div
      className="fw-normal text-dark"
      style={{
        fontWeight: "400",
        fontSize: "1.25rem", // 20px
        lineHeight: "100%",
        width: "14.4375rem", // 231px
        color: "#858585",
        textAlign: "center",
        wordBreak: "break-word",
        letterSpacing:"0.05rem"
      }}
    >
      {props?.uanItem?.uan}
    </div>
  
    {props?.uanItem?.employment_history?.length > 0 && (
      <>
        <div
          className="text-secondary fw-normal mt-1"
          style={{
            fontWeight: "400",
            fontSize: "1rem", // 16px
            lineHeight: "100%",
            color: "#858585",
            width: "13.4375rem", // 231px
            textAlign: "center",
          }}
        >
          {serviceDetails?.service}
        </div>
        <div
          className="text-secondary fw-normal mt-1 mb-1"
          style={{
            fontWeight: "400",
            fontSize: "1rem", // 16px
            lineHeight: "100%",
            color: "#858585",
            width: "14.4375rem", // 231px
            textAlign: "center",
          }}
        >
          {serviceDetails?.year}
        </div>
      </>
    )}
  </div>
  
  
  );
};
export const NoUanFoundContainer = () => {
  const user_mobile = decryptData(localStorage.getItem('user_mobile'))
  const handleChangeMobileNumber = () => {
    localStorage.clear()
    window.location.href = MESSAGES.CHEKC_MY_PF_URL
  }

  return (
    <>
      <div
      className="rounded-2 px-4 py-3 d-flex align-items-start justify-content-start "
      style={{
        width: "100%",
        minWidth: "17.1875rem", // 275px
        maxWidth: "19.5625rem", // 345px
        gap: "0.3125rem", // 5px
        overflow: "hidden",
      }}
    >
      <div
        className="bg-white px-2 py-3 d-flex align-items-center justify-content-center"
        style={{
          width: "100%",
          borderRadius: "62.5rem", // 1000px
          backgroundColor: "#fff",
        }}
      >
        <div className="d-flex align-items-center justify-content-center clickeffect" style={{ gap: "0.5rem" }}         onClick={handleChangeMobileNumber}
        >
          <p
            className="text-dark m-0"
            style={{
              fontWeight: "400",
              fontSize: "1.1rem",
              lineHeight: "120%",
              wordBreak: "break-word",
            }}
          >
            {user_mobile}
          </p>
          <FaRegEdit
            style={{
              fontSize: "1.1rem",
              color: "#000",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </div>
      
    </>
  );
};



export const DataEncryption = () => {
  return (
    <div
      className="text-secondary text-center fw-normal mb-1 mt-1"
      style={{ fontSize: "0.75rem" }}
    >
      Your data is protected by 256 bit AES encryption
    </div>
  );
};
export const PoweredBy = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center ">
      <img
        src={Umang}
        alt="Powered By Umang"
        className="img-fluid"
        style={{ width: "2rem", height: "2rem" }} // 32px → 2rem
      />

      <div
        className="text-center fw-light"
        style={{ fontSize: "0.625rem", color: "#999999" }} // 10px → 0.625rem
      >
        Powered by: Umang
      </div>
    </div>
  );
};

export const UserRegistrationSubmitButton = (props: any) => {
  const [showIframe, setShowIframe] = useState(false);
  return (
    <div className="d-flex flex-column align-items-center gap-2">
      <button
        className={`btn btn-primary ${props.disabled ? "opacity-50 cursor-not-allowed" : ""
          } btn text-white fw-bold clickeffect pt-2 pb-2`}
        disabled={props.disabled}
        style={{
          width: "330px",
          height: "51px",
          maxHeight: "72px",
          borderRadius: "1000px",
          backgroundColor: "#00124F",
          padding: "16px 32px",

        }}
        onClick={props.onClick}
      >
        Submit
      </button>

      <div
        className="text-center text-secondary"
        style={{
          fontWeight: "400",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
          width: "345px",
        }}
      >
        By Log in, you agree to our{" "}
        <span className="text-primary" style={{ cursor: "pointer" }}
          onClick={() => setShowIframe(true)}>Terms & Conditions
        </span>
      </div>
      {showIframe && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Terms & Conditions</h5>
                <button type="button" className="btn-close" onClick={() => setShowIframe(false)}></button>
              </div>
              <div className="modal-body">
                <iframe
                  src="https://www.finright.in/terms-conditions"
                  style={{
                    width: "100%",
                    height: "30rem",
                    border: "none",
                  }}
                  title="Iframe Example"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export const UserRegistrationOtpInput = ({
  resendText,
  timerText,
}: UserRegistrationOtpInputProps) => {
  const OTP_LENGTH = 6; // 🔹 Define OTP length here to fix the error
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index] === "") {
        // 🔹 Move focus back and clear previous box
        if (index > 0) {
          newOtp[index - 1] = "";
          setOtp(newOtp);
          document.getElementById(`otp-input-${index - 1}`)?.focus();
        }
      } else {
        // 🔹 Just clear current box
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // 🔹 Handle Arrow Key Navigation
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      (e.target.nextSibling as HTMLInputElement)?.focus();
    }
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3 py-3">
      <div
        className="text-black text-center fw-bold p-2"
        style={{
          width: "325px",
          height: "29px",
        }}
      >
        Enter OTP
      </div>

      <div
        className="text-center"
        style={{
          fontWeight: "400",
          fontSize: "16px",
          width: "385px",
        }}
      >
        OTP Sent to your mobile number{" "}
        <span className="fw-bold">XXXXXX1234</span>
      </div>

      <div className="d-flex justify-content-center gap-2">
        {otp.map((data, index) => (
          <input
            key={index}
            type="number"
            maxLength={1}
            value={data}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="text-center border-0 border-bottom border-dark"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "5px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
              borderBottomWidth: "2.5px",
              backgroundColor: "#FFFFFF",
            }}
          />
        ))}
      </div>
      <div
        className="text-center"
        style={{
          fontWeight: "400",
          fontSize: "16px",
          width: "300px",
        }}
      >
        {`${resendText}: `}
        <span className="fw-bold" style={{ color: "#304DFF" }}>
          {`${timerText}`}
        </span>
      </div>

    </div>
  );
};

export const SkipButton = (props: any) => {
  return (
    <div className="d-flex flex-column align-items-center gap-2 mt-4">
      <button
        className="btn text-dark d-flex justify-content-center align-items-center gap-2 "
        style={{
          border: "1px solid #00124F",
          width: "350px",
          height: "51px",
          maxHeight: "72px",
          borderRadius: "1000px",
          paddingTop: "16px",
          paddingRight: "32px",
          paddingBottom: "16px",
          paddingLeft: "32px",
          backgroundColor: "transparent",
        }}
        onClick={props.onClick}
      >
        Skip <FaArrowRightLong />
      </button>

      <p
        className="text-center text-dark"
        style={{
          fontWeight: "400",
          fontSize: "16px",
          lineHeight: "100%",
          letterSpacing: "0%",
          textAlign: "center",
          width: "345px",
          height: "19px",
          marginBottom: "0",
        }}
      >
        You will be able to fetch details later also
      </p>
    </div>
  );
};

// Your styled component
export const CurrentWorkingCompany = ({ currentEmploymentUanData, onCompanySelect, setIsModalOpen, type }: CurrentWorkingCompanyProps) => {  
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [hasUserSelected, setHasUserSelected] = useState(false); 
  
  const displayNameMap: Record<string, string> = {
  "I am retired": "Retired",
  "I am currently not Working": "Not Working",
  "I have multiple UANs": "Multiple UANs",
};

  const getDynamicTitle = (company: string) => {
  const normalized = company?.toLowerCase();

  if (["retired", "i am retired", "not working"].includes(normalized)) {
    return "I am currently : ";
  } else if (normalized === "multiple uans") {
    return "I have currently : ";
  }else if (normalized === "pf not deducted by current employer") {
    return
  } else if (company) {
    return "Working at :";
  }
};

  useEffect(() => {
  if (currentEmploymentUanData?.length > 0 && !hasUserSelected) {
    const getDefaultSelectedCompany = () => {
      if(currentEmploymentUanData[0]?.isFromFullScrapper) {
        const filtered = currentEmploymentUanData[0]?.serviceHistory.filter((item: any) => {
          const joiningDate = item.details["Joining Date"];
          return joiningDate && joiningDate !== "NA" && joiningDate !== "N/A" && joiningDate !== "-" && joiningDate.trim() !== "";
        });        
        if (filtered.length === 0) return currentEmploymentUanData[0]?.serviceHistory[0]?.company;

        const activeEmployers = filtered.filter((item:any) => {
          const exitDate = item.details["Exit Date"];
          return !exitDate || exitDate === "NA" || exitDate === "N/A" || exitDate === "-" || exitDate.trim() === "";
        });

        if (activeEmployers.length > 0) {
          return activeEmployers.reduce((latest:any, curr:any) =>
            new Date(curr.details["Joining Date"]!) > new Date(latest.details["Joining Date"]!)
              ? curr
              : latest
          ).company;
        }
        return "Retired";
      } else {
        const filtered = currentEmploymentUanData.filter((item:any) => item.date_of_joining !== null);
        if (filtered.length === 0) return currentEmploymentUanData[0]?.establishment_name;
        const activeEmployers = filtered.filter((item:any) => item.date_of_exit === null);
        if (activeEmployers.length > 0) {
          return activeEmployers.reduce((latest:any, curr:any) =>
            new Date(curr.date_of_joining!) > new Date(latest.date_of_joining!)
              ? curr
              : latest
          ).establishment_name;
        }
        return "Retired";
      }
    };

    const defaultSelected = getDefaultSelectedCompany();
    setSelectedCompany(ToTitleCase(defaultSelected));
    onCompanySelect(defaultSelected);
  }
}, [currentEmploymentUanData, hasUserSelected]);

  const handleOptionSelect = (option: string) => {
    const displayValue = displayNameMap[option] || option; // Map if matched, else original
    setSelectedCompany(displayValue);
    onCompanySelect(option);
    setHasUserSelected(true);
    setShowModal(false); // close popup
    // setIsModalOpen(false)
  };

  useEffect(() => {
  setIsModalOpen(showModal);
}, [showModal]);

  const generateOptions = () => {
    let companyNames:any = []

    if(currentEmploymentUanData[0]?.isFromFullScrapper) {
      const dojNullCompanies = currentEmploymentUanData[0]?.serviceHistory.filter((emp:any) => {
        const joiningDate = emp.details["Joining Date"];
        return !joiningDate || joiningDate === "NA" || joiningDate === "N/A" || joiningDate === "-" || joiningDate.trim() === "";
      });

      const currentlyWorkingCompanies = currentEmploymentUanData[0]?.serviceHistory.filter(
        (emp:any) => {
          const joiningDate = emp.details["Joining Date"];
          const exitDate = emp.details["Exit Date"];
          return (joiningDate && joiningDate !== "NA" && joiningDate !== "N/A" && joiningDate !== "-" && joiningDate.trim() !== "") && (!exitDate || exitDate == "N/A" || exitDate == "NA" || exitDate == "-" && exitDate.trim() == "");
        } 
      );

      const latestCompany = currentlyWorkingCompanies.sort((a:any, b:any) =>
        new Date(b.details["Joining Date"]).getTime() - new Date(a.details["Joining Date"]).getTime()
      )[0];
    
      const combinedCompanies = [
         ...(latestCompany ? [latestCompany] : []),
        ...dojNullCompanies
      ];

      // 5. Convert to unique title-cased company names
      companyNames = [...new Set(
        combinedCompanies.map(emp => ToTitleCase(emp.company))
      )];
    } else {
      const dojNullCompanies = currentEmploymentUanData.filter((emp:any) => emp.date_of_joining === null);

      const currentlyWorkingCompanies = currentEmploymentUanData.filter(
        (emp:any) => emp.date_of_joining !== null && emp.date_of_exit === null
      );
    
      const latestCompany = currentlyWorkingCompanies.sort((a:any, b:any) =>
        new Date(b.date_of_joining).getTime() - new Date(a.date_of_joining).getTime()
      )[0];
    
      const combinedCompanies = [
         ...(latestCompany ? [latestCompany] : []),
        ...dojNullCompanies
      ];
      // 5. Convert to unique title-cased company names
      companyNames = [...new Set(
        combinedCompanies.map(emp => ToTitleCase(emp.establishment_name))
      )];
    }
    
  // 6. Add fixed options
  return [
    ...companyNames,
    "I am retired",
    "I am currently not Working",
    "I have multiple UANs",
    "PF not deducted by current employer"
  ];
};

  return (
  //   <div
  //   className="d-flex align-items-center justify-content-between px-4 py-2 mb-4 mx-auto"
  //   style={{
  //     border: "1px solid #D9D9D9",
  //     borderRadius: "15px",
  //     backgroundColor: "#F8F8F8",
  //     // width: "90%",
  //   }}
  // >
  //   <div style={{ textAlign: "left", flex: 1 }}>
  //     {getDynamicTitle(selectedCompany) && (
  //       <span style={{ fontSize: "1.13rem" }}>
  //         {getDynamicTitle(selectedCompany)}<br></br>
  //       </span>
  //     )}
  //     <span style={{ color: "#6D75A7", fontSize: "1rem" }}>
  //       {selectedCompany}
  //     </span>
  //   </div>

  //   <button
  //     className="d-flex align-items-center justify-content-center"
  //     onClick={() => setShowModal(!showModal)}
  //     style={{
  //       backgroundColor: "#00124F",
  //       border: "none",
  //       borderRadius: "50%",
  //       width: "2rem",
  //       height: "2rem",
  //       color: "#ffffff",
  //       cursor: "pointer",
  //       // boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  //     }}
  //   >
  //     <AiFillEdit size={16} />
  //   </button>
  //   {showModal && (
  //     <EmploymentStatusSelectorSlider onSelect={handleOptionSelect} options={generateOptions()} onClose={() => setShowModal(false)} />
  //   )}
  // </div>
    <>
    {type !== "full" ? (
     <div
      className="d-flex align-items-center justify-content-between px-4 py-2 mb-4 mx-auto"
      style={{
        border: "1px solid #D9D9D9",
        borderRadius: "15px",
        backgroundColor: "#F8F8F8",
        // width: "90%",
      }}
    >
      <div style={{ textAlign: "left", flex: 1 }}>
        {getDynamicTitle(selectedCompany) && (
          <span style={{ fontSize: "1.13rem" }}>
            {getDynamicTitle(selectedCompany)}<br></br>
          </span>
        )}
        <span style={{ color: "#6D75A7", fontSize: "1rem" }}>
          {selectedCompany}
        </span>
      </div>

      <button
        className="d-flex align-items-center justify-content-center"
        onClick={() => setShowModal(!showModal)}
        style={{
          backgroundColor: "#00124F",
          border: "none",
          borderRadius: "50%",
          width: "2rem",
          height: "2rem",
          color: "#ffffff",
          cursor: "pointer",
          // boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <AiFillEdit size={16} />
      </button>
      {showModal && (
        <EmploymentStatusSelectorSlider onSelect={handleOptionSelect} options={generateOptions()} onClose={() => setShowModal(false)} />
      )}
    </div>
    ) : (
    <div
      className="d-flex align-items-center  justify-content-center"
      style={{
        width: "100%",
        minWidth: "17.1875rem", // 275px
        maxWidth: "18.5625rem", // 345px
        marginBottom: "1rem",
      }}
    >
      {/* Main Box */}
      <div
        className="flex-grow-1 shadow"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          // boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p className="mb-0 mt-1"
          style={{
            fontSize: "1rem",
            color: "#858585",
            fontWeight: 400
          }}
        >
          {getDynamicTitle(selectedCompany)}
        </p>
        <p className="select-employe-status mb-0 my-1">
          {selectedCompany}
        </p>
      </div>

      {/* Spacer between box and icon */}
      <div style={{ width: "0.75rem" }} /> {/* ~12px gap */}

      {/* Edit Icon */}
      <button
        // onClick={handleClick}
        onClick={() => setShowModal(!showModal)}
        className="d-flex align-items-center justify-content-center"
        style={{
          backgroundColor : color.editIconColor,
          border: "none",
          borderRadius: "50%",
          width: "2rem",
          height: "2rem",
          color: "#ffffff",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <AiFillEdit size={16}/>
      </button>

      {/* Animated popup box */}
       <AnimatePresence>
        {showModal && (
          <EmploymentOptionsModal onSelect={handleOptionSelect} options={generateOptions()} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
    )}
    </>
   
  );
}


export const CurrentEmployerNotListed = (props: any) => {
  return (
    <div
      className="bg-white rounded-2 px-4 py-3 d-flex align-items-center justify-content-between clickeffect"
      style={{
        width: "100%", // Responsive width
        minWidth: "17.1875rem", // 275px -> rem
        maxWidth: "18.5625rem", // 345px -> rem
        borderRadius: "5px", // 5px -> rem
        gap: "0.3125rem", // 5px -> rem
        overflow: "hidden", // Prevents unwanted overflow
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset"
      }}
      onClick={props.onClick}
    >
      <p
        className="text-dark text-start m-0 flex-grow-1"
        style={{
          fontWeight: "400",
          fontSize: "1.1rem", // 22px -> rem
          lineHeight: "120%",
          textAlign: "left",
          wordBreak: "break-word", // Ensures text wraps properly
        }}
      >
        Current employer is not listed in this UAN
      </p>
      <BiChevronRight size={37} className="ms-2 text-secondary" />
    </div>
  );
};