import React, {useEffect} from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({children}) => {

    const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
    // console.log("Auth Checking");

    return loggedIn === 1
      ? children
      : <Navigate to="/" replace />;
}

export default PrivateRoute;