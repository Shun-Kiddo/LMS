    function myFunction(x) {
        x.classList.toggle("change");
        sidebar.classList.toggle('active');
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "/LMS_TEACHER_SIDE/LMS_TEACHER_LOGIN/teacher_sign_in.html";
        });
    }

    async function fetchStudents() {
        try {
            const response = await fetch("http://192.168.254.150:3000/students");
            const students = await response.json();
            const studentList = document.getElementById("studentList");
            studentList.innerHTML = "";

            students.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${student.student_number}</td>
                    <td class="name-cell">
                        <a class="name" href="/LMS_TEACHER_SIDE/LMS_STUDENT_PROFILE/student_profile.html?student_number=${student.student_number}">
                            ${student.firstname} ${student.middlename} ${student.lastname}
                        </a>
                        <span class="tooltip">${student.email}</span>
                    </td>
                    <td>${student.section}</td>
                    <td class="actions">
                        <a class="btn-update" href="/LMS_TEACHER_SIDE/LMS_STUDENT_PROFILE/student_profile.html?student_number=${student.student_number}">Update</a>
                        <button class="btn-delete" onclick="deleteStudent('${student.student_number}')">Delete</button>
                    </td>
                `;
                studentList.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function deleteStudent(student_number) {
        if (!confirm("Are you sure you want to delete?")) return;

        const response = await fetch(`http://192.168.254.150:3000/students/${student_number}`, {
            method: "DELETE"
        });

        if (response.ok) {
            fetchStudents();
        } else {
            const result = await response.json();
            alert(result.message || "Failed to delete student.");
        }
    }

    function searchStudent() {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let rows = document.querySelectorAll("#studentList tr");

        rows.forEach(row => {
            let studentNumber = row.cells[0].textContent.toLowerCase();
            let section = row.cells[2].textContent.toLowerCase();

            if (studentNumber.includes(input) || section.includes(input)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    fetchStudents();

