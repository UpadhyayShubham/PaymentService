INSERT INTO employees (name, email)
VALUES
    ('Alice', 'alice@payment.test'),
    ('Bob', 'bob@payment.test');

INSERT INTO accounts (employee_id, balance)
SELECT
    id,
    100000
FROM employees
WHERE email = 'alice@payment.test';

INSERT INTO accounts (employee_id, balance)
SELECT
    id,
    50000
FROM employees
WHERE email = 'bob@payment.test';

INSERT INTO jobs (
    employee_id,
    description,
    amount
)
SELECT
    id,
    'Backend development',
    25000
FROM employees
WHERE email = 'alice@payment.test';

INSERT INTO jobs (
    employee_id,
    description,
    amount
)
SELECT
    id,
    'System design work',
    75000
FROM employees
WHERE email = 'alice@payment.test';
