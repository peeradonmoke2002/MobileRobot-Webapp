import { configureStore, combineReducers } from "@reduxjs/toolkit";
import waypointsReducer from './waypointsSlice';
import mapReducer from './mapSlice';
import agvReducer from "./agvSlice";
import topicReducer from "./TopicSlice";

const rootReducer = combineReducers({
    waypoints: waypointsReducer,
    maps: mapReducer,
    agv: agvReducer,
    topics: topicReducer

});


const store = configureStore({
    reducer: rootReducer
});

export default store;