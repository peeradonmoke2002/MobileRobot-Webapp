import React, { useEffect, useState } from 'react';
import { connectToMachine, getRosConnection } from "../rosbridge";
import { ZoomPanEvent } from '../ZomPanEvent';
import { Row, Col } from 'react-bootstrap';
import Switch from '@mui/joy/Switch';
import MapList from '../MapManager/MapList';
import MapSelector from '../MapManager/MapSelecter';
import TwoDMap from '../Localization/TwoDMap';
import turtlebot from '../../../Image/turtlebot.png'

const MapControl = ({ robotname, ip , pose, path}) => {
    
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [actionClient, setActionClient] = useState(null);
    const [viewer, setViewer] = useState(null);
    
    useEffect(() => {
        const x = window.innerWidth;
        const twoDmapWidth = x * 0.48;
        const twoDmapHeight = x * 0.48 * 0.75;

        // Connect to ROS
        const ros = connectToMachine(robotname, `ws://${ip}:9090`);

        // Create ROS2D Viewer
        const viewer = new window.ROS2D.Viewer({
            divID: 'twod-map',
            width: twoDmapWidth,
            height: twoDmapHeight,
        });
        setViewer(viewer);

        // Create OccupancyGridClient
        const gridClient = new window.ROS2D.OccupancyGridClient({
            ros: ros,
            Topic: '/map',
            rootObject: viewer.scene,
            continuous: true,
            rootObject: viewer.scene
        });


        const actionClient = new window.ROSLIB.ActionClient({
            ros : ros,
            actionName : 'move_base_msgs/MoveBaseAction',
            serverName : '/move_base'
        });
        setActionClient(actionClient);

        // Create a marker representing the robot.
        const poseListener = new window.ROSLIB.Topic({
            ros: ros,
            name: '/amcl_pose',
            messageType: pose.messageType,
            throttle_rate: 200,
        });
        console.log('robotname', robotname);

        // Add planned path
        const plannedPath = new window.ROS2D.NavPath({
            ros: ros,
            rootObject: viewer.scene,
            pathTopic: path.topic_name,
            messageType: path.messageType,
            
        });


        gridClient.on('change', function () {
            viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
            viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
            plannedPath.initScale();

            displayPoseMarker();
            ZoomPanEvent(viewer, gridClient);
        });

        // Showing the pose on the map
        const displayPoseMarker = () => {
            // Create a marker representing the robot.
            const robotMarker = new window.ROS2D.NavigationArrow({
                size: 12,
                strokeSize: 1,
                fillColor: window.createjs.Graphics.getRGB(255, 128, 0, 0.66),
                pulse: true
            });
    
            robotMarker.visible = false;
            gridClient.rootObject.addChild(robotMarker);
            let initScaleSet = false;

            poseListener.subscribe((message) => {
                // Orientate the marker based on the robot's pose.
                robotMarker.x = message.pose.pose.position.x;
                robotMarker.y = -message.pose.pose.position.y;
                

                if (!initScaleSet) {
                    robotMarker.scaleX = 1.0 / viewer.scene.scaleX;
                    robotMarker.scaleY = 0.7 / viewer.scene.scaleY;
    
                    initScaleSet = true;
                }
                robotMarker.rotation = viewer.scene.rosQuaternionToGlobalTheta(message.pose.pose.orientation);
                robotMarker.visible = true;
            });
        };

        return () => {
          
            // Unsubscribe from the pose listener
            poseListener.unsubscribe();
            // Cleanup the ROS2D objects
            viewer.scene.removeChild(gridClient.rootObject);
            // Cleanup other resources
            ros.close();
        };
    }, [robotname, ip]);

     // Turn on/off the navigation click
     useEffect(() => {
        if (isSwitchOn == true){
            console.log('Switch is on');
            var confirmationShown = false;
            // const viewer = viewerRef.current;
            const rootObject = viewer.scene;
            var currentGoal;
            let orientationMarker;
            let position = null;
            let positionVec3 = null;
            let mouseDown = false;
            let xDelta = 0;
            let yDelta = 0;
            let goalMarker = null
            
            const stage = rootObject instanceof window.createjs.Stage ? rootObject : rootObject.getStage();
            const sendGoal = (pose) => {
                if (!confirmationShown) {
                    // Check if there is an ongoing goal
                    if (currentGoal && currentGoal.status === 'active') {
                        // Ask the user if they want to cancel the ongoing goal
                        const cancelConfirmed = window.confirm(
                            'Previous navigation is not finished yet! Do you want to cancel?'
                        );
                    }
    
                    // Proceed with creating a new goal
                    var userConfirmed = window.confirm(
                        'Navi Confirmation: \n\n Please click <OK> to start AGV navigation!'
                    );
    
                    console.log('User confirmed:', userConfirmed);
    
                    if (userConfirmed) {
                        confirmationShown = true;
                        var goal = new window.ROSLIB.Goal({
                            actionClient: actionClient,
                            goalMessage: {
                                target_pose: {
                                    header: {
                                        frame_id: 'map',
                                    },
                                    pose: pose,
                                },
                            },
                        });
                        goal.send();
    
                        currentGoal = goal;
    
                        // Create a marker for the goal
                        if (goalMarker === null) {
                            goalMarker = new window.ROS2D.NavigationArrow({
                                size: 15,
                                strokeSize: 1,
                                fillColor: window.createjs.Graphics.getRGB(
                                    255,
                                    64,
                                    128,
                                    0.66
                                ),
                                pulse: true,
                            });
                        }
                        rootObject.addChild(goalMarker);
    
                        goalMarker.x = pose.position.x;
                        goalMarker.y = -pose.position.y;
                        goalMarker.rotation = stage.rosQuaternionToGlobalTheta(
                            pose.orientation
                        );
                        goalMarker.scaleX = 1.0 / stage.scaleX;
                        goalMarker.scaleY = 1.0 / stage.scaleY;
    
                        goal.on('result', function () {
                            rootObject.removeChild(goalMarker);
                        });
                        confirmationShown = false;
                    } else {
                        console.log('User clicked cancel');
                        confirmationShown = false;
                        window.alert('Navigation is cancelled!');
                    }
                }
            };

             // Cancel the current goal
             const cancelGoal = () => {
                if (currentGoal !== 'undefined' && currentGoal !== null && currentGoal.status === 'active') {
                    currentGoal.cancel();
                    rootObject.removeChild(goalMarker); // Remove the goal marker
                }
                else {
                    window.alert('No active goal to cancel!');
                }
            }
    
            const mouseEventHandler = (event, mouseState) => {
                if (mouseState === 'down') {
                    const pos = stage.globalToRos(event.stageX, event.stageY);
                    position = pos;
                    positionVec3 = new window.ROSLIB.Vector3(pos);
                    mouseDown = true;
                } else if (mouseState === 'move') {
                    rootObject.removeChild(orientationMarker);
            
                    if (mouseDown === true) {
                    let currentPos = stage.globalToRos(event.stageX, event.stageY);
                    let currentPosVec3 = new window.ROSLIB.Vector3(currentPos);
            
                    orientationMarker = new window.ROS2D.NavigationArrow({
                        size: 15,
                        strokeSize: 1,
                        fillColor: window.createjs.Graphics.getRGB(255, 0, 0, 0.66),
                        pulse: false
                    });
            
                    xDelta = currentPosVec3.x - positionVec3.x;
                    yDelta = currentPosVec3.y - positionVec3.y;
            
                    const thetaRadians = Math.atan2(xDelta, yDelta);
                    let calculatedThetaDegrees = (thetaRadians * (180.0 / Math.PI));
            
                    if (calculatedThetaDegrees >= 0 && calculatedThetaDegrees <= 180) {
                        calculatedThetaDegrees += 270;
                    } else {
                        calculatedThetaDegrees -= 90;
                    }
            
                    orientationMarker.x = positionVec3.x;
                    orientationMarker.y = -positionVec3.y;
                    orientationMarker.rotation = calculatedThetaDegrees;
                    orientationMarker.scaleX = 1.0 / stage.scaleX;
                    orientationMarker.scaleY = 1.0 / stage.scaleY;
            
                    rootObject.addChild(orientationMarker);
                    }
                } else if (mouseDown) { // mouseState === 'up'
                    mouseDown = false;
            
                    const goalPos = stage.globalToRos(event.stageX, event.stageY);
                    const goalPosVec3 = new window.ROSLIB.Vector3(goalPos);
            
                    xDelta = goalPosVec3.x - positionVec3.x;
                    yDelta = goalPosVec3.y - positionVec3.y;
            
                    let thetaRadians = Math.atan2(xDelta, yDelta);
            
                    if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
                    thetaRadians += (3 * Math.PI / 2);
                    } else {
                    thetaRadians -= (Math.PI / 2);
                    }
            
                    const qz = Math.sin(-thetaRadians / 2.0);
                    const qw = Math.cos(-thetaRadians / 2.0);
            
                    const orientation = new window.ROSLIB.Quaternion({ x: 0, y: 0, z: qz, w: qw });
            
                    const pose = new window.ROSLIB.Pose({
                    position: positionVec3,
                    orientation: orientation,
                    });
            
                    sendGoal(pose);
                }
                };
            
                const handleMouseDown = (event) => mouseEventHandler(event, 'down');
                const handleMouseMove = (event) => mouseEventHandler(event, 'move');
                const handleMouseUp = (event) => mouseEventHandler(event, 'up');
            
                rootObject.addEventListener('stagemousedown', handleMouseDown);
                rootObject.addEventListener('stagemousemove', handleMouseMove);
                rootObject.addEventListener('stagemouseup', handleMouseUp);
            
                return () => {
                // Cleanup: Remove event listeners if component unmounts
                    rootObject.removeEventListener('stagemousedown', handleMouseDown);
                    rootObject.removeEventListener('stagemousemove', handleMouseMove);
                    rootObject.removeEventListener('stagemouseup', handleMouseUp);
                };
        }
        else {
            // Placeholder statement
            console.log('Switch is off');
            return () => {};
        }   
    }, [isSwitchOn]);

    return (
        <Row>
            <div id="twod-map"/>
            <Row>
                <div style={{ 
                        display: 'flex', 
                        flexGrow:'1',
                        justifyContent:'space-between',
                        marginTop:'10px',}}>
                    <Col xs={4}>
                        <div    style={{    alignItems:'center',
                                            display:'flex' }}>
                            <div style={{marginRight: '10px',}}>
                                Navigation Click:
                            </div>
                            <Switch 
                                checked={isSwitchOn} 
                                onChange={(event) => setIsSwitchOn(event.target.checked)}
                                color={isSwitchOn ? 'success' : 'neutral'} 
                                variant={isSwitchOn ? 'solid' : 'outlined'}
                                // endDecorator={isSwitchOn ? 'On' : 'Off'} 
                                // slotProps={{ endDecorator: { sx: { minWidth: 24 } } }} 
                            />
                            <span style={{ marginLeft: '5px',display:'flex' }}>{isSwitchOn ? 'On' : 'Off'}</span>
                        </div>
                    </Col>
                    <Col xs={8}>
                        <div   style={{
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'right'
                                }}>
                            <MapList robotname={robotname} ip={ip}/>
                        </div>
                    </Col>


                </div>
            </Row>
            <Row>
                <div style={{ display: 'flex', alignItems:'center'}}>
                    <div>Select available map:</div>
                    <div style={{paddingTop:'2rem'}}>
                        <MapSelector robotname={robotname} ip={ip}/>
                    </div>
                </div>
            </Row>
        </Row>
    );
}

export default MapControl;
