// Sidebar Toggle
function myFunction(x) {
    x.classList.toggle("change");
    sidebar.classList.toggle('active');
}

// Get student number from URL
const params = new URLSearchParams(window.location.search);
const studentNumber = params.get("student_number");
console.log("Student Number from URL:", studentNumber);

// Fetch and display student data
async function loadStudentProfile() {
    if (!studentNumber) {
        alert("No student number provided. Redirecting...");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_STUDENT_LIST/student_list.html";
    }

    try {
        const response = await fetch(`http://192.168.254.150:3000/students/${studentNumber}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error:\n${errorText}`);
        }

        const student = await response.json();
        
        document.getElementById("profileImage").src = `http://192.168.254.150:3000/${student.img_path}` || "/LMS_images/lms_pic1.png";
        document.getElementById("studentName").innerHTML = ` ${student.lastname}, ${student.firstname} ${student.middlename}.`;
        document.getElementById("email").innerHTML= `${student.email}`;
        document.getElementById("studentNumber").innerHTML= `${student.student_number}`;
        document.getElementById("studentSection").innerHTML= `<span class="section">BSIT</span> ${student.section}`;
    } catch (err) {
        console.error("Error loading student profile:", err);
        alert("Unable to load student profile.");
        console.log("Loaded student number from URL:", studentNumber);
    }
}
loadStudentProfile();
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
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
    