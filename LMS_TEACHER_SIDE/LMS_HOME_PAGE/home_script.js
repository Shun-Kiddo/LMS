    //Sidebar Toggle
        function myFunction(x) {
            x.classList.toggle("change");
            document.getElementById("sidebar").classList.toggle('active'); // Make sure sidebar has an ID
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

function checkTokenExpiration() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        // No token, redirect to login
        window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        return;
    }

    const decoded = parseJwt(token);

    if (!decoded || !decoded.exp) {
        // Invalid token, force logout
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        return;
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    if (decoded.exp < now) {
        // Token is expired
        alert("Session expired. You have been logged out.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
    }
}

// Run check on page load
checkTokenExpiration();
 