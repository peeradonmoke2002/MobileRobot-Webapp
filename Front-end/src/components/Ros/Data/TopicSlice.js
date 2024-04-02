import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

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

export const fetchTopic = () => async (dispatch, getState) => {
  try {
    const response = await axios.get('http://10.100.16.55:3001/api/topics');
    const data = response.data;

    const currentTopicNames = getAGVsTopics(getState());

    if (!data || data.length === 0 || !arraysEqual(data, currentTopicNames)) {
      // Dispatch an action to update the state with new map names
      dispatch(addAGVsTopics(data));
      // console.log('Topic names:', data);
    }
  } catch (error) {
    console.error('Error fetching map names:', error);
  }
};

export const fetchTopicByRobot = (robotName) => async (dispatch, getState) => {
  try {
    const response = await axios.get(`http://10.100.16.55:3001/api/topics/${robotName}`);
    const topics = response.data;
    const currentTopicNames = getAGVsTopics(getState());
    if (!topics || topics.length === 0 || !arraysEqual(topics, currentTopicNames)) {
      // Dispatch an action to update the state with new map names
      dispatch(addAGVsTopicsbyRobot({ robotName:robotName, topics:topics }));
    //   console.log('Topic by robot:', robotName, topics);
    }
  } catch (error) {
    console.error('Error fetching map names:', error);
  }
};

export const removeTopicByRobotAndTopic = (robotName, topicName) => async (dispatch) => {
  try {
    // Make a DELETE request to remove the specified topic
    await axios.delete(`http://10.100.16.55:3001/api/topics/${robotName}/${topicName}`);

    // Dispatch actions to update the topics after removing the topic
    dispatch(fetchTopic());
    dispatch(removeAGVsTopicByRobotAndTopic({ robotName, topicName }));
  } catch (error) {
    console.error('Error removing topic:', error);
    throw error;
  }
};

export const editTopicByRobotAndTopic = (robotName, topics) => async (dispatch) => {
  try {
    // Make a PUT request to update the specified topics for the robot
    await axios.put(`http://10.100.16.55:3001/api/topics/${robotName}`, { topics });
    // Dispatch an action to update the topics after editing
    dispatch(fetchTopicByRobot(robotName));
  } catch (error) {
    console.error('Error updating topics:', error);
    throw error;
  }
};


const topicSlice = createSlice({
  name: 'topics',
  initialState: {
    topicAGVs: [],
    topicAGVsbyRobot: {}
  },
  reducers: {
    addAGVsTopics: (state, action) => {
      const newData = action.payload;
      if (!arraysEqual(state.topicAGVs, newData)) {
          state.topicAGVs = newData;
          // console.log('Topic state:', state.topicAGVs);
      }
    },
   
    removeAGVsTopicByRobotAndTopic: (state, action) => {
      const { robotName, topicName } = action.payload;
      // Find the robot by name
      const robot = state.topicAGVs.find((robot) => robot.name === robotName);
      if (robot) {
        // Remove the specified topic from the robot's topics
        delete robot.topics[topicName];
      } else {
        console.error('Robot not found:', robotName);
      }
    },
    addAGVsTopicsbyRobot: (state, action) => {
        const { robotName, topics } = action.payload;
        state.topicAGVsbyRobot[robotName] = topics;
        // console.log('Topic state:', state.topicAGVsbyRobot);
    }
    
    
  },
});

export const { addAGVsTopics, removeAGVsTopicByRobotAndTopic, addAGVsTopicsbyRobot } = topicSlice.actions;



// Selectors
export const getAGVsTopics = (state) => state.topics.topicAGVs;
export const getAGVsTopicsByRobot = (state, robotName) => state.topics.topicAGVsbyRobot[robotName];


export default topicSlice.reducer;
