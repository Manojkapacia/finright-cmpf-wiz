import { IoMdCall } from "react-icons/io";
import "./helper.css"
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

interface ButtonProps  {
    name: any;
    onClick?: () => void;
  }

  interface ModelButtonProps {
    content: string;
    arrow?: boolean;
    onClick?: () => void;
  }
  interface CustomButtonAllProps {
    content: string;
    onClick: () => void;
    color?: string;
  }
  
  
 export const CustomButton: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
      <button className="custom-button pb-1 pt-1" onClick={onClick}>
        {name}
      </button>
    );
  };
  export const CustomButtonArrow: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
      <button className="custom-button-arrow pb-1 pt-1 flex items-center justify-center gap-2"  onClick={onClick}>
      {name}
      <FaArrowRightLong  className="mt-1" />
    </button>
    );
  };
  export const CustomButtonArrowBack: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
      <button className="custom-button-arrow pb-1 pt-1 flex items-center justify-center gap-2"  onClick={onClick}>
      <FaArrowLeftLong  className="mt-1" />
      {name}
    </button>
    );
  };
  
  export const CustomOutlinedButton: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
      <button className="custom-outlined-button" onClick={onClick}>
        {name}
      </button>
    );
  };
  
  export const CustomOutlinedButtonWithIcons: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
<button className="custom-outlined-button flex items-center gap-2" onClick={onClick}>
  <IoMdCall className="fs-5 light-icon" style={{marginTop:"0.1rem"}} />
  <span>{name}</span>
  <FaArrowRightLong className="mt-1 fs-5 light-icon" />
</button>
    );
  };

  export const CustomButtonWithIcons: React.FC<ButtonProps> = ({ name, onClick }) => {
    return (
<button className="custom-button-with-icon flex items-center gap-2" onClick={onClick}>
  <IoMdCall className="fs-5 light-icon" style={{marginTop:"0.1rem"}} />
  <span>{name}</span>
  <FaArrowRightLong className="mt-1 fs-5 light-icon" />
</button>
    );
  };




  export const ModelButton: React.FC<ModelButtonProps> = ({ content, arrow = false, onClick }) => {
    return (
      <button 
        className={"btn d-flex justify-content-center align-items-center mx-auto  rounded-pill  gap-2"}
        onClick={onClick}
        style={{
          boxSizing: "border-box",
          padding: "0.3125rem 1.25rem",
          fontSize: "0.8125rem",
          width:"13.3125rem",
          height:"2.125rem",
          background: "linear-gradient(0deg, rgba(0, 199, 165, 0.1), rgba(0, 199, 165, 0.1)), #FFFFFF",
          border: "0.0625rem solid #B5EBE2",
          boxShadow: "0rem 0.25rem 0.25rem rgba(0, 0, 0, 0.25)",
          color: "#00C7A5",
          order: 3,
          flexGrow: 0,
          fontWeight: 600,
          lineHeight: "100%",
          letterSpacing: "0px"
        }}
      >
        {arrow && <IoMdCall size="1.125rem" color="#00C7A5" className="me-1" style={{ width: "1.125rem", height: "1.125rem"}} />}
        <span className="d-flex align-items-center font-bold" style={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: "100%", letterSpacing: "0px" }}>{content}</span>
      </button>
    );
  };
  

  export const ModelButtonArrow: React.FC<ModelButtonProps> = ({ content, arrow = false, onClick }) => {
    return (
      <button 
        className={"btn d-flex justify-content-center align-items-center mx-auto  rounded-pill  gap-2"}
        onClick={onClick}
        style={{
          boxSizing: "border-box",
          padding: "0.3125rem 1.25rem",
          fontSize: "0.8125rem",
          width:"13.3125rem",
          height:"2.125rem",
          background: "linear-gradient(0deg, rgba(0, 199, 165, 0.1), rgba(0, 199, 165, 0.1)), #FFFFFF",
          border: "0.0625rem solid #B5EBE2",
          boxShadow: "0rem 0.25rem 0.25rem rgba(0, 0, 0, 0.25)",
          color: "#00C7A5",
          order: 3,
          flexGrow: 0,
          fontWeight: 600,
          lineHeight: "100%",
          letterSpacing: "0px"
        }}
      >
        <span className="d-flex align-items-center font-bold" style={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: "100%", letterSpacing: "0px" }}>{content}</span>
        {arrow && <FaArrowRightLong size="1rem" color="#00C7A5" className="me-1 mt-1" style={{ width: "1.125rem", height: "1rem"}} />}
      </button>
    );
  };
 
  // #ffb8b8
  // #b8efe6

  export const CustomButtonAll: React.FC<CustomButtonAllProps> = ({ content, onClick, color }) => {
    const buttonColor = color === "#FF0000" ? "#FF0000" : "#00C7A5";
    const background = color === "#FF0000"
      ? "linear-gradient(0deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1)), #FFFFFF"
      : "linear-gradient(0deg, rgba(0, 199, 165, 0.1), rgba(0, 199, 165, 0.1)), #FFFFFF";
    const border = color === "#FF0000" ? "0.0625rem solid #ffb8b8" : "0.0625rem solid #B5EBE2";
  
    return (
      <button 
        className={"btn d-flex justify-content-center align-items-center mx-auto rounded-pill gap-2"}
        onClick={onClick}
        style={{
          boxSizing: "border-box",
          padding: "0.3125rem 1rem",
          fontSize: "0.8125rem",
          width: "18.125rem",
          height: "2.125rem",
          background: background,
          border: border,
          boxShadow: "0rem 0.25rem 0.25rem rgba(0, 0, 0, 0.25)",
          color: buttonColor,
          order: 3,
          flexGrow: 0,
          fontWeight: 600,
          lineHeight: "100%",
          letterSpacing: "0px"
        }}
      >
   <span className="d-flex align-items-center font-bold" 
      style={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: "100%", letterSpacing: "0px" }}>
  {content}
</span>
        <HiOutlineArrowLongRight  color={buttonColor} className="me-1" style={{ width: "1.525rem", height: "1.525rem",marginLeft:"-0.3rem" }} />
      </button>
    );
  };
  


