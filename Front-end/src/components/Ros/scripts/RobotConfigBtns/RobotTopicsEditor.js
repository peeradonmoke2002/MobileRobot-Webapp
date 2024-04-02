import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicByRobot, getAGVsTopicsByRobot, editTopicByRobotAndTopic } from '../../Data/TopicSlice';
import RobotlistManager from './RobotlistManager';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';

const EditTopicsOverlay = ({ robotName, onClose }) => {
  const dispatch = useDispatch();
  const topics = useSelector(state => getAGVsTopicsByRobot(state, robotName));
  const [updatedTopics, setUpdatedTopics] = useState({});
  const [warning, setWarning] = useState('');

  useEffect(() => {
    dispatch(fetchTopicByRobot(robotName));
  }, [dispatch, robotName]);

  useEffect(() => {
    setUpdatedTopics(topics);
  }, [topics]);

  const handleTopicChange = (topicName, newData) => {
    setUpdatedTopics(prevTopics => ({
      ...prevTopics,
      [topicName]: newData
    }));
  };

  const handleSaveTopics = () => {
    if (!robotName) {
      setWarning('Please select a robot.');
    } else {
      dispatch(editTopicByRobotAndTopic(robotName, updatedTopics));
      onClose();
    }
  };

  return (
    <Card className="modal-content" style={{ width: '100%', maxHeight: '50vh', overflowY: 'auto', border: 'none' }}>
      <Card.Body>
        {warning && <p style={{ color: 'red' }}>{warning}</p>}
        {Object.entries(updatedTopics).map(([topicKey, topicData]) => (
          <Row key={topicKey} className="mb-3">
            <Col xs={12} md={5}>
              <Form.Group className="mb-3" controlId={`topicName_${topicKey}`}>
                <Form.Label>Topic Name:</Form.Label>
                <Form.Control type="text" value={topicData.topic_name} onChange={e => handleTopicChange(topicKey, { ...updatedTopics[topicKey], topic_name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12} md={5}>
              <Form.Group className="mb-3" controlId={`messageType_${topicKey}`}>
                <Form.Label>Message Type:</Form.Label>
                <Form.Control type="text" value={topicData.message_type} onChange={e => handleTopicChange(topicKey, { ...updatedTopics[topicKey], message_type: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
        ))}
        <div className="button-group">
          <Button style={{marginRight:'10px', border: 'none'}} variant="primary" type="button" onClick={handleSaveTopics}>Save Topics</Button>
          <Button style={{backgroundColor: 'red' ,border: 'none' }} variant="primary" type="button" onClick={onClose} >Cancel</Button>
        </div>
      </Card.Body>
    </Card>
  );
};  

export default EditTopicsOverlay;