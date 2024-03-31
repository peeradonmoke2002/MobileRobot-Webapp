// AddRobotModal.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addRobot } from '../../Data/agvSlice';


const AddRobotModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [robotData, setRobotData] = useState({
    name: '',
    rosbridge_server_ip: '',
    rosbridge_server_port: '',
  });

  const [warning, setWarning] = useState('');

  const handleChange = (e) => {
    setRobotData({
      ...robotData,
      [e.target.name]: e.target.value,
    });

    setWarning('');
  };

  const handleSubmit = () => {
    if (!robotData.name.trim() || !robotData.rosbridge_server_ip.trim() || !robotData.rosbridge_server_port.trim()) {
      setWarning('All fields are required');
    } else {
      console.log('robotData:', robotData);
      dispatch(addRobot(robotData));
      onClose();
    }
  };


  return (
      <div className="modal-content" style={{ flexDirection: 'column' }}>
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

        {warning && <p style={{ color: 'red' }}>{warning}</p>}

        <div style={{display:'flex'}}>
          <div>
            <button onClick={handleSubmit}
                    className='sub-submit-btn' 
                    style={{ marginRight: '10px'}}
                    >
                      Add Robot
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

export default AddRobotModal;