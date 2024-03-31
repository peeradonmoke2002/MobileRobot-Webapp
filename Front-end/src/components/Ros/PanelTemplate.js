import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import React, { useState } from "react";
import Conection from "./scripts/rosConnection";
import { dummySUBPAGE } from "../../pages/subpages/subpageDummy";
import SideBar from "../Sidebar/Sidebar";
import { Container, Row, Col } from "react-bootstrap";

export const PanelTemplate = ({robotData}) => {

    const robotname = robotData.name;
    const ip = robotData.rosbridge_server_ip;
    const port = robotData.rosbridge_server_port;
    const mode = robotData.mode;

    const navigate = useNavigate();
    const [chooseNav, setChooseNav] = useState(0);
    const currentLocate = useLocation();

    return (
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
                        
                        <Row>
                            <Conection robotname={robotname} ip={ip} port={port} mode={mode}/>
                        </Row>
                        
                        <Row style={{fontFamily:'Manrope'}}>
                            <div className="Nav_panel">
                                {dummySUBPAGE&&
                                    dummySUBPAGE.map((sub,index) => (
                                        <Link   to={sub.path}
                                                style={{textDecoration:'none'}}
                                            > 
                                            <div 
                                                key={index}
                                                onClick={() => setChooseNav(sub.id)}
                                                className={`NavChild ${
                                                    (sub.path === '' && currentLocate.pathname === "/robots/" + robotname) ||
                                                    (sub.path !== '' && currentLocate.pathname === "/robots/" + robotname + "/" + sub.path) 
                                                    ? 'active' : ''
                                                  }`}
                                            >
                                                {/* {"/robots"+"/"+robotname+"/"+sub.path}  */}
                                                
                                                {sub.name}
                                            </div>
                                        </Link>
                                ))}
                            </div>
                            <Outlet />
                        </Row>
                    </Col>
                </div>
            </Row>
        </Container>   
        
    );
}