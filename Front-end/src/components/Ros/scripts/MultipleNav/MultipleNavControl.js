import React, { useEffect, useState, useRef } from 'react';
import { getRosConnection} from "../rosbridge";
import WaypointSelector from '../waypoint/WaypointSelecter';
import AmsclState from '../RobotState/AmclState';
import { useDispatch, useSelector } from 'react-redux';
import { getPositionMap } from '../../Data/agvSlice';
import * as Three from "three";
import { Button, Row, Col } from 'react-bootstrap';
import CurrentSpeed from '../RobotState/CurrentSpeed';

const MutipleNavControl = ({robotname, ip, amcl, speed, pos}) => {

    const position = useSelector(getPositionMap);

  
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
        const poseGoalNow = {
            pose:{
                position:{
                    x: goalX,
                    y: goalY,
                    z: 0
                },
                orientation:{
                    x: 0,
                    y: 0,
                    z: goalZ,
                    w: goalW
                }
            
            }
        }
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

        // goal(relGoal);
        // poseGoal(poseGoalNow);
        // relGoal.on('result', function() {
        //     console.log('Goal reached successfully!');
        // });
       

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

    const getOrientationFromQuaternion = (rosOrientationQuaternion) => {
        const q = new Three.Quaternion(
          rosOrientationQuaternion.x,
          rosOrientationQuaternion.y,
          rosOrientationQuaternion.z,
          rosOrientationQuaternion.w
        );
        // convert this quaternion into Roll, Pitch and Yaw
        const RPY = new Three.Euler().setFromQuaternion(q);
    
        return RPY["_z"] * (180 / Math.PI);
      };

    const updateLabels = () => {
        if (position) {
            document.getElementById('relGoalX').value = position.position.x.toFixed(3);
            document.getElementById('relGoalY').value = position.position.y.toFixed(3);
            document.getElementById('relGoalW').value = getOrientationFromQuaternion(position.position.orientation).toFixed(3);
        }
    };
        


  return (
    <div>
        <Row style={{paddingTop:'1rem',
                    paddingBottom:'1rem',
                    marginTop:'1rem',
                    marginLeft:'5px',
                    marginRight:'5px',
                    borderTop:'1px solid'}}>
                <AmsclState robotname={robotname} ip={ip} amcl={amcl} />
               
        </Row>
        <Row style={{marginTop:'1rem',
                    paddingTop:'1rem',
                    paddingBottom:'1rem',
                    marginLeft:'5px',
                    marginRight:'5px',
                    borderTop:'1px solid'}}>
                <CurrentSpeed robotname={robotname} ip={ip} speed={speed} position={pos} />
        </Row>
      

        <Row style={{marginTop:'1rem',
                    paddingTop:'1rem',
                    paddingBottom:'1rem',
                    marginLeft:'5px',
                    marginRight:'5px',
                    borderTop:'1px solid'}}>
            <Row>
                <div style={{display:'flex',
                            justifyContent:'flex-start',
                            fontSize:'20px',
                            textDecoration: 'underline'}}>
                    Input destination
                </div>
            </Row>
            <div style={{justifyContent:'center',marginTop:'1rem',alignItems:'center'}}>
                <div style={{marginBottom:'10px'}}>Click your goal position then update here!</div>
                <Button variant='secondary'
                        onClick={updateLabels}
                        style={{marginBottom:'20px'}}>
                    Update goal
                </Button>
                <div>Or type goal position</div>
            </div>
            <Row>
                <div style={{marginLeft:'10px',
                            marginTop:'1rem'}}>
                <label style={{display:'flex',justifyContent:'flex-start'}}>
                    X Coor:
                    <input  type="number"
                            id="relGoalX"
                            style={{ marginLeft: '32px' }}/>
                </label>
                <label style={{display:'flex',justifyContent:'flex-start'}}> 
                    Y Coor:
                    <input  type="number"
                            id="relGoalY"
                            style={{ marginLeft: '34px' }}/>
                </label>
                <label style={{display:'flex',justifyContent:'flex-start'}}>
                    Orien (W):
                    <input  type="number"
                            id="relGoalW"
                            style={{ marginLeft: '10px' }}/>
                </label>
                </div>
            </Row>
            <Row>
                <div style={{display:'flex', 
                            justifyContent:'center',
                            marginLeft:'12px',
                            marginTop:'1rem'}}>
                    <Button onClick={moveToRelativePos}
                            size="sm"
                            variant='success'>
                        Move To Goal
                    </Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button variant='danger'
                            size="sm" 
                            onClick={moveBaseCancel}>
                        Cancel
                    </Button>
                </div>
            </Row>
            <Row style={{marginTop:'1rem'}}>
                <div style={{display:'flex', 
                            justifyContent:'center',
                            marginLeft:'12px',
                        }}>
                    <Col xs={5}>
                        <hr style={{  color: '#000000',
                                    backgroundColor: '#000000',
                                    height: '2px',
                                    }}/>
                    </Col>
                    <Col xs={2}>
                        Or
                    </Col>
                    <Col xs={5}>
                        <hr style={{  color: '#000000',
                                    backgroundColor: '#000000',
                                    height: '2px',
                                    }}/>
                    </Col>
                </div>
            </Row>
            <Row>
                <div style={{display:'flex',
                            justifyContent:'center',
                            marginTop:'1rem',
                            marginLeft:'12px'}}>
                    <div style={{width:'250px'}}>
                        <WaypointSelector robotname={robotname} ip={ip}/>
                    </div>
                </div>
            </Row>
        </Row>
    </div>
   );
  
};

export default MutipleNavControl;


