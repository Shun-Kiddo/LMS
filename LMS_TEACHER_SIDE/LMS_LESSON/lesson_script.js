function myFunction(x) {
    x.classList.toggle("change");
    sidebar.classList.toggle('active');
} 


const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
   }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        });
    }
        
    async function addLesson() {
        const lesson_type = document.getElementById("lesson").value.trim();
        const description = document.getElementById("description").value.trim();
        const attemp_allowed = document.getElementById("attemptAllowed").value.trim();
        const date_limit = document.getElementById("dateLimit").value.trim();
        const time_limit = document.getElementById("timeLimit").value.trim();

            // Create timestamp for date_created
        const date_created = new Date().toISOString().slice(0, 19).replace('T', ' '); // e.g., "2025-05-03 14:30:00"

        if (!lesson_type || !description || !attemp_allowed || !date_limit || !time_limit) {
            alert("Please fill in all fields.");
            return;
        }

            try {
                const response = await fetch("http://192.168.254.150:3000/lesson", { // change this URL to match your backend
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` // include if you're using auth
                    },
                    body: JSON.stringify({
                        lesson_type,
                        description,
                        attemp_allowed,
                        date_created,
                        date_limit,
                        time_limit
                    })
                });

        const result = await response.json();

            if (response.ok) {
                alert("Lesson quiz added successfully!");
                displayLessons();
            } else {
                alert("Failed: " + result.message);
             }
        } catch (error) {
            console.error("Request failed:", error);
            alert("Server error occurred.");
        }
    }

        async function displayLessons() {
            const lessonList = document.getElementById("lessonList");
            lessonList.innerHTML = "";

            try {
                const response = await fetch("http://192.168.254.150:3000/lesson", { // Adjust URL as needed
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch lessons");
                }

                const lessons = await response.json();

                if (lessons.length === 0) {
                    lessonList.innerHTML = "<p>No lessons found.</p>";
                    return;
                }
                lessons.forEach((lesson) => {
                    const timeopen = new Date(lesson.date_created).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                    });

                    const dateopen = new Date(lesson.date_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    const timeclosed = new Date(lesson.date_limit).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                    });

                    const dateclosed = new Date(lesson.date_limit).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
 
                    const div = document.createElement("div");
                    div.className = "lesson-item";
                    div.innerHTML = `
                        <h3>${lesson.lesson_type}</h3>
                        <p><strong>Description:</strong> ${lesson.description}</p>
                        <p><strong>Attempt Allowed:</strong> ${lesson.attemp_allowed}</p>
                        <p><strong>Opened:</strong> ${dateopen} / ${timeopen}</p>
                        <p><strong>Closed:</strong> ${dateclosed} / ${timeclosed}</p>
                        <p><strong>Time Limit:</strong> ${lesson.time_limit} seconds</p>
                        <div class="lesson-actions">
                            <button class ="view-students-btn"onclick="viewStudents(${lesson.lesson_id}, '${lesson.lesson_type.replace(/'/g, "\\'")}')">View Submissions</button>
                            <button class ="create-btn" onclick="createQuiz(${lesson.lesson_id})">Create Quiz</button>
                            <button class="edit-btn" onclick="editLesson(${lesson.lesson_id})">Update</button>
                            <button class="delete-btn" onclick="deleteLesson(${lesson.lesson_id})">Delete</button>
                        </div>
                    `;

                    lessonList.appendChild(div);
                });
            } catch (error) {
                console.error(error);
                lessonList.innerHTML = "<p>Error loading lessons.</p>";
            }
        }
        displayLessons();

        function createQuiz(lesson_id) {
            window.location.href = `/LMS_TEACHER_SIDE/LMS_QUIZZES_PAGE/quiz.html?lesson_id=${lesson_id}`;
        }


        async function deleteLesson(lesson_id) {
            if (!confirm("Are you sure you want to delete?")) return;
            const res = await fetch(`http://192.168.254.150:3000/lesson/${lesson_id}`,{method: "DELETE"});
            if (res.ok) displayLessons();
        }

        function editLesson(lesson_id) {
            // Option 1: Simple prompt-based update (for demo/testing)
            const newLessonType = prompt("Enter new lesson name:");
            const newDescription = prompt("Enter new description:");
            const newAttempts = prompt("Enter new attempts allowed:");
            const newDateLimit = prompt("Enter new closing date (YYYY-MM-DD HH:MM:SS):");
            const newTimeLimit = prompt("Enter new time limit (in seconds):");

            const updatedLesson = {
                lesson_type: newLessonType,
                description: newDescription,
                attemp_allowed: newAttempts,
                date_limit: newDateLimit,
                time_limit: newTimeLimit
            };

            fetch(`http://192.168.254.150:3000/lesson/${lesson_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedLesson)
            })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    alert("Lesson updated successfully.");
                    displayLessons(); // refresh the list
                } else {
                    alert("Failed to update: " + data.error);
                }
            })
            .catch(err => {
                console.error("Update failed:", err);
                alert("Server error while updating.");
            });
        }
        
async function viewStudents(lesson_id, lesson_type) {
    try {
        const response = await fetch(`http://192.168.254.150:3000/lesson/${lesson_id}/submissions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const students = await response.json();

        if (!response.ok) {
            throw new Error("Failed to fetch student data");
        }

        if (students.length === 0) {
            alert("No students have taken this quiz.");
            return;
        }

        // Build table HTML
        let tableHtml = `
            <div class="student-list-container">
                <h3 class="title">Students who have taken this quiz: ${lesson_type}</h3>
                <table class="student-table">
                    <thead>
                        <tr>
                            <th>Student Number</th>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach(student => {
            const scoreText = student.score !== null ? `${student.score} pts` : "Not graded";
            tableHtml += `
                <tr>
                    <td>${student.student_number}</td>
                    <td>${student.firstname} ${student.lastname}</td>
                    <td>${scoreText}</td>
                </tr>
            `;
        });

        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        // Remove existing if already shown
        const oldContainer = document.querySelector(".student-list-container");
        if (oldContainer) oldContainer.remove();

        // Append new
        const studentListContainer = document.createElement("div");
        studentListContainer.innerHTML = tableHtml;
        document.body.appendChild(studentListContainer);

    } catch (error) {
        console.error("Error loading student list:", error);
        alert("There was an error fetching the student list.");
    }
}
