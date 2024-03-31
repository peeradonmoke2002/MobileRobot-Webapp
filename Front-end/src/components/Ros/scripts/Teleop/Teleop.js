import React, { useState, useEffect } from "react";
import Slider from '@mui/material/Slider';
import { initconnect, connectToMachine } from "../rosbridge";
import teleopImage from '../../../Image/teleop.png';


const Teleoperation = ({ip,robotname,cmdvel}) => {

    const [speed, setSpeed] = useState(0.0);
    const [teleop, setTeleop] = useState(null);
  

    useEffect(() => {
        const ros = connectToMachine(robotname, "ws://" + ip + ":9090");
        const initVelocityPublisher = () => {
            const twist = new window.ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0 },
                angular: { x: 0, y: 0, z: 0 }
            });
    
            const cmdVel = new window.ROSLIB.Topic({
                ros: ros,
                name: cmdvel.topic_name,
                // name: '/cmd_vel',
                messageType: cmdvel.messageType 
            });
    
            cmdVel.advertise();
        };
    
        const initTeleopKeyboard = () => {
            const teleopInstance = new window.KEYBOARDTELEOP.Teleop({
                ros: ros,
                name: cmdvel.topic_name,
                // topic: '/cmd_vel'
            });
            console.log('initTeleop');
            teleopInstance.scale = 0.0;
            setTeleop(teleopInstance);
        };
        initVelocityPublisher();
        initTeleopKeyboard();

        return () => {

            ros.close();
        };
    }, []);


    const handleSpeedChange = e => {
        const newSpeed = parseFloat(e.target.value);
        console.log('newSpeed:', newSpeed);
        if (teleop) {
            teleop.scale = newSpeed / 100;
            setSpeed(teleop.scale);
            console.log(`RobotSpeed at ip ${ip}:`, teleop.scale);

        } else {
            console.error('Teleop is not defined yet.');
        }
    };

    return (
        <div style={{paddingTop:'1rem',paddingBottom:'1rem'}}>
            <div>Speed: {speed} m/s</div>
            <Slider
                style={{ width: '90%' }}  
                size="small"
                defaultValue={0}
                aria-label="Small"
                valueLabelDisplay="auto"
                marks
                min={0}
                max={70}
                step={1}
                onChange={handleSpeedChange}
                valueLabelFormat={(value) => value.toFixed(2)}
            />
            <div style={{marginTop:'1rem'}}>
                <img src={teleopImage} style={{ width: '250px', height: '200px' }} />
            </div>
        </div>
    );
};

export default Teleoperation;
