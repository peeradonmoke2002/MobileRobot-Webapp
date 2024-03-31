import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import { isMachineConnected, connectToMachine} from "./rosbridge";
// import Alert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Button } from "react-bootstrap";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ChangeModeButton from "./RobotConfigBtns/ChangeModeButton";


const Connection = ({robotname, ip, port, mode}) => {
    const [rosStatus, setRosStatus] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [rosStatusTime, setRosStatusTime] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const ros = connectToMachine(robotname, `ws://${ip}:${port}`);
        ros.on('connection', () => {
          console.log('Connected to websocket server.');
          setIsConnected(true);
        }
        );
        ros.on('error', (error) => {
          console.log('Error connecting to websocket server: ', error);
          setIsConnected(false);
        }
        );
        ros.on('close', () => {
          console.log('Connection to websocket server closed.');
          setIsConnected(false);
        }
        );
    
        return () => {
          // listenerRos.unsubscribe();
          ros.close();
        };
      }, [robotname, ip, port]);

      
      useEffect(() => {
        updateConnectionStatus(rosStatus);
      }, [rosStatus]);

      const updateConnectionStatus = (commu) => {
        if(commu === 0){
          setIsConnected(false);
        }
        else if(commu >= 1){
          setIsConnected(true);
        }
        else{
          setIsConnected(false);
        }
      };

    return (
      <div>
        <div style={{display:'flex'}}>
          <button className="mybtn" onClick={() => navigate('/robots')}>
              <ArrowBackIosNewIcon sx={{ fontSize: 55 }} /> 
          </button>
          <div className="robotConnection-box">
            <h1>{robotname}</h1>
            <div className="controls">
              <ChangeModeButton robotname={robotname} ip={ip} port={port} mode={mode}/>
              <div className="alert-container">
                <Alert
                  style={{
                    fontSize: '1.25em',
                    border: '1px solid',
                    width: '180px',
                  }}
                  variant={isConnected ? "success" : "danger"}
                >
                  <p style={{ margin: '0', color: isConnected ? '#008000' : '#ff0000' }}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </Alert>
              </div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: isConnected ? '#008000' : '#ff0000', 
                      width: 'auto', 
                      height: '1.5rem' }}>
        </div>
      </div>
  );
}

export default Connection;