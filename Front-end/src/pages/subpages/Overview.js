import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicByRobot, getAGVsTopicsByRobot } from '../../components/Ros/Data/TopicSlice';
import MapControl from "../../components/Ros/scripts/Navigation/MapControl";
import AmclState from "../../components/Ros/scripts/RobotState/AmclState";
import RobotInfo from "../../components/Ros/scripts/RobotState/RobotInfo";
import CurrentSpeed from "../../components/Ros/scripts/RobotState/CurrentSpeed";
import WaypointControl from "../../components/Ros/scripts/waypoint/WaypointControl";
import WaypointSelector from "../../components/Ros/scripts/waypoint/WaypointSelecter";
import InitPose from "../../components/Ros/scripts/Localization/initpose";
import TwoDMap from "../../components/Ros/scripts/Localization/TwoDMap";
import { getReloadMap } from '../../components/Ros/Data/agvSlice';
import Teleoperation from "../../components/Ros/scripts/Teleop/Teleop";

const Overview = ({robotData}) => {

    const name = robotData.name;
    const ip = robotData.rosbridge_server_ip;
    const port = robotData.rosbridge_server_port;
    const ReloadMapupdate = useSelector(getReloadMap);
    const [initMarkerPose, setInitMarker] = useState(null);
    const { batteryVoltage, bumperStatus } = RobotInfo({ name, ip });
    const [key, setKey] = useState(3);
    const [isShowInitpose, setShowInitpose] = useState(false);
    const [isShowWP, setShowWP] = useState(false);
    const dispatch = useDispatch();
    const Topic = useSelector(state => getAGVsTopicsByRobot(state, name));
    const [isTopicAvailable, setIsTopicAvailable] = useState(false);
   
    useEffect(() => {
        const fetchData = async () => {
            dispatch(fetchTopicByRobot(name));
            setIsTopicAvailable(true);
        };

        const intervalId = setInterval(async () => {
            await fetchData();
            console.log('fetchData:', Topic);
        }, 2000);

        fetchData();

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
    // console.log('Topic:', Topic);

 
    useEffect(() => {
        console.log('ReloadMapupdate:', ReloadMapupdate);
        setKey((prevKey) => prevKey + 1);
    }, [ReloadMapupdate]);
    
    const ToggleInitpose = ()  =>{
        setShowInitpose(!isShowInitpose);
        setShowWP(false);
        setKey((prevKey) => prevKey + 1);
    }

    const ToggleShowWP = () => {
        setShowWP(!isShowWP);
        setShowInitpose(false);
        setKey((prevKey) => prevKey + 1);
    }

    const handleinitMarker = (initMarker) => {
        setInitMarker(initMarker);
    };
    
    return(
        <Col className="subpage_box">
            <Row style={{   textAlign: 'left', 
                            margin:'2rem', 
                            marginLeft:'2rem'}}>
                <Row>
                    <Col md={4} style={{fontSize:'18px'}}>
                        <div style={{marginLeft:'-1.5rem',paddingLeft:'0.7rem'}}>
                            Battery Voltage: {batteryVoltage === null 
                                                ? 'No Data' 
                                                : batteryVoltage}
                        </div>
                    </Col>
                    <Col md={4} style={{fontSize:'18px'}}>
                        <div style={{marginLeft:'-1.5rem',paddingLeft:'0.7rem'}}>
                            Bumper Status: {bumperStatus === null 
                                                ? 'No Data' 
                                                : bumperStatus 
                                                ? 'Non-acticve' : 'Active'}
                        </div>
                    </Col>
                </Row>
                <br/>
                <br/>
                <Row xs={10}>
                    
                    {isTopicAvailable ? (
                    <div style={{display:'flex', paddingLeft:'0px'}}>
                        
                        
                        <div style={{   paddingLeft:'0px',
                                        paddingRight:'3rem'
                                    }}>
                            <AmclState robotname={name} ip={ip} amcl={amcl_cov}/>
                        </div>
                            
                        <div style={{paddingLeft:'2rem'}}>
                            <CurrentSpeed   
                                  robotname={name} 
                                  ip={ip} 
                                  speed={speed}
                                  position={position}
                                />
                        </div>
                    </div>
                    ) : (
                        <div class="loading-container">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                      </div>
                    )}
                </Row>
            </Row>
            <hr style={{color: '#000000',
                        backgroundColor: '#000000',
                        height: '3px',
                        width:'90%',
                        margin:'auto'
                        }}/>
            <br/>
            <Row style={{   textAlign: 'center', 
                            margin:'2rem', 
                            marginLeft:'2rem'}}>
                <Col xs={8}>
                {isShowInitpose === true ? 
                    <TwoDMap robotname={name} 
                             ip={ip}    
                             setInitMarker={handleinitMarker}   
                             pose={poseListener}    
                             scan={scan}    
                             key={key}/>
                    :
                    <MapControl robotname={name}    
                                ip={ip} 
                                pose={poseListener}
                                path={path} 
                                key={key}/>
                }
                </Col>
                <Col xs={4} style={{alignItems:'center'}}>
                    <div className="d-grid" >
                        <button 
                            className={`btn-local ${
                                    isShowInitpose === true ? 'active' : ''
                                }`}
                            onClick={ToggleInitpose}
                        >
                            Localization
                        </button>
                        <div className="box-local">
                            {isShowInitpose === true && <InitPose robotname={name} 
                                                                  ip={ip} 
                                                                  initMarkerPose={initMarkerPose}/>}
                        </div>
                        <button 
                            className={`btn-local ${
                                    isShowWP === true ? 'active' : ''
                                }`}
                            onClick={ToggleShowWP}
                        >
                            Waypoint configure
                        </button>
                        <div className="box-local">
                            {isShowWP === true && 
                                <div>
                                    <div  style={{margin:'2rem'}}> 
                                        <WaypointControl/>
                                    </div>
                                    <div  style={{  justifyContent:'center',
                                                    margin:'2rem'}}>
                                        <WaypointSelector robotname={name} ip={ip}/>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="box-manual">
                        <div style={{borderBottom:'2px solid', padding:'0.5rem', fontSize:'18px'}}>
                            Manual controls
                        </div>
                        <Teleoperation robotname={name} ip={ip} cmdvel={cmd_vel}/>
                        </div>
                    </div>
                </Col>
            </Row>
        </Col>
    );
}

export default Overview;