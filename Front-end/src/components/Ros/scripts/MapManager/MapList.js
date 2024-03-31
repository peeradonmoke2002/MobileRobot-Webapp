import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMapNames, clearMapNames, selectMapNames } from '../../Data/mapSlice'; // Adjust the path accordingly
import { connectToMachine , getRosConnection} from "../rosbridge";
import { getChangeMap } from '../../Data/agvSlice';

const MapList = ({ robotname, ip }) => {
  const dispatch = useDispatch();
  const mapNames = useSelector(selectMapNames);
  const [defaultMap, setDefaultMap] = useState('???');
  const CheckButtonSetmap = useSelector(getChangeMap);


  // useEffect(() => {
  //   dispatch(fetchMapNames());
  //   const intervalId = setInterval(() => {
  //     dispatch(fetchMapNames());
  //   }, 5000);
  //   console.log('maplist:',mapNames)
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [dispatch]);
  
  useEffect(() => {
    const ros = connectToMachine(robotname, `ws://${ip}:9090`);
    const defaultMapFile = new window.ROSLIB.Param({
      ros,
      name: '/agv/mapfile',
    });

    const getDefaultMapName = () => {
      defaultMapFile.get((mapFileName) => {
        console.log('Map file name: ' + mapFileName);
        if (mapFileName !== null) {
          setDefaultMap(mapFileName);
        } else {
          setDefaultMap('???');
          console.error('Failed to get the default map name');
        }
      });
    };
    
    getDefaultMapName();
    console.log('check',CheckButtonSetmap)


  }, [CheckButtonSetmap]);

  
  
  
  return (
    <div style={{fontSize:'10px'}}>
      <b style={{marginRight:'5px'}}>Current Config:</b>
      <span id='defaultmap'>{defaultMap}</span>
    </div>
  
  );
};

export default MapList;
