// Sidebar Toggle
function myFunction(x) {
    x.classList.toggle("change");
    sidebar.classList.toggle('active');
} 
//Authentication Token Check
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//Logout Functionality
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
     });
}
     
async function fetchAnnouncements() {
    try{
    const response = await fetch("http://192.168.254.150:3000/student_announcements");
    const announcements = await response.json();

    const list = document.getElementById("AnnouncementList");
    list.innerHTML = "";
    announcements.forEach(announcement => {
        const time = new Date(announcement.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
             hour12: true
        });

        const date = new Date(announcement.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const {title, content, attachment } = announcement;

        list.innerHTML += `
            <div class="announcement_item">
                <p class="time">${date} - ( ${time} )</p>
                <h3 class="title">${title}</h3>
                <p>${content}</p>
                ${attachment ? `<a class="viewAttachment" href="http://localhost:3000${attachment}" target="_blank">View Attachment</a>` : ""}
                <br>
            </div>`;
        });
    } catch (err) {
        console.error("Error fetching activities:", err);
    }
}
fetchAnnouncements();

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

// Function to parse JWT token and extract payload 
function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (e) {
        return null;
    }
}
// Function to check token expiration
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


