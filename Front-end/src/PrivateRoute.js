import React from "react";
import { Navigate } from "react-router-dom";
import { defaultColumn } from "react-table";

const PrivateRoute = ({children}) => {
    const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
    // console.log("Auth Checking");

    return loggedIn === 1
      ? children
      : <Navigate to="/" replace />;
}

export default PrivateRoute;