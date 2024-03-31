import React, { useRef, useState, useEffect } from "react"
import SideBar from "../components/Sidebar/Sidebar"
import RobotCard from "../components/Ros/RobotCard"
import robotConfig from '../components/Ros/scripts/robot.json'
import { Link, NavLink } from "react-router-dom"
import {Popover, Overlay, Col, Row, Container } from "react-bootstrap"
import RobotlistManager from "../components/Ros/scripts/RobotConfigBtns/RobotlistManager"
import ReloadButton from "../components/Ros/scripts/RobotConfigBtns/ReloadButton"
import AddRobotModal from "../components/Ros/scripts/RobotConfigBtns/AddRobotPopup"
import RemoveRobotModal from "../components/Ros/scripts/RobotConfigBtns/RemoveRobotPopup"
import EditRobot from "../components/Ros/scripts/RobotConfigBtns/EditRobotPopup"
import { fetchMoveBaseInformation , getMoveInformation } from '../components/Ros/Data/agvSlice';
import { fetchTopic, fetchTopicByRobot, removeTopicByRobotAndTopic, getAGVsTopics } from '../components/Ros/Data/TopicSlice';
import { useDispatch, useSelector } from 'react-redux';


let renderCount = 0;

export default function Robots() {
    // const [robots, serRobots] = useState(robotConfig);
    // console.log('Robot component rendered.'); // Debug statement

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isRmvOpen, setIsRmvOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);

    const robots = useSelector(getMoveInformation);
    const topics = useSelector(getAGVsTopics);
    // console.log('use this call robots');

    const dispatch = useDispatch();

    const displayAddPanel = (event) => {
        setIsAddOpen(!isAddOpen);
        setIsRmvOpen(false);
        setIsEditOpen(false);
        setTarget(event.target);
    };

    const displayDeletePanel = (event) => {
        setIsRmvOpen(!isRmvOpen);
        setIsAddOpen(false);
        setIsEditOpen(false);
        setTarget(event.target);
      };

    const displayConfigPanel = (event) => {
        setIsEditOpen(!isEditOpen);
        setIsAddOpen(false);
        setIsRmvOpen(false);
        setTarget(event.target);
    };



    useEffect(() => {
        dispatch(fetchMoveBaseInformation());
        dispatch(fetchTopic());
        const intervalId = setInterval(() => {
          dispatch(fetchMoveBaseInformation());
          dispatch(fetchTopic());
        //   console.log('fetchMoveBaseInformation',robots);
        //   console.log('fetchTopic',topics);
        }, 5000);
        return () => clearInterval(intervalId);
      
      }, [dispatch]);


    return(
        <Container  className="px-0" 
                    fluid={true}
                    style={{height: '100vh',
                            overflowX: 'hidden',
                            fontFamily:'Manrope'
                            }}
                    >
            <Row>
                <div style={{display:'flex',height:'100vh'}}>

                    <Col sm={2}>
                        <SideBar/>
                    </Col>
                    <Col sm={10}>
                   
                            <div className="upper-icon-wrapper">
                                    
                                <div>
                                    <button className='config-add-btn' 
                                            style={{marginLeft: '0.5rem'}}
                                            onClick={displayAddPanel}
                                            ref={ref}
                                            key="add-btn"
                                            >
                                        Add New Robot
                                    </button>
                                    <Overlay
                                        show={isAddOpen}
                                        target={target}
                                        placement="bottom"
                                        container={ref}
                                        containerPadding={20}
                                        >
                                        <Popover id="popover-contained">
                                        {/* <Popover.Header as="h3">Popover bottom</Popover.Header> */}
                                        <Popover.Body>
                                            <AddRobotModal onClose={() => setIsAddOpen(false)}/>
                                        </Popover.Body>
                                        </Popover>
                                    </Overlay>
                                </div>

                                <div>
                                    <button className='config-del-btn' 
                                            onClick={displayDeletePanel}
                                            ref={ref}
                                            key="del-btn"
                                    >
                                        Delete
                                    </button>
                                    <Overlay
                                        show={isRmvOpen}
                                        target={target}
                                        placement="bottom"
                                        container={ref}
                                        containerPadding={20}
                                    >
                                        <Popover id="popover-contained">
                                        {/* <Popover.Header as="h3">Popover bottom</Popover.Header> */}
                                        <Popover.Body>
                                            <RemoveRobotModal onClose={() => setIsRmvOpen(false)}/>
                                        </Popover.Body>
                                        </Popover>
                                    </Overlay>
                                </div>

                                <div>
                                    <button className='config-edit-btn' 
                                            onClick={displayConfigPanel}
                                            ref={ref}
                                            key="edit-btn"
                                            >
                                        Edit
                                    </button>
                                    <Overlay
                                        show={isEditOpen}
                                        target={target}
                                        placement="bottom"
                                        container={ref}
                                        containerPadding={20}
                                        >
                                        <Popover id="popover-contained">
                                        {/* <Popover.Header as="h3">Popover bottom</Popover.Header> */}
                                        <Popover.Body>
                                            <EditRobot onClose={() => setIsEditOpen(false)}/>
                                        </Popover.Body>
                                        </Popover>
                                    </Overlay>
                                </div>
                                <div style={{marginLeft: 'auto'}}>
                                <ReloadButton />
                                </div>


                            </div>
                            <div style={{paddingBottom:'5px'}}>
                                {robots.length === 0 ? (
                                <body className="body-loading">
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <p>Try to connect to database....</p>
                                </div>
                                </body>
                                )
                                : (
                                robots.map((robot, index) => {
                                    const sanitizedRobotName = robot.name.replace(/\W+/g, '-');
                                    return (
                                        <NavLink to={sanitizedRobotName} 
                                                style={{ textDecoration: 'none' }}
                                                key={index}
                                        >
                                            <RobotCard robot={robot} key={index}/>
                                        </NavLink>
                                    );
                                })
                                )
                                }
                            </div>
                    </Col>
                  
                </div>
            </Row>
      </Container>
    );
}