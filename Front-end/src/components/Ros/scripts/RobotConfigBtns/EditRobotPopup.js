import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleEditRobot, getMoveInformation } from '../../Data/agvSlice';
import RobotlistManager from './RobotlistManager';

const EditRobot = ({ onClose }) => {
  const dispatch = useDispatch();
  const moveInformation = useSelector(getMoveInformation);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [robotData, setRobotData] = useState({
    name: '',
    rosbridge_server_ip: '',
    rosbridge_server_port: '',
  });
  const [warning, setWarning] = useState('');

  useEffect(() => {
    // If selectedRobot exists, set the form data for editing
    if (selectedRobot) {
      setRobotData({
        name: selectedRobot.name,
        rosbridge_server_ip: selectedRobot.rosbridge_server_ip,
        rosbridge_server_port: selectedRobot.rosbridge_server_port,
      });
      console.log('robotData', robotData);  
    }
  }, [selectedRobot]);

  const handleRobotSelection = (selectedRobot) => {
    const selectedRobotData = moveInformation.find((robot) => robot.name === selectedRobot);
    setSelectedRobot(selectedRobotData);
    setWarning('');
    console.log(selectedRobotData);
  };

  const handleChange = (e) => {
    setRobotData({
      ...robotData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!selectedRobot) {
      setWarning('Please select a robot.');
    } else {
      dispatch(handleEditRobot(selectedRobot, robotData));
      onClose();
    }
  };

  return (
      <div className="modal-content">
        <RobotlistManager onSelect={handleRobotSelection} />
        {warning && <p style={{ color: 'red' }}>{warning}</p>}
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={robotData.name}
          onChange={handleChange}
          style={{marginBottom:'10px'}}
        />
        <label>Rosbridge Server IP:</label>
        <input
          type="text"
          name="rosbridge_server_ip"
          value={robotData.rosbridge_server_ip}
          onChange={handleChange}
          style={{marginBottom:'10px'}}
        />
        <label>Rosbridge Server Port:</label>
        <input
          type="text"
          name="rosbridge_server_port"
          value={robotData.rosbridge_server_port}
          onChange={handleChange}
          style={{marginBottom:'10px'}}
        />
        <div style={{display:'flex'}}>
            <div>
              <button onClick={handleSubmit} 
                      className='sub-submit-btn'
                      style={{ marginRight: '10px'}}
                      >
                        Edit Robot
              </button>
            </div>
            <div>
              <button onClick={onClose} 
                      className='sub-cancel-btn'
                      >
                        Cancel
              </button>
            </div>
          </div>
      </div>
  );
};

export default EditRobot;
