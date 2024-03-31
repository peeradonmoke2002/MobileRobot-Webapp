const rosConnections = {};

export const connectToMachine = (machineName, url) => {
  const ros = new window.ROSLIB.Ros({ url });

  ros.on('connection', () => {
    rosConnections[machineName] = {
      ros,
      isConnected: true
    };
    // console.log(`Connected to ${machineName}`);
  });

  ros.on('error', (error) => {
    console.error(`Error connecting to ${machineName}:`, error);
    rosConnections[machineName] = {
      ros: null,
      isConnected: false
    };
  });

  ros.on('close', () => {
    // console.log(`Connection to ${machineName} closed.`);
    rosConnections[machineName] = {
      ros: null,
      isConnected: false
    };
  });

  return ros;
};

export const getRosConnection = (machineName) => {
  return rosConnections[machineName]?.ros;
};

export const isMachineConnected = (machineName) => {
  return !!rosConnections[machineName]?.isConnected;
};


