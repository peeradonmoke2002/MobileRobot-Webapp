const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// add for user
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// var low = require("lowdb");

const app = express();
const port = 3001;
// Wait for Updated to be secure.
const jwtSecretKey = crypto.randomBytes(32).toString('hex');

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'rai',
  host: 'localhost', 
  //10.147.20.160
  //172.16.0.193
  database: 'ros-database',
  password: 'rai',
  port: 5432,
});

// Test the database connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database. Current timestamp:', result.rows[0].now);
  }
});

// ----------------------- 4 Endpoint for waypoint -----------------------
// Endpoint to get all waypoints
app.get('/api/waypoints', async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM waypoints');
    res.json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/waypoints', async (req, res) => {
  try {
    const { x, y, w } = req.body;
    console.log('Received request:', { x, y, w });

    if (!x || !y || !w) {
      return res.status(400).json({ error: 'Invalid request. x, y, and w are required.' });
    }

    const results = await pool.query(
      'INSERT INTO waypoints (x, y, w) VALUES ($1, $2, $3) RETURNING *',
      [x, y, w]
    );
    console.log('Database query successful:', results.rows[0]);

    res.json({ message: `A new waypoint has been added: ${JSON.stringify(results.rows[0])}` });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});
  

// Endpoint to update a waypoint
app.put('/api/waypoints/:id', async (req, res) => {
    const waypointId = req.params.id;
    try {
      const { x, y, w } = req.body;
      const results = await pool.query(
        'UPDATE waypoints SET x = $1, y = $2, w = $3 WHERE id = $4 RETURNING *',
        [x, y, w, waypointId]
      );
      res.json({ message: `Waypoint updated: ${JSON.stringify(results.rows[0])}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Endpoint to delete a waypoint
app.delete('/api/waypoints/:id', async (req, res) => {
  const waypointId = req.params.id;
  try {
    if (waypointId.toLowerCase() === 'all') {
      // Delete all waypoints
      await pool.query('DELETE FROM waypoints');
      // Reset the auto-incrementing sequence to 1
      await pool.query('ALTER SEQUENCE waypoints_id_seq RESTART WITH 1');
      res.json({ message: 'All waypoints deleted successfully' });
    } else {
      // Delete a specific waypoint by ID
      await pool.query('DELETE FROM waypoints WHERE id = $1', [waypointId]);
      res.json({ message: `Waypoint deleted with ID: ${waypointId}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/waypoints/batch', async (req, res) => {
  try {
    const waypoints = req.body;

    // Assuming 'waypoints' is an array of objects with 'id', 'x', 'y', and 'w' properties
    const values = waypoints.map(waypoint => `(${waypoint.id}, ${waypoint.x}, ${waypoint.y}, ${waypoint.w})`).join(',');

    // Use INSERT ... ON CONFLICT to handle conflicts based on the 'id' column
    const query = `
      INSERT INTO waypoints (id, x, y, w)
      VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET
      x = EXCLUDED.x,
      y = EXCLUDED.y,
      w = EXCLUDED.w
    `;

    await pool.query(query);

    res.json({ message: 'Waypoints inserted or updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// ----------------------- 4 Endpoint for Login -----------------------

// Endpoint to get users data
// Done, Just to check if there is any data inside.
app.get('/api/users', async (req, res) => {
  try {
    /* 
      query language to tell Server to 'SELECT' (method)
        everything '*' from 'users'
    */
    const results = await pool.query('SELECT * FROM users');
    res.json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to Login
app.post('/api/users', async (req, res) => {
  // define request structure aka ".body"
  const { usernameOrEmail, password } = req.body;
  console.log("Start Login...");
  try {
    console.log('User:', { usernameOrEmail });
    console.log('Password:', { password });

    // Check user entry in database, look up by email.
    let result = await pool.query(
                  'SELECT * FROM users WHERE email = $1', 
                  [usernameOrEmail]);
    let user = result.rows[0];

    // if no user found by email, look up by username.
    if (!user) {
      result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [usernameOrEmail]);
      user = result.rows[0];
    }

    // if no user found by either email and user name.
    if (!user) {
      return res.status(401).json({ message: "Invalid email or username"});
    }
    //Check password match.
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password"});
    }
    
    // Give user a Login token.
    let loginData = {
      usernameOrEmail,
      signInTime: Date.now()
    }
    const token = jwt.sign( loginData, jwtSecretKey );
    const role = user.role;
    const username = user.username;
    const email = user.email;
    // console.log("User's token:", token);
    // console.log("User's role:", role);
    res.status(200).json({ message: "success", token, role, username, email});
    console.log('Login Done.');

  } catch (error) {
    console.error("Error authenticating user: ", error);
    res.status(500).json({ error: "Internal Server Error"});
  }
});

// Endpoint to registry
app.post('/register', async (req,res) => {
  const { newUsername, newEmail, newPassword } = req.body
  try {
    // Check if the email or username is already registered
    console.log('Registration start...');
    console.log('User:', { newUsername });
    console.log('Email:', { newEmail });
    console.log('Password:',{newPassword});

    const emailExists = await pool.query(
                        'SELECT * FROM users WHERE email = $1', 
                        [newEmail]);
    const usernameExists = await pool.query(
                            'SELECT * FROM users WHERE username = $1',
                            [newUsername]);
    if(emailExists.rows.length > 0) {
      console.error("Email is already exists.");
      return res.status(400).json({ message: "Email is already exists."});
    }

    if(usernameExists.rows.length > 0) {
      console.error("Username is already used.");
      return res.status(400).json({ message: "Username is already used."});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Registry new user to the database
    await pool.query('INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3)', [newUsername, newEmail, hashedPassword]);
    // Registry successfully
    res.status(200).json({ message: "success" });

  } catch (error) {
    console.error("Error registering user: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to verify user
app.post('/verify', async (req,res) => {
  const tokenHeaderKey = "jwt-token";
  const authToken = req.headers[tokenHeaderKey];
  // console.log('authToken: ', authToken);
  
  try{
    // Check Token key
    // console.log('Check the token')
    // console.log('jwtKey: ', jwtSecretKey)
    const verified = jwt.verify(authToken, jwtSecretKey);
    if (verified){
      console.log('Verify process done.');
      return res.status(200).json({ status: "logged in", message: "success" });
    } else {
      // Access Denied
      console.log('Access denied.');
      return res.status(401).json({ status: "invalid auth", message: "denied" });
    }

  } catch (error) {
    // Access Denied
    return res.status(401).json({ status: "invalid auth", message: "error" });
  }
});

// End point to deleted user 
app.delete('/api/remove-user/:target', async (req, res) => {
  try {
    const { target } = req.params;
    console.log(`Delete User ${target} start...`);
    const result = await pool.query('DELETE FROM users WHERE username = $1 or email = $1 RETURNING *', [target]);

    const removedUser = result.rows[0];
     res.status(200).json({ target: removedUser, message: "success" });
     console.log('Delete Complete.')
  } catch (error) {
    console.error('Error removing user', error);
    res.status(500).send('Internal Server Error');
  }
});

// End point to change pasword
app.put('/api/change-password/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { configPassword, confirmPassword, currentPassword } = req.body;
    
    // console.log('InputUser:',identifier);
    // console.log('NewPassword:',configPassword);

    // Check if identifier is username or email.
    let currentUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );
    if (currentUser.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    //Get OLD password
    const oldPasswordResult = await pool.query(
      'SELECT password_hash FROM users WHERE email = $1 OR username = $1',
      [identifier]
      );
    const oldPasswordHash = oldPasswordResult.rows[0].password_hash;
    
    //Check if current password is correct.
    const isCorrectPassword = await bcrypt.compare(currentPassword, oldPasswordHash)
    if (!isCorrectPassword) {
      return res.status(400).json({message: "Current Password isn't correct."});
    }

    if (configPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }

    //Check if new password and confirm password match
    if (configPassword !== confirmPassword) {
      return res.status(400).json({message: "New password and confirm password do not match."});
    }

    // Check if the old password matches the provided configPassword
    const isSamePassword = await bcrypt.compare(configPassword, oldPasswordHash);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be the same as the old password." });
    }

    const userId = currentUser.rows[0].id;
    const newHashedPassword = await bcrypt.hash(configPassword, 10);

    const updatePassword = await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
                                          [newHashedPassword, userId]);

    const updatedUser = updatePassword.rows[0];
    
    res.status(200).json({ message: "success", user: updatedUser });
  } catch (error) {
    // Handle errors, log them, and respond with a 500 Internal Server Error
    console.error('Error updating passowrd', error);
    res.status(500).send('Internal Server Error');
  }
});

// ----------------------- Endpoints for RobotConfic -----------------------
// Get every robots data
app.get('/api/robots-config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM robots_config ORDER BY id');
    const robotConfigData = result.rows;
    // console.log(robotConfigData);
    res.json(robotConfigData);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add new robot
app.post('/api/add-robot', async (req, res) => {
  try {
    const { name, rosbridge_server_ip, rosbridge_server_port } = req.body;
    const result = await pool.query(
      'INSERT INTO robots_config (name, rosbridge_server_ip, rosbridge_server_port, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, rosbridge_server_ip, rosbridge_server_port, 'Out of Service']
    );

    const newRobot = result.rows[0];
    res.json(newRobot);
  } catch (error) {
    console.error('Error adding robot', error);
    res.status(500).send('Internal Server Error');
  }
});

// Deleted robot 
app.delete('/api/remove-robot/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query('DELETE FROM robots_config WHERE name = $1 RETURNING *', [name]);

    const removedRobot = result.rows[0];
    res.json(removedRobot);
  } catch (error) {
    console.error('Error removing robot', error);
    res.status(500).send('Internal Server Error');
  }
});

// Change name maybe?
app.put('/api/edit-robot/:name', async (req, res) => {
  try {
    const { name: oldName } = req.params;
    const { name: newName, rosbridge_server_ip, rosbridge_server_port } = req.body;
    console.log('Received request:', { oldName, newName, rosbridge_server_ip, rosbridge_server_port });
    // Perform an UPDATE query on the 'robots_config' table
    const result = await pool.query(
      'UPDATE robots_config SET name = $1, rosbridge_server_ip = $2, rosbridge_server_port = $3, is_active = $5 WHERE name = $4 RETURNING *',
      [newName, rosbridge_server_ip, rosbridge_server_port, oldName, 'Out of Service']
    );
    // Retrieve the updated robot from the query result
    const updatedRobot = result.rows[0];
    // Respond with the updated robot data in JSON format
    res.json(updatedRobot);
  } catch (error) {
    // Handle errors, log them, and respond with a 500 Internal Server Error
    console.error('Error updating robot', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// ----------------------- Endpoints for Map Data -----------------------
app.get('/api/maps', async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM maps');
    res.json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/maps/names', async (req, res) => {
  try {
    const results = await pool.query('SELECT map_name FROM maps');
    
    const mapNames = results.rows.map(row => row.map_name);

    res.json(mapNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/maps/names/:map_name', async (req, res) => {
  try {
    const mapName = req.params.map_name;

    // Use DELETE statement to physically remove the row
    const results = await pool.query('DELETE FROM maps WHERE map_name = $1', [mapName]);

    if (results.rowCount === 0) {
      console.log(`Map with name '${mapName}' not found`);
      res.status(404).json({ error: 'Map not found', logStatus: 'Map not found', status: 404 });
    } else {
      console.log(`Map with name '${mapName}' deleted successfully`);
      res.status(204).json({ message: 'Map deleted successfully', logStatus: 'Map deleted successfully', status: 204 });
    }
  } catch (error) {
    console.error(error);
    console.log(`Error deleting map with name '${mapName}'`);
    res.status(500).json({ error: 'Internal Server Error', message: error.message, logStatus: 'Error deleting map', status: 500 });
  }
});


// GET endpoint to retrieve topics based on robot name
app.get('/api/topics/:robot_name', async (req, res) => {
  const { robot_name } = req.params;

  try {
    const result = await pool.query('SELECT topics FROM robots_config WHERE name = $1', [robot_name]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }

    res.json(result.rows[0].topics);
  } catch (err) {
    console.error('Error fetching topics:', err.message);
    res.status(500).json({ error: 'Error fetching topics' });
  }
});

// GET endpoint to retrieve all robots and their topics
app.get('/api/topics', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, topics FROM robots_config');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching topics:', err.message);
    res.status(500).json({ error: 'Error fetching topics' });
  }
});

// POST endpoint to add or edit topics based on robot name
app.post('/api/topics/:robot_name', async (req, res) => {
  const { robot_name } = req.params;
  const { topics } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO robots_config (name, topics) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET topics = $2 RETURNING *',
      [robot_name, topics]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding/editing topics:', err.message);
    res.status(500).json({ error: 'Error adding/editing topics' });
  }
});

// PUT endpoint to update topics for a robot
app.put('/api/topics/:robot_name', async (req, res) => {
  const { robot_name } = req.params;
  const { topics } = req.body;

  try {
    // Check if the robot exists
    const robotExists = await pool.query('SELECT * FROM robots_config WHERE name = $1', [robot_name]);
    if (robotExists.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }

    // Iterate through each topic in the second layer and update it
    for (const [topic_name, topicData] of Object.entries(topics)) {
      const { topic_name: new_topic_name, message_type } = topicData;

      // Construct the update query dynamically
      const updateQuery = {
        text: `UPDATE robots_config 
               SET topics = jsonb_set(topics, '{${topic_name}}', $1::jsonb)
               WHERE name = $2`,
        values: [JSON.stringify(topicData), robot_name]
      };

      // Update the specified topic for the robot
      await pool.query(updateQuery);
    }

    res.json({ message: 'Topics updated successfully' });
  } catch (err) {
    console.error('Error updating topics:', err.message);
    res.status(500).json({ error: 'Error updating topics' });
  }
});

// ----------------------- Endpoints for Topic Data -----------------------

// DELETE endpoint to remove a specific topic based on robot name
app.delete('/api/topics/:robot_name/:topic_name', async (req, res) => {
  const { robot_name, topic_name } = req.params;

  try {
    // Fetch the current topics JSON object for the robot
    const { rows } = await pool.query(
      'SELECT topics FROM robots_config WHERE name = $1',
      [robot_name]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }

    // Get the current topics object
    const { topics } = rows[0];

    // Check if the specified topic exists
    if (!(topic_name in topics)) {
      return res.status(404).json({ error: 'Topic not found for the robot' });
    }

    // Remove the specified topic from the topics object
    delete topics[topic_name];

    // Update the topics in the database
    await pool.query(
      'UPDATE robots_config SET topics = $1 WHERE name = $2',
      [topics, robot_name]
    );

    res.json({ message: 'Topic removed successfully for the robot' });
  } catch (err) {
    console.error('Error removing topic:', err.message);
    res.status(500).json({ error: 'Error removing topic' });
  }
});
