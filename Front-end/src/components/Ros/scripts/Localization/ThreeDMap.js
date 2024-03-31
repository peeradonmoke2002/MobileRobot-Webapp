import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine , getRosConnection} from "../rosbridge";

const ThreeDMap = ({robotname,ip, scan}) => {
  
  const [x] = useState(window.innerWidth);
  const [twoDmapHeight, setTwoDmapHeight] = useState(x * 0.48 * 0.75);
  const [twoDmapWidth, setTwoDmapWidth] = useState(x * 0.48);

  useEffect(() => {
  
      const ros = connectToMachine(robotname, `ws://${ip}:9090`);

      const viewer3D = new window.ROS3D.Viewer({
        divID: 'threed-map',
        width: twoDmapWidth,
        height: twoDmapHeight,
        antialias: true,
        // background: '#ffffff'
      });


      const tfClient = new window.ROSLIB.TFClient({
        ros: ros,
        angularThres: 0.05,
        transThres: 0.05,
        rate: 2.0
      });

      const grid3D = new window.ROS3D.OccupancyGridClient({
        ros: ros,
        topic: "/map", //"/move_base/global_costmap/costmap",
        tfClient: tfClient,
        continuous: true,
        rootObject: viewer3D.scene,
        color: { r: 255, g: 255, b: 255 },
        opacity: 0.80,
        compression: 'cbor',
      });

      const cloudClient = new window.ROS3D.LaserScan({   // for front SICK scanner
        ros: ros,
        tfClient: tfClient,
        rootObject: viewer3D.scene,
        topic: scan.topic_name,
        material: { size: 0.20, color: 0xff0000 },
        //  max_pts     : 541, //1081
        pointRatio: 1,   // - point subsampling ratio (default: 1, no subsampling)
        messageRatio: 1,  // - message subsampling ratio (default: 1, no subsampling)
        compression: 'cbor'
      });

      const arrow = new window.ROS3D.Arrow({
        length: 0.5,
        headLength: 0.4,
        shaftDiameter: 0.1,
        headDiameter: 0.3,
      
    });
    
      // Set the color of the arrow to green
      arrow.setColor(0x00FF00);
    
      const arrowNode = new window.ROS3D.SceneNode({
        tfClient: tfClient,
        frameID: 'base_link',
          object: arrow
      });
    
      viewer3D.scene.add(arrowNode);
      grid3D.on('change', function() {
      });

      const currentState = {
        twoDmapHeight,
        twoDmapWidth,
        // Additional data you want to save
      };
     
 

  }, [robotname, ip, twoDmapHeight, twoDmapWidth]);

 
  return (
    <div>
      <div id="threed-map"/>
    </div>
  );

};
export default ThreeDMap;
