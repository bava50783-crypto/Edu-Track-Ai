# EduTrack AI – AI-Powered Student Education Management System

## 📌 Project Overview

**EduTrack AI** is a web-based Student Education Management System designed to simplify academic management through intelligent AI-powered features.

The platform provides a centralized space where students can manage assignments, track deadlines, view faculty announcements, organize study materials, and receive AI-powered academic assistance.

Faculty members can create and manage assignments and publish important announcements for students.

The system aims to improve student productivity, academic organization, and learning efficiency.

## 🎯 Project Objectives

- Provide a centralized platform for managing academic activities.
- Help students track assignments and upcoming deadlines.
- Allow students to monitor assignment completion.
- Enable faculty to publish assignments and announcements.
- Generate summaries from uploaded academic PDF documents.
- Provide document-based question answering using AI.
- Suggest study plans based on pending assignments and deadlines.
- Offer an AI academic assistant for student learning support.

## 👥 User Roles

### 1. Student
Students can:
- Log in to their personal dashboard.
- View assignments and deadlines.
- Track pending, completed, and overdue assignments.
- Mark assignments as completed.
- Read faculty announcements.
- Upload and manage academic PDF materials.
- Generate AI-powered PDF summaries.
- Ask questions based on uploaded documents.
- Use the AI academic assistant.
- Generate deadline-based study suggestions.

### 2. Faculty / Admin
Faculty members can:
- Log in to the faculty dashboard.
- Create and manage assignments.
- Set assignment deadlines.
- Edit and delete assignments.
- Publish academic announcements.
- Edit and manage announcements.

## ✨ Key Features

| Feature | Description |
|---|---|
| Role-Based Login | Separate access for students and faculty |
| Student Dashboard | Overview of academic activities |
| Assignment Management | Create, view, and manage assignments |
| Deadline Tracking | Monitor upcoming and overdue assignments |
| Completion Tracking | Track assignment progress |
| Announcements | Publish and view academic updates |
| PDF Upload | Upload academic study materials |
| AI PDF Summarization | Generate summaries from academic documents |
| Document Q&A | Ask questions using uploaded PDF content |
| AI Academic Assistant | Get AI-powered study assistance |
| AI Study Planner | Receive study suggestions based on actual deadlines |

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python – Flask |
| Database | SQLite |
| ORM | Flask-SQLAlchemy |
| Authentication | Flask-Login |
| AI Integration | Google Gemini API |
| PDF Processing | PyPDF |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |

## 📂 Project Structure

```text
EduTrack-AI/
│
├── app.py
├── config.py
├── models.py
├── requirements.txt
├── .env
├── .gitignore
│
├── routes/
│   ├── auth.py
│   ├── student.py
│   ├── faculty.py
│   └── ai.py
│
├── services/
│   ├── ai_service.py
│   ├── pdf_service.py
│   └── planner_service.py
│
├── templates/
│   ├── login.html
│   ├── student_dashboard.html
│   ├── faculty_dashboard.html
│   ├── assignments.html
│   ├── announcements.html
│   ├── study_materials.html
│   └── ai_assistant.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│
├── uploads/
│
└── instance/
    └── edutrack.db
```

*Note: This is the proposed folder structure. Files and folders may be adjusted during implementation.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Python 3.10 or above
- Visual Studio Code
- Google Gemini API key
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
```

Move into the project folder:

```bash
cd EduTrack-AI
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory.

Add the following:

```env
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your actual API key.

**Important:** Never upload your `.env` file or API keys to GitHub.

### Step 5: Run the Application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000/
```

## 🤖 AI Integration

EduTrack AI uses the Google Gemini API to provide intelligent academic assistance.

AI-powered capabilities include:

1. **PDF Summarization:** Converts lengthy academic documents into concise summaries and revision notes.
2. **Document-Based Q&A:** Answers student questions using relevant information extracted from uploaded PDFs.
3. **AI Academic Assistant:** Provides explanations and study-related guidance.
4. **AI Study Planner:** Suggests study priorities using actual assignment deadlines and pending tasks.

AI responses should be reviewed by students for accuracy. Document-based answers should be grounded in the uploaded material.

## 🔐 Security Considerations

- Passwords should be stored using secure password hashing.
- Role-based authorization should protect faculty-only functions.
- API keys should be stored in environment variables.
- Uploaded files should be validated before processing.
- Student-specific information should only be accessible to the authorized student.
- Database operations should use SQLAlchemy ORM.

## 🚀 Future Enhancements

- Mobile application for Android and iOS.
- Attendance management.
- Timetable integration.
- Automated email and push notifications.
- Quiz and online examination management.
- Integration with college ERP and Learning Management Systems.
- Advanced academic performance analytics.

## 📌 Project Scope

**In Scope**
- Student and faculty authentication.
- Assignment and deadline management.
- Announcement management.
- Academic PDF upload and processing.
- AI-powered summarization and document Q&A.
- AI academic assistant.
- Deadline-based study planner.

**Out of Scope**
- Online examination and proctoring.
- Fee payment management.
- Attendance tracking.
- Native mobile applications.
- Live college ERP integration.

 **Screenshots**
<img width="1296" height="1600" alt="screen1" src="https://github.com/user-attachments/assets/ed9ba3d9-e945-4fe0-9159-840bc9a2c2a0" />
<img width="1326" height="1600" alt="screen2" src="https://github.com/user-attachments/assets/0b13a3a5-38cb-44a6-9d54-a9ca8aab05fa" />
<img width="1308" height="1600" alt="screen3" src="https://github.com/user-attachments/assets/464598e9-0935-493e-ad38-5d35609dd060" />
<img width="1143" height="1600" alt="screen4" src="https://github.com/user-attachments/assets/a6334a28-f649-475b-b2a1-7535d758e90d" />
<img width="1600" height="2773" alt="screen5" src="https://github.com/user-attachments/assets/5c07119e-6bf9-4a30-ac0c-37cfdaa81f7b" />
<img width="1002" height="1600" alt="screen6" src="https://github.com/user-attachments/assets/64ac5b78-c12b-44a2-b550-debaa159aa2a" />

## 👩‍💻 Project Information

**Project Name:** EduTrack AI

**Project Type:** Web-Based Application

**Domain:** Education Technology (EdTech) and Artificial Intelligence

**Primary Users:** Students and Faculty

**Project Version:** 1.0

---

*EduTrack AI – Your academics. Organized. Smarter.*
