require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
const secretKey = process.env.JWT_SECRET;
app.use(cors({ origin:["http://127.0.0.1:5500","http://192.168.254.150:5500"], credentials: true }));
app.use(express.static(path.join(__dirname, "public")));
app.listen(3000,'0.0.0.0', () => console.log("Server running on port http://0.0.0.0:3000"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// Make files accessible
const multer = require("multer");
// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname;
        console.log(`Saving file as: ${filename}`); // Log the filename to confirm
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "2005", // Change to your actual password
    database: "lms"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // Exit if DB fails to connect
    } else {
        console.log("Connected to MySQL database");
    }
});

const authenticateTeacher = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, secretKey); 
        req.teacher = {
            id: decoded.id,  // ✅ use `id` not `userId`
        };
        next(); 
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


// Include the teacher authentication middleware
app.post('/signup', authenticateTeacher, upload.single('profile-image'), (req, res) => {
    const { firstname, middlename, lastname, email, password, section } = req.body;
    const img_path = req.file ? req.file.path : null; // Path to the uploaded image file

    // Check if required fields are present
    if (!firstname || !lastname || !email || !password || !section || !img_path) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Assuming you're generating student numbers as you described earlier
    const year = new Date().getFullYear().toString().slice(-2); // "25"
    const prefix = `${year}-`; // "25-"
    const getMaxQuery = `SELECT MAX(student_number) AS max FROM students WHERE student_number LIKE '${prefix}%'`;

    db.query(getMaxQuery, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error (max query)' });

        let newSuffix = 1;

        if (results[0].max) {
            const lastNum = parseInt(results[0].max.split('-')[1]);
            newSuffix = lastNum + 1;
        }

        const newStudentNumber = `${year}-${newSuffix.toString().padStart(4, '0')}`; // e.g., "25-0001"

        // Insert the new student with the teacher's ID (from JWT)
        const insertQuery = 'INSERT INTO students (student_number, firstname, middlename, lastname, email, password, section, img_path, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        // Insert the teacher's ID from req.teacher (decoded JWT)
        db.query(insertQuery, [newStudentNumber, firstname, middlename, lastname, email, password, section, img_path, req.teacher.id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to register student', error: err });
            
            res.status(201).json({ message: 'Student registered successfully', student_number: newStudentNumber });
            
        });
    });
});

  
//---TEACHER SIGNUP---//
// Signup Route for Teacher
app.post('/teacher_signup', (req, res) => {
    const { firstname,middlename,lastname, email, password} = req.body;
  
    if (!firstname ||!lastname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
      const insertQuery = 'INSERT INTO teacher (firstname, middlename, lastname, email, password) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [firstname,middlename,lastname, email, password], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to register teacher' })
            
        res.status(201).json({ message: 'Teacher registered successfully'});
      });
    });

// Teacher Login Route
app.post("/teacher_signin", (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const loginQuery = "SELECT * FROM teacher WHERE email = ?";
    db.query(loginQuery, [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "User not found. Please sign up." });
        }

        const teacher = results[0];
        if (teacher.password !== password) {
            return res.status(401).json({ message: 'Invalid student number or password' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: teacher.id }, secretKey, { expiresIn: "1h" });

        // Send success response with token
        res.json({ message: "Login successful!", token });
    });
});

// Fetch all full names
app.get("/students", (req, res) => {
    const sql = "SELECT firstname, middlename, lastname, student_number, section, email FROM students";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        console.log("Fetched users:", results);
        res.json(results);
    });
});


// Update Student
app.put("/students/:student_number", (req, res) => {
    const { firstname,middlename,lastname } = req.body;
    const { student_number } = req.params;

    const sql = "UPDATE students SET firstname = ?,middlename = ?, lastname = ? WHERE student_number = ?";
    db.query(sql, [firstname, middlename,lastname, student_number], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error updating student" });
        }
        res.json({ message: "Student updated successfully!" });
    });
});

// Delete Student
app.delete("/students/:student_number", (req, res) => {
    const { student_number } = req.params;

    const sql = "DELETE FROM students WHERE student_number = ?";
    db.query(sql, [student_number], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error deleting student" });
        }
        res.json({ message: "Student deleted successfully!" });
    });
});

