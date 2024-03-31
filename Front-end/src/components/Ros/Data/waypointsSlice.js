
import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const waypointsSlice = createSlice({
  name: 'waypoints',
  initialState: [],
  reducers: {
    updateWaypoints: (state, action) => {
      return action.payload;
    },
    clearWaypoints: (state) => {
      return [];
    },
  },
});

export const { updateWaypoints, clearWaypoints } = waypointsSlice.actions;
export const selectWaypoints = (state) => state.waypoints;

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
// Async action for fetching waypoints
export const fetchWaypointsAsync = () => async (dispatch, getState) => {
    try {
      const response = await axios.get('http://10.100.16.55:3001/api/waypoints/');
      const data = response.data;
  
      const currentState = selectWaypoints(getState());
  
      if (!data || data.length === 0 || !arraysEqual(data, currentState)) {
        dispatch(updateWaypoints(data));
      }
  
    } catch (error) {
      console.error('Error fetching waypoints:', error);

    }
  };
  export const sendWaypointToDatabase = (data) => async (dispatch) => {
    try {
      const response = await axios.post('http://10.100.16.55:3001/api/waypoints/', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = response.data;
      dispatch(fetchWaypointsAsync());
      console.log('Data sent to the database:', result);
    } catch (error) {
      console.error('Error sending data to the database:', error);
    }
  };
  
export const clearWaypointsTable = () => async (dispatch) => {
    try {
      await axios.delete('http://10.100.16.55:3001/api/waypoints/all');
  
      console.log('Table cleared successfully');
      dispatch(fetchWaypointsAsync());
      dispatch(clearWaypoints());
    } catch (error) {
      console.error('Error clearing table:', error);
    }
  };


export const downloadWaypoints = () => async (dispatch) => {
  try {
    const response = await axios.get('http://10.100.16.55:3001/api/waypoints/');
    const waypoints = response.data;

    const waypointsJson = JSON.stringify(waypoints, null, 2);

    const blob = new Blob([waypointsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading waypoints:', error);
  }
};

export const uploadWaypoints = (file) => async (dispatch) => {
  try {
    const content = await file.text();
    const waypoints = JSON.parse(content);

    console.log('Parsed Waypoints:', waypoints);

    const response = await axios.post('http://10.100.16.55:3001/api/waypoints/batch', waypoints, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('Waypoints uploaded:', result);

    dispatch(fetchWaypointsAsync());
  } catch (error) {
    console.error('Error uploading waypoints:', error);
  }
};
  
export default waypointsSlice.reducer;
