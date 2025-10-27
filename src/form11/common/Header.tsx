import React from 'react';
import { BsList } from "react-icons/bs";
import './../App.css'
const Header: React.FC = () => {
  return (
    <div className="card custom-bottom-shadow w-100 mt-2" style={{ backgroundColor: '#CED9FF' }}>
      <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
        <p className="mb-0" style={{fontSize: '1.13rem'}}>Fill Form 11</p>
        <button className="btn p-1" style={{color: "#1C1B1F"}}>
          <BsList size={24} />
        </button>
      </div>
    </div>
  );
};

export default Header;
