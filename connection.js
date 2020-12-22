// Required modules
const mysql = require("mysql");

// Connection information for the MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_tracker_db"
});

module.exports = connection;