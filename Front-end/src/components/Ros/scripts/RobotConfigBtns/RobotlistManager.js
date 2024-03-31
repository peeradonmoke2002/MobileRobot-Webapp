import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoveBaseInformation , getMoveInformation } from '../../Data/agvSlice';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const RobotlistManager = ({onSelect}) => {
  const moveInformation = useSelector(getMoveInformation);
  const [selectedRobot, setSelectedRobot] = useState('')
  const [robotset, setRobotset] = useState([]) 
  const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchData = () => {
//         dispatch(fetchMoveBaseInformation());
//     };

//     fetchData(); 

//     const intervalId = setInterval(() => {
//         fetchData();
//     }, 5000);

//     return () => {
//         clearInterval(intervalId);
//     };
// }, [dispatch]);

  const handleRobotSelection = (event) => {
    const selectedRobotEvent = event.target.value;
    const selectedRobotData = moveInformation.find((robot) => robot.name === selectedRobotEvent);
    setRobotset(selectedRobotData);
    setSelectedRobot(selectedRobotEvent);
    onSelect(selectedRobotEvent);
  };

  return (
    <div>
      {moveInformation && (

        <FormControl sx={{ m: 1, minWidth: 160 }}>
        <InputLabel id="select-robot">Select Robot</InputLabel>
        <Select
            labelId="select-robot"
            id="select-robot-list-manager"
            value={selectedRobot} // Keep the whole object as the value
            label="Select Robot"
            onChange={handleRobotSelection}
            >
            {moveInformation.map((robot) => (
              <MenuItem key={robot.name} value={robot.name}>
                {robot.name}
                </MenuItem>
            ))}
        </Select>
        </FormControl>
      )}
    </div>
  );
};

export default RobotlistManager ;
