import './index.css';
import Multiple_Navigation from './pages/Multiple_Navigation';
import SettingPage from './pages/Setting'
import Login from './pages/Login';
import Robots from './pages/Robots';
import Overview from './pages/subpages/Overview';
import Manual_n_Slam from './pages/subpages/Manual&Slam';
import Robot_info from './pages/subpages/RobotInfo';
import Teleoperation from './components/Ros/scripts/Teleop/Teleop';
import InitPose from './components/Ros/scripts/Localization/initpose';
import { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import robotsConfig from './components/Ros/scripts/robot.json';
import { PanelTemplate } from './components/Ros/PanelTemplate';
import { dummySUBPAGE } from './pages/subpages/subpageDummy';
import { fetchMoveBaseInformation , getMoveInformation } from '../src/components/Ros/Data/agvSlice';
import { useDispatch, useSelector } from 'react-redux';
import PrivateRoute from './PrivateRoute';
import { fetchTopic,fetchTopicByRobot,getAGVsTopics } from './components/Ros/Data/TopicSlice';

function App() {

  const user = JSON.parse(localStorage.getItem("user"));
  // const [robots, setRobots] = useState(robotsConfig);
  const robots = useSelector(getMoveInformation);
  // const topics = useSelector(getAGVsTopics);
  // console.log("Topics: ", topics)
  const dispatch = useDispatch();
  // console.log(robots);

  useEffect(() => {
    dispatch(fetchTopic());
    const intervalId = setInterval(() => {
      dispatch(fetchTopic());
    }, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch]);


  

  useEffect(() => {
    // Fetch the user email and token from local storage
    console.log("Checking LogIn...")

    // If the token/email does not exist, mark the user as logged out
    if (!user || !user.token) {
      console.log("LogIn Status: Not login yet")
      return
    }

    // If the token exists, verify it with the auth server to see if it is valid
    fetch("http://localhost:3001/verify", {
            method: "POST",
            headers: {
                'jwt-token': user.token
              }
        })
        .then(r => r.json())
        .then(r => {
            localStorage.setItem("loggedIn", 1)
            console.log("LogIn Status: ", r.message)
        })

  }, [])



  // useEffect(() => {
  //   dispatch(fetchMoveBaseInformation())
  // }
  // , [dispatch])

  

  
  return (
    <div className="App">
        <Routes>
          <Route  path="/" 
                  element={<Login 
                                 
                          />} />
          <Route  path="/multiple_navigation" 
                  element={ <PrivateRoute>
                              <Multiple_Navigation />
                            </PrivateRoute>
                            }/>
          <Route  path="/robots/*" 
                  element={ <PrivateRoute>
                              <Robots />
                            </PrivateRoute>
                            }/>

          <Route path="/setting"
                  element={
                            <PrivateRoute >
                              <SettingPage/>
                            </PrivateRoute>
                          }/>
                           
          {robots.length !== 0 &&
            robots.map((robot, index) => (
            <Route 
                key={index}
                path={'/robots/'+robot.name}
                element={<PanelTemplate robotData={robot}/>}
            >
              <Route index element={<Overview robotData={robot} />} 
              />
             {dummySUBPAGE &&
                dummySUBPAGE.map((sub,index) => (
                  <Route
                    key={index+1}
                    path={sub.path}
                    element={<sub.element robotData={robot}/>}
                  />
                  ))}
            </Route>
          ))}
        </Routes>
    </div>
  );
}

export default App;