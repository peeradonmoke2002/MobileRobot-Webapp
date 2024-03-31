import React, { useEffect, useState, useRef } from 'react';
import { connectToMachine , getRosConnection} from "../rosbridge";
import { Row, Col, Container } from "react-bootstrap";
import * as Three from "three";
import WaypointControl from "../waypoint/WaypointControl";
import { useDispatch, useSelector } from 'react-redux';
import { addAGVsPosition, addAGVsSpeed } from "../../Data/agvSlice";
import { fetchTopic, fetchTopicByRobot, 
    removeTopicByRobotAndTopic, getAGVsTopics,
    getAGVsTopicsByRobot } from '../../Data/TopicSlice';

const CurrentSpeed = ({robotname, ip, speed , position}) => {
    const [x, setX] = useState(0.0);
    const [y, setY] = useState(0.0);
    const [orientation, setOrientation] = useState(0.0);
    const [linearVelocity, setLinearVelocity] = useState(0.0);
    const [angularVelocity, setAngularVelocity] = useState(0.0);
    const [loading, setLoading] = useState(true);

    const [prevX, setPrevX] = useState(0.0);
    const [prevY, setPrevY] = useState(0.0);
    const [prevOrientation, setPrevOrientation] = useState(0.0);

    const [prevLinearX, setPrevLinearX] = useState(0.0);
    const [prevAngularY, setPrevAngularY] = useState(0.0);

    const dispatch = useDispatch();
    // const topicSpeed. = useSelector(state => getAGVsTopicsByRobot(state, robotname));

    useEffect(() => {
        dispatch(fetchTopicByRobot(robotname));
        const intervalId = setInterval(() => {
            dispatch(fetchTopicByRobot(robotname));
        }, 5000);
        return () => clearInterval(intervalId);
    }, [dispatch, robotname]);

    useEffect(() => {
        if (x !== 0 && y !== 0 && orientation !== 0 && linearVelocity !== 0 && angularVelocity !== 0) {
            setLoading(false);
        }
    }, [x, y, orientation, linearVelocity, angularVelocity]);


    useEffect(() => {
        const fetchData = async () => {
            const ros = connectToMachine(robotname, `ws://${ip}:9090`);
            const newVelocitySubscriber = new window.ROSLIB.Topic({
                ros: ros,
                name: speed.topic_name,
                messageType: speed.messageType,
            });
            const newPoseSubscriber = new window.ROSLIB.Topic({
                ros: ros,
                name: position.topic_name,
                messageType: position.messageType,
            });

            newPoseSubscriber.subscribe((message) => {
                const newX = message.pose.pose.position.x.toFixed(2);
                const newY = message.pose.pose.position.y.toFixed(2);
                const newOrientation = getOrientationFromQuaternion(message.pose.pose.orientation).toFixed(2);
                setX(newX);
                setY(newY);
                setOrientation(newOrientation);
                const posPayload = {
                    position: {
                        x: newX,
                        y: newY,
                        orientation: newOrientation,
                    },
                };
                dispatch(addAGVsPosition(posPayload));
            });

            newVelocitySubscriber.subscribe((message) => {
                const newLinearX = message.twist.twist.linear.x.toFixed(2);
                const newAngularY = message.twist.twist.angular.z.toFixed(2);
                setLinearVelocity(newLinearX);
                setAngularVelocity(newAngularY);
                const speedPayload = {
                    linear: {
                        x: newLinearX,
                    },
                    angular: {
                        z: newAngularY,
                    }
                };
                dispatch(addAGVsSpeed(speedPayload));
            });

            return () => {
                newVelocitySubscriber.unsubscribe();
                newPoseSubscriber.unsubscribe();
            };
        };

        fetchData();
    }, [dispatch, ip, position.messageType, position.topic_name, robotname, speed.messageType, speed.topic_name]);

    const getOrientationFromQuaternion = (rosOrientationQuaternion) => {
        const q = new Three.Quaternion(
          rosOrientationQuaternion.x,
          rosOrientationQuaternion.y,
          rosOrientationQuaternion.z,
          rosOrientationQuaternion.w
        );
        // convert this quaternion into Roll, Pitch and Yaw
        const RPY = new Three.Euler().setFromQuaternion(q);
    
        return RPY["_z"] * (180 / Math.PI);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

 
    return (
            <div style={{display:'flex',justifyContent:'left'}}>
                <div style={{paddingRight:'3rem',paddingLeft:'0.5rem'}}>
                    <Col style={{fontSize:'18px',textDecoration: 'underline'}}>
                        Position:
                    </Col>
                    <Col xs={2} style={{marginLeft:'1rem'}}>
                        <div style={{display:'flex'}}>
                            <div>
                                x:
                            </div>
                            <div>
                                {x}
                            </div>
                        </div>
                    </Col>
                    <Col xs={2} style={{marginLeft:'1rem'}}>                                                              
                        <div style={{display:'flex'}}>
                            <div>
                                y:
                            </div>
                            <div>
                                {y}
                            </div>
                        </div>
                    </Col>
                    <Col xs={2} style={{marginLeft:'-1rem'}}>
                        <div style={{display:'flex'}}>
                            <div>
                                Orien:
                            </div>
                            <div>
                                {orientation}
                            </div>
                        </div>
                    </Col>
                </div>
                <div>
                    <Col style={{fontSize:'18px',textDecoration: 'underline'}}>
                        Velocities:
                    </Col>
                    <Col style={{marginLeft:'2rem'}}>
                        <div style={{display:'flex'}}>
                            <div>
                                Linear Vel:
                            </div>
                            <div>
                                {linearVelocity}
                            </div>
                        </div>
                    </Col>
                    <Col style={{marginLeft:'1.3rem'}}>
                        <div style={{display:'flex'}}>
                            <div>
                                Angular Vel:
                            </div>
                            <div>
                                {angularVelocity}
                            </div>
                        </div>
                    </Col>
                </div>
            </div>
    );
};
export default CurrentSpeed;

