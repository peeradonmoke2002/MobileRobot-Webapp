import React from "react";
import {
    CDBSidebar,
    CDBSidebarContent,
    CDBSidebarFooter,
    CDBSidebarHeader,
    CDBSidebarMenu,
    CDBSidebarMenuItem,
  } from 'cdbreact';
  import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import AIMs_logo from '../Image/AIM-Blightest-Logo.png';
import RAI_logo from '../Image/RAI-logo.png'


function SideBar({}) {

    const navigate = useNavigate()
    const currebtLocation = useLocation();

    const onButtonClick = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("loggedIn")
        navigate("/")
    }

    return (
        <div style={{
                height: '100%', 
                overflow: 'clip',
                position: 'fixed',
                width:'256px',
            }} >
            <CDBSidebar
                        textColor="#fff" 
                        backgroundColor="#333"
                        // backgroundColor="#f0f0f0"
                        // style={{maxwidth:'100%'}}
                        >
                <CDBSidebarHeader 
                        // prefix={<i className="fa fa-bars fa-large"></i>}
                        >
                    <div className="container" style={{ display: 'flex', alignItems: 'center',marginLeft:'-1rem'}}>
                        <img
                            src={RAI_logo}
                            alt="RAI_logo"
                            style={{ width: '100px' }}
                        />
                        <img
                            src={AIMs_logo}
                            alt="AIMs_logo"
                            style={{ width: '85px', marginLeft: '1.20rem' }}
                        />
                        {/* <a className="text-decoration-none ms-2" 
                            style={{ color: 'inherit',fontSize:'20px' }}>
                            AIM LAB
                        </a> */}
                    </div>
                </CDBSidebarHeader>

                <CDBSidebarContent className="sidebar-content">
                <CDBSidebarMenu>
                     <NavLink  
                                to="/robots"
                                style={({ isActive }) => {
                                    return isActive ? { color: "orange"} : {};
                                    }}
                                >
                        <CDBSidebarMenuItem icon="th-list">Robot List</CDBSidebarMenuItem>
                    </NavLink>
                    <NavLink   
                                to="/multiple_navigation"
                                style={({ isActive }) => {
                                    return isActive ? { color: "orange"} : {};
                                    }}
                                >
                            <CDBSidebarMenuItem icon="shapes">Multi Robot Navigation</CDBSidebarMenuItem>
                    </NavLink>
                    <NavLink
                                to="/setting"
                                style={({ isActive }) => {
                                    return isActive ? { color: "orange"} : {};
                                    }}
                                >
                        <CDBSidebarMenuItem icon="cog">Setting</CDBSidebarMenuItem>
                    </NavLink>
                </CDBSidebarMenu>
                </CDBSidebarContent>

                <CDBSidebarFooter>
                    <div className="buttonContainer">
                        <button onClick={onButtonClick}>
                            <LogoutTwoToneIcon/> LogOut
                        </button>
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>
        </div>
    );
}

export default SideBar;