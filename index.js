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

// Prompts user for name, salary, and department of new role to add; adds department to database
const addRole = () => {
    connection.query("SELECT * FROM department", function (err, results) {
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
                        let choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].name);
                        }
                        return choiceArray;
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


// Query the database and return all employees for viewing
// const addEmployee = () => {
//     inquirer.prompt(
//         {
//             name: "firstName",
//             type: "input",
//             message: "What is the employee's first name?"
//         }
//     );

//     const { lastName } = await inquirer.prompt(
//         {
//             name: "lastName",
//             type: "input",
//             message: "What is the employee's last name?"
//         }
//     );

//     await connection.query(
//         `SELECT 
//           employee.first_name
//         , employee.last_name
//         , role.title
//         FROM employee 
//         LEFT JOIN role ON employee.role_id = role.id 
//         WHERE role.title = "Manager";`,
//         (err, results) => {
//             if (err) throw err;
//             // Display results of query in a table format
//             console.table(results)
//         });

//     await inquirer.prompt(
//         {
//             name: "manager",
//             type: "list",
//             message: "What is the employee's last name?"
//         }
//     );


//     console.log('firstName, lastName :>> ', firstName, lastName);
// }