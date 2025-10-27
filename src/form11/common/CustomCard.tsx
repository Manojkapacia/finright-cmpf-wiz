import React from 'react';
import './../App.css'
const CoustomCard: React.FC = () => {
  return (
    <div className="card w-100 mt-3 border-0" style={{ backgroundColor: '#F7F9FF',borderRadius: "1rem" }}>
      <div className="card-body d-flex justify-content-between align-items-center px-2 py-2">
        <div className="" style={{fontSize:'1rem'}}>
            <p className="mb-0">Test User</p>
            <p className="mb-0">WDA-22342</p>
          </div>
      </div>
    </div>
  );
};

export default CoustomCard;