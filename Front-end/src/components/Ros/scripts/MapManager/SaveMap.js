import React, { useState } from 'react';
import { connectToMachine , getRosConnection} from "../rosbridge";

const MapSaverComponent = ({robotname,ip}) => {
  const [newMapName, setNewMapName] = useState('');
  const [inputMapName, setInputMapName] = useState('');
  const ros = connectToMachine(robotname, `ws://${ip}:9090`);

  const agvSaveMap = new window.ROSLIB.Service({
    ros,
    name: '/agv_map_saver',
    serviceType: 'webclient/SaveMap',
  });

  const amclServiceClient = new window.ROSLIB.Service({
    ros         : ros,
    name        : 'gmapping_amcl_switcher',
    serviceType : 'SMLauncher'
 });

  const request_for_MapReload = new window.ROSLIB.ServiceRequest({
    launch_command : 'MapReload'
 });

  const handleSaveMap = () => {
    console.log('inputMapName',inputMapName);
    const enteredMapName = inputMapName.trim();
    if (!enteredMapName) {
      alert('Please enter a valid map name!');
    } else {
      const newMapSaveRqt = new window.ROSLIB.ServiceRequest({
        file_name: enteredMapName,
      });
      console.log('newMapSaveRqt',newMapSaveRqt);
      agvSaveMap.callService(newMapSaveRqt, (result) => {
        console.log('Result for service call on ' + agvSaveMap.name + ': ' + result.result);

        setNewMapName(enteredMapName);
        setInputMapName(''); 
      });
    }
  };

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
      }
    } catch (error) {
      console.error('Error during map reload:', error);
    }
  };


  return (
    <div>
      <label style={{marginBottom:'10px'}}>
        Enter new map name:
        <input
          id='mapnameinput'
          type="text"
          value={inputMapName}
          onChange={(e) => setInputMapName(e.target.value)}
        />
      </label>
      <button onClick={handleSaveMap} 
              style={{marginRight: '10px'}} 
              className='sub-submit-btn'
            >
        Save Map
      </button>
      <button onClick={handleReloadMap}
              className='sub-submit-btn'
            >
        Reload Default Map
      </button>
      {newMapName && (
        <p>
          Map "{newMapName}" has been saved!
        </p>
      )}
    </div>
  );
};

export default MapSaverComponent;
