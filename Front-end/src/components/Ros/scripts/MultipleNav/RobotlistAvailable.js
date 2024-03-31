import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'react-bootstrap';
import { fetchMoveBaseInformation, getMoveInformation } from '../../Data/agvSlice';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const RobotlistAvailable = ({ onSelect }) => {
  const moveInformation = useSelector(getMoveInformation);
  const [selectedRobot, setSelectedRobot] = useState('');
  const dispatch = useDispatch();

  const handleRobotSelection = (event) => {
    const selectedRobotEvent = event.target.value;
    setSelectedRobot(selectedRobotEvent);
    onSelect(selectedRobotEvent);
  };

  const availableRobots = moveInformation.filter((robot) => robot.is_active === 'Available');

  if (availableRobots.length === 0) {
   availableRobots.push({ name: 'No Robot Available' });
  }

  return (
    <Row>
      <div>
        {availableRobots && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <FormControl sx={{ m: 1, minWidth: 160 }} size="small">
              <InputLabel id="demo-simple-select-autowidth-label">
                Select Robot
              </InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={selectedRobot}
                label="Select Robot"
                onChange={handleRobotSelection}
              >
                {availableRobots.map((robot) => (
                  <MenuItem key={robot.name} value={robot.name} disabled={robot.name === 'No Robot Available'}>
                    {robot.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </div>
    </Row>
  );
};

export default RobotlistAvailable;
