import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { connectToMachine, getRosConnection } from "../rosbridge";
import CurrentSpeed from "./CurrentSpeed";
import WaypointTable from "../waypoint/WaypointTable";
import RobotInfo from "./RobotInfo";
import MapList from "../MapManager/MapList";
import SaveMap from "../MapManager/SaveMap";
import MapSelector from "../MapManager/MapSelecter";
import WaypointControl from "../waypoint/WaypointControl";

const RobotState = ({robotname,ip}) => {
 
  return (
    <>
      <Container>
             {/* RobotInfo */}
            <CurrentSpeed robotname={robotname} ip={ip} TopicSpeed={'/odom_encoder'} 
            MessageSpped={'nav_msgs/Odometry'} 
            TopicPosition={'/amcl_pose'} MessagePosition={'geometry_msgs/PoseWithCovarianceStamped'}/>
            
            <RobotInfo robotname={robotname} ip={ip} />
            <WaypointControl />   
            {/* WayPoint */}
            <WaypointTable robotname={robotname} ip={ip} />
            {/* Map */}
            <MapList robotname={robotname} ip={ip}/>
            <SaveMap robotname={robotname} ip={ip}/>
            <MapSelector robotname={robotname} ip={ip} />
      </Container>
    </>
  );
};

export default RobotState;
