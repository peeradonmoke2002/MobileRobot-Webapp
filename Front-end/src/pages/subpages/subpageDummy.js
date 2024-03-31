import Overview from "./Overview";
import Robot_info from "./RobotInfo";
import Manual_n_Slam from "./Manual&Slam";

export const dummySUBPAGE = [
    {
      id: 1,
      name: "Overview",
      path: "",
      element: (robotData) => <Overview {...robotData}/>,
    },
    {
      id: 2,
      name: "Manual Control & Slam",
      path: "manual_n_slam",
      // element: <Manual_n_Slam/>,
      element: (robotData) => <Manual_n_Slam {...robotData}/>,
    },
    {
      id: 3,
      name: "Robot info",
      path: "robot_info",
      element: (robotData) => <Robot_info {...robotData}/>,
    },
];