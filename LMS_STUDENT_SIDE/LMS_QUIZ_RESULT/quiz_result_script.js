// Toggle hamburger menu and sidebar
function myFunction(x) {
    x.classList.toggle("change");
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Check token presence
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
    window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
}

// Logout logic
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
    });
}

// When the page is loaded, fetch quiz result
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lesson_id = urlParams.get('lesson_id');
    const student_number = localStorage.getItem("student_number") || sessionStorage.getItem("student_number");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!lesson_id || !student_number || !token) {
        alert("Missing student or lesson information.");
        return;
    }

    try {
        const response = await fetch(`http://192.168.254.150:3000/quiz_result?lesson_id=${lesson_id}&student_number=${student_number}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to retrieve result");
        }

        document.getElementById("score").textContent = data.score + "%";
        document.getElementById("dateSubmitted").textContent = new Date(data.date_submitted).toLocaleDateString();

    } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
    }
});

