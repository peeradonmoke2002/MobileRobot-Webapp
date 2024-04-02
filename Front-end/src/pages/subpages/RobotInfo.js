import React, { useState, useRef } from "react";
import { Col, Overlay, Popover, Row, Form, Button } from "react-bootstrap";
import ActiveInfo from "../../components/Ros/scripts/RosInfo/AtiveInfo";
import RobotTopicsEditor from "../../components/Ros/scripts/RobotConfigBtns/RobotTopicsEditor";
import SettingsIcon from '@mui/icons-material/Settings';

export default function Robot_info({ robotData }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);
  const name = robotData.name;
  const ip = robotData.rosbridge_server_ip;
  const port = robotData.rosbridge_server_port;

  const displayConfigPanel = (event) => {
    setIsEditOpen(!isEditOpen);
    setTarget(event.target);
  };

return (
    <Col className="subpage_box">
        <Row style={{ textAlign: "left", margin: "2rem", marginLeft: "2rem" }}>
            <Row style={{ fontSize: "20px", marginBottom: "10px" }}>
                Robotname: {name}
            </Row>
            <Row style={{ fontSize: "20px", marginBottom: "10px" }}>
                IP: {ip}
            </Row>
            <Row style={{ fontSize: "20px", marginBottom: "10px" }}>
                Port: {port}
            </Row>
            <Row style={{ justifyContent: "left"}}>
                <button
                   
                    onClick={displayConfigPanel}
                    style={{ marginLeft: "0", marginRight: "10px", width: "180px" }}
                   
                >
                    <SettingsIcon style={{ fontSize: "20px", marginRight: "10px", verticalAlign: "middle" }} />
                    Edit Topics
                </button>
                <Overlay
                    show={isEditOpen}
                    target={target}
                    placement="right"
                    container={ref.current}
                    containerPadding={100}
                    onHide={() => setIsEditOpen(false)}
                >
                    <Popover id="popover-contained" style={{ maxWidth: '500px' }}>
                        <Popover.Header as="h3">Edit Topic {name}</Popover.Header>
                        <Popover.Body>
                            <RobotTopicsEditor robotName={name} onClose={() => setIsEditOpen(false)} />
                        </Popover.Body>
                    </Popover>
                </Overlay>
            </Row>
            <Row>
                <ActiveInfo robotName={name} />
            </Row>
        </Row>
    </Col>
);
}