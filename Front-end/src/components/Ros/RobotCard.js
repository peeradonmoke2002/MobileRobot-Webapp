import React, { useEffect, useState } from 'react'
import { connectToMachine } from './scripts/rosbridge';
import { Col, Row, Container } from 'react-bootstrap';

const RobotCard = ({ robot }) => {

  const [rosStatus, setRosStatus] = useState('');
  const [rosStatusTime, setRosStatusTime] = useState('???');
  const [Status, setStatus] = useState('Out of Service');

  useEffect(() => {

        const ros =  connectToMachine(robot.name,`ws://${robot.rosbridge_server_ip}:${robot.rosbridge_server_port}`);
          
        ros.on('connection', () => {
          // console.log(`Connected to websocket server at ${robot.name} ${robot.rosbridge_server_ip}.`);
          setRosStatus(1);
          setStatus(robot.is_active);
          setRosStatusTime(new Date().toLocaleTimeString());
        }
        );
        ros.on('error', (error) => {
          // console.log(`Error connecting to websocket server at ${robot.name} ${robot.rosbridge_server_ip}:`, error);
          setRosStatus(0);
          setStatus(robot.is_active);
        
        }
        );
        ros.on('close', () => {
          // console.log(`Connection to websocket server closed at ${robot.name} ${robot.rosbridge_server_ip}.`);
          setRosStatus(0);
          setStatus(robot.is_active);
        }
        );

    return () => {
      ros.close();
    };
  }, []);
  
  return (
      <div className="robot-card">
        <h3>{robot.name}</h3>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ flex: '1 0 20%'}}>
            <p>IP: {robot.rosbridge_server_ip}</p>
            <p>Port: {robot.rosbridge_server_port}</p>
            <p>Last Update: {rosStatusTime}</p>
          </div>
          <div style={{ flex: '1 0 80%'}}>
            <p style={{ color: rosStatus ? 'green' : 'red' }}>
              ROS Bridge Status: {rosStatus ? 'Connected' : 'Disconnected'}
            </p>
            <p style={{ color: Status === 'Available' ? 'green' : 'red' }}>
              ROS Node Status: {Status}
            </p>
            <p style={{ color: robot.mode === 'IDLE' ? 'gray' : robot.mode === 'NAV' ? 'purple' : robot.mode === 'SLAM' ? 'orange' : '' }}>
              Mode: {robot.mode}
            </p>
          </div>
        </div>

        
      </div>
  );
};
  
  export default RobotCard;