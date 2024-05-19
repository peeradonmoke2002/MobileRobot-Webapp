import React, { useState, useEffect } from 'react';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import authProvider from './authProvider';
import config from '../../config/configureAPI';


const currentUrl = window.location.href;
const isDeploy = currentUrl.includes('localhost') ? 'development' : 'production';  
const environment = process.env.NODE_ENV || isDeploy;
const API = config[environment].API;

const UserTable = () => {
  const [users, setUsers] = useState([]);

  const delUser = (targetUser) => {
    authProvider.deleteUser({targetUser})
    .then(response => {
      window.alert(response.message);
    })
    .catch(error => {
      window.alert(error);
    })
  };

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API}/api/users`)
        .then(response => response.json())
        .then(data => {
          const sortedData = data.sort((a, b) => a.id - b.id);
          setUsers(sortedData);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <table style={{ 
          borderCollapse: 'collapse',
          border: '2px solid gray',
          margin:'1rem',
          width: '100%' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid black' }}>
          <th style={{padding: '8px' }}>Username</th>
          <th style={{padding: '8px',textAlign: 'right' }}>Email</th>
          <th style={{padding: '8px',textAlign: 'right' }}>Role</th>
          <th style={{padding: '8px' }}></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{padding: '8px' }}>{user.username}</td>
            <td style={{padding: '8px',textAlign: 'right' }}>{user.email}</td>
            <td style={{padding: '8px',textAlign: 'right' }}>{user.role}</td>
            {user.role !== 'admin' ?
              <td style={{padding: '8px' }}>
                <button style={{border:'none', color:'red', background:'none'}} onClick={() => delUser(user.username)}>
                  <DeleteForeverOutlinedIcon/>
                </button>
              </td>
              :
              <td style={{padding: '8px' }}></td>
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;