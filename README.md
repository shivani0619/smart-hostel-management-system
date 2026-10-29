# SmartHostel AI – Complete Hostel Management System

Beginner-friendly setup guide. Follow every step in order.

---

## What is inside this project?

```
hostel_project/
├── frontend/     ← Website pages (HTML, CSS, JavaScript)
├── backend/      ← Flask API server (Python)
│   ├── schema.sql
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
└── README.md     ← This file
```

---

## STEP 1 – Open the project in VS Code

1. Extract the ZIP file.
2. Open **VS Code**.
3. Click **File → Open Folder**.
4. Select the folder named **`hostel_project`**.

---

## STEP 2 – Create database tables (MySQL Workbench)

1. Open **MySQL Workbench**.
2. Connect to your MySQL server (enter your root password if asked).
3. Click **File → Open SQL Script**.
4. Go to the project folder → **backend** → select **`schema.sql`**.
5. Click the **lightning bolt** icon (Execute) to run the whole script.
6. You should see: `Schema created successfully for smart_hostel_db`.

This creates all tables inside the database **`smart_hostel_db`**.  
It does **NOT** create fake students. Only FAQ answers and basic settings are added.

---

## STEP 3 – Enter your MySQL password

1. In VS Code, open the folder **backend**.
2. You will see a file named **`.env.example`**.
3. Make a **copy** of it and rename the copy to **`.env`**  
   (right-click → Copy → Paste → rename to `.env`).
4. Open **`.env`** and change this line:

```
DB_PASSWORD=your_mysql_password
```

Replace `your_mysql_password` with the real password you use in MySQL Workbench.

Also change (optional but recommended):

```
SECRET_KEY=any-long-random-text-here
JWT_SECRET_KEY=another-long-random-text-here
```

Save the file.

---

## STEP 4 – Install Python packages and start the backend

1. Open a **terminal** inside VS Code (Terminal → New Terminal).
2. Go to the backend folder:

```
cd backend
```

3. Create a virtual environment:

```
python -m venv venv
```

4. Activate it:

**Windows:**
```
venv\Scripts\activate
```

**Mac / Linux:**
```
source venv/bin/activate
```

5. Install packages:

```
pip install -r requirements.txt
```

6. Start the server:

```
python run.py
```

You should see something like:

```
Running on http://127.0.0.1:5000
```

**Keep this terminal open.** Do not close it while using the website.

---

## STEP 5 – Start the frontend

1. Open a **second terminal** in VS Code.
2. Go to the frontend folder:

```
cd frontend
```

3. Start a simple web server:

```
python -m http.server 5500
```

---

## STEP 6 – Open the website

Open your browser and go to:

```
http://127.0.0.1:5500/landingpage.html
```

---

## STEP 7 – Create the first Warden account

Open a **third terminal** (or use Postman / browser) and run:

**Windows (PowerShell):**
```
curl -X POST http://127.0.0.1:5000/api/auth/register/warden -H "Content-Type: application/json" -d "{\"full_name\":\"Main Warden\",\"email\":\"warden@smarthostel.ai\",\"password\":\"Warden@123\"}"
```

**Mac / Linux:**
```
curl -X POST http://127.0.0.1:5000/api/auth/register/warden \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Main Warden","email":"warden@smarthostel.ai","password":"Warden@123"}'
```

Then:

1. Go to the website → Login → choose **Warden**.
2. Email: `warden@smarthostel.ai`
3. Password: `Warden@123`
4. You will enter the **Warden Dashboard**.

---

## How Student registration works

1. Landing page → Login → **Student** → Create an account.
2. Fill: Full Name, Student ID, Email, Phone, Department, Year, Password.
3. Click Register.
4. Data is saved in MySQL (`users` + `students` tables).
5. Go back and **Login** with the same email and password.
6. You will see the **Student Dashboard** with your real name.

---

## How Parent login works

1. First a **student must register**.
2. Then Parent Register → enter the child’s **Student ID**.
3. After registration, Parent Login → goes to **Parent Dashboard**.
4. Parent can see linked child details.

---

## How Warden login works

1. Create warden with the curl command above (only once).
2. Login as Warden → **Warden Dashboard**.
3. From there you can:
   - See live statistics
   - Approve / reject leave requests
   - Resolve complaints
   - View students and rooms
   - Allocate rooms
   - Manage FAQs (add / deactivate)
   - Publish announcements

---

## Chatbot

On most pages you will see a **floating chat button** (bottom-right).

Ask questions like:
- “What time does the hostel gate close?”
- “Mess timings”
- “How do I apply for leave?”

Answers come **only** from the MySQL `faqs` table.  
If no matching FAQ is found, it tells you to contact the warden.

---

## Important notes

- Backend must be running (`python run.py`) for login and data to work.
- Frontend must be served on port 5500 (or change `API_BASE` in `frontend/api.js`).
- No fake students/parents are created automatically. Everything is created through the website.
- Passwords are stored hashed (bcrypt). Login uses JWT tokens.

---

## If something goes wrong

| Problem | Solution |
|---------|----------|
| Cannot connect to MySQL | Check `DB_PASSWORD` in `.env` |
| Module not found | Run `pip install -r requirements.txt` again |
| Login fails | Make sure backend is running on port 5000 |
| CORS / network error | Use `http://127.0.0.1:5500` not `file://` |
| Table doesn’t exist | Run `schema.sql` again in Workbench |

---

Enjoy your SmartHostel AI system!

---

## AI Emergency Assistant (new feature)

### Extra setup (existing databases only)

If you already ran the original `schema.sql` earlier, run this migration once in MySQL Workbench:

1. Open **`backend/migrations/add_emergency_assistant.sql`**
2. Execute it (lightning icon)

Fresh installs using the full `schema.sql` already include the emergency table.

### How to test

**Student**
1. Login as student
2. Dashboard → red **AI Emergency Assistant** card, or sidebar **Emergency / SOS**
3. Type e.g. `I fell down and I need medical help`
4. Click **Analyze** (optional) then **SEND SOS**
5. Status appears; history lists the request

**Warden**
1. Login as warden → **Emergencies** tab
2. See alert banner / stats / list (high & critical highlighted)
3. **Acknowledge → Responded → Resolve**
4. Page polls every 8 seconds for new SOS

**Parent**
1. Login as parent (must be linked to the student)
2. See **Emergency Alerts** and emergency notifications

### API summary (Emergency)

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/emergencies/classify` | Student (preview only) |
| POST | `/api/emergencies` | Student (create SOS) |
| GET | `/api/emergencies/my` | Student |
| GET | `/api/emergencies/parent` | Parent |
| GET | `/api/emergencies/warden` | Warden |
| GET | `/api/emergencies/warden/pending-count` | Warden (polling) |
| GET | `/api/emergencies/:id` | Owner / Parent / Warden |
| PUT | `/api/emergencies/:id/acknowledge` | Warden |
| PUT | `/api/emergencies/:id/respond` | Warden |
| PUT | `/api/emergencies/:id/resolve` | Warden |

Classification is local keyword/NLP (no paid API). Structure supports swapping in an LLM later.
