import React, { useState, useEffect } from 'react';
import MapNavAll from './MapNavAll';
import { useDispatch, useSelector } from 'react-redux';
import { handleEditRobot, getMoveInformation } from '../../Data/agvSlice';
import RobotlistAvailable from './RobotlistAvailable';
import { Col, Row, Container } from 'react-bootstrap';
import MapList from '../MapManager/MapList';
import { fetchTopicByRobot, getAGVsTopicsByRobot } from '../../Data/TopicSlice';
import ReplayTwoToneIcon from '@mui/icons-material/ReplayTwoTone';


const SetMainMap = ({}) => {
  const dispatch = useDispatch();
  const moveInformation = useSelector(getMoveInformation);
  const [selectedRobot, setSelectedRobot] = useState('');
  const [name, setName] = useState('');
  const [key, setKey] = useState(0);

  const Topic = useSelector(state => getAGVsTopicsByRobot(state, name));
  // const topics = useSelector(state => getAGVsTopicsByRobot(state, 'TurtlebotSim001'));
  useEffect(() => {
      if (name === '') {
          return;
      }
    dispatch(fetchTopicByRobot(name));
    const intervalId = setInterval(() => {
      dispatch(fetchTopicByRobot(name));
      // console.log('amcltopic',amclTopic.amcl_cov);
    }, 5000);
    return () => clearInterval(intervalId);

  }, [dispatch, name]);

  const handleReloadData = () => {
    if (name) {
        setKey((prevKey) => prevKey + 1);
    }
};

 
  const poseListener = Topic? {
      topic_name: Topic.nav_poseListener.topic_name ,
      messageType: Topic.nav_poseListener.message_type ,
  }: {};
  const path = Topic? {
    topic_name: Topic.path.topic_name ,
    messageType: Topic.path.message_type,
}: {};

  // Handle robot selection event
  const handleRobotSelection = (selectedRobot) => {
    const selectedRobotData = moveInformation.find((robot) => robot.name === selectedRobot);
    setName(selectedRobotData.name)
    console.log('Selected Robot Data:', selectedRobotData);
    setSelectedRobot(selectedRobotData);
    console.log('Selected Robot:', selectedRobot);
    setKey((prevKey) => prevKey + 1);
    handleReloadData();
  };

  return (
    <Container>
      <Row>
        <div 
          style={{display:'flex',
                  alignItems:'center',
                  marginLeft:'1rem',
                }}
        >
          <div>
            Select Main Robot for get the main map:
          </div>
          <RobotlistAvailable onSelect={handleRobotSelection} />
          <button onClick={handleReloadData} className='refresh-multiple-btn'>
           <ReplayTwoToneIcon/>
          </button>
        </div>
      </Row>
      <Row>
          <MapNavAll onSelect={selectedRobot} pose={poseListener} path={path} key={key} />
      </Row>
    </Container>
  );
};

export default SetMainMap;
