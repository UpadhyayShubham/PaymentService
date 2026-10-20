Develop a payment service in Typescript and Postgres.

Data modelling:
- Employees
- Accounts
- Jobs
- Payments

HTTP -> Controller -> Service -> Repository -> DB

APIs:
- Pay a job
- Get account balance
- Get payment / job status
- Make the payment flow the centerpiece of the exercise

<!-- Create DB user and DB: -->

REVOKE CONNECT ON DATABASE devdb FROM PUBLIC;
REVOKE CONNECT ON DATABASE payment_service FROM PUBLIC;

CREATE USER devdbuser WITH ENCRYPTED PASSWORD '<your-devdb-password>';
CREATE USER payment_service_user WITH ENCRYPTED PASSWORD '<your-db-password>';

GRANT ALL PRIVILEGES ON DATABASE devdb TO devdbuser;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO payment_service_user;


SELECT has_database_privilege('devdbuser', 'devdb', 'CONNECT');  -- should return t
SELECT has_database_privilege('payment_service_user', 'payment_service', 'CONNECT');  -- should return f

psql -U devdbuser -d devdb -h localhost
psql -U payment_service_user -d payment_service -h localhost

