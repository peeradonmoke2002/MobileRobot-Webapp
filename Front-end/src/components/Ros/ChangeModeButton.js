import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine } from "../rosbridge";
import Switch from '@mui/joy/Switch';
import MapSaverComponent from '../MapManager/SaveMap';
import { Row, Col, Button, Overlay, Popover } from "react-bootstrap";

const ChangeModeButton = ({robotname ,ip }) => {

  const ros = connectToMachine(robotname, `ws://${ip}:9090`);
  console.log('ros:', ros);

  /* ------ Add New Map ------ */
  const [currentMode, setMode] = useState(false);
  const [isAddNewMap, setIsAddMapOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const displayAddPanel = (event) => {
    setIsAddMapOpen(!isAddNewMap);
    setTarget(event.target);
  };

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
    } catch (error) {
      console.error('Error during Navigation process:', error);
    }
  };

  useEffect(() => {
    if(!currentMode) {
      handleStartNavigation();
    } else {
      handleStartGmapping();
    }
  }, [currentMode]);

  return (
    <div style={{height:'100px'}}>
        <div style={{
            display: 'flex',
            justifyContent:'flex-start'}}>
          <div    style={{    alignItems:'center',
                              display:'flex' }}>
              <div style={{marginRight: '10px',}}>
                  Change Mode:
              </div>
              <Switch 
                  checked={currentMode} 
                  onChange={(event) => setMode(event.target.checked)}
                  color={currentMode ? 'warning' : 'neutral'} 
                  variant="solid"
              />
              <span style={{ marginLeft: '5px',display:'flex' }}>{currentMode ? 'SLAM' : 'Navigation'}</span>
          </div>
        </div>
        {currentMode &&
          <div  ref={ref} 
                style={{marginTop:'1rem',
                        display: 'flex',
                        justifyContent:'flex-start'}}>
            <Button variant="outline-success" style={{borderRadius:'0px'}}
                    onClick={displayAddPanel}
            >
                Save New Map
            </Button>         
            <Overlay
                show={isAddNewMap}
                target={target}
                placement="right"
                container={ref}
                containerPadding={20}
                >
                <Popover id="popover-contrained">
                <Popover.Body>
                    <MapSaverComponent robotname={robotname} ip={ip}/>
                </Popover.Body>
                </Popover>
            </Overlay>                         
          </div>
        }
    </div>
  );
};

export default ChangeModeButton;
