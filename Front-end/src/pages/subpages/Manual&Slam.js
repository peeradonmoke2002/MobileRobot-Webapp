import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import MapView from "../../components/Ros/scripts/Gmapping/Mapview";
import AmclState from "../../components/Ros/scripts/RobotState/AmclState";
import CurrentSpeed from "../../components/Ros/scripts/RobotState/CurrentSpeed";
import Teleoperation from "../../components/Ros/scripts/Teleop/Teleop";
import { Row, Col, Button, Overlay, Popover, OverlayTrigger } from "react-bootstrap";
import Switch from "@mui/joy/Switch";
import { useRef, useState, useEffect } from "react";
import MapSaverComponent from "../../components/Ros/scripts/MapManager/SaveMap";
import MapList from "../../components/Ros/scripts/MapManager/MapList";
import ThreeDMap from "../../components/Ros/scripts/Localization/ThreeDMap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicByRobot,  getAGVsTopicsByRobot } from '../../components/Ros/Data/TopicSlice';
import ChangeModeButton from "../../components/Ros/scripts/RobotConfigBtns/ChangeModeButton";


export default function Manual_n_Slam({robotData}) {
    const name = robotData.name;
    const ip = robotData.rosbridge_server_ip;
    const port = robotData.rosbridge_server_port;
    const mode = robotData.mode;
    const Topic = useSelector(state => getAGVsTopicsByRobot(state, name));
    const [isTopicAvailable, setIsTopicAvailable] = useState(false);
    const dispatch = useDispatch();

   
    useEffect(() => {
        const fetchData = async () => {
            dispatch(fetchTopicByRobot(name));
            setIsTopicAvailable(true);
        };

        const intervalId = setInterval(async () => {
            await fetchData();
        }, 2000);

        fetchData();

        return () => clearInterval(intervalId);
    }, [dispatch, name]);

    const scan = Topic ? {
        topic_name: Topic.scan.topic_name,
        messageType: Topic.scan.message_type,
    }: {};
    const poseListener = Topic ? {
        topic_name: Topic.slam_poseListener.topic_name,
        messageType: Topic.slam_poseListener.message_type,
    }: {};
    const speed = Topic ? {
        topic_name: Topic.slam_speed.topic_name,
        messageType: Topic.slam_speed.message_type,
    }: {};
    const position = Topic ? {
        topic_name: Topic.slam_pos.topic_name,
        messageType: Topic.slam_pos.message_type,
    }: {};
    const cmd_vel = Topic ? {
        topic_name: Topic.cmd_vel.topic_name,
        messageType: Topic.cmd_vel.message_type,
    }: {};
    const amcl_cov = Topic ? {
        topic_name: Topic.amcl_cov.topic_name,
        messageType: Topic.amcl_cov.message_type,
    }: {};
    const path = Topic? {
        topic_name: Topic.path.topic_name ,
        messageType: Topic.path.message_type,
    }: {};

    const [isAddNewMap, setIsAddMapOpen] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const displayAddPanel = (event) => {
        setIsAddMapOpen(!isAddNewMap);
        setTarget(event.target);
    };

    return(
        <Col className="subpage_box">
            <Row style={{   textAlign: 'center', 
                            margin:'2rem', 
                            marginLeft:'2rem'}}>
                <Col xs={8}>
                    {isSwitchOn ? 
                        <ThreeDMap robotname={name} ip={ip} scan={scan}/>
                    :
                        <MapView robotname={name} ip={ip} scan={scan} pose={poseListener}/>
                    }
                    <Row style={{height:'100px',marginTop:'0.5rem'}}>
                        <div style={{  
                                display:'flex',
                                flexGrow:'1',
                                justifyContent:'space-between'}}>
                            <Col xs={4}>
                                <div    ref={ref} 
                                        style={{display: 'flex',
                                                justifyContent:'flex-start'}}>
                                    <Button variant={mode === 'NAV' ? 'outline-danger' : 'success'} style={{borderRadius:'0px'}}
                                            onClick={displayAddPanel}
                                            disabled={mode === 'NAV'}
                                    >
                                        Save New Map
                                    </Button>         
                                    <Overlay
                                        show={isAddNewMap}
                                        target={target}
                                        placement="right"
                                        container={ref}
                                        containerPadding={20}
                                        >
                                        <Popover id="popover-contrained">
                                        <Popover.Body>
                                            <MapSaverComponent robotname={name} ip={ip}/>
                                        </Popover.Body>
                                        </Popover>
                                    </Overlay>                         
                                </div>
                            </Col>
                            <Col xs={8}>
                                <div style={{height:'100px'}}>
                                    <div    style={{
                                                display:'flex',
                                                alignItems:'center',
                                                justifyContent:'right'
                                                }}>
                                        <MapList robotname={name} ip={ip}/>
                                    </div>
                                    <div style={{
                                        marginTop:'1rem',
                                        display: 'flex',
                                        justifyContent:'right'}}>
                                        <div    style={{    alignItems:'center',
                                                            display:'flex' }}>
                                            <div style={{marginRight: '10px',}}>
                                                Change 2D-3D:
                                            </div>
                                            <Switch 
                                                checked={isSwitchOn} 
                                                onChange={(event) => setIsSwitchOn(event.target.checked)}
                                                color={isSwitchOn ? 'warning' : 'neutral'} 
                                                variant="solid"
                                            />
                                            <span style={{ marginLeft: '5px',display:'flex' }}>{isSwitchOn ? '3D' : '2D'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </div>
                    </Row>
                </Col>
                <Col xs={4}>
                    {isTopicAvailable ? (
                    <div style={{padding:'1rem',border: '1px solid black',borderStyle:'outset'}}>
                        {/* <Row style={{paddingLeft:'0.5rem'}}>
                            <AmclState robotname={name} ip={ip} amcl={amcl_cov}/>
                        </Row>
                        <hr style={{color: '#000000',
                                    backgroundColor: '#000000',
                                    height: '2px',}}/> */}
                        <Row style={{paddingLeft:'0.5rem'}}>
                            <CurrentSpeed   
                                robotname={name} 
                                ip={ip} 
                                speed={speed}
                                position={position}
                                />
                        </Row>
                    </div>
                    ) : (
                        <div class="loading-container">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                        </div>
                    )}
                    <div className="box-manual">
                        <div style={{borderBottom:'2px solid', padding:'0.5rem', fontSize:'18px'}}>
                            Manual controls
                        </div>
                        <Teleoperation robotname={name} ip={ip} cmdvel={cmd_vel}/>
                    </div>
                </Col>
            </Row>
        </Col>
    );
}
