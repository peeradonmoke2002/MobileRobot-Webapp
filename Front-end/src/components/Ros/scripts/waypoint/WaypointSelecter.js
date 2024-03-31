import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWaypointsAsync, selectWaypoints, updateWaypoints } from "../../Data/waypointsSlice";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Row, Col } from 'react-bootstrap';
import { getRosConnection } from '../rosbridge';

const WaypointSelector = ({ robotname, ip }) => {

  const [selectedWaypoint, setSelectedWaypoint] = useState('')
  const [waypointset, setWaypointset] = useState([])
  const dispatch = useDispatch();
  const waypoints = useSelector(selectWaypoints);
  console.log('robotname:', robotname);


useEffect(() => {

  dispatch(fetchWaypointsAsync());

  const intervalId = setInterval(() => {
    dispatch(fetchWaypointsAsync());
  }, 5000);

  console.log(waypoints);
  // Clean up the interval on component unmount
  return () => clearInterval(intervalId);
}, [dispatch]);


const handleWaypointSelection = (e) => {
  const selectedId = e.target.value;
  const selectedWaypointData = waypoints.find((waypoint) => waypoint.id === selectedId);
  setSelectedWaypoint(selectedId);
  setWaypointset(selectedWaypointData);
  console.log('Selected Waypoint ID:', selectedId);
  console.log('Selected Waypoint Data:', selectedWaypointData);
};

const amclUpdate = () => {
  const ros = getRosConnection(robotname);
  var amclUpdateClient = new window.ROSLIB.Service({
    ros: ros,
    name: '/request_nomotion_update',
    serviceType: 'std_srvs/Empty'
  });
  var counts = 0;
  var id = setInterval(updates, 150);
  clearCostmap();
  function updates() {
    if (counts == 30) {
      clearInterval(id);
    } else {
      counts++;
      amclUpdateClient.callService('std_srvs/Empty');
    }
  }
};

const clearCostmap = () => {
  const ros = getRosConnection(robotname);
  const clearCostmapClient = new window.ROSLIB.Service({
    ros: ros,
    name: '/move_base/clear_costmaps',
    serviceType: 'std_srvs/Empty'
  });

  clearCostmapClient.callService('std_srvs/Empty', (result) => {
    console.log('called service ' + clearCostmapClient.name);
  });
}

const moveToRelGoal = (x, y, w) => {
  const ros = getRosConnection(robotname);
  const moveClient = new window.ROSLIB.ActionClient({
    ros: ros,
    actionName: 'move_base_msgs/MoveBaseAction',
    serverName: '/move_base'
  });
  // Check ros connection
  
  const goalX = x;
  const goalY = y;
  const goalW = Math.cos((w * Math.PI) / (180 * 2));
  const goalZ = Math.sin((w * Math.PI) / (180 * 2));
  console.log('Goal X:', x);
  console.log('Goal Y:', y);
  console.log('Goal W:', w);
  console.log('Goal Z (sin):', goalZ);
  console.log('Goal W (cos):', goalW);

  const relGoal = new window.ROSLIB.Goal({
    actionClient: moveClient,
    goalMessage: {
      target_pose: {
        header: {
          frame_id: 'map'
        },
        pose: {
          position: {
            x: goalX,
            y: goalY,
            z: 0
          },
          orientation: {
            x: 0,
            y: 0,
            z: goalZ,
            w: goalW
          }
        }
      }
    }
  });

  console.log("Realgoal", relGoal);
  clearCostmap();
  relGoal.send();
}

const selectWaypointById = () => {
  const ros = getRosConnection(robotname);
  console.log('Selected id in button:', waypointset);
  console.log('Ros Connection status at selectWaypointById:', ros)

 
  if (waypointset.id === 0 || waypointset.id === null || waypointset.id === undefined) {
    console.log('Waypoint not found with ID');
    return;
  }
  
    console.log('Selected waypoint:', waypointset);
    const relX = typeof waypointset.x === 'string' ? parseFloat(waypointset.x) : waypointset.x;
    const relY = typeof waypointset.y === 'string' ? parseFloat(waypointset.y) : waypointset.y;
    const relW = typeof waypointset.w === 'string' ? parseFloat(waypointset.w) : waypointset.w;
    
    // Call moveToRelGoal with the waypoint's x, y, and w values
    amclUpdate();
    moveToRelGoal(relX, relY, relW);
};


  return (
    <Row>
      <FormControl style={{ 
                            width:'100%',
                            margin:'auto',
                            backgroundColor:'white',
                            borderBlockColor:'white',
                            border:'1px',
                            borderRadius: '5px',
                            }}>
        <InputLabel id="select-way-point">Select Waypoint</InputLabel>
        <Select
          labelId="select-way-point"
          id="select-way-point"
          value={selectedWaypoint}
          label="Select Waypoint"
          onChange={handleWaypointSelection}
        >
        {waypoints
          .slice() 
          .sort((a, b) => a.id - b.id) 
          .map((waypoint) => (
            <MenuItem key={waypoint.id} value={waypoint.id}>
              {waypoint.id} ({waypoint.x},{waypoint.y},{waypoint.w})
            </MenuItem>
      ))}
        </Select>
      </FormControl>

      <Col>
        <button  style={{ marginTop:'1rem'}} className="btnSelectWaypoint" onClick={selectWaypointById}> Send Waypoint </button>
      </Col>
    </Row>
  );
};

export default WaypointSelector;



