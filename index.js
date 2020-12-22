// Required modules
const connection = require("./connection");
const cTable = require('console.table');

// Connect to database and execute inquirer module
connection.connect((err) => {
    if (err) throw err;
    viewEmployees();
});

const viewEmployees = () => {
    connection.query('SELECT * FROM employee;', (err, results) => {
        console.table(results); // results contains rows returned by server
    })
}