// LMS_STUDENT_SIDE/LMS_STUDENT_LOGIN/student_login_script.js  
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const student_number = document.querySelector("input[name='username']").value;
    const passwordInput = document.querySelector("input[name='password']");
    const password = passwordInput.value;

    try {
        const response = await fetch("http://192.168.254.150:3000/student_signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_number, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("student_number", data.student_number); 
            window.location.href = "/LMS_STUDENT_SIDE/LMS_STUDENT_HOME/student_home.html";
        } else {
            passwordInput.classList.add("error");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        passwordInput.classList.add("error");
    }
});

document.querySelector("input[name='password']").addEventListener("input", function() {
    this.classList.remove("error");
});
