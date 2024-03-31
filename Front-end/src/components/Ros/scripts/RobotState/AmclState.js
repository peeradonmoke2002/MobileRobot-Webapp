import React, { useEffect, useState } from 'react';
import { connectToMachine, getRosConnection } from "../rosbridge";
import classNames from 'classnames';
import { Col, Container, Row, Button} from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopic, fetchTopicByRobot, 
  removeTopicByRobotAndTopic, getAGVsTopics,
  getAGVsTopicsByRobot } from '../../Data/TopicSlice';

const AmclState = ({ robotname, ip , amcl}) => {
  const [amclFixStatus, setAmclFixStatus] = useState({
    x: 0,
    y: 0,
    a: 0,
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
      const ros = connectToMachine(robotname, `ws://${ip}:9090`);
      const covListener = new window.ROSLIB.Topic({
          ros: ros,
          name: amcl.topic_name,
          messageType: amcl.message_type,
          compression: 'cbor',
          throttle_rate: 200,
          queue_length: 1
      });

      covListener.subscribe((message) => {
          const cov_x = Math.round(message.x.toFixed(6) * 10) / 10;
          const cov_y = Math.round(message.y.toFixed(6) * 10) / 10;
          const cov_a = Math.round(message.z.toFixed(6) * 10) / 10;
          setAmclFixStatus({ x: cov_x, y: cov_y, a: cov_a });
          setLoading(false); // Data has arrived, set loading to false
      });

      return () => {
          covListener.unsubscribe();
          ros.close();
      };
  }, [robotname, ip, amcl, setAmclFixStatus, setLoading]);


  const getStatusText = (x, y, a) => {
    if (x <= 15 && y <= 15 && a <= 6) {
        return 'Fixed';
    } else if (x <= 20 && y <= 20 && a <= 12) {
        return 'Stable';
    } else {
        return 'Unstable';
    }
  };

  const amclUpdate = () => {
    const ros = getRosConnection(robotname);
    const amclUpdateClient = new window.ROSLIB.Service({
        ros: ros,
        name: '/request_nomotion_update',
        serviceType: 'std_srvs/Empty'
    });
    let counts = 0;
    const id = setInterval(() => {
        if (counts === 30) {
            clearInterval(id);
        } else {
            counts++;
            amclUpdateClient.callService('std_srvs/Empty');
        }
    }, 150);
    clearCostmap();
  };

  const clearCostmap = () => {
    const ros = getRosConnection(robotname);
    const clearCostmapClient = new window.ROSLIB.Service({
        ros: ros,
        name: '/move_base/clear_costmaps',
        serviceType: 'std_srvs/Empty'
    });

    clearCostmapClient.callService('std_srvs/Empty', (result) => {
        console.log('called service ' + clearCostmapClient.name);
    });
}

if (loading) {
  return (
  <p>Loading...</p>
  );
}
  
  return (
      <div style={{display:'flex',justifyContent:'left'}}>
          <div style={{fontSize:'18px',textDecoration: 'underline'}}>
            AMCL State:
          </div>
          <div  className={classNames('amcl_value', {
            'success': amclFixStatus.x <= 15 && amclFixStatus.y <= 15 && amclFixStatus.a <= 6,
            'info': amclFixStatus.x <= 20 && amclFixStatus.y <= 20 && amclFixStatus.a <= 12,
            'danger': amclFixStatus.x > 20 || amclFixStatus.y > 20 || amclFixStatus.a > 12,
          })}
          style={{
              paddingLeft:'1.5rem',
            }}
          >
            <Row>
              {getStatusText(amclFixStatus.x, amclFixStatus.y, amclFixStatus.a)}
            </Row>
            <Row>
                  {amclFixStatus.x === null ? 'No Data' : amclFixStatus.x}/
                  {amclFixStatus.y === null ? 'No Data' : amclFixStatus.y}/
                  {amclFixStatus.a === null ? 'No Data' : amclFixStatus.a}
            </Row>
            <Row className='notchange' style={{marginLeft:'-1rem',color:'black'}}>
              (x/y/a)
            </Row>
            <Row style={{display:'flex',justifyContent:'center',marginTop:'1rem'}}>
                <Button className="btnamcl"
                        style={{fontSize:'12px',marginRight:'15px'}}
                        variant='info'
                        onClick={amclUpdate}> 
                    AMCL Localization
                </Button>
            </Row>
          </div>
      </div>
  );

  // const amclStatus = {
  //   x: amclFixStatus.x,
  //   y: amclFixStatus.y,
  //   a: amclFixStatus.a,
  //   statusText: getStatusText(amclFixStatus.x, amclFixStatus.y, amclFixStatus.a)
  // };

  // return amclStatus;
};

export default AmclState;
