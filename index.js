// Required modules
const connection = require("./connection");
const cTable = require('console.table');
const inquirer = require('inquirer');

// Connect to database and execute inquirer module
connection.connect((err) => {
    if (err) throw err;
    start();
});

// Prompts user for desired action
const start = () => {
    inquirer
        .prompt({
            name: "chooseAction",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add Department",
                "Add Role",
                "Add Employee",
                "Update Employee Role",
                "EXIT"]
        })
        .then((answer) => {
            // Execute correct function based on user's answer
            switch (answer.chooseAction) {
                case "View All Departments":
                    viewDepartments();
                    break;
                case "View All Roles":
                    viewRoles();
                    break;
                case "View All Employees":
                    viewEmployees();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee Role":
                    updateEmpRole();
                    break;
                case "EXIT":
                    connection.end();
                    break;
            }
        });
}

// Query the database and return all departments for viewing
const viewDepartments = () => {
    connection.query('SELECT * FROM department;', (err, results) => {
        if (err) throw err;
        // Display results of query in a table format
        console.table(results);
        // Return user to initial questions for further actions
        start();
    })
}

// Query the database and return all roles for viewing
const viewRoles = () => {
    connection.query('SELECT * FROM role;', (err, results) => {
        if (err) throw err;
        // Display results of query in a table format
        console.table(results);
        // Return user to initial questions for further actions
        start();
    })
}

// Query the database and return all employees for viewing
const viewEmployees = () => {
    connection.query(`
        SELECT 
          employee.id
         ,employee.first_name
         ,employee.last_name
         ,role.title
         ,department.name AS department
         ,role.salary
         ,CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id 
        LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`,
        (err, results) => {
            if (err) throw err;
            // Display results of query in a table format
            console.table(results);
            // Return user to initial questions for further actions
            start();
        })
}

// Prompts user for name of new department to add; adds department to database
const addDepartment = () => {
    inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "What is the name of the department you'd like to add?"
            }
        ])
        .then((answer) => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.departmentName
                },
                (err) => {
                    if (err) throw err;
                    console.log("The department was created successfully!");
                    // Return user to initial questions for further actions
                    start();
                }
            );
        });
};

// Prompts user for name, salary, and department of new role to add; adds role to database
const addRole = () => {
    connection.query("SELECT * FROM department", (err, results) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "roleName",
                    type: "input",
                    message: "What is the name of the role you'd like to add?"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "What is the salary for this role?",
                    validate: (value) => {
                        if (isNaN(value) === false && value > 0) {
                            return true;
                        }
                        console.log(" <-- Value must be a number greater than 0!");
                        return false;
                    }
                },
                {
                    name: "department",
                    type: "list",
                    message: "Which department does this role belong to?",
                    choices: () => {
                        let departmentArray = [];
                        for (var i = 0; i < results.length; i++) {
                            departmentArray.push(results[i].name);
                        }
                        return departmentArray;
                    }
                }
            ])
            .then((answer) => {
                let chosenDepartmentID;

                for (var i = 0; i < results.length; i++) {
                    if (results[i].name === answer.department) {
                        chosenDepartmentID = results[i].id;
                    }
                }

                connection.query(
                    "INSERT INTO role SET ?",
                    {
                        title: answer.roleName,
                        salary: answer.salary,
                        department_id: chosenDepartmentID
                    },
                    (err) => {
                        if (err) throw err;
                        console.log("The role was created successfully!");
                        // Return user to initial questions for further actions
                        start();
                    }
                );
            });
    });
};

// Prompts user for first_name, last_name, department, role, and manager of new employee to add; adds employee to database
const addEmployee = () => {
    connection.query("SELECT * FROM role", (err, roleData) => {
        connection.query("SELECT * FROM employee", (err, employeeData) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: "firstName",
                        type: "input",
                        message: "What is the first name of the employee you'd like to add?"
                    },
                    {
                        name: "lastName",
                        type: "input",
                        message: "What is the last name of the employee you'd like to add?"
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "What is the employee's role?",
                        choices: () => {
                            let roleArray = [];
                            for (var i = 0; i < roleData.length; i++) {
                                roleArray.push(roleData[i].title);
                            }
                            return roleArray;
                        }
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Who is the employee's manager?",
                        choices: () => {
                            let managerArray = ["None"];
                            for (var i = 0; i < employeeData.length; i++) {
                                managerArray.push(employeeData[i].first_name + " " + employeeData[i].last_name);
                            }
                            return managerArray;
                        }
                    }
                ])
                .then((answer) => {
                    // Find ID of Chosen Role
                    let chosenRoleID;

                    for (var i = 0; i < roleData.length; i++) {
                        if (roleData[i].title === answer.role) {
                            chosenRoleID = roleData[i].id;
                        }
                    }

                    // Find ID of Chosen Manager
                    let chosenManagerID;

                    for (var i = 0; i < employeeData.length; i++) {
                        if (employeeData[i].first_name + " " + employeeData[i].last_name === answer.manager) {
                            chosenManagerID = employeeData[i].id;
                        }
                    }

                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: chosenRoleID,
                            manager_id: chosenManagerID
                        },
                        (err) => {
                            if (err) throw err;
                            console.log("The employee was added successfully!");
                            // Return user to initial questions for further actions
                            start();
                        }
                    );
                });
        });
    })
};

// Prompts user for first_name, last_name, department, role, and manager of new employee to add; adds employee to database
const updateEmpRole = () => {
    connection.query("SELECT * FROM employee", (err, employees) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: () => {
                        let employeeArray = [];
                        for (var i = 0; i < employees.length; i++) {
                            employeeArray.push(employee[i].first_name + " " + employees[i].last_name);
                        }
                        return employeeArray;
                    }
                }
            ])
            .then((answer) => {
                // Find ID of Chosen Role
                let chosenRoleID;

                for (var i = 0; i < roleData.length; i++) {
                    if (roleData[i].title === answer.role) {
                        chosenRoleID = roleData[i].id;
                    }
                }

                // Find ID of Chosen Manager
                let chosenManagerID;

                for (var i = 0; i < employeeData.length; i++) {
                    if (employeeData[i].first_name + " " + employeeData[i].last_name === answer.manager) {
                        chosenManagerID = employeeData[i].id;
                    }
                }

                connection.query(
                    "INSERT INTO employee SET ?",
                    {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: chosenRoleID,
                        manager_id: chosenManagerID
                    },
                    (err) => {
                        if (err) throw err;
                        console.log("The employee was added successfully!");
                        // Return user to initial questions for further actions
                        start();
                    }
                );
            });
    });
};