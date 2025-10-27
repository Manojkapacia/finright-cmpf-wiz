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
        width: "fit-content",
        cursor: "pointer",
      }}
    >
      {content}
    </button>
  );
};
