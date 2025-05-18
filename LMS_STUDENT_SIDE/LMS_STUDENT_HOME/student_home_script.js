//Sidebar Toggle
function myFunction(x) {
    x.classList.toggle("change");
    document.getElementById("sidebar").classList.toggle('active'); // Make sure sidebar has an ID
}

//Slideshow
let slideIndex = 1;
showSlides(slideIndex);

//Auto change slide every 3 seconds
setInterval(() => {
    plusSlides(1);
}, 3000);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}


function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (e) {
        return null;
    }
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

async function fetchStudent() {
    try {
        const response = await fetch("http://192.168.254.150:3000/userprofile", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404 || response.status === 401) {
            // Handle unauthorized or not found
            alert("Session expired or student not found. You have been logged out.");
            window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html"; 
            return;
        }

        if (!response.ok) { 
            throw new Error(`Failed to fetch student info: ${response.status}`);
        }

        const student = await response.json();
        console.log('Student Data:', student); // Log the response data

        const profile = document.getElementById("profile");
        const studentName = document.getElementById("studentName");
        studentName.innerHTML=`<a class="studentName" href="/LMS_STUDENT_SIDE/LMS_USER_PROFILE/user_profile.html?student_number=${student.student_number}">
                                        ${student.firstname || 'N/A'}
                              </a>`;
        profile.href=`/LMS_STUDENT_SIDE/LMS_USER_PROFILE/user_profile.html?student_number=${student.student_number}`;

    } catch (error) {
        console.error(error.message);
    }
}
fetchStudent();


function checkTokenExpiration() {
    if (!token) {
        alert("Session expired. You have been logged out.");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
        return;
    }

    console.log('Sending Token:', token); // Check the token being sent
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
        // Invalid token, force logout
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
        return;
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    if (decoded.exp < now) {
        // Token is expired
        alert("Session expired. You have been logged out.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/1_login.html";
    }
}

// Run check on page load
checkTokenExpiration();

