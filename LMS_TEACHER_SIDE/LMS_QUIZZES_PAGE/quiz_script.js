        // Sidebar toggle function for responsive layout
        function myFunction(x) {
            x.classList.toggle("change");
            sidebar.classList.toggle('active');
        }
    
        // Auth check: redirect to login if token is missing
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        }
    
        // Logout handler
        const logoutBtn = document.getElementById("logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
            });
        }
    
        // Populate quizzes from server
        document.addEventListener("DOMContentLoaded", async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const lesson_id = urlParams.get('lesson_id');  // Get the lesson_id from the URL
            
            if (!lesson_id) {
                alert("No lesson found!");
                return;
            }
            document.getElementById("lessonId").value = lesson_id;
            try {
                const response = await fetch(`http://192.168.254.150:3000/quizzes?lesson_id=${lesson_id}`);  // Fetch quizzes for this lesson
                const quizzes = await response.json();
                renderQuizzes(quizzes);  // Display the quizzes
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        });

        function renderQuizzes(quizzes) {
            const quizList = document.getElementById("quizList");
            quizList.innerHTML = "";  // Clear previous quizzes

            if (quizzes.length === 0) {
                quizList.innerHTML = "<p>No quizzes found for this lesson.</p>";
                return;
            }

            quizzes.forEach((quiz, index) => {
                quizList.innerHTML += `
                    <div class='quiz-item'>
                        <span><strong>Question ${index + 1}: ${quiz.question}</strong> <br>(${quiz.type})</span>
                        <div>
                            <button class='edit-btn' onclick="editQuiz(${quiz.id})">Update</button>
                            <button class='delete-btn' onclick="deleteQuiz(${quiz.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const lesson_id = urlParams.get('lesson_id');

        if (lesson_id) {
            // Pre-fill the lesson ID field
            document.getElementById("lessonId").value = lesson_id;
        }

       
        document.getElementById("quizType").addEventListener("change", function () {
            const quizType = this.value;
            if (quizType === "multiple") {
                document.getElementById("multipleOptions").style.display = "block";
            } else {
                document.getElementById("multipleOptions").style.display = "none";
            }
        });

        async function addQuiz() {
            const lesson_id = document.getElementById("lessonId").value;
            const question = document.getElementById("question").value;
            const type = document.getElementById("quizType").value;
            let options = [];

            if (type === "multiple") {
                options = [
                    document.getElementById("option1").value.trim(),
                    document.getElementById("option2").value.trim(),
                    document.getElementById("option3").value.trim(),
                    document.getElementById("option4").value.trim()
                ];
            }

            const correct_answer = document.getElementById("correctAnswer").value.trim();

            // Debugging log for options
            console.log("Options being sent:", options);
            console.log("Option 1 value:", document.getElementById("option1").value);
            console.log("Option 2 value:", document.getElementById("option2").value);
            console.log("Option 3 value:", document.getElementById("option3").value);
            console.log("Option 4 value:", document.getElementById("option4").value);

            // Validate that none of the options are empty
            if (!question || !type || !correct_answer || (type === "multiple" && options.some(option => option === ""))) {
                alert("Please fill in all required fields including correct answer.");
                return;
            }

            try {
                const response = await fetch("http://192.168.254.150:3000/quizzes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, type, options, lesson_id, correct_answer })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Quiz added successfully!");
                    clearQuizForm();  // Clear the form after quiz creation
                    location.reload();
                } else {
                    alert("Error adding quiz: " + data.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to add quiz.");
            }
        }

        function clearQuizForm() {
            document.getElementById("question").value = "";
            document.getElementById("quizType").value = "multiple";  // Reset to default
            document.getElementById("option1").value = "";
            document.getElementById("option2").value = "";
            document.getElementById("option3").value = "";
            document.getElementById("option4").value = "";
            document.getElementById("correctAnswer").value = "";

        }

    
        // Edit existing quiz
        async function editQuiz(id) {
            const newQuestion = prompt("Enter the new question:");
            if (!newQuestion) {
                alert("Question is required!");
                return;
            }

            const newType = prompt("Enter new type (multiple/truefalse):");
            if (!newType || (newType !== "multiple" && newType !== "truefalse")) {
                alert("Type must be 'multiple' or 'truefalse'.");
                return;
            }

            let newOptions = [];
            if (newType === "multiple") {
                newOptions = [
                    prompt("Enter option 1:"),
                    prompt("Enter option 2:"),
                    prompt("Enter option 3:"),
                    prompt("Enter option 4:")
                ];

                if (newOptions.some(opt => !opt)) {
                    alert("All options are required for multiple choice.");
                    return;
                }
            }

            try {
                const response = await fetch(`http://192.168.254.150:3000/quizzes/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: newQuestion,
                        type: newType,
                        options: newType === "multiple" ? newOptions : null
                    })
                });

                if (!response.ok) {
                    const errorMessage = await response.json();
                    alert(`Error updating quiz: ${errorMessage.message}`);
                    return;
                }

                alert("Quiz updated successfully!");
                location.reload(); // Refresh the page to show updated quiz
            } catch (err) {
                console.error("Error updating quiz:", err);
            }
        }

    
        // Delete quiz by ID
        async function deleteQuiz(id) {
            if (!confirm("Are you sure you want to delete this quiz?")) return;
    
            try {
                await fetch(`http://192.168.254.150:3000/quizzes/${id}`, { method: "DELETE" });
                location.reload();
            } catch (error) {
                console.error("Error deleting quiz:", error);
            }
        }
