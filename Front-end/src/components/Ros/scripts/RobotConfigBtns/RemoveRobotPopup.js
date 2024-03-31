import React from 'react';
import { useDispatch } from 'react-redux';
import { removeRobot, removeAGVsInformation } from '../../Data/agvSlice';
import RobotlistManager from './RobotlistManager';
import { useState } from 'react';

const RemoveRobotModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const [selectedRobot, setSelectedRobot] = useState(null);
    const [warning, setWarning] = useState('');

    const handleRemoveRobot = () => {
      if (selectedRobot) {
      dispatch(removeRobot(selectedRobot));
      dispatch(removeAGVsInformation(selectedRobot));
      onClose();
    } else {
      setWarning('Please select a robot.');
    }
    };

    const handleRobotSelection = (selectedRobot) => {
      setSelectedRobot(selectedRobot);
      setWarning('');
    };
  
    return (
        <div className="modal-content">
          <RobotlistManager onSelect={handleRobotSelection} />
          {selectedRobot && (
            <div style={{marginBottom:'10px'}}>Selected Robot: {selectedRobot.name}</div>
          )}

          {warning && <p style={{ color: 'red' }}>{warning}</p>}

          <div style={{display:'flex',marginTop:'5px'}}>
            <div>
              <button onClick={handleRemoveRobot} 
                      className='sub-submit-btn'
                      style={{ marginRight: '10px'}}
                      >
                        Remove Robot
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
  
  export default RemoveRobotModal;