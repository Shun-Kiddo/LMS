document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.querySelector("input[name='email']").value;
    const passwordInput = document.querySelector("input[name='password']");
    const password = passwordInput.value;
    
    try {
        const response = await fetch("http://192.168.254.150:3000/teacher_signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({email, password })
        });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem("token", data.token);
                window.location.href = "/LMS_TEACHER_SIDE/LMS_HOME_PAGE/home2_page.html";
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
