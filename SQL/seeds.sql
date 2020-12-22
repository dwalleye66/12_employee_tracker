USE employee_tracker_db;

INSERT INTO department (name)
VALUES ("HR");

INSERT INTO role (title, salary, department_id)
VALUES ("Manager", 50000.00,1);

INSERT INTO employee (first_name,last_name,role_id)
VALUES ("Timothy","Kemp",1);