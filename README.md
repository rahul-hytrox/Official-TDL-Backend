# Official TDL Backend [Attendance Management System With To Do List]

A comprehensive backend system for managing employee attendance, profiles, and break times. Built with Node.js and Express.

## 🚀 Project Details

**Project Title:** Official TDL Backend [Attendance Management System With To Do List]  
**Description:** This project serves as the backend API for an attendance management system. It handles employee registration, secure authentication using JWT, daily attendance tracking (login/logoff), and break time management (tea/lunch breaks).

### 🛠 Project Batch (Technology Stack)
We use the following technologies in this project:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcryptjs (Password Hashing)
- **Tools:** Nodemon, Dotenv, CORS

---

## 💻 Installation Process

Follow these steps to set up the project locally:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/rahul-hytrox/Official-TDL-Backend.git
    cd Official-TDL-Backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Database Setup**
    - Ensure you have MySQL installed and running.
    - Create a database (default name: `expro_attendance`).
    - Import the schema file located at `database/schema.sql` into your MySQL database to create the necessary tables (`employee_details`, `emp_attendance`, `emp_break_time`).

4.  **Environment Configuration**
    - Create a `.env` file in the root directory.
    - Add the following variables (adjust values to match your setup):
      ```env
      PORT=5000
      NODE_ENV=development
      
      # Database Configuration
      DB_HOST=localhost
      DB_USER=root
      DB_PASS=your_password
      DB_NAME=expro_attendance
      
      # Security
      JWT_SECRET=your_jwt_secret_key
      ```

5.  **Run the Project**
    - For development (with auto-reload):
      ```bash
      npm run dev
      ```
    - For production start:
      ```bash
      npm start
      ```
    
    The server will start at `http://localhost:5000`.

---

## 🔐 Role-Based Access Control (RBAC)

The system now implements role-based security:
- **`administrator`**: Full access to all API endpoints including creating, updating, and deleting records.
- **`employee`**: restricted access. Can utilize all `GET` requests (read-only) but cannot perform `POST`, `PUT`, or `DELETE` operations (except for self-service if implemented).

Authentication is handled via JWT. The token must be included in the `Authorization: Bearer <token>` header.

---

## 🗄 Database Details

The system uses a MySQL relational database with the following primary schemas:

- **`employee_details`**: Stores employee profiles, personal info, designation, encrypted passwords, and **`emp_role`** (administrator/employee).
- **`emp_attendance`**: Tracks daily login and logoff times, along with attendance status.
- **`emp_break_time`**: Records lunch and tea break durations.
- **`holidays`**: Stores official holiday dates and names.

---

## 🔗 API Routers

The API is organized into the following main routes:

| Route Prefix | Description | Auth Requirement |
| :--- | :--- | :--- |
| **`/api/auth/login`** | Employee Login (returns JWT) | Public |
| **`/api/auth/generate-token`** | API Key based token generation | API Key required |
| **`/api/employees`** | Employee Management | JWT Required (W/D: Admin Only) |
| **`/api/attendance`** | Attendance Tracking | JWT Required (W/D: Admin Only) |
| **`/api/breaks`** | Break Management | JWT Required (W/D: Admin Only) |
| **`/api/holidays`** | Holiday Management | JWT Required (W/D: Admin Only) |

*Note: W/D = Write/Delete operations (POST, PUT, DELETE).*

---

## 👤 My Rapo

[Rahul Hytrox](https://github.com/rahul-hytrox)

---

## 🤝 Open Source & Collaboration

**Welcome to collaborate on this project!**  
This is an open-source initiative. We welcome contributions, bug fixes, and feature enhancements. Feel free to fork the repository, make changes, and submit a pull request.

Let's build something great together!

---
*Created for Official TDL Backend [Attendance Management System With To Do List]*
