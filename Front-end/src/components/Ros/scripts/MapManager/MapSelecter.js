import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMapNames, clearMapNames, selectMapNames, deleteMapByName } from '../../Data/mapSlice'; // Adjust the path accordingly
import { connectToMachine , getRosConnection} from "../rosbridge";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Container } from 'react-bootstrap';
import { ChangeMap, ReloadMap } from '../../Data/agvSlice';

const MapSelector = ({ robotname,ip }) => {

  const [selectedMap, setSelectedMap] = useState('')
  const dispatch = useDispatch();
  const mapNames = useSelector(selectMapNames);

  const ros = connectToMachine(robotname, `ws://${ip}:9090`);

  // Create a ROSLIB.Service object for the '/agv_set_map' service
  const agvSetMap = new window.ROSLIB.Service({
      ros,
      name: '/agv_set_map',
      serviceType: 'webclient/SetMap',
  });
  // Create a ROSLIB.Service object for the '/gmapping_amcl_switcher' service
  const amclServiceClient = new window.ROSLIB.Service({
      ros         : ros,
      name        : 'gmapping_amcl_switcher',
      serviceType : 'SMLauncher'
   });
   // Create a ROSLIB.ServiceRequest object for the '/gmapping_amcl_switcher' service  
    const request_for_MapReload = new window.ROSLIB.ServiceRequest({
      launch_command : 'MapReload'
   });
  
   // Fetch map names from the server
  useEffect(() => {

  dispatch(fetchMapNames());

  const intervalId = setInterval(() => {
      dispatch(fetchMapNames());
  }, 5000);

  // Clean up the interval on component unmount
  return () => clearInterval(intervalId);
  }, [dispatch]);

  // Map selection handler
  const handleMapSelection = (e) => {
      const selectedMapId = e.target.value;
      const selectedMapName = mapNames.find((mapName) => mapName === selectedMapId);
      setSelectedMap(selectedMapName);
  
      console.log('Selected Map:', selectedMapId);
  };
  // Set map handler
  const handleSetMap = () => {
      const enteredMapName = selectedMap;
      console.log('setmap',enteredMapName);
      if (!enteredMapName) {
        alert('Please select map name!');
      } else {
        const newMapSaveRqt = new window.ROSLIB.ServiceRequest({
          map_name: enteredMapName,
        });
  
        agvSetMap.callService(newMapSaveRqt, (result) => {
          console.log('Result for service call on ' + agvSetMap.name + ': ' + result.result);
        });
        // setbuttonChnageMap(prevState => prevState + 1)
        // Update the state with the selected map name
        dispatch(ChangeMap());
      }
  };
  // Reload map handler
  const handleReloadMap = async () => {
      try {
        if (window.confirm('Are you sure you want to reload the default map?')) {
          const result = await new Promise((resolve, reject) => {
            amclServiceClient.callService(request_for_MapReload, (result) => {
              if (result) {
                resolve(result);
              } else {
                reject(new Error('Service call failed.'));
              }
            });
          });
          window.alert('Service call: ' + result.result);
          console.log('Result for service call on ' + amclServiceClient.name + ' : ' + result.result);
          // Update the state with the selected map name
          dispatch(ReloadMap());
        }
      } catch (error) {
        console.error('Error during map reload:', error);
      }
    };

  const handleDeleteMap = () => {
      // Log the selected map name before dispatching the action
      console.log(`Deleting map with name: ${selectedMap}`);
    
      // Dispatch the deleteMapByName action with the selected map name
      dispatch(deleteMapByName(selectedMap));
    
      // Log a message after dispatch if needed
      console.log(`Deletion process initiated for map with name: ${selectedMap}`);
  };
      
  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

        <FormControl  sx={{ m: 1, minWidth: 125 }} size='small'>
          <InputLabel id="select-map" style={{fontSize:'14px'}}>Select Map</InputLabel>
          <Select
            labelId="select-map"
            id="select-map"
            value={selectedMap}
            label="Select Map"
            onChange={handleMapSelection}
          >
          {mapNames
            .map((mapNames) => (
              <MenuItem key={mapNames} value={mapNames}>
                {mapNames}
              </MenuItem>
        ))}
          </Select>
        </FormControl>
        <div style={{ display: 'flex', alignItems:'center'}}>
          <button onClick={handleSetMap}
                  className='sub-submit-btn'
                  style={{fontSize:'14px', marginRight:'5px'}}
          >
            Set Map
          </button>
          <button onClick={handleReloadMap}
                  className='sub-submit-btn'
                  style={{fontSize:'14px', marginRight:'5px'}}
          >
            Reload Map Service
          </button>
          <button onClick={handleDeleteMap}
                  className='sub-submit-btn'
                  style={{fontSize:'14px', marginRight:'5px'}}
          >
            Delete Map Select
          </button>
        </div>
      </div>
    </Container>
  );
};

export default MapSelector;



