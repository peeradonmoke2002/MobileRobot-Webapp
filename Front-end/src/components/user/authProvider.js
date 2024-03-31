const authProvider = {
//  <------------------------ Login ------------------------>
    login: ({ usernameOrEmail, password }) =>  {
        return new Promise((resolve, reject) => {
            
            /* 
            Check if the user has entered both fields correctly
            */ 
            if(!usernameOrEmail) {
                reject(new Error('Please enter your email or username'));
                return;
            }

            /*
            Check if input isn't email then check username
                ''' No special character, is a pure number, 
                  and must have at least 2 letters. '''
            */
            // if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(usernameOrEmail))) {}
            if (!(/^[a-zA-Z0-9._%+-]+@kmitl.ac.th$/.test(usernameOrEmail))) {

                console.log("I'm not valid, I'm gonna check if I'm username");

                if (/^[a-zA-Z]{2,}[a-zA-Z0-9]*$/.test(usernameOrEmail)) {
                    console.log("I'm username and valid.");
                } else {
                    console.log("Oh NO, I'm not valid!");
                    reject(new Error('Please enter a valid email or username'));
                    return;
                }
            }

            if(!password || password.length < 8) {
                reject(new Error('Please enter a password that is at least 8 characters long'));
                return;
            }

            fetch("http://10.100.16.55:3001/api/users", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({usernameOrEmail, password})
            })
            .then(r => r.json())
            .then(data => {
                if ('success' === data.message) {
                    localStorage.setItem("user", JSON.stringify({username: data.username, email: data.email, role: data.role, token: data.token}));
                    localStorage.setItem("loggedIn", 1);
                    resolve();
                } else {
                    reject(new Error(data.message));
                    // console.log("Response message:", r.message)
                    // window.alert("Wrong username/email or password")
                }
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        return Promise.resolve();
    },
//  <------------------------ Error Condition (Maybe Move to checkAuth for complex?) ------------------------>    
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject({ redirectTo: '/unauthorized', 
                                    logoutUser: false , 
                                    message: 'Not admin'});
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
//  <------------------------ CheckAuth? ------------------------>
    checkAuth: () =>  {
        return new Promise((resolve, reject) => {
            console.log("Checking LogIn...");
            const user = JSON.parse(localStorage.getItem("user"));
            
            if (!user || !user.token) {
                console.log("LogIn Status: Not logged in yet");
                reject({ redirectTo: '/'});
            } else {
                fetch("http://10.100.16.55:3001/verify", {
                    method: "POST",
                    headers: {
                        'jwt-token': user.token
                    }
                })
                    .then(r => r.json())
                    .then(r => {
                    if (r.message === 'success') {
                        localStorage.setItem("loggedIn", 1);
                        // console.log("User:", user);
                        console.log("LogIn Status: ", r.message);
                        resolve();
                    } else {
                        console.error("User is not logged in: ", r.message);
                        localStorage.removeItem("user");
                        localStorage.removeItem("loggedIn");
                        // Redirect to the Login page or perform other actions as needed
                        reject({ redirectTo: '/'});
                        // window.location.href = "/";
                    }
                    })
                    .catch(error => {
                        console.error("Error fetching user data:", error);
                        localStorage.removeItem("user");
                        localStorage.removeItem("loggedIn");
                        reject({ redirectTo:'/' });
                    });
            }
        })
    },
    checkRole: () => {
        return new Promise((resolve, reject) => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser.role === "admin") {
                console.log("He's....The Chosen One.");
                resolve({message: 'admin'});
            } else {
                console.log("Promise me you will call the admin.");
                reject({message: 'not_admin'});
            }
        })
    },
    registration: ({ newUsername, newEmail, newPassword }) =>  {
        return new Promise((resolve, reject) => {
            // Check email -----------------------------------------------
            if(!newEmail) {
                reject(new Error('Please enter username'));
                return;
            }
            if (!(/^[a-zA-Z0-9._%+-]+@kmitl.ac.th$/.test(newEmail))) {
                console.log("Not valid email");
                reject(new Error('Please Enter an institute email.'));
                return;
            }
            // Check username -----------------------------------------------
            if(!newUsername) {
                reject(new Error('Please enter username'));
                return;
            }
            if (!(/^[a-zA-Z]{2,}[a-zA-Z0-9]*$/.test(newUsername))) {
                console.log("Not valid username");
                reject(new Error('Please enter a valid username'));
                return;
            }
            // Check password -----------------------------------------------
            if(!newPassword || newPassword.length < 8) {
                reject(new Error('Please enter a password that is at least 8 characters long'));
                return;
            }

            fetch("http://10.100.16.55:3001/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({newUsername, newEmail, newPassword})
            })
            .then(r => r.json())
            .then(data => {
                if ('success' === data.message) {
                    resolve({message: "Registeration Complete!"});
                } else {
                    reject(new Error(data.message));
                    // console.log("Response message:", r.message)
                    // window.alert("Wrong username/email or password")
                }
            })
            .catch(error => {
                reject(error);
            });
        })
    },
    changePassword: ({ identity, configPassword, confirmPassword, currentPassword }) => {
        return new Promise((resolve, reject) => {
            fetch(`http://10.100.16.55:3001/api/change-password/${identity}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ configPassword, confirmPassword, currentPassword })
            })
            .then(r => r.json())
            .then(data => {
                if ('success' === data.message) {
                    resolve({ message: "Password changed successfully!"});
                } else {
                    reject(new Error(data.message));
                }
            })
            .catch(error => {
                reject(error);
            });
        })
    },
    deleteUser: ({targetUser}) => {
        return new Promise((resolve, reject)=>{
            fetch(`http://10.100.16.55:3001/api/remove-user/${targetUser}`,{
                method:"DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(r => r.json())
            .then(data => {
                if ("success" === data.message) {
                    resolve({message: `Delete ${data.target}`});
                } else {
                    reject(new Error(data.message));
                }
            })
            .catch(error => {
                reject(error);
            });
        })
    }
};


export default authProvider