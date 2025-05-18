document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordInput = document.querySelector("input[name='password']");
    const confirmPasswordInput = document.querySelector("input[name='confirm_password']");
    const firstname = document.querySelector("input[name='firstname']").value.trim();
    const middlename = document.querySelector("input[name='middlename']").value.trim();
    const lastname = document.querySelector("input[name='lastname']").value.trim();
    const email = document.querySelector("input[name='email']").value.trim();
    const section = document.querySelector("input[name='section']").value.trim();
    const password = passwordInput.value.trim();
    const confirm_password = confirmPasswordInput.value.trim();
    const profileImage = document.querySelector("input[name='profile-image']").files[0]; // Access the file input

    // Check if fields are empty
    if (!firstname || !lastname || !email || !password || !confirm_password || !section || !profileImage) {
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

    // Prepare FormData to handle file upload and form fields
    const formData = new FormData();
    formData.append('firstname', firstname);
    formData.append('middlename', middlename);
    formData.append('lastname', lastname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('section', section);
    formData.append('profile-image', profileImage);

    // Send signup request
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await fetch("http://192.168.254.150:3000/signup", {
            method: "POST",
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}` // Attach the token
            }
        });

        const data = await response.json();
        if (response.ok) {
           alert(data.message);
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
