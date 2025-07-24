# Infrastructure Setup Guide

_Reference: Epic 1 – Infrastructure Setup_

## Overview
This guide describes how to set up, run, and tear down the infrastructure for the User Management System using Docker, Docker Compose, and Infrastructure as Code (Terraform).

## Prerequisites
- Docker & Docker Compose installed
- (Optional) AWS CLI and Terraform installed for cloud provisioning

## Local Development
1. Clone the repository
2. Build and run services:
   ```sh
   docker-compose up --build
   ```
3. Access the frontend at http://localhost
4. Access the backend at http://localhost:3000

## Infrastructure as Code (Cloud)

---

## Database Setup (Backend Persistent Storage)

1. **PostgreSQL Installation:**
   - Install PostgreSQL locally or use a managed service (e.g., AWS RDS).
   - Create a database (e.g., `userdb`).

2. **Configure Environment Variables:**
   - Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` with your credentials.

3. **Run Database Migrations:**
   - From the `backend` directory, run:
     ```sh
     npx knex migrate:latest --env development
     ```
   - This will create the `users` and `audit_logs` tables.

4. **Production:**
   - Set `DATABASE_URL` in your production environment.
   - Use SSL for production DB connections.

5. **Security:**
   - Use strong, unique DB credentials.
   - Restrict DB network access to backend services only.

---

## Teardown Instructions
To remove all infrastructure and containers:

- **Local (Docker Compose):**
  ```sh
  docker-compose down -v
  ```
- **Cloud (Terraform):**
  ```sh
  cd infra/terraform
  terraform destroy
  ```

---

## Architecture Diagram
See `docs/architecture-diagram.drawio` for a diagram of service relationships and data flows. Open with diagrams.net/draw.io.

---

## Security & Compliance
- All secrets and environment variables are managed via `.env` (never commit secrets)
- Docker images are scanned for vulnerabilities in CI
- IAM roles follow least privilege
- Terraform state is encrypted and locked (S3 + DynamoDB)
- Logs are centrally collected and searchable
- Document reviewed and updated: 2025-07-24


### Remote State Setup (One-Time)
Before running Terraform for the first time, create the S3 bucket and DynamoDB table for remote state and locking:

```sh
aws s3api create-bucket --bucket user-management-tfstate --region us-east-1
aws dynamodb create-table \
  --table-name user-management-tfstate-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

Update `infra/terraform/variables.tf` if you use a different region or bucket/table name.

### Running Terraform
1. Configure AWS credentials (e.g., `aws configure`)
2. Edit `infra/terraform/variables.tf` as needed
3. Initialize and apply Terraform:
   ```sh
   cd infra/terraform
   terraform init
   terraform apply
   ```
4. Resources will be provisioned in your AWS account

## Teardown
- To stop Docker services:
  ```sh
  docker-compose down
  ```
- To destroy cloud resources:
  ```sh
  terraform destroy
  ```

## Security & Compliance
- Never commit secrets to version control
- Use `.env` files for local secrets, AWS Secrets Manager for cloud
- Follow least-privilege principle for IAM roles

## Logging & Monitoring (Planned)
- Centralized logging and monitoring will be added in future iterations

---

_Last updated: 2025-07-24_