app.get("/students/:student_number", (req, res) => {
    const student_number = req.params.student_number;

    const sql = "SELECT * FROM students WHERE student_number = ?";
    db.query(sql, [student_number], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(results[0]);
    });
});

app.post('/students/update', (req, res) => {
    const { student_number, firstname, middlename, lastname, email, section } = req.body;
    const sql = `UPDATE students 
                 SET firstname = ?, middlename = ?, lastname = ?, email = ?, section = ? 
                 WHERE student_number = ?`;
    db.query(sql, [firstname, middlename, lastname, email, section, student_number], (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ message: "Update failed" });
        }
        res.json({ message: "Profile updated successfully" });
    });
});

// --------------Sa Quizzes-----------------------

app.get("/quizzes", (req, res) => {
    const { lesson_id } = req.query;
    let sql = "SELECT * FROM quizzes";
    let params = [];

    if (lesson_id) {
        sql += " WHERE lesson_id = ?";
        params.push(lesson_id);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(Array.isArray(results) ? results : []);
    });
});


// Lesson //
app.post("/lesson", (req, res) => {
    const {lesson_type, description, attemp_allowed, date_created, date_limit, time_limit} = req.body;
    const sql = "INSERT INTO lesson ( lesson_type, description, attemp_allowed, date_created, date_limit, time_limit) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [lesson_type, description, attemp_allowed, date_created,date_limit,time_limit], (err, result) => {
        if (err) {
            console.error("Error adding lesson_quiz:", err);
            return res.status(500).json({ message: "Error adding quiz", error: err });
        }
        res.status(201).json({ message: "Lesson_quiz added successfully!" });
    });
});

// Update a lesson

app.put("/lesson/:id", (req, res) => {
    const lessonId = req.params.id;
    const { lesson_type, description, attemp_allowed, date_created, date_limit, time_limit } = req.body;

    const fields = [];
    const values = [];

    if (lesson_type !== undefined && lesson_type !== "") {
        fields.push("lesson_type = ?");
        values.push(lesson_type);
    }
    if (description !== undefined && description !== "") {
        fields.push("description = ?");
        values.push(description);
    }
    if (attemp_allowed !== undefined && attemp_allowed !== "") {
        fields.push("attemp_allowed = ?");
        values.push(parseInt(attemp_allowed)); 
    }
    if (date_created !== undefined && date_created !== "") {
        fields.push("date_created = ?");
        values.push(date_created);
    }
    if (date_limit !== undefined && date_limit !== "") {
        fields.push("date_limit = ?");
        values.push(date_limit);
    }
    if (time_limit !== undefined && time_limit !== "") {
        fields.push("time_limit = ?");
        values.push(time_limit);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided to update." });
    }

    const sql = `UPDATE lesson SET ${fields.join(", ")} WHERE lesson_id = ?`;
    values.push(lessonId);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating lesson:", err);
            return res.status(500).json({ message: "Error updating lesson", error: err });
        }

        res.status(200).json({ message: "Lesson updated successfully!" });
    });
});


// Delete a lesson
app.delete("/lesson/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM lesson WHERE lesson_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting lesson:", err);
            return res.status(500).json({ message: "Error deleting lesson", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        res.status(200).json({ message: "Lesson deleted successfully!" });
    });
});

