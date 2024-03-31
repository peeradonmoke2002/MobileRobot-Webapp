import ReplayTwoToneIcon from '@mui/icons-material/ReplayTwoTone';
import React,{ useState, useEffect } from 'react';
import { Row } from 'react-bootstrap';

const ReloadButton = () => {

  

  const handleReload = () => {
      // Use for foruce reload the page
      // setKey((prevKey) => prevKey + 1);
      window.location.reload();
    };

  return (
      <button onClick={handleReload} className='refresh-btn' key="refresh-btn">
          <ReplayTwoToneIcon/>
      </button>
  );
};

export default ReloadButton;
