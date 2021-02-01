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
                    choices: results.map(({ name }) => name)
                }
            ])
            .then((answer) => {

                const { id } = results.find(({ name }) => name === answer.department);

                connection.query(
                    "INSERT INTO role SET ?",
                    {
                        title: answer.roleName,
                        salary: answer.salary,
                        department_id: id
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

            const fullNames = employeeData.map(({ first_name, last_name }) => {
                return first_name + " " + last_name
            });

            console.log('fullNames :>> ', fullNames);

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
                        choices: roleData.map(({ title }) => title)
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Who is the employee's manager?",
                        choices: fullNames
                    }
                ])
                .then((answer) => {
                    // Find ID of Chosen Role
                    var { id } = roleData.find(({ title }) => title === answer.role);

                    const roleID = id;

                    // Find ID of Chosen Manager
                    var { id } = employeeData.find(({ first_name, last_name }) => first_name + " " + last_name === answer.manager);

                    const managerID = id;

                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: roleID,
                            manager_id: managerID
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

// Prompts user to choose employee they want to update and their new role; updates employee's role in database
const updateEmpRole = () => {
    connection.query("SELECT * FROM role", (err, roles) => {
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
                            for (let i = 0; i < employees.length; i++) {
                                employeeArray.push(employees[i].first_name + " " + employees[i].last_name);
                            }
                            return employeeArray;
                        }
                    },
                    {
                        name: "newRole",
                        type: "list",
                        message: "What is the employee's new role?",
                        choices: () => {
                            let newRoleArray = [];
                            for (let i = 0; i < roles.length; i++) {
                                newRoleArray.push(roles[i].title);
                            }
                            return newRoleArray;
                        }
                    }
                ])
                .then((answer) => {
                    // Find ID of Chosen Employee
                    let chosenEmployeeID;

                    for (let i = 0; i < employees.length; i++) {
                        if (employees[i].first_name + " " + employees[i].last_name === answer.employee) {
                            chosenEmployeeID = employees[i].id;
                        }
                    }

                    // Find ID of Chosen New Role
                    let chosenNewRoleID;

                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === answer.newRole) {
                            chosenNewRoleID = roles[i].id;
                        }
                    }

                    connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [
                            {
                                role_id: chosenNewRoleID
                            },
                            {
                                id: chosenEmployeeID
                            }
                        ],
                        (err) => {
                            if (err) throw err;
                            console.log("The employee's role was updated successfully!");
                            // Return user to initial questions for further actions
                            start();
                        }
                    );
                });
        });
    });
};