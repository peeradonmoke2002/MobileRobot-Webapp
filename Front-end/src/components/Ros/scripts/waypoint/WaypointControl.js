import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchWaypointsAsync, 
          selectWaypoints, 
          sendWaypointToDatabase,
          clearWaypointsTable,
          downloadWaypoints,
          uploadWaypoints,} from "../../Data/waypointsSlice";
import { getSpeed, getPosition } from "../../Data/agvSlice";


const WaypointControl = () => {
  const speed = useSelector(getSpeed);
  const pos = useSelector(getPosition);

  const waypoints = useSelector(selectWaypoints);
  const dispatch = useDispatch();
 
  useEffect(() => {
      dispatch(fetchWaypointsAsync());

      const intervalId = setInterval(() => {
        dispatch(fetchWaypointsAsync());
       
      }, 5000);
    
      return () => clearInterval(intervalId);
    }, [dispatch]);

// Api method //
const handleSendToDatabase = async () => {
  // const data = {
  //   x: x,
  //   y: y,
  //   w: orientation,
  // };
  const data = {
    x: pos.position.x,
    y: pos.position.y,
    w: pos.position.orientation,
  };

  console.log('Data to send in waypoint Control:', data);
  dispatch(sendWaypointToDatabase(data));
  dispatch(fetchWaypointsAsync());
};

const handleClearTable = async () => {

  dispatch(clearWaypointsTable());
  dispatch(fetchWaypointsAsync());
};

const handleDownloadWaypoints = async () => {
  dispatch(downloadWaypoints());
  dispatch(fetchWaypointsAsync());
};

const handleUploadWaypoints = async (event) => {

  const file = event.target.files[0];
  if (file) {
    dispatch(uploadWaypoints(file));
    dispatch(fetchWaypointsAsync());
  }
};

    return (
        <Row 
          // style={{padding:'0px',marginBottom:'0rem'}}
        >
            {/* <div style={{padding:'0px',justifyContent:'center'}}> */}
                {/* <div style={{ margin:'auto',
                              marginBottom:'1rem',
                              width:'100%',
                              borderBottom: '2px solid',
                              padding:'5px'
                            }}>
                        Waypoint configure
                </div> */}
                <button className="save-button" onClick={handleSendToDatabase}>Save waypoint</button>
                <button className="clear-button" onClick={handleClearTable}>clear waypoint</button>
                <button className="download-button" onClick={handleDownloadWaypoints}>Download waypoints</button>
                <button className="file-button" onClick={() => document.getElementById('fileInput').click()}>  Upload waypoints</button>
                <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleUploadWaypoints} />
            
            {/* </div> */}
        </Row>
    );
};
  
export default WaypointControl;
    







