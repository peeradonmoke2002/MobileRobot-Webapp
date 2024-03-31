import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine } from "../rosbridge";
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { fetchMoveBaseInformation, getMoveInformation, addAGVsPositionMap } from '../../Data/agvSlice';
import {getAGVsTopics} from '../../Data/TopicSlice';
import { ZoomPanEvent } from '../ZomPanEvent';
import Switch from '@mui/joy/Switch';


const MapNavAll = ({onSelect, pose, path}) => {
   
  const Robotdata = useSelector(getMoveInformation);
  const TopicAll = useSelector(getAGVsTopics);
  // const [goalpos, setGoal] = useState(goal);
  // const [poseGoalNow, setPoseGoal] = useState(poseGoal);
  // console.log('goalpos:',goalpos)
  // console.log('poseGoalNow:',poseGoalNow)

  const dispatch = useDispatch();
  // Create a ref to store the viewer
  const viewerRef = useRef(null);
  // Get the window width
  const x = window.innerWidth;
  const twoDmapWidth = x * 0.38;
  const twoDmapHeight = x * 0.48 * 0.55;
  // Set mainRobot and mainGridClient
  const [mainGridClient, setMainGridClient] = useState(null);
  const [mainRobot, setMainRobot] = useState({
      name: onSelect.name,
      ip: onSelect.rosbridge_server_ip,
      ros: null,
      gridClient: null,
  });

 const [robotColors, setRobotColors] = useState({});
 const [robotPoseReceived, setRobotPoseReceived] = useState({});

 const [isSwitchOn, setIsSwitchOn] = useState(false);

  // Get random color for the robot
  const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  };

  const getRobotColor = (robotName) => {
      if (robotColors[robotName]) {
        return robotColors[robotName];
      } else {
        const color = getRandomColor();
        setRobotColors((prevColors) => ({ ...prevColors, [robotName]: color }));
        return color;
      }
  };
  
  // fetch Robots DATA


  useEffect(() => {
    const connectToMainRobot = async () => {
          // Connect to ROS
          const mainRos = connectToMachine(mainRobot.name, `ws://${mainRobot.ip}:9090`);
          // Create ROS2D Viewer
          viewerRef.current = new window.ROS2D.Viewer({
              divID: 'twod-map',
              width: twoDmapWidth,
              height: twoDmapHeight,
          });
          
          const viewer = viewerRef.current;

  
          // Create OccupancyGridClient
          const mainGridClient = new window.ROS2D.OccupancyGridClient({
              ros: mainRos,
              rootObject: viewer ? viewer.scene : null,
              continuous: true,
          });
          // Create a marker representing the robot.
          const MainPoseListener = new window.ROSLIB.Topic({
              ros: mainRos,
              name: pose.topic_name,
              messageType: pose.messageType,
              throttle_rate: 200,
          });

           // Add planned path
          const plannedPathMain = new window.ROS2D.NavPath({
              ros: mainRos,
              rootObject: viewer.scene,
              pathTopic: path.topic_name,
              messageType: path.messageType,
          });
          

          const handleGridChange = () => {
              viewer.scaleToDimensions(mainGridClient.currentGrid.width, mainGridClient.currentGrid.height);
              viewer.shift(mainGridClient.currentGrid.pose.position.x, mainGridClient.currentGrid.pose.position.y);
              plannedPathMain.initScale();
              displayPoseMarker(MainPoseListener, mainGridClient, mainRobot.name);
              ZoomPanEvent(viewer, mainGridClient);
          };

          // make the map fully visible
          mainGridClient.on('change', handleGridChange);

          // Showing the pose on the map
          const displayPoseMarker = (MainPoseListener, mainGridClient, robotName) => {
              let robotColor;

              // Check if the robot is the main robot
              if (robotName === mainRobot.name) {
                // Use a specific color for the main robot
                robotColor = "#ff8000"
                setRobotColors((prevColors) => ({ ...prevColors, [robotName]: robotColor }));
   
              } else {
                // Use a random color for other robots
                robotColor = getRobotColor(robotName);
              }
              // Create a marker representing the robot.
              const robotMarker = new window.ROS2D.NavigationArrow({
              size: 12,
              strokeSize: 1,
              fillColor: robotColor,
              pulse: true
              });
              robotMarker.visible = false;
              mainGridClient.rootObject.addChild(robotMarker);
              let initScaleSet = false;

              MainPoseListener.subscribe((message) => {
                  setRobotPoseReceived((prevRobotPoseReceived) => ({
                      ...prevRobotPoseReceived,
                      [robotName]: true,
                    }));
              // Orientate the marker based on the robot's pose.
              robotMarker.x = message.pose.pose.position.x;
              robotMarker.y = -message.pose.pose.position.y;
              // robotMarker
              if (!initScaleSet) {
                  robotMarker.scaleX = 1.0 / viewer.scene.scaleX;
                  robotMarker.scaleY = 0.7 / viewer.scene.scaleY;
                  initScaleSet = true;
              }
              robotMarker.rotation = viewer.scene.rosQuaternionToGlobalTheta(message.pose.pose.orientation);
              robotMarker.visible = true;
              });
          };
  
          setMainGridClient(mainGridClient);
          setMainRobot({
              ...mainRobot,
              ros: mainRos,
              gridClient: mainGridClient,
          });


          return () => {

              MainPoseListener.unsubscribe();
              viewer.scene.removeChild(mainGridClient.rootObject);
          };
      };
      connectToMainRobot();
  }, [onSelect]);

  useEffect(() => {
      const viewer = viewerRef.current;
      if (viewer && mainGridClient) {
          console.log('viewer:',viewer)
          console.log('mainGridClient:',mainGridClient)
          console.log('Robotdata:', Robotdata)
          const otherRobots = Robotdata.filter(robot => robot.name !== mainRobot.name);
          const otherTopics = TopicAll.filter(topic => topic.name !== mainRobot.name);
          // console.log('otherRobots:',otherRobots)
          // console.log('otherTopics:',otherTopics)
      
          const GetotherRobotsPose = otherRobots.map(({ name, rosbridge_server_ip, topics }) => {
              const ros = connectToMachine(name, `ws://${rosbridge_server_ip}:9090`);
              // const pose = topics.find(topic => topic.name === 'nav_poseListener');
              const pose = topics.nav_poseListener;
              const poseListener = new window.ROSLIB.Topic({
                  ros: ros,
                  name: pose.topic_name, 
                  messageType: pose.messageType,
                  throttle_rate: 200,
              });
              const plannedPath = new window.ROS2D.NavPath({
                  ros: ros,
                  rootObject: viewer.scene,
                  // pathTopic: '/move_base/GlobalPlanner/plan',
                  pathTopic: path.topic_name,
                  messageType: path.messageType,
              });
              
              const displayPoseMarker = () => {
                  const robotMarker = new window.ROS2D.NavigationArrow({
                  size: 12,
                  strokeSize: 1,
                  fillColor: getRobotColor(name),
                  pulse: true,
                  });
                  robotMarker.visible = false;
                  mainGridClient.rootObject.addChild(robotMarker);
                  let initScaleSet = false;
          
                  poseListener.subscribe((message) => {
                      setRobotPoseReceived((prevRobotPoseReceived) => ({
                          ...prevRobotPoseReceived,
                          [name]: true,
                        }));
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
              const handleGridChange = () => {
                  plannedPath.initScale();
                  displayPoseMarker();
              };
  
              // make the map fully visible
              mainGridClient.on('change', handleGridChange);
              // mainGridClient.on('change', displayPoseMarker);
          
          
              return poseListener;
          });
      
          return () => {
              GetotherRobotsPose.forEach(poseListener => poseListener.unsubscribe());

          };
      }
  }, [mainGridClient, viewerRef, mainRobot]);
  
 
  useEffect(() => {
      if (!isSwitchOn) return;
    
      const viewer = viewerRef.current;
      const rootObject = viewer.scene;
    
      let orientationMarker;
      let position = null;
      let positionVec3 = null;
      let mouseDown = false;
      let xDelta = 0;
      let yDelta = 0;
    
      const stage = rootObject instanceof window.createjs.Stage ? rootObject : rootObject.getStage();
    
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
    
          const posMap = {
            position: {
              x: pose.position.x,
              y: pose.position.y,
              orientation: {
                x: pose.orientation.x,
                y: pose.orientation.y,
                z: pose.orientation.z,
                w: pose.orientation.w,
              },
            },
          };
    
          dispatch(addAGVsPositionMap(posMap));
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
  }, [isSwitchOn, viewerRef]);

    return (
      <Row>
        <div id="twod-map"/>
        <Row>
          <div style={{ alignItems:'center',
                        display:'flex',
                        marginLeft: '4rem' }}>
            <div style={{marginRight: '10px',fontWeight:'bold'}}>
                      Map Interaction:
            </div>
            <Switch
                    checked={isSwitchOn}
                    onChange={(event) =>
                        setIsSwitchOn(event.target.checked)
                    }
                    color={isSwitchOn ? 'success' : 'neutral'}
                    variant={isSwitchOn ? 'solid' : 'outlined'}
                />
            <span style={{ marginLeft: '5px',display:'flex' }}>{isSwitchOn ? 'On' : 'Off'}</span>

            <span style={{ marginRight: '10px',marginLeft: '2rem', fontWeight:'bold'}}>Robot Pos Colors:</span>
            {Object.entries(robotColors).length > 0 ? (
              Object.entries(robotColors)
                  .filter(([robotName]) => robotPoseReceived[robotName]) 
                  .map(([robotName, color]) => (
                      <div key={robotName} style={{ marginRight: '18px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, marginRight: '8px' }}></div>
                          <div style={{ color: color }}>
                              {robotName}
                          </div>
                      </div>
                  ))
            ) : (
                <span>---/---</span>
            )}
          </div>
        </Row>
      </Row>
    );
};
    
export default MapNavAll;