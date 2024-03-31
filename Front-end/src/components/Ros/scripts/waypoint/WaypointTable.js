import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchWaypointsAsync, 
          selectWaypoints, 
          sendWaypointToDatabase,
          clearWaypointsTable,
          downloadWaypoints,
          uploadWaypoints,} from "../../Data/waypointsSlice";


const WaypointTable = ({robotname,ip}) => {
  
    const waypoints = useSelector(selectWaypoints);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchWaypointsAsync());
        const intervalId = setInterval(() => {
          dispatch(fetchWaypointsAsync());
        }, 5000);
        return () => clearInterval(intervalId);
      }, [dispatch]);

      return (
        <>
            <Container> 
                  <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>X</th>
                      <th>Y</th>
                      <th>W</th>
                    </tr>
                  </thead>
                  <tbody>
                  {waypoints
                    .slice() 
                    .sort((a, b) => a.id - b.id) 
                    .map((waypoint) => (
                      <tr key={waypoint.id}>
                        <td>{waypoint.id}</td>
                        <td>{waypoint.x}</td>
                        <td>{waypoint.y}</td>
                        <td>{waypoint.w}</td>
                      </tr>
                  ))}
                
                  </tbody>
                </table>
          </Container>
        </>
      );
    };
    
export default WaypointTable;
    







