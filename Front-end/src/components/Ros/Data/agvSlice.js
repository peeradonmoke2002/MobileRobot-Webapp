import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../../config/configureAPI'


const currentUrl = window.location.href;
const isDeploy = currentUrl.includes('localhost') ? 'development' : 'production';  
const environment = process.env.NODE_ENV || isDeploy;
const API = config[environment].API;

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
};

export const fetchMoveBaseInformation = () => async (dispatch, getState) => {
  try {
  
    const response = await axios.get(`${API}/api/robots-config`);
    const data = response.data;
    const currentState = getMoveInformation(getState());
    if (data !== currentState) {
      dispatch(addAGVsInformation(data));
    }
    
  } catch (error) {
    console.error('Error fetching move base information:', error);
  }
};


export const fetchmodeBase = (robotName) => async (dispatch, getState) => {
  try {
    const response = await axios.get(`${API}/api/robot-mode/${robotName}`);
    const data = response.data;
    
    if (response.status === 404) {
      console.log(`Robot mode information not found for robot ${robotName}`);
    
    } else if (response.status === 200) {
      const mode = data.mode; // Access the 'mode' property
    
      // Now you can use the 'mode' variable as needed
      console.log(`Robot ${robotName} is in mode: ${mode}`);
    
      // Assuming you have a Redux action to add the mode to your state
      dispatch(addAGVModes({ name: robotName, mode }));
    }
 
  } catch (error) {
    console.error(`Error fetching move base information for robot ${robotName}:`, error);
  }
};

export const addRobot = (robotData) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/api/add-robot/`, robotData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = response.data;
    dispatch(fetchMoveBaseInformation());
    console.log('Data sent to the database:', result);
  } catch (error) {
    console.error('Error adding robot:', error);
  }
};
export const removeRobot = (robotName) => async (dispatch) => {
  try {
    await axios.delete(`${API}/api/remove-robot/${robotName}`);
    dispatch(fetchMoveBaseInformation());
    dispatch(removeAGVsInformation(robotName)); 
  } catch (error) {
    console.error('Error removing robot:', error);
    throw error;
  }
};

export const handleEditRobot = (selectedRobot, updatedData) => async (dispatch) => {
  try {
    // Make a PUT request to the edit endpoint
    await axios.put(`${API}/api/edit-robot/${selectedRobot.name}`,updatedData);

    // Optionally, you may want to refresh the robot list or update the state
    dispatch(fetchMoveBaseInformation());
    dispatch(editAGVsInformation({ selectedRobot, updatedData }));

    // Any other actions you want to perform after a successful edit
  } catch (error) {
    console.error('Error updating robot', error);
    // Handle error, show a message, etc.
  }
};

const AGVsSlice = createSlice({
  name: 'agv',
  initialState: {
    movebaseinformation: [],
    moveBasePosition: [],
    moveBasePositionMap: [],
    moveBaseSpeed: [],
    moveBaseModes: [],
    moveChangeMap: 0,
    moveReloadMap: 0
  },
  reducers: {
    addAGVsPosition: (state, action) => {
      // console.log('Adding AGVs Position:', action.payload);
      if (state.moveBasePosition.length <= 10) {
        state.moveBasePosition = [action.payload, ...state.moveBasePosition];
      } else {
        state.moveBasePosition.pop()
        state.moveBasePosition = [action.payload, ...state.moveBasePosition];
      }
    },
    addAGVsPositionMap: (state, action) => {
      console.log('Adding AGVs Position map:', action.payload);
      if (state.moveBasePositionMap.length <= 10) {
        state.moveBasePositionMap = [action.payload, ...state.moveBasePositionMap];
      } else {
        state.moveBasePositionMap.pop()
        state.moveBasePositionMap = [action.payload, ...state.moveBasePositionMap];
      }
    },
    addAGVsSpeed: (state, action) => {
      // console.log('Adding AGVs Speed:', action.payload);
      if (state.moveBaseSpeed.length <= 10) {
        state.moveBaseSpeed = [action.payload, ...state.moveBaseSpeed];
      } else {
        state.moveBaseSpeed.pop()
        state.moveBaseSpeed = [action.payload, ...state.moveBaseSpeed];
      }
    },
    addAGVsInformation: (state, action) => {
      const newData = action.payload;
      if (!arraysEqual(state.movebaseinformation, newData)) {
        state.movebaseinformation = newData;
      }
    },
    removeAGVsInformation: (state, action) => {
      const removedAGVName = action.payload;
      state.movebaseinformation = state.movebaseinformation.filter((agv) => agv.name !== removedAGVName);
    },
    editAGVsInformation: (state, action) => {
      const { selectedRobot, updatedData } = action.payload;

      // Find the index of the robot with the old name
      const updatedRobotIndex = state.movebaseinformation.findIndex((robot) => robot.name === selectedRobot.name);

      if (updatedRobotIndex !== -1) {
        // Clone the original object to maintain immutability
        const updatedRobot = { ...state.movebaseinformation[updatedRobotIndex] };

        // Update properties, including the name
        updatedRobot.name = updatedData.name;
        updatedRobot.rosbridge_server_ip = updatedData.rosbridge_server_ip;
        updatedRobot.rosbridge_server_port = updatedData.rosbridge_server_port;

        // Create a new array with the updated robot
        state.movebaseinformation = [
          ...state.movebaseinformation.slice(0, updatedRobotIndex),
          updatedRobot,
          ...state.movebaseinformation.slice(updatedRobotIndex + 1),
        ];
      }
    },
    addAGVModes: (state, action) => {
      state.moveBaseModes = action.payload;
    },
    ChangeMap: (state) => {
      state.moveChangeMap += 1;
    },
    ReloadMap: (state) => {
      state.moveReloadMap += 1;
    }
  },
});

export const { 
    addAGVsPosition, 
    addAGVsPositionMap,
    addAGVsSpeed, 
    addAGVsInformation, 
    removeAGVsInformation, 
    editAGVsInformation,
    addAGVModes,
    ChangeMap,
    ReloadMap

} = AGVsSlice.actions;

// Selectors
export const getSpeed = (state) => state.agv.moveBaseSpeed[0];
export const getPosition = (state) => state.agv.moveBasePosition[0];
export const getPositionMap = (state) => state.agv.moveBasePositionMap[0];
export const getMoveInformation = (state) => state.agv.movebaseinformation;
export const getModesBase = (state) => state.agv.moveBaseModes;
export const getChangeMap = (state) => state.agv.moveChangeMap;
export const getReloadMap = (state) => state.agv.moveReloadMap;



export default AGVsSlice.reducer;