type CompleteProfileButtonProps = {
  text: string;
  color?:string;
  onClick?: () => void;
};

export const CompleteProfileButton: React.FC<CompleteProfileButtonProps> = ({ text,color, onClick }) => {
  return (
      <button
      className="clickeffect"
      onClick={onClick}
      style={{
        backgroundColor: `${ color ? color : "#00124F" }`,
        borderRadius: "0.3125rem", 
        width:"100%",
        color:"white",
        border:"none",
        padding: "0.625rem", 
        fontSize:"0.8125rem",
        fontWeight: "600",
        cursor:"pointer"
       }}
    >
      {text}
    </button>
  );
};



import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface WithdrawNowButtonProps {
  content: string;
  onClick: () => void;
  color?: string; // e.g. "#00C7A5" or "#FF3B30"
}

export const WithdrawNowButton: React.FC<WithdrawNowButtonProps> = ({
  content,
  onClick,
  color,
}) => {
  return (
    <button
    className="clickeffect"
      onClick={onClick}
      style={{
        padding: "0.625rem", // 10px
        fontSize: "0.8125rem",
        color: color ? color : "#00C7A5",
        backgroundColor: color ==="#FF3B30" ? "#F8E6EA":"#E2F6F9",
        borderRadius: "0.3125rem", // 5px
        border: `1px solid ${color ? color : "#00C7A5"}`,
        fontWeight: 600,
        lineHeight: "100%",
        width: "7.5rem",
        cursor: "pointer",
      }}
    >
      {content}
    </button>
  );
};


export const PFSuccessCard = () => {
  return (
    <div
      className="card border-0 shadow-sm mt-3"
      style={{
        backgroundColor: "#34A853",
        borderRadius: "1rem",
        padding: "0.926rem",
      }}
    >
      <div
        className="d-flex justify-content-center align-items-center gap-2  text-white"
        style={{
          fontSize: "0.7125rem", // 13px
          fontWeight: 400,
         }}
      >
        <FaCheckCircle className="fs-6 gap-2" />
        {/* <FaCheckCircle style={{ fontSize: "0.8125rem" }} /> */}
        <span>Details Updated – Your PF report is now ready</span>
      </div>
    </div>
  );
};

