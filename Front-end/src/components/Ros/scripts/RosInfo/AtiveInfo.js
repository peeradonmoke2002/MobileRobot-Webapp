import React, { useState, useEffect } from 'react';
import Config from "../robot.json";
import { useTable } from 'react-table';
import { Row, Col } from 'react-bootstrap';
import { initconnect, connectToMachine } from "../rosbridge";

const ActiveInfo = ({robotname, ip}) => {
  const [loading, setLoading] = useState(true);
  const [activeNodes, setActiveNodes] = useState([]);
  const [activeTopics, setActiveTopics] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [activeParameters, setActiveParameters] = useState([]);


  const fetchDataAndUpdateState = (rosFunction, setStateFunction, sort = false) => {
    rosFunction((data) => {
      setStateFunction(data && Array.isArray(data) ? (sort ? data.sort() : data) : []);
    });
  };

   useEffect(() => {
    try{
      setLoading(true);
      const ros = connectToMachine(robotname, "ws://" + ip + ":9090");
      ros.getNodes((nodes) => {
        console.log('Nodes:', nodes);
        setActiveNodes(nodes && Array.isArray(nodes) ? nodes.sort() : []);
      });
  
      ros.getTopics((topics) => {
          const getTopics = topics.topics;
          console.log('Topics:', getTopics);
          setActiveTopics(getTopics && Array.isArray(getTopics) ? getTopics.sort() : []);
      });

      ros.getServices((services) => {
        console.log('Services:', services);
        setActiveServices(services && Array.isArray(services) ? services.sort() : []);
      });
  
      ros.getParams((params) => {
        console.log('Parameters:', params);
        setActiveParameters(params && Array.isArray(params) ? params.sort() : []);
      });
      setLoading(false);

      return () => {
        ros.close();
      }

      }
      catch(err){
        console.log('Error in ActiveInfo:', err);
      }
   

  }, []);

  const data = React.useMemo(
    () => [
      {
        category: 'Nodes',
        values: activeNodes,
      },
      {
        category: 'Topics',
        values: activeTopics,
      },
      {
        category: 'Services',
        values: activeServices,
      },
      {
        category: 'Parameters',
        values: activeParameters,
      },
    ],
    [activeNodes, activeTopics, activeServices, activeParameters]
  );

  const AGVTopicList = [
    '/amcl_pose',
    '/amcl_cov',
    '/cmd_vel',
    '/initialpose',
    '/move_base/DWAPlannerROS/global_plan',
    '/odom',
    '/scan',
    '/map',
    '/turtlebot3_slam_gmapping/map',
  ];


  const AGVNodeList = [
    '/agv_change_mode',	
    '/agv_gmapping_server',	
    '/amcl_cov_republisher',
    '/rosbridge_websocket',	
    '/tf2_web_republisher',
    '/agv_status',
    '/map_server',
    '/move_base',
    '/robot_state_publisher',
    '/turtlebot3_slam_gmapping',
  ];



  const columns = React.useMemo(
    () => [
      { Header: 'Index', accessor: 'index' },
      { Header: 'ROS Name', accessor: 'name' },
      { Header: 'Check', accessor: 'check' },
     
    ],
    []
  );

  const checkIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="24px" height="24px">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 18 21 6l-1.41-1.41L9 16.17z"/>
    </svg>
  );

  const crossIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24px" height="24px">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 10.59L7.41 6 6 7.41 10.59 12 6 16.59 7.41 18 12 13.41 16.59 18 18 16.59 13.41 12 18 7.41 16.59 6 12 10.59z"/>
    </svg>
  );

  console.log('AGV Topic List:', AGVTopicList);
  console.log('AGV Node List:', AGVNodeList);
  console.log('Active Nodes:', activeNodes);
  console.log('Active Topics:', activeTopics);

  const nodesTableData = AGVNodeList.map((name, index) => ({
    index: index + 1,
    name,
    check: activeNodes.includes(name) ? checkIcon : crossIcon,
  }));
  
  const topicsTableData = AGVTopicList.map((name, index) => ({
    index: index + 1,
    name,
    check: activeTopics.includes(name) ? checkIcon : crossIcon,
  }));
  
  
  


  const nodesTable = useTable({ columns, data: nodesTableData });
  const topicsTable = useTable({ columns, data: topicsTableData });
  

  const tableContainerStyle = {
    height: '200px', // Set the desired height for each table
    overflow: 'auto',
    margin: '10px 0',
  };

  return (
    <Row>
      <Row style={{fontSize:'20px',marginTop:'1rem',marginBottom:'10px',textDecoration: 'underline'}}>
        ROS Nodes Table
      </Row>
      <div style={tableContainerStyle}>
        <table {...nodesTable.getTableProps()}>
          <thead>
            {nodesTable.headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} style={{ width: 'auto' }}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...nodesTable.getTableBodyProps()}>
            {nodesTable.rows.map(row => {
              nodesTable.prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} style={{ width: 'auto', color: cell.column.id.includes('Check') && cell.value === 'Yes' ? 'green' : 'black', textAlign: 'center' }}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Row style={{fontSize:'20px',marginTop:'1rem',marginBottom:'10px',textDecoration: 'underline'}}>
        ROS Topics Table
      </Row>
      <div style={tableContainerStyle}>
        <table {...topicsTable.getTableProps()}>
          <thead>
            {topicsTable.headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} style={{ width: 'auto' }}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...topicsTable.getTableBodyProps()}>
            {topicsTable.rows.map(row => {
              topicsTable.prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} style={{ width: 'auto', color: cell.column.id.includes('Check') && cell.value === 'Yes' ? 'green' : 'black', textAlign: 'center' }}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Row>
  );
};

export default ActiveInfo;