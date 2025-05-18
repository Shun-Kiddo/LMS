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

// fetch students function
async function fetchStudents() {
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
        const response = await fetch("http://192.168.254.150:3000/student_list", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const students = await response.json();
        console.log("Received students:", students); // For debugging
        const studentList = document.getElementById("studentList");
        const sectionHeader = document.querySelector("h2.section");

        if (students.length > 0) {
            sectionHeader.textContent = `SECTION - ${students[0].section || 'N/A'}`;
        }

        students.forEach((student, index)=> {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index+1}</td>
                <td class="name-cell">
                <a class="name" href="/LMS_STUDENT_SIDE/LMS_STUDENT_PROFILE/profile_student.html?student_number=${student.student_number}">
                     ${student.firstname} ${student.middlename} ${student.lastname}
                </a>
                <span class="tooltip">
                    ${student.email}
                </span>
            `;
            studentList.appendChild(row);
        });

    }catch (error) {
        console.error("Error fetching students:", error);
    }
}

// Search student function
function searchStudent() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let rows = document.querySelectorAll("#studentList tr");

    rows.forEach(row => {
        let studentName = row.cells[1].textContent.toLowerCase();
        if (studentName.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
fetchStudents();

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


