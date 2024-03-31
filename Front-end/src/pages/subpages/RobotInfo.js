import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import ActiveInfo from "../../components/Ros/scripts/RosInfo/AtiveInfo";

export default function Robot_info({robotData}) {
    const name = robotData.name;
    const ip = robotData.rosbridge_server_ip;
    const port = robotData.rosbridge_server_port;

    const currentlocate = useLocation();

    return(
        <Col className="subpage_box">
            <Row style={{   textAlign: 'left', 
                            margin:'2rem', 
                            marginLeft:'2rem'}}>
                <Row style={{fontSize:'20px',marginBottom:'10px'}}>
                    Robotname: {name}
                </Row>
                <Row style={{fontSize:'20px',marginBottom:'10px'}}>
                    IP: {ip}
                </Row>
                <Row style={{fontSize:'20px',marginBottom:'10px'}}>
                    Port: {port}
                </Row>
                <Row>
                    <ActiveInfo robotname={name} ip={ip}/>
                </Row>

            </Row>
        </Col>
    );
}