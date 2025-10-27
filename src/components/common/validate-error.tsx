import React from "react";

interface ValidationErrorProps {
    message?: any; // Optional string type
}

const ValidationError: React.FC<ValidationErrorProps> = ({ message }) => {
    return message ? <div className="text-danger mt-1">{message}</div> : null;
};

export default ValidationError;
