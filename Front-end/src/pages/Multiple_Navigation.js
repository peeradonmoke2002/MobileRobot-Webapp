import React, { useEffect, useState } from "react";
import SideBar from "../components/Sidebar/Sidebar";
import RobotCard from "../components/Ros/RobotCard";
import robotConfig from '../components/Ros/scripts/robot.json';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {fetchMoveBaseInformation, getMoveInformation } from '../components/Ros/Data/agvSlice';
import { Container, Row, Col } from "react-bootstrap";
import SetMainMap from "../components/Ros/scripts/MultipleNav/SetMainMap";
import MutipleNavControl from "../components/Ros/scripts/MultipleNav/MultipleNavControl";
import RobotlistAvailable from "../components/Ros/scripts/MultipleNav/RobotlistAvailable";
import {  fetchTopicByRobot, getAGVsTopicsByRobot } from '../components/Ros/Data/TopicSlice';

const Multiple_Navigation = () => {

    const dispatch = useDispatch();
    const moveInformation = useSelector(getMoveInformation);
    const [name, setName] = useState('');
    const [selectedRobot, setSelectedRobot] = useState('');
    // const [goalpos, setGoal] = useState('');
    // const [poseGoalNow, setPoseGoal] = useState('');
    const [key, setKey] = useState(0);

   
    const Topic = useSelector(state => getAGVsTopicsByRobot(state, name));
    // const topics = useSelector(state => getAGVsTopicsByRobot(state, 'TurtlebotSim001'));


    
    useEffect(() => {
        dispatch(fetchMoveBaseInformation());
     
        const intervalId = setInterval(() => {
          dispatch(fetchMoveBaseInformation());
        }, 5000);
        return () => clearInterval(intervalId);
      
      }, [dispatch]);


    useEffect(() => {
        if (name === '') {
            return;
        }
      dispatch(fetchTopicByRobot(name));
      const intervalId = setInterval(() => {
        dispatch(fetchTopicByRobot(name));
        // console.log('amcltopic',amclTopic.amcl_cov);
      }, 2000);
      return () => clearInterval(intervalId);
  
    }, [dispatch, name]);

    const scan = Topic ? {
        topic_name: Topic.scan.topic_name ,
        messageType: Topic.scan.message_type ,
    } : {};

    const poseListener = Topic ? {
        topic_name: Topic.nav_poseListener.topic_name ,
        messageType: Topic.nav_poseListener.message_type ,
    } : {};

    const speed = Topic ? {
        topic_name: Topic.nav_speed.topic_name ,
        messageType: Topic.nav_speed.message_type,
    } : {};

    const position = Topic ? {
        topic_name: Topic.nav_pos.topic_name ,
        messageType: Topic.nav_pos.message_type,
    } : {};

    const amcl_cov = Topic ? {
        topic_name: Topic.amcl_cov.topic_name ,
        messageType: Topic.amcl_cov.message_type ,
    } : {};

    const path = Topic? {
        topic_name: Topic.path.topic_name ,
        messageType: Topic.path.message_type,
    }: {};

    const cmd_vel = Topic ? {
        topic_name: Topic.cmd_vel.topic_name,
        messageType: Topic.cmd_vel.message_type,
    }: {};
    
  
    // Handle robot selection event
    const handleRobotSelection = (selectedRobot) => {
      const selectedRobotData = moveInformation.find((robot) => robot.name === selectedRobot);
      setName(selectedRobotData.name)
      setSelectedRobot(selectedRobotData);
      setKey((prevKey) => prevKey + 1);
      console.log('Selected Robot:', selectedRobot);
      console.log('Selected Robot Data:', selectedRobotData);
     
    };



    return (
        <Container  className="px-0" 
                    fluid={true}
                    style={{height: '100vh',
                            overflowX: 'hidden',
                            fontFamily:'Manrope',
                            }}
                    >
            <Row>
                <div style={{display:'flex',height:'100vh'}}>
                    <Col sm={2}>
                        <SideBar/>
                    </Col>
                    <Col sm={10}>
                        <div className="page-playground">

                        <div style={{flexGrow: 1,
                                        display:'flex',
                                        justifyContent:'flex-start',
                                        alignItems:'center',
                                        marginTop:'1rem',
                                        marginBottom:'-1rem',
                                        marginLeft:'1.5rem'}}>
                                <h1 style={{fontSize:'32px'}}>
                                    Multi robot navigation
                                </h1>
                            </div>
                            <br/>
                            <div style={{flexGrow: 1,
                                        display:'flex',
                                        justifyContent:'flex-start',
                                        alignItems:'center',
                                        marginLeft:'1.5rem',
                                        marginRight:'1.5rem'}}>
                                <hr style={{color: '#000000',
                                            backgroundColor: '#000000',
                                            height: '2px',
                                            width:'100%',
                                            margin:'auto'
                                            }}/>
                            </div>
                            <br/>
                            <Row>
                                <Col xs={7} style={{marginBottom:'1rem'}}>
                                    <SetMainMap/>
                                </Col>
                                <Col xs={5} style={{}}>
                                            
                                        <div style={{width:'450px',
                                                    justifyContent:'center',
                                                    marginLeft:'1rem',
                                                    marginTop:'2rem',
                                                    border:'1px solid',}}>
                                            <h4 style={{borderBottom:'1px solid',
                                                        padding:'1rem',}}>
                                                Select Control Robot
                                            </h4>
                                            <div style={{marginLeft:'0.5rem'}}>
                                                <RobotlistAvailable onSelect={handleRobotSelection} />
                                            </div>

                                            {selectedRobot && selectedRobot.name && selectedRobot.rosbridge_server_ip ? (
                                                <MutipleNavControl 
                                                robotname={selectedRobot.name} 
                                                ip={selectedRobot.rosbridge_server_ip} 
                                                amcl={amcl_cov}
                                                speed={speed}
                                                pos={position}
                            
                                                key={key} />
                                                ) : (
                                                    <div style={{padding:'1rem'}}>
                                                      - - - Select a robot to control first - - -
                                                    </div>
                                                    )}
                                        </div>

                                </Col>
                            </Row>
                        </div>
                    </Col>
                </div>
            </Row>    
        
        </Container>
    );
}

export default Multiple_Navigation