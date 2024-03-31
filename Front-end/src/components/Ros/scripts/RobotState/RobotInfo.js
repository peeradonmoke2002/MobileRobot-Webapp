import React, { useState, useEffect } from "react";
import { connectToMachine } from "../rosbridge";

const RobotInfo = ({ name, ip }) => { // Destructure props directly
  const [batteryVoltage, setBatteryVoltage] = useState(null);
  const [bumperStatus, setBumperStatus] = useState(null);

  useEffect(() => {
    const ros = connectToMachine(name, "ws://" + ip + ":9090"); // Use name and ip directly
    const DeviceStatus = new window.ROSLIB.Topic({
      ros: ros,
      name: "/device_status",
      messageType: "roboteq_msgs/Status",
    });

    const callback = (message) => {
      // console.log("Received message:", message); // Log the received message
      if (message) {
        // console.log("Setting battery voltage:", message.battery_voltage.toFixed(4));
        setBatteryVoltage(message.battery_voltage.toFixed(4));
        // console.log("Setting bumper status:", message.emo_bumper_open);
        setBumperStatus(message.emo_bumper_open);
      } else {
        // console.log("Received null message, resetting values.");
        setBatteryVoltage(null);
        setBumperStatus(null);
      }
    };

    DeviceStatus.subscribe(callback);

    return () => {
      DeviceStatus.unsubscribe();
      ros.close();
    };
  }, [name, ip]); // Depend on name and ip

  return { batteryVoltage, bumperStatus }; // Return the values
};

export default RobotInfo;
