import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { connectToMachine , getRosConnection} from "../rosbridge";
import Agvload from "../Image/agv_loaded2.gif";
import WaypointSelector from '../waypoint/WaypointSelecter';
import AmsclState from '../RobotState/AmclState';
import MapControl from './MapControl';
import NavControl from './NavControl';

const MapViewer = ({robotname,ip}) => {

  return (
   <div>
      <h2>MAP</h2>
      <MapControl robotname={robotname} ip={ip} />
    <div >
      <NavControl robotname={robotname} ip={ip} />
      </div> 
    </div>
  );
  
};

export default MapViewer;


