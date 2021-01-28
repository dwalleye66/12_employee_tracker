USE employee_tracker_db;

INSERT INTO department (name)
VALUES 
    ("Human Resources"),
    ("Operations"),
    ("Accounting"),
    ("Information Technology");

INSERT INTO role (title, salary, department_id)
VALUES 
    ("Manager", 50000.00,1),
    ("Clerk", 30000.00,1);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES 
    ("Timothy","Kemp",1,NULL),
    ("Mickey","Mouse",2,1);