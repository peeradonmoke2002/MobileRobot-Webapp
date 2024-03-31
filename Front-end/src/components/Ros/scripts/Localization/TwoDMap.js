import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine , getRosConnection} from "../rosbridge";
import { ZoomPanEvent } from '../ZomPanEvent';
import { Row } from 'react-bootstrap';
import MapList from '../MapManager/MapList';


const TwoDMap = ({robotname, ip, setInitMarker, pose, scan}) => {
  const [x] = useState(window.innerWidth);
  const [twoDmapHeight, setTwoDmapHeight] = useState(x * 0.48 * 0.75);
  const [twoDmapWidth, setTwoDmapWidth] = useState(x * 0.48);
  useEffect(() => {
    const ros = connectToMachine(robotname, `ws://${ip}:9090`);

    const viewer = new window.ROS2D.Viewer({
        divID: 'twod-map',
        width: twoDmapWidth,
        height: twoDmapHeight,
    });

    const gridClient = new window.ROS2D.OccupancyGridClient({
        ros: ros,
        rootObject: viewer.scene,
        continuous: true,
        topic: '/map',
    });

    gridClient.on('change', function () {
        viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
        viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
        displayPoseMarker();
        ZoomPanEvent(viewer,gridClient);
        displayLaserScan(ros);
    });

    const poseListener = new window.ROSLIB.Topic({
      ros: ros,
      name: pose.topic_name,
      messageType: pose.messageType,
      throttle_rate: 200,
      queue_length: 5
    });


    const initMarker = new window.ROS2D.NavigationArrow({
        size: 0.5,
        strokeSize: 0.1,
        strokeColor: window.createjs.Graphics.getRGB(255, 0, 0, 0.66),
        fillColor: window.createjs.Graphics.getRGB(0, 255, 0, 0.66),
        pulse: true
    });

    initMarker.visible = false;
    gridClient.rootObject.addChild(initMarker);
    let initScaleSet2 = false;
    if (!initScaleSet2) {
      initMarker.scaleX = 1.0 / viewer.scene.scaleX;
      initMarker.scaleY = 0.7 / viewer.scene.scaleX;
      initScaleSet2 = true;
     }

    setInitMarker(initMarker);
   
    const displayPoseMarker = () => {
     
      const robotMarker = new window.ROS2D.NavigationArrow({
        size: 12,
        strokeSize: 1,
        fillColor: window.createjs.Graphics.getRGB(255, 128, 4, 0.66),
        pulse: false
      });

      robotMarker.visible = false;

       
      gridClient.rootObject.addChild(robotMarker);

      let initScaleSet = false;

      poseListener.subscribe((message) => {
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
    }
    const tfClient = new window.ROSLIB.TFClient({
      ros: ros,
      angularThres: 0.05,
      transThres: 0.05,
      fixedFrame: 'map',
      rate: 2.0
  });

  let lasertf = { x: 0, y: 0, rotation: 0 };
  let base_footprint_tf = null;
  tfClient.subscribe('base_link', function(tf) {
      base_footprint_tf = tf;
      console.log('lasertf:', lasertf);
  });

   function displayLaserScan(ros) {
      const topic = scan.topic_name;
      const marker_radius = 0.04;
      const marker_fill_color = window.createjs.Graphics.getRGB(255, 0, 0, 1.0);
      const laser_listener = new window.ROSLIB.Topic({
          ros: ros,
          name: topic,
          messageType: scan.messageType
      });
  
      let prev_markers = new window.createjs.Container(); // Initialize container for markers
  
      laser_listener.subscribe(function (msg) {
          const num = msg.ranges.length;
          const angles = Array.from({ length: num }, (_, i) => msg.angle_min + (msg.angle_max - msg.angle_min) / num * i);
          const poses_2d = angles.flatMap((angle, index) => {
              const range = msg.ranges[index];
              if (range > msg.range_min && range < msg.range_max) {
                  return [[Math.cos(angle) * range, Math.sin(angle) * range, -angle]]
              }
              return []  // Skip this point
          });
  
          if (base_footprint_tf === null) {
              console.log('no tf');
              return;
          }
  
          // Transform points collectively
          const transformed_poses = poses_2d.map(pt => {
              const pose = new window.ROSLIB.Pose({
                  position: new window.ROSLIB.Vector3({
                      x: pt[0], y: pt[1], z: 0
                  }),
                  orientation: new window.ROSLIB.Quaternion({
                      x: 0, y: 0, z: Math.cos(pt[2]), w: Math.sin(pt[2])
                  })
              });
              pose.applyTransform(base_footprint_tf);
              return pose;
          });
  
          // Update existing markers
          prev_markers.removeAllChildren(); // Clear previous markers
          transformed_poses.forEach(pt => {
              const marker = new window.createjs.Shape(
                  new window.createjs.Graphics()
                      .beginFill(marker_fill_color)
                      .drawCircle(0, 0, marker_radius)
                      .endFill()
              );
              marker.x = pt.position.x;
              marker.y = -pt.position.y;
              marker.rotation = viewer.scene.rosQuaternionToGlobalTheta(pt.orientation);
              prev_markers.addChild(marker);
          });
  
          viewer.addObject(prev_markers);
      });
  }
 
    return () => {
      viewer.scene.removeChild(gridClient.rootObject);
      poseListener.unsubscribe();
    };
  }, []);



  return (
    <Row>
        <div id="twod-map"/>
        <Row>
            <div style={{
                    display:'flex',
                    marginTop:'10px',
                    justifyContent:'flex-end',
                    alignItems:'center'}}>
                <div>
                    <MapList robotname={robotname} ip={ip}/>
                </div>
            </div>
        </Row>
    </Row>
  );

};
export default TwoDMap;