// Fetch all lessons
app.get("/lesson", (req, res) => {
    const sql = "SELECT * FROM lesson ORDER BY lesson_id DESC"; // optional ORDER BY
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching lessons:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

// Add a new quiz
app.post("/quizzes", (req, res) => {
    const { question, type, options, lesson_id, correct_answer } = req.body;

    if (!question || !type || !lesson_id || !correct_answer) {
        return res.status(400).json({ message: "Missing required fields!" });
    }

    let optionsJSON = null;
    if (type === "multiple" && options && options.length) {
        optionsJSON = JSON.stringify(options);
    }

    const lessonSQL = "SELECT time_limit FROM lesson WHERE lesson_id = ?";
    db.query(lessonSQL, [lesson_id], (err, lessonResults) => {
        if (err || lessonResults.length === 0) {
            return res.status(400).json({ message: "Invalid lesson ID or DB error" });
        }

        const time_limit = lessonResults[0].time_limit;

        const insertSQL = `
            INSERT INTO quizzes (question, type, options, time_limit, lesson_id, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(
            insertSQL,
            [question, type, optionsJSON, time_limit, lesson_id, correct_answer],
            (err2, result) => {
                if (err2) {
                    console.error("Error adding quiz:", err2);
                    return res.status(500).json({ message: "Error adding quiz", error: err2 });
                }
                res.status(201).json({ message: "Quiz added successfully!" });
            }
        );
    });
});



// Update a quiz
app.put("/quizzes/:id", (req, res) => {
    const { id } = req.params;
    const { question, type, options, time_limit } = req.body;
    if (!question || !type || !time_limit) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const optionsJSON = options && options.length ? JSON.stringify(options) : null;

    const sql = "UPDATE quizzes SET question = ?, type = ?, options = ?, time_limit = ? WHERE id = ?";
    db.query(sql, [question, type, optionsJSON, time_limit, id], (err, result) => {
        if (err) {
            console.error("Error updating quiz:", err);
            return res.status(500).json({ message: "Error updating quiz" });
        }
        res.json({ message: "Quiz updated successfully!" });
    });
});

// Delete a quiz
app.delete("/quizzes/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM quizzes WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting quiz" });
        res.json({ message: "Quiz deleted successfully!" });
    });
});

// GET /lesson/:lesson_id/submissions
app.get('/lesson/:lesson_id/submissions', (req, res) => {
    const lesson_id = req.params.lesson_id;
    const sql = `
        SELECT 
        sa.student_number, 
        s.firstname, 
        s.lastname, 
        MIN(sa.submitted_at) AS submitted_at, 
        qr.score
        FROM student_answers sa
        JOIN students s ON sa.student_number = s.student_number
        LEFT JOIN quiz_results qr ON sa.student_number = qr.student_number AND sa.lesson_id = qr.lesson_id
        WHERE sa.lesson_id = ?
        GROUP BY sa.student_number, s.firstname, s.lastname, qr.score;

            `;
    db.query(sql, [lesson_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

//--------------Sa activities------------------//

// Add activity
app.post("/activities", upload.single("attachment"), (req, res) => {
    const { title, content, type } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO activities (title, content, file_path, type) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, content, filePath, type], (err, result) => {
        if (err) {
            console.error("Error saving activity:", err);
            return res.status(500).json({ message: "Failed to save activity" });
        }

        res.status(201).json({
            message: "Activity created successfully!",
            file_path: filePath,
            id: result.insertId
        });
    });
});


// Fetch all activities
app.get("/activities", (req, res) => {
    const sql = "SELECT * FROM activities";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results || []);
    });
});

//Delete an activity
app.delete("/activities/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM activities WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting Activiy" });
        res.json({ message: "Activity deleted successfully!" });
    });
});


// Update a activity
app.put("/activities/:id", upload.single("attachment"), (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    const sql = "UPDATE activities SET title = ?, content = ?, file_path = ? WHERE id = ?";
    db.query(sql, [title, content, filePath, id], (err, result) => {
        if (err) {
            console.error("Error updating activity:", err);
            return res.status(500).json({ message: "Error updating activity" });
        }

        res.json({ message: "Activity updated successfully!" });
    });
});




//sa Announcement
const nodemailer = require("nodemailer");
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "learningmanagementsystem.01@gmail.com",
        pass: "lofw zgna idab cmkx"
    }
});

// CREATE ANNOUNCEMENT + SEND EMAIL
app.post("/announcements", upload.single("attachment"), (req, res) => {
    const { title, content } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const query = "INSERT INTO announcements (title, content, attachment) VALUES (?, ?, ?)";
    db.query(query, [title, content, filePath], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        // Get all student emails
        db.query("SELECT email FROM students", (err, students) => {
            if (err) return res.status(500).json({ message: "Failed to fetch students" });

            const emails = students.map(s => s.email);

            const mailOptions = {
                from: "learningmanagementsystem.01@gmail.com",
                bcc: emails,
                subject: "LMS Announcement: " +"\n"+ title,
                text: content,
                html: `<p>${content.replace(/\n/g, "<br>")}</p>`,
                attachments: req.file ? [{ path: path.join(__dirname, filePath) }] : []
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.error("Email error:", err);
                else console.log("Emails sent:", info.response);
            });

           res.status(201).json({ message: "Announcement posted and students notified!" });
        });
    });
});

// GET ANNOUNCEMENTS
app.get("/announcements", (req, res) => {
    db.query("SELECT * FROM announcements ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to load announcements" });
        res.json(results);
    });
});

// DELETE ANNOUNCEMENT
app.delete("/announcements/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM announcements WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Announcement deleted" });
    });
});

// UPDATE ANNOUNCEMENT
app.put("/announcements/:id", upload.single("attachment"), (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const query = filePath
        ? "UPDATE announcements SET title = ?, content = ?, attachment = ? WHERE id = ?"
        : "UPDATE announcements SET title = ?, content = ? WHERE id = ?";

    const params = filePath ? [title, content, filePath, id] : [title, content, id];

    db.query(query, params, (err) => {
        if (err) return res.status(500).json({ message: "Database error during update" });

        // Fetch student emails again
        db.query("SELECT email FROM students", (err, students) => {
            if (err) return res.status(500).json({ message: "Failed to fetch students for email" });

            const emails = students.map(s => s.email);

            const mailOptions = {
                from: "learningmanagementsystem.01@gmail.com",
                to: emails,
                subject: "Learning Management System\n(by: Jayson Mancol): " + title,
                text: content,
                attachments: req.file ? [{ path: path.join(__dirname, filePath) }] : []
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.error("Email error:", err);
                else console.log("Updated announcement re-sent:", info.response);
            });

            res.json({ message: "Announcement updated and emails re-sent!" });
        });
    });
});

/////////////////////////////-------------------STUDENT---------------------////////////////////////////////

// Assuming you're using dotenv to load environment variables
require('dotenv').config();
// Middleware to authenticate the token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    console.log("Token:", token);
    console.log("Secret:", process.env.JWT_SECRET);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // Using the environment variable for the secret key
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        // Attach the decoded token (which should contain student info) to the request object
        req.user = decoded;
        next();
    });
}


// Student Login Route
app.post("/student_signin", (req, res) => {
    const { student_number, password } = req.body;
    console.log("Login attempt for:", student_number);
    
    if (!student_number || !password) {
        return res.status(400).json({ message: 'Student number and password are required' });
      }
    const loginQuery = "SELECT * FROM students WHERE student_number = ?";
    db.query(loginQuery, [student_number], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: "User not found. Please sign up." });
        }
        const student = results[0];
        if (student.password !== password) {
            return res.status(401).json({ message: 'Invalid student number or password' });
          }
        // Generate JWT Token
          const payload = {
            student_number: student.student_number,
            section: student.section
        };

        const token = jwt.sign(payload,secretKey, { expiresIn: "1h" });
        // Send success response
        res.json({ message: "Login successful!", token , student_number: student.student_number });
    });
});

// Get all students in a section
app.get("/student_list", (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }
    
    try {
        const decoded = jwt.verify(token, secretKey);
        const section = decoded.section;

        // SQL query to get students and their corresponding teacher's name
        const query = `
            SELECT s.student_number, s.firstname, s.middlename, s.lastname, s.section, s.email, s.img_path, 
                   t.firstname AS teacher_firstname, t.lastname AS teacher_lastname
            FROM students s
            LEFT JOIN teacher t ON s.created_by = id
            WHERE s.section = ?
        `;
        
        db.query(query, [section], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // If results are found, send them back
            res.json(results);
        });
    } catch (err) {
        console.error("Token verification error:", err);
        res.status(403).json({ message: "Invalid token" });
    }
});


// Get all announcements
app.get("/student_announcements", (req, res) => {
    db.query("SELECT * FROM announcements ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to load announcements" });
        res.json(results);
    });
});

// Get all activities

app.post("/submitted_activity", authenticateToken, upload.single("attachment"), (req, res) => {
    const { activity_id, content, submitted_at } = req.body;
    const student_number = req.user.student_number; // get from decoded token
    const attachment_path = req.file ? `/uploads/${req.file.filename}` : null;

    if (!student_number) {
        return res.status(401).json({ message: "Unauthorized. Student number not found." });
    }

    const sql = "INSERT INTO submitted_activities (student_number, activity_id, content, attachment_path) VALUES (?, ?, ?, ?)";
    db.query(sql, [student_number, activity_id, content, attachment_path, submitted_at], (err, result) => {
        if (err) {
            console.error("Error saving activity:", err);
            return res.status(500).json({ message: "Failed to save activity" });
        }
        res.status(201).json({ message: "Activity created successfully!" });
    });
}); 


// Route to get student data
app.get("/student/me", authenticateToken, (req, res) => {
    const studentNumber = req.user.student_number;

    // Query the database to get student details
    db.query('SELECT * FROM students WHERE student_number = ?', [studentNumber], (err, results) => {
        if (err) {
            console.error('Error fetching student data:', err);
            return res.status(500).json({ message: 'Error fetching student data' });
        }
    
        if (!results.length) {
            return res.status(404).json({ message: 'Student not found' });
        }
    
        const student = results[0];
        res.json({
            firstname: student.firstname,
            middlename: student.middlename || '',
            lastname: student.lastname,
          //  student_number: student.student_number,
        });
    });
});

app.use(cors());

app.get("/userprofile", authenticateToken, (req, res) => {
    const studentNumber = req.user.student_number;

    // Query the database to get student details
    db.query('SELECT * FROM students WHERE student_number = ?', [studentNumber], (err, results) => {
        if (err) {
            console.error('Error fetching student data:', err);
            return res.status(500).json({ message: 'Error fetching student data' });
        }
    
        if (!results.length) {
            return res.status(404).json({ message: 'Student not found' });
        }
    
        const student = results[0];
        res.json({
            firstname: student.firstname,
            middlename: student.middlename || '',
            lastname: student.lastname,
            student_number: student.student_number,
        });
    });
});

app.use(cors());

app.post('/student_answers', authenticateToken, async (req, res) => {
    const student_number = req.user.student_number;
    const { lesson_id, answers } = req.body;

    if (!student_number || !lesson_id || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        let correctCount = 0;

        for (let i = 0; i < answers.length; i++) {
            const { quiz_id, answer } = answers[i];

            // 1. Insert student answer
            await db.promise().query(
                'INSERT INTO student_answers (student_number, quiz_id, lesson_id, answer) VALUES (?, ?, ?, ?)',
                [student_number, quiz_id, lesson_id, answer]
            );

            // 2. Get the correct answer from quizzes table
            const [quizRows] = await db.promise().query(
                'SELECT correct_answer FROM quizzes WHERE id = ?',
                [quiz_id]
            );

            if (quizRows.length > 0 && quizRows[0].correct_answer === answer) {
                correctCount++;
            }
        }

        // 3. Calculate score
        const score = (correctCount / answers.length) * 100;

        // 4. Insert into quiz_results
        await db.promise().query(
            `INSERT INTO quiz_results (student_number, lesson_id, score) VALUES (?, ?, ?)`,
            [student_number, lesson_id, score]
        );

        return res.status(200).json({ message: 'Answers submitted successfully', score });

    } catch (err) {
        console.error('Error processing quiz answers:', err);
        return res.status(500).json({ message: 'Server error while saving answers and score.' });
    }
});


// Route to get quiz results for a specific student and lesson
app.get('/quiz_result', authenticateToken, async (req, res) => {
    const { lesson_id, student_number } = req.query;

    if (!lesson_id || !student_number) {
        return res.status(400).json({ message: "Missing lesson_id or student_number" });
    }

    try {
        const [rows] = await db.promise().query(
            "SELECT score, date_submitted FROM quiz_results WHERE lesson_id = ? AND student_number = ? ORDER BY date_submitted DESC LIMIT 1",
            [lesson_id, student_number]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});











