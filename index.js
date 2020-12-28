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
        .then(function (answer) {
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
    connection.query('SELECT * FROM employee;', (err, results) => {
        if (err) throw err;
        // Display results of query in a table format
        console.table(results);
        // Return user to initial questions for further actions
        start();
    })
}