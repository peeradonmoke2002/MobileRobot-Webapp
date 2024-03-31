import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authProvider from "../components/user/authProvider";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RAIlogo from '../components/Image/RAI-logo.png';
import AIMlogo from '../components/Image/AIM-Lap-Logo.png'
import { Col } from "react-bootstrap";

const Login = () => {
    const [usernameOrEmail, setUserOrEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    // const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
    const userIn = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        authProvider.checkAuth()
          .catch(error => {
            console.error("Error checking authentication:", error);
          });
      }, []);

    const onButtonClick = () => {
        // Set initial error values to empty
        setEmailError("")
        setPasswordError("")
        // logIn();
        authProvider.login({usernameOrEmail, password})
        .then( () => {
            navigate("/robots");
        })
        .catch(error => {
            console.error("Error logging in:", error.message);
            // Set error messages based on the type of error
            if (error.message === 'Please enter your email or username') {
                setEmailError(error.message);
            } else if (error.message === 'Please enter a valid email or username') {
                setEmailError(error.message);
            } else if (error.message === 'Please enter a password that is at least 8 characters long') {
                setPasswordError(error.message);
                setPassword('');
            } else if (error.message === 'Invalid email or username') {
                setEmailError(error.message);
            } else if (error.message === 'Invalid password') {
                setPasswordError(error.message);
                setPassword('');
            } else { // Display error message to the user
                setPasswordError('Something wrong. Please try again later:', error.message);
                setPassword('');
            }
        });
    }

    const togglePasswordVis = () => {
        setShowPassword(!showPassword);
    }

    const GoInside = () => {
        navigate("/robots")
    }

    return (
        <div className={"loginContainer"} style={{ backgroundColor: "white" }}>
            <div className='d-flex justify-content-center'>
                <div className='h-25 w-25 d-flex align-items-center justify-content-center'>
                    <img src={RAIlogo} style={{ width: '60%' }} alt='RaiLogo'/>
                </div>
            </div>
            <div className="welcometitle">
                <div>Welcome!</div>
            </div>
            <div className={"titleContainer"}>
                <div>Login</div>
            </div>
            <br />
            {!userIn ? 
                <>
                    <div className={"inputContainer"}>
                        <input
                            value={usernameOrEmail}
                            placeholder="Enter your email here..."
                            onChange={ev => setUserOrEmail(ev.target.value)}
                            className={"inputBox"} />
                        <label className="errorLabel">{emailError}</label>
                    </div>
                    <br />
                    <div className={"inputContainer"} style={{marginLeft:'2.25rem'}}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                placeholder="Enter your password here..."
                                onChange={ev => setPassword(ev.target.value)}
                                className={"inputBox"} />
                            <button onClick={togglePasswordVis} style={{ border: 'none', background: 'none' }}>
                                {showPassword ? 
                                    <VisibilityIcon sx={{ color: "#7d7d7d" }}/> 
                                : 
                                    <VisibilityOffIcon sx={{ color: "#999999" }}/>}
                            </button>
                        </div>
                        <label className="errorLabel">{passwordError}</label>
                    </div>
                    <br />
                    <div className={"inputContainer"}>
                        <input
                            className={"loginbutton w-100"}
                            type="button"
                            onClick={onButtonClick}
                            value={"Log in"} />
                    </div>
                </>
            :
            <div>
                <div className={"inputContainer"}>
                    <input
                        className={"loginbutton"}
                        type="button"
                        onClick={GoInside}
                        value={"Go inside!"} />
                </div>
            </div>
            }
        </div>
    );
}

export default Login