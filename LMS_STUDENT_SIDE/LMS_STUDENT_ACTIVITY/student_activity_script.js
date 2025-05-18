   // Sidebar Toggle
   function myFunction(x) {
    x.classList.toggle("change");
    sidebar.classList.toggle("active");
  }
  // Authentication Token Check
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Logout Functionality
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
    });
  }

  async function fetchActivities() {
    try {
      const response = await fetch("http://192.168.254.150:3000/activities");
      const data = await response.json();

      const container = document.getElementById("quizList");
      container.innerHTML = "";

      data.forEach((activity) => {
        const time = new Date(activity.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const date = new Date(activity.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const { title, content, type , id } = activity;
        const  fileUrl=activity.file_path; // Extract file name from path
        const baseUrl = "http://localhost:3000";
        container.innerHTML += `
        <div class="activity-item">
          <p class="time">${date} - ( ${time} )</p>
          <h3 class="act_title">${title}</h3>
          <div>${content}</div>
            ${fileUrl ? `<a class="viewAttachment" href="${baseUrl}${fileUrl}" target="_blank">View Attachment</a>` : ""}
          ${["activity", "mco", "assignment"].includes(type.toLowerCase()) ? 
            `<button class="submit-btn" onclick='submitActivity(${JSON.stringify(title)}, ${JSON.stringify(content)},${JSON.stringify(id)})'>Add Submission</button>` 
            : ""
          }
        </div>`;
      });
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  }

function submitActivity(title, content, id) {
  localStorage.setItem('selectedActivityId', id);
  localStorage.setItem('selectedActivityTitle', title);
  localStorage.setItem('selectedActivityContent', content);
  window.location.href = "/LMS_STUDENT_SIDE/LMS_ACTIVITY_SUBMISSION/activity_submission.html";
}

  async function deleteActivity(id) {
    if (!confirm("Are you sure you want to delete?")) return;
    const res = await fetch(`http://192.168.254.150:3000/activities/${id}`, { method: "DELETE" });
    if (res.ok) fetchActivities();
  }


  fetchActivities();

    // Student Profile Link
    async function fetchAndSetStudentProfileLink() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
          const response = await fetch("http://192.168.254.150:3000/userprofile", {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              throw new Error("Failed to fetch student info");
          }

          const student = await response.json();

          const sidebarProfileLink = document.getElementById("profile");
          if (sidebarProfileLink) {
              sidebarProfileLink.href = `/LMS_STUDENT_SIDE/LMS_USER_PROFILE/user_profile.html?student_number=${student.student_number}`;
          }

      } catch (err) {
          console.error("Error fetching logged-in student:", err);
      }
  }
  fetchAndSetStudentProfileLink();
  
function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (e) {
        return null;
    }
}

function checkTokenExpiration() {
  if (!token) {
      alert("Session expired. You have been logged out.");
      window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
      return;
}

  console.log('Sending Token:', token);
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
      return;
  }

  const now = Math.floor(Date.now() / 1000);

  if (decoded.exp < now) {
      alert("Session expired. You have been logged out.");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
  }
}
checkTokenExpiration();

