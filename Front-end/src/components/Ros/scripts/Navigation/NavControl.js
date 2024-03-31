import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { connectToMachine , getRosConnection} from "../rosbridge";
import WaypointSelector from '../waypoint/WaypointSelecter';
import AmsclState from '../RobotState/AmclState';
import MapControl from './MapControl';

const NavControl = ({robotname,ip}) => {

  
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
    console.log(ros)
    const moveClient = new window.ROSLIB.ActionClient({
      ros: ros,
      actionName: 'move_base_msgs/MoveBaseAction',
      serverName: '/move_base'
    });
    // Check ros connection
    console.log('ROS connection status in moveToRelGoal:', ros.isConnected);
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
      actionClient : moveClient,
      goalMessage : {
            target_pose : {
                  header : {
                        frame_id : 'map'
                  },
                  pose : {
                        position: {
                              x: goalX,
                              y: goalY,
                              z: 0
                        },
                        orientation : {
                              x:0,
                              y:0,
                              z: goalZ,
                              w: goalW
                        }
                  },
            }
      }
   });

    console.log("Realgoal", relGoal);
    clearCostmap();
    relGoal.send();
  }

  const moveToRelativePos = () => {
    const relX = Number(document.getElementById('relGoalX').value);
    const relY = Number(document.getElementById('relGoalY').value);
    const relW = Number(document.getElementById('relGoalW').value);
    moveToRelGoal(relX, relY, relW);
  }

  const moveBaseCancel = () => {
    const ros = getRosConnection(robotname);
    const cancelGoalPub = new window.ROSLIB.Topic({
      ros: ros,
      name: '/move_base/cancel',
      messageType: 'actionlib_msgs/GoalID'
    });

    const cancelMsg = new window.ROSLIB.Message({
      id: ''
    });
    cancelGoalPub.publish(cancelMsg);
  }
  


  return (
    <div>
      <div >
      <h3>Relative Position</h3>
      <br />
        <div className="input-section flex">
          <br />
          <label style={{ marginRight: '10px' }}>
            X Coordinate:
            <input type="number" id="relGoalX" style={{ marginLeft: '10px' }} />
          </label>
          <label style={{ marginRight: '10px' }}> 
            Y Coordinate:
            <input type="number" id="relGoalY" style={{ marginLeft: '20px' }}/>
          </label>
          <label style={{ marginRight: '10px' }}>
            Orientation (W):
            <input type="number" id="relGoalW" style={{ marginLeft: '10px' }}/>
          </label>
        </div>
            <AmsclState robotname={robotname} ip={ip} />
            <button  class="moveToRelativePosBtn" onClick={moveToRelativePos} style={{ marginRight: '10px' }}>Move To Relative Position</button>
            <button  class="cancelRelativePosBtn" onClick={moveBaseCancel}>Cancel Relative Position</button>
            <WaypointSelector robotname={robotname} ip={ip}/>
            <button className="btnamcl" onClick={amclUpdate}> initAmcl </button>
      </div>
    </div>
   );
  
};

export default NavControl;


