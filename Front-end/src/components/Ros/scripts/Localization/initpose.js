import React, { useEffect, useState } from 'react';
import { connectToMachine , getRosConnection} from "../rosbridge";
import { Row, Col, Container, Button } from "react-bootstrap";
// import stlload from '../stl/buger_base.dae';
import AmsclState from '../RobotState/AmclState';
import { ZoomPanEvent } from '../ZomPanEvent';

const InitPose = ({robotname, ip, initMarkerPose}) => {
  const [x] = useState(window.innerWidth);
  const [twoDmapHeight, setTwoDmapHeight] = useState(x * 0.48 * 0.75);
  const [twoDmapWidth, setTwoDmapWidth] = useState(x * 0.48);
  const [xi, setXi] = useState(1.0);
  const [yi, setYi] = useState(0.0);
  const [ai, setAi] = useState(0.3);

 
  const pubinitPoseMessage = () => {

    const ros = getRosConnection(robotname);

    const initPoseTopic = new window.ROSLIB.Topic({
      ros: ros,
      name: '/initialpose',
      messageType: 'geometry_msgs/PoseWithCovarianceStamped',
      queue_size: 1,
       queue_length: 1
    });

    const initpose = new window.ROSLIB.Message({
      header: {
        frame_id: "map"
      },
      pose: {
        pose: {
          position: { x: 0.0, y: 0.0, z: 0.0 },
          orientation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }
        },
        covariance: [
          0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 
          0.0, 0.25, 0.0, 0.0, 0.0, 0.0, 
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
          0.0, 0.0, 0.0, 0.0, 0.0, 0.07]
      }
    });


    var initposeX = Number(document.getElementById('initposeXText').value);
    var initposeY = Number(document.getElementById('initposeYText').value);
    var initposeW = Math.cos(Number(document.getElementById('initposeWText').value) * Math.PI / (180 * 2));
    var initposeZ = Math.sin(Number(document.getElementById('initposeWText').value) * Math.PI / (180 * 2));

    initpose.pose.pose.position.x = initposeX;
    initpose.pose.pose.position.y = initposeY;
    initpose.pose.pose.orientation.z = initposeZ;
    initpose.pose.pose.orientation.w = initposeW;
    initpose.pose.covariance[6 * 0 + 0] = 0.7 * 0.7;
    initpose.pose.covariance[6 * 1 + 1] = 0.7 * 0.7;
    initpose.pose.covariance[6 * 5 + 5] = 0.5 * 0.5;  //Math.PI/12.0 * Math.PI/12.0;

    initPoseTopic.publish(initpose);
    amclUpdate();
  };

  const amclUpdate = () => {
    const ros = getRosConnection(robotname);
    var amclUpdateClient = new window.ROSLIB.Service({
      ros: ros,
      name: '/request_nomotion_update',
      serviceType: 'std_srvs/Empty'
    });
    var counts = 0;
    var id = setInterval(updates, 150);
    clearCostmap();
    function updates() {
      if (counts == 30) {
        clearInterval(id);
      } else {
        counts++;
        amclUpdateClient.callService('std_srvs/Empty');
      }
    }
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
  // dpad event //
  const updateInitMarker = () => {
    if (initMarkerPose) {

      initMarkerPose.x = Number(document.getElementById('initposeXText').value);
      initMarkerPose.y = -Number(document.getElementById('initposeYText').value);
      initMarkerPose.rotation = -Number(document.getElementById('initposeWText').value);
      initMarkerPose.visible = true;
    }
  };

  useEffect(() => {
    const ros = connectToMachine(robotname, `ws://${ip}:9090`);
    updateInitMarker();
  }, [xi, yi, ai]);


  const handleArrowClick = (direction, increment) => {
    switch (direction) {
      case 'left':
        setXi((prevXi) => prevXi - increment);
        break;
      case 'right':
        setXi((prevXi) => prevXi + increment);
        break;
      case 'up':
        setYi((prevYi) => prevYi + increment);
        break;
      case 'down':
        setYi((prevYi) => prevYi - increment);
        break;
      default:
        break;
    }
    updateInitMarker();
  };

  const handleArrowRight = () => {
    setAi((prevAi) => {
      let newAi = prevAi - 10;
      if (newAi >= 360) {
        newAi = newAi + 360;
      }
      return newAi;
    });
    updateInitMarker();
  };

  const handleArrowLeft = () => {
    setAi((prevAi) => {
      let newAi = prevAi + 10;
      if (newAi < 0) {
        newAi = newAi - 360;
      }
      return newAi;
    });
    updateInitMarker();
  };

  const handleUpClick = () => {
    handleArrowClick('up', 0.2);
  };

  const handleDownClick = () => {
    handleArrowClick('down', 0.2);
  };

  const handleLeftClick = () => {
    handleArrowClick('left', 0.2);
  };

  const handleRightClick = () => {
    handleArrowClick('right', 0.2);
  };

  return (
    <Container style={{ paddingTop:'1rem',
                        paddingBottom:'1rem'}}>
      {/* <div class="row" style={{ display: 'flex' }}>

        <div class="column" style={{ width: '50%' }}>
            <h3>2D Map</h3>
            <br></br>
            <div id="twod-map"></div>
        </div>
        <br></br>
              
        <div class="column" style={{ width: '50%' }}>
             <h3>3D Map</h3>
             <br></br>
             <div id="threed-map"></div>
        </div>

      </div> */}
  
      <Row>
        <div style={{ display: 'flex',justifyContent:'center'}}>
          <p style={{paddingRight:'30px'}}>X: {xi.toFixed(1)}</p>
          <p style={{paddingRight:'30px'}}>Y: {yi.toFixed(1)}</p>
          <p>W: {ai.toFixed(0)}</p>
        </div>
      </Row>
      <Row style={{ display: 'flex' }} >
          <Col>
          <Button className="btn btn-primary" 
                  onClick={handleArrowLeft}
                  style={{height:'100%',fontSize:'14px'}}
                  >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z" />
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
            </svg>
            Rotate Left
          </Button>
        </Col>
        <Col>
          <div class="set blue">
            <div class="d-pad">
                <a className="up" onClick={handleUpClick} href="#"></a>
                <a className="right" onClick={handleRightClick} href="#"></a>
                <a className="down" onClick={handleDownClick} href="#"></a>
                <a className="left" onClick={handleLeftClick} href="#"></a>
            </div>
          </div>
        </Col>
        <Col>
          <Button className="btn btn-primary" 
                  onClick={handleArrowRight}
                  style={{height:'100%',fontSize:'14px'}}
                  >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
            </svg>
            Rotate Right
          </Button>
        </Col>
      </Row>


      {/* <Row style={{marginTop:'1rem',marginBottom:'1rem'}}>
          <Col xs={5}>
            <hr style={{  color: '#000000',
                          backgroundColor: '#000000',
                          height: '2px',
                        }}/>
          </Col>
          <Col xs={2}>
            Or
          </Col>
          <Col xs={5}>
            <hr style={{  color: '#000000',
                          backgroundColor: '#000000',
                          height: '2px',
                        }}/>
          </Col>
      </Row> */}
      
      <Row>
        {/* <Col xs={1}>X:</Col>
        <Col xs={3}>
          <input type="text" className="form-control" id="initposeXText" value={xi.toFixed(1)} readOnly />
        </Col>
        <Col xs={1}>Y:</Col>
        <Col xs={3}>
          <input type="text" className="form-control" id="initposeYText" value={yi.toFixed(1)} readOnly />
        </Col>
        <Col xs={1}>Z:</Col>
        <Col xs={3}>
          <input type="text" className="form-control" id="initposeWText" value={ai.toFixed(1)} readOnly />
        </Col> */}
      </Row>
      <Row className="mt-3">
        <div style={{justifyContent:'center'}}>
          <Button variant="success" 
                  onClick={pubinitPoseMessage}
                  style={{width:'50%'}}
          >
            Publish Init Pose
          </Button>
        </div>
      </Row>


    </Container>
  );

};
export default InitPose;