export const PFLoadingCard = ({ text }: any) => {
  return (
    <div
      className="card border-0 shadow-sm mt-3"
      style={{
        backgroundColor: "#D4F8F2",
        borderRadius: "1rem",
        padding: "0.626rem",
        display: "flex",              // Center wrapper content
        justifyContent: "center",     // Horizontally center
        alignItems: "center",         // Vertically center
        minHeight: "3rem",            // Optional: ensures some vertical space
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          color: "#34A853",
          fontSize: "0.8125rem",
          fontWeight: 400,
          lineHeight: "1.2",
          gap: "0.5rem",               // Space between spinner and text
        }}
      >
        <div
          style={{
            width: "1rem",
            height: "1rem",
            border: "0.15em solid #34A853",
            borderTop: "0.15em solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>

        <span style={{ wordBreak: "break-word" }}>{text}</span>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};


export const PFProgressCard = () => {
  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        padding: "1.25rem", // 20px in rem
        borderRadius: "1rem",
        backgroundColor: "#F7F9FF",
        display: "flex",
        flexDirection: "column",
        gap: "0.3125rem", // 5px in rem
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top thick bar with shine */}
      <div
        style={{
          height: "2.0625rem", // 33px
          width: "100%",
          background: "#D9D9D9",
          position: "relative",
          overflow: "hidden",
        
        }}
      >
        <div
          style={{
            content: '""',
            position: "absolute",
            top: 0,
            left: "-50%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "shine 2s infinite",
          }}
        />
      </div>

      {/* Bottom thin bar with shine */}
      <div
        className="mt-2"
        style={{
          height: "0.4375rem", // 7px
          width: "100%",
          background: "#D9D9D9",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            content: '""',
            position: "absolute",
            top: 0,
            left: "-50%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "shine 2s infinite",
          }}
        />
      </div>

      {/* Shine Animation */}
      <style>
        {`
          @keyframes shine {
            0% {
              left: -50%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};



interface KycProfileCardProps {
  label: string|number;
  name: string|any;
  onCorrectClick: () => void;
  onIncorrectClick: () => void;
   status: boolean | null;
}

export const KycProfileCard: React.FC<KycProfileCardProps> = ({
  label,
  name,
  onCorrectClick,
  onIncorrectClick,
  status
}) => {
  return (
    <div
      className="card border-0 shadow-sm mb-3"
      style={{
        borderRadius: "1rem", // 16px
        paddingTop: "0.9375rem", // 15px
        paddingRight: "1.25rem", // 20px
        paddingBottom: "0.9375rem", // 15px
        paddingLeft: "1.25rem", // 20px
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem", // 10px
        backgroundColor: "#F7F9FF",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.8125rem", // 13px
            fontWeight: 400,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "1rem", // 16px
            marginTop:"-0.3rem",
            fontWeight: 600,
          }}
        >
          {name}
        </div>
      </div>

     <div className="d-flex gap-2">
  <button
    type="button"
    className="btn clickeffect"
    onClick={onCorrectClick}
    style={{
      flex: 1,
      borderRadius: "0.3125rem",
      border: `1px solid #00C7A5`,
      color: status === true ? "white" : "#00C7A5",
      backgroundColor: status === true ? "#00C7A5" : "#E2F6F9",
      fontSize: "0.8125rem",
      padding: "0.625rem",
      fontWeight: 600,
      lineHeight: "100%",
      letterSpacing: "0",
    }}
  >
    Correct
  </button>

  <button
    type="button"
    className="btn clickeffect"
    onClick={onIncorrectClick}
    style={{
      flex: 1,
      borderRadius: "0.3125rem",
      border: "1px solid #FF3B30",
      color: status === false ? "white" : "#FF3B30",
      backgroundColor: status === false ? "#FF3B30" : "#F8E6EA",
      fontSize: "0.8125rem",
      fontWeight: 600,
      padding: "0.625rem",
      lineHeight: "100%",
      letterSpacing: "0",
    }}
  >
    Incorrect
  </button>
</div>

    </div>
  );
};