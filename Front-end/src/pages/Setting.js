import React, { useEffect, useState } from "react";
import SideBar from "../components/Sidebar/Sidebar";
import RobotCard from "../components/Ros/RobotCard";
import robotConfig from '../components/Ros/scripts/robot.json';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { getMoveInformation } from '../components/Ros/Data/agvSlice';
import { Container, Row, Col, Button } from "react-bootstrap";
import authProvider from "../components/user/authProvider";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UserTable from "../components/user/userData";

const SettingPage = () => {

    const [newUsername, setNewUsername] = useState('');
    const [newEmail ,setNewEmail] = useState('');
    const [newPassword, addPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [configPassword, newPass] = useState('');
    const [confirmPassword, conPass] = useState('');
    const [currentPassword, nowPass] = useState('');

    const [errorBelowCurrentPass, updateCurrentPassError] = useState('');
    const [errorBelowConfirmPass, updateConfirmPassError] = useState('');

    const getuserInfo = JSON.parse(localStorage.getItem('user'));
    const [toggleChangePanel, setShowChangePanel] = useState(false);
    const [showAddPanel, addMoreUser] = useState(false);
    // const [trueinfo, setTrueInfo] = useState([]);

    // useEffect(() => {
    //     const fetchData = () => {
    //       fetch('http://localhost:3001/api/users')
    //         .then(response => response.json())
    //         .then(datas => {
    //             const currentInfo = datas.filter(user => user.username === getuserInfo.usernameOrEmail ||
    //                                                      user.email === getuserInfo.usernameOrEmail);
    //             // datas.map((user, index) => (

    //             // ))
    //             console.log(currentInfo);
    //             setTrueInfo(currentInfo);
    //         })
    //         .catch(error => {
    //           console.error('Error fetching user data:', error);
    //         });
    //     };
    
    //     fetchData();
    
    //     // const intervalId = setInterval(fetchData, 5000);
    //     // return () => clearInterval(intervalId);
    // }, []);

    const changePassword = () => {
        const identity = currentUser.username;
        authProvider.changePassword({identity, configPassword, confirmPassword, currentPassword})
        .then(response => {
            window.alert(response.message);
            updateCurrentPassError('');
            updateConfirmPassError('');
            newPass('');
            conPass('');
            nowPass('');
        })
        .catch(error => {
            if (error.message === "Current Password isn't correct.") {
                // window.alert(error.message);
                updateCurrentPassError(error.message);
                updateConfirmPassError('');
                newPass('');
                conPass('');
            } else {
                updateConfirmPassError(error.message);
                updateCurrentPassError('');
                conPass('');
            }
        })
    };
    
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        authProvider.checkRole()
        .then(response => {
            if(response.message === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        })
        .catch(error => {
            console.error(error.message);
        })
    }, []);

    const togglePasswordVis = () => {
        setShowPassword(!showPassword);
    };

    const addNewUser = () => {
        // window.alert(`NU ${newUsername}, NE ${newEmail}, NP ${newPassword}`);
        authProvider.registration({newUsername, newEmail, newPassword})
        .then((r) => {
            window.alert(r.message);
            setNewUsername('');
            setNewEmail('');
            addPassword('');
        })
        .catch(error => {
            window.alert(error);
            setNewUsername('');
            setNewEmail('');
            addPassword('');
        })
    };


    return (
        <Container  className="px-0" 
                    fluid={true}
                    style={{height: '100vh',
                            overflowX: 'hidden',
                            fontFamily:'Manrope',
                            }}
                    >
            <Row>
                <div style={{display:'flex',height:'100vh'}}>
                    <Col sm={2}>
                        <SideBar/>
                    </Col>
                    <Col sm={10}>
                        <div className="page-playground">

                            <div style={{flexGrow: 1,
                                        display:'flex',
                                        justifyContent:'flex-start',
                                        alignItems:'center',
                                        marginTop:'1rem',
                                        marginBottom:'-1rem',
                                        marginLeft:'1.5rem'}}>
                                <h1 style={{fontSize:'32px'}}>
                                    User Setting
                                </h1>
                            </div>
                            <br/>
                            <div style={{flexGrow: 1,
                                        display:'flex',
                                        justifyContent:'flex-start',
                                        alignItems:'center',
                                        marginLeft:'1.5rem',
                                        marginRight:'1.5rem'}}>
                                <hr style={{color: '#000000',
                                            backgroundColor: '#000000',
                                            height: '2px',
                                            width:'100%',
                                            margin:'auto'
                                            }}/>
                            </div>
                            <Row style={{marginBottom:'1.5rem'}}>
                                <div style={{
                                            display:'flex', 
                                            flexDirection:'column',
                                            alignItems:'flex-start', 
                                            justifyContent: 'flex-start',
                                            marginTop:'1rem',
                                            marginLeft:'1.5rem'}}>
                                    <div>
                                        Username: {getuserInfo.username} ({getuserInfo.email})
                                    </div>
                                    <div style={{marginBottom:'1rem'}}>
                                        Role: {getuserInfo.role}
                                    </div>
                                    <button className="sub-submit-btn"
                                            onClick={() => setShowChangePanel(!toggleChangePanel)}>
                                        Change the password
                                    </button>
                                    {toggleChangePanel && (
                                        <div className="setting-input-box">
                                            <div style={{
                                                    display:'flex',
                                                    justifyContent:'flex-start',
                                                    marginLeft:'41px',
                                                    marginBottom:'10px'}}>
                                                <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                    Current Password:
                                                </div>
                                                <div className="inputContainer">
                                                    <input
                                                            value={currentPassword}
                                                            onChange={ev => nowPass(ev.target.value)}
                                                            style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                            className={"inputBox"} />
                                                    <label className="errorLabel">{errorBelowCurrentPass}</label>
                                                </div>
                                            </div>
                                            <div style={{
                                                    display:'flex',
                                                    justifyContent:'flex-start',
                                                    marginLeft:'23px',
                                                    marginBottom:'10px'}}>
                                                <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                    Enter New Password:
                                                </div>
                                                <div className="inputContainer">
                                                    <input
                                                            value={configPassword}
                                                            onChange={ev => newPass(ev.target.value)}
                                                            style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                            className={"inputBox"} />
                                                </div>
                                            </div>
                                            <div style={{
                                                    display:'flex',
                                                    justifyContent:'flex-start',
                                                    marginBottom:'10px'}}>
                                                <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                    Comfirm New Password:
                                                </div>
                                                <div className="inputContainer">
                                                    <input
                                                            value={confirmPassword}
                                                            onChange={ev => conPass(ev.target.value)}
                                                            style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                            className={"inputBox"} />
                                                    <label className="errorLabel">{errorBelowConfirmPass}</label>
                                                </div>
                                            </div>
                                            <div style={{margin:'auto'}}>
                                                <Button onClick={changePassword}>change password</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Row>
                            {isAdmin &&
                                <Row style={{marginBottom:'1.5rem'}}>

                                    <div className="setting-input-box">
                                        <button className="sub-submit-btn"   
                                                onClick={() => addMoreUser(!showAddPanel)}>
                                            Register New User
                                        </button>
                                        {showAddPanel && (
                                            <div className="setting-input-box">
                                                <div style={{
                                                        display:'flex',
                                                        justifyContent:'flex-start',
                                                        marginLeft:'37px',
                                                        marginBottom:'10px'}}>
                                                    <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                        Email:
                                                    </div>
                                                    <input
                                                        value={newEmail}
                                                        placeholder="Enter email here.."
                                                        onChange={ev => setNewEmail(ev.target.value)}
                                                        style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                        className={"inputBox"} />
                                                </div>
                                                <div style={{
                                                        display:'flex',
                                                        justifyContent:'flex-start',
                                                        marginBottom:'10px'}}>
                                                    <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                        Username:
                                                    </div>
                                                    <input
                                                        value={newUsername}
                                                        placeholder="Enter username here.."
                                                        onChange={ev => setNewUsername(ev.target.value)}
                                                        style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                        className={"inputBox"} />
                                                </div>
                                                <div style={{
                                                        display:'flex',
                                                        justifyContent:'flex-start',
                                                        marginLeft:'5px',
                                                        marginBottom:'10px'}}>
                                                    <div style={{marginRight:'5px',marginTop:'3px'}}>
                                                        Password:
                                                    </div>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        placeholder="Enter your password here..."
                                                        onChange={ev => addPassword(ev.target.value)}
                                                        style={{borderRadius:'0px',height:'30px',width:'250px'}}
                                                        className={"inputBox"} />
                                                    <button onClick={togglePasswordVis} style={{ border: 'none', background:'none' }}>
                                                        {showPassword ? 
                                                            <VisibilityIcon sx={{ color: "#7d7d7d",fontSize:'20px'}}/> 
                                                        : 
                                                            <VisibilityOffIcon sx={{color:"#999999", fontSize:'20px'}}/>}
                                                    </button>
                                                </div>
                                                <div style={{margin:'auto'}}>
                                                    <Button onClick={addNewUser}>Sign up</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{diplay:'flex'}}>
                                        <div style={{
                                                display:'flex',
                                                alignItems:'flex-start', 
                                                justifyContent: 'flex-start',
                                                marginTop:'3rem',
                                                marginLeft:'1.5rem',
                                                fontWeight:'bold',
                                                fontSize:'20px'}}>
                                            User List
                                        </div>
                                        <div style={{
                                            display:'flex',
                                            justifyContent:'flex-start',
                                            alignItems:'center',
                                            marginLeft:'1.5rem',
                                            marginRight:'1.5rem',
                                            marginTop:'0.5rem',
                                            marginBottom:'0.5rem'}}>
                                            <hr style={{color: '#000000',
                                                        backgroundColor: '#000000',
                                                        height: '2px',
                                                        width:'100%',
                                                        margin:'auto',
                                                        }}/>
                                        </div>
                                    </div>
                                    
                                    <div style={{marginLeft:'10px'}}><UserTable/></div>
                                </Row>
                            }
                        </div>
                    </Col>
                </div>
            </Row>    
        
        </Container>
    );
}

export default SettingPage