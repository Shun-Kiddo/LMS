   
        // Sidebar Toggle
        function myFunction(x) {
        x.classList.toggle("change");
        sidebar.classList.toggle('active');
       } 

        //Authentication Token Check
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        }

        //Logout Functionality
        const logoutBtn = document.getElementById("logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
            });
        }

        document.getElementById("activityForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = document.getElementById("activityForm");
        const formData = new FormData(form);

        try {
            const response = await fetch("http://192.168.254.150:3000/activities", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                form.reset();
                fetchActivities();
            } else {
                alert(result.message || "Something went wrong.");
            }
        } catch (err) {
            console.error("Failed to create activity:", err);
            alert("Error creating activity.");
        }
    });

    async function fetchActivities() {
        try {
            const response = await fetch("http://192.168.254.150:3000/activities");
            const data = await response.json();

            const container = document.getElementById("quizList"); // reuse this div for activity list
            container.innerHTML = "";

            data.forEach(activity => {
            const time = new Date(activity.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const date = new Date(activity.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
                const { id, title, content, file_path } = activity;
                const  fileUrl=activity.file_path; // Extract file name from path
                const baseUrl = "http://localhost:3000";
                container.innerHTML += `
                    <div class="activity-item">
                        <p class="time">${date} - ( ${time} )</p>
                        <h3 class="act_title">${title}</h3>
                        <div>${content}</div>
                        <div class="lesson-actions">
                        ${fileUrl ? `<a class="viewAttachment" href="${baseUrl}${fileUrl}" target="_blank">View Attachment</a>` : ""}
                        <button class="delete-btn" onclick="deleteActivity(${id})">Delete</button>
                        <button class="edit-btn"onclick="editActivity(${id})">Update</button>
                        </div>
                    </div>`;
            });
        } catch (err) {
            console.error("Error fetching activities:", err);
        }
    }

    // to Delete activity
    async function deleteActivity(id) {
            if (!confirm("Are you sure you want to delete?")) return;
            const res = await fetch(`http://192.168.254.150:3000/activities/${id}`,{method: "DELETE"});
            if (res.ok) fetchActivities();
        }

    // to Edit activity
    async function editActivity(id) {
        const newTitle = prompt("New title:");
        const newContent = prompt("New content:");
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("title", newTitle);
            formData.append("content", newContent);
            if (file) {
                formData.append("attachment", file);
            }

            const res = await fetch(`http://192.168.254.150:3000/activities/${id}`, {
                method: "PUT",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert("Activity updated with file!");
                fetchActivities();
            } else {
                alert("Failed to update: " + data.message);
            }
        };

        fileInput.click(); // Trigger file select
    }
// Load activities when page loads
fetchActivities();
