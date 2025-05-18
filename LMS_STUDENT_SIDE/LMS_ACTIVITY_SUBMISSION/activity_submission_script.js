// Authentication Check
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
    window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
}

// Sidebar Toggle
function myFunction(x) {
    x.classList.toggle("change");
    sidebar.classList.toggle('active');
}

// Display activity title and content
const title = localStorage.getItem('selectedActivityTitle');
const content = localStorage.getItem('selectedActivityContent');

if (title) {
    document.querySelector('.title_activity').textContent = title;
}
if (content) {
    document.getElementById('quizList').innerHTML = `
        <div class="activity-content">
            <p class="problem">Problem:</p>${content}
        </div>`;
}

// Submission handling
document.getElementById("submissionForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = document.getElementById("submissionForm");
    const formData = new FormData(form);

    const activity_id = localStorage.getItem('selectedActivityId');
    console.log("Submitting Activity ID:", activity_id); // Debug line

    if (activity_id) {
        formData.append('activity_id', activity_id);
    } else {
        alert("Activity ID is missing.");
        return;
    }

    try {
        const response = await fetch("http://192.168.254.150:3000/submitted_activity", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            form.reset();
            window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_ACTIVITY/student_activity.html";
            alert("Activity submitted successfully.");
            
            // Optional: redirect or update UI
        } else {
            alert(result.message || "Something went wrong.");
        }
    } catch (err) {
        console.error("Submission error:", err);
        alert("Error creating activity.");
    }
});

// Logout handler
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
    });
}
