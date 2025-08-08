# PulseCare – Project Documentation

## 1. Overview

### Project Name
**PulseCare**

### Short Description
PulseCare is a secure, internal-only medical history management platform for an approved hospital.  
It provides a centralized database for storing and managing patient medical histories.  
A Super Admin approves the hospital account, and the approved hospital can read, add, and update records through both a web dashboard and a secure API.

### Key Features
- Centralized medical history database
- Approved hospital profile with full read/write access
- Super Admin approval process for hospital account creation
- Secure API for hospital system integration
- Encrypted data storage and communication

### Tech Stack
- **Front-End:** Next.js (TypeScript), Tailwind CSS
- **Back-End:** Node.js, Express.js
- **Database:** MySQL 
- **Authentication:** Firebase Authentication (Google login)
- **API:** RESTful API (JSON)
- **Security:** HTTPS, JWT tokens, Data encryption

### Stakeholders / Users
- **Super Admin** – Approves hospital account, manages system settings, and oversees activity.
- **Hospital** – Single approved profile with full read/write access to patient records and API.

---

## 2. Basic User Workflow

1. **Hospital Registration Request**  
   - Hospital submits registration form with credentials.
2. **Super Admin Approval**  
   - Super Admin verifies and approves the request.
3. **Account Activation**  
   - Hospital receives login credentials.
4. **Medical History Management**  
   - Hospital can search, add, and update patient records.
5. **API Integration**  
   - Hospital uses API to access and manage patient data.

---

## 3. Modules

### Super Admin Module
- Approve/reject hospital account
- Manage system-wide settings
- View audit logs

### Hospital Module
- Manage hospital profile
- Search patients
- Add/update patient medical records
- Access API keys for integration

### Patient Records Module
- Search patients by ID or name
- View complete medical history
- Add/update records with hospital and date tags

### API Module
- REST API for access hospital access
- Authentication via API keys & JWT
- Endpoints for:
  - GET patient history
  - POST new medical record
  - PUT update existing record

---

## 4. Pages (Front-End)

### Authentication
- **Login Page** – Firebase Google login
- **Hospital Registration Page** – Form to request access

### Super Admin Dashboard
- Pending Approvals Page
- Full paitent's list

### Hospital Dashboard
- Hospital Profile Page
- Patient Search Page
- Patient Details Page
- Add/Update Medical Record Page
- API Key Management Page
