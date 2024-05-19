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

export const fetchMapNames = () => async (dispatch, getState) => {
  try {
    const response = await axios.get(`${API}/api/maps/names`);
    const newMapNames = response.data;

    const currentMapNames = selectMapNames(getState());

    if (!newMapNames || newMapNames.length === 0 || !arraysEqual(newMapNames, currentMapNames)) {
      // Dispatch an action to update the state with new map names
      dispatch(updateMapNames(newMapNames));
    }
  } catch (error) {
    console.error('Error fetching map names:', error);
  }
};

export const deleteMapByName = (mapName) => async (dispatch) => {
  try {
    console.log(`Attempting to delete map with name: ${mapName}`);

    // Make the DELETE request to your API
    await axios.delete(`${API}/api/maps/names/${mapName}`);
    
    console.log(`Map with name '${mapName}' deleted successfully`);

    // Dispatch an action to update the state by removing the deleted map
    dispatch(removeMapByName(mapName));
  } catch (error) {
    console.error(`Error deleting map by name ${mapName}:`, error);
  }
};



const mapsSlice = createSlice({
  name: 'maps',
  initialState: {
    mapNames: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    updateMapNames: (state, action) => {
      return {
        ...state,
        mapNames: action.payload,
        status: 'succeeded',
      };
    },
    clearMapNames: (state) => {
      return {
        ...state,
        mapNames: [],
        status: 'idle',
      };
    },
    removeMapByName: (state, action) => {
      const mapNameToRemove = action.payload;
      return {
        ...state,
        mapNames: state.mapNames.filter((name) => name !== mapNameToRemove),
        status: 'succeeded',
      };
    },
  },
});

export const { updateMapNames, clearMapNames, removeMapByName } = mapsSlice.actions;
export const selectMapNames = (state) => state.maps.mapNames;

export default mapsSlice.reducer;
