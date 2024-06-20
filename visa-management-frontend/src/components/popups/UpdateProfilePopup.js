import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpdateProfilePopup = () => {
  const navigate = useNavigate(); 

  const handleClose = () => {
    navigate('/home'); // ホームに遷移
  };


  return (
    <div className="popup-overlay"> 
    <div className='Popup'>
      <p>Successfully updated.</p>
      <button onClick={handleClose}>Back to Home</button>
    </div>
    </div>
  );
};

export default UpdateProfilePopup;
