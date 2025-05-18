document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordInput = document.querySelector("input[name='password']");
    const confirmPasswordInput = document.querySelector("input[name='confirm_password']");
    const firstname = document.querySelector("input[name='firstname']").value.trim();
    const middlename = document.querySelector("input[name='middlename']").value.trim();
    const lastname = document.querySelector("input[name='lastname']").value.trim();
    const email = document.querySelector("input[name='email']").value.trim();
    const password = passwordInput.value.trim();
    const confirm_password = confirmPasswordInput.value.trim();

    // Check if fields are empty
    if (!firstname || !lastname || !email || !password || !confirm_password) {
        alert("All fields are required!");
        return;
    }
    // Check if passwords match
    if (password !== confirm_password) {
        passwordInput.style.border = "2px solid red";
        confirmPasswordInput.style.border = "2px solid red";
        return; // Stop form submission
    } else {
        passwordInput.style.border = "";
        confirmPasswordInput.style.border = "";
    }
    // Send signup request
    try {
        const response = await fetch("http://192.168.254.150:3000/teacher_signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstname,middlename,lastname, email, password})
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html"; // Redirect on success
        }
    } catch (error) {
        console.error("Signup failed:", error);
        alert("Something went wrong. Try again.");
    }
});

// Remove red border when typing
document.querySelectorAll("input[name='password'], input[name='confirm_password']").forEach(input => {
    input.addEventListener("input", () => {
        input.style.border = "";
    });
});
