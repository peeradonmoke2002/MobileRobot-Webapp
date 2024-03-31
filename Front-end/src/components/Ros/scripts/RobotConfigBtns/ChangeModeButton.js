import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine } from "../rosbridge";

const ChangeModeButton = ({robotname ,ip, port, mode}) => {

  const ros = connectToMachine(robotname, `ws://${ip}:9090`);
  const [navMode, setNavMode] = useState(mode);
  console.log('ros:', ros);


  /* Service and Change Mode */
  const amclServiceClient = new window.ROSLIB.Service({
    ros         : ros,
    name        : 'gmapping_amcl_switcher',
    serviceType : 'SMLauncher'
  });

    const request_for_GMAPPING = new window.ROSLIB.ServiceRequest({
      launch_command : 'SLAM'
  });

  const request_for_NAV = new window.ROSLIB.ServiceRequest({
      launch_command : 'NAV'
  });


  useEffect(() => {
    if (navMode === 'NAV') {
      // Update the button color for NAV mode
    } else if (navMode === 'SLAM') {
      // Update the button color for SLAM mode
    }
  }, [navMode]);  
  const handleStartGmapping = async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        amclServiceClient.callService(request_for_GMAPPING, (result) => {
          if (result) {
            console.log('Serive SLAM call successfully.');
            resolve(result);
          } else {
            console.log('Service SLAM call failed.');
            reject(new Error('Service SLAM call failed.'));
          }
        });
      });
      window.alert('Service call: ' + result.result);
      console.log('Result for service call on ' + amclServiceClient.name + ' : ' + result.result);
      setNavMode('SLAM');
      // window.location.reload(); 
    } catch (error) {
      console.error('Error during Gmapping process:', error);
    }
  };

  const handleStartNavigation = async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        amclServiceClient.callService(request_for_NAV, (result) => {
          if (result) {
            console.log('Serive Nav call successfully.');
            resolve(result);
          } else {
            console.log('Service Nav call failed.');
            reject(new Error('Service call failed.'));
          }
        });
      });
      window.alert('Service call: ' + result.result);
      console.log('Result for service call on ' + amclServiceClient.name + ' : ' + result.result);
      setNavMode('NAV');
      // window.location.reload(); 
    } catch (error) {
      console.error('Error during Navigation process:', error);
    }
  };


  return (
    <div>
      <div    style={{    alignItems:'center',
                          display:'flex',
                          border:'1px solid',
                          borderRadius:'6px' 
                          }}>
          <button style={{
                        border: navMode === 'NAV' ? '2px solid' : 'none',
                        width: '150px',
                        height: '65px',
                        borderTopLeftRadius: '6px',
                        borderBottomLeftRadius: '6px',
                        backgroundColor: navMode === 'NAV' ? '#3b82f6' : '#d1d5db',
                        color: navMode === 'NAV' ? 'white' : '#4b5563',
                        transition: 'all 0.3s ease'
                     }} 
                  onClick={handleStartNavigation}>
              Navigation Mode
          </button>
          <button style={{ 
                     border: navMode === 'SLAM' ? '2px solid' : 'none',
                     width: '150px',
                     height: '65px',
                     borderTopRightRadius: '6px',
                     borderBottomRightRadius: '6px',
                     backgroundColor: navMode === 'SLAM' ? '#ff7400' : '#d1d5db',
                     color: navMode === 'SLAM' ? 'white' : '#4b5563',
                     transition: 'all 0.3s ease'
                     }} 
                  onClick={handleStartGmapping}>
              SLAM Mode
          </button>
        
      </div>
    </div>
  );
};

export default ChangeModeButton;


