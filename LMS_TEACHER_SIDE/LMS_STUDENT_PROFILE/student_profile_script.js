 // Sidebar Toggle
  function myFunction(x) {
      x.classList.toggle("change");
      sidebar.classList.toggle('active');
  }

  // Fetch and display student data
  async function loadStudentProfile() {
      // Get the student number from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const studentNumber = urlParams.get('student_number'); // Get the student number from the query parameter

      if (!studentNumber) {
          alert("Student number not found in URL!");
          return;
      }

      try {
          const response = await fetch(`http://192.168.254.150:3000/students/${studentNumber}`);
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server error:\n${errorText}`);
          }

          const student = await response.json();
          document.getElementById("profileImage").src = `http://192.168.254.150:3000/${student.img_path}` || "/LMS_images/lms_pic1.png";
          document.getElementById("studentName").innerHTML = `${student.lastname}, ${student.firstname} ${student.middlename}.`;
          document.getElementById("email").innerHTML = `${student.email}`;
          document.getElementById("studentNumber").innerHTML = `${student.student_number}`;
          document.getElementById("studentSection").innerHTML = `<span class="section">BSIT</span> ${student.section}`;
      } catch (err) {
          console.error("Error loading student profile:", err);
          alert("Unable to load student profile.");
          console.log("Loaded student number:", studentNumber);
      }
  }

  // Call the function to load the student profile when the page loads
  loadStudentProfile();

let isEditing = false;

document.getElementById("editButton").addEventListener("click", () => {
    const nameField = document.getElementById("studentName");
    const emailField = document.getElementById("email");
    const sectionField = document.getElementById("studentSection");

    if (!isEditing) {
        // Switch to edit mode
        const fullName = nameField.textContent; // e.g., "Doe, John M."
        const email = emailField.textContent;
        const section = sectionField.textContent.split(' ')[1];

        // Parse full name
        const nameParts = fullName.split(', ');
        const lastName = nameParts[0];
        const firstAndMiddle = nameParts[1].split(' ');
        const firstName = firstAndMiddle[0];
        const middleName = firstAndMiddle[1]?.replace('.', '') || '';

        nameField.innerHTML = `
            <input type="text" id="editLastName" value="${lastName}" placeholder="Last Name">
            <input type="text" id="editFirstName" value="${firstName}" placeholder="First Name">
            <input type="text" id="editMiddleName" value="${middleName}" placeholder="Middle Name">
        `;
        emailField.innerHTML = `<input type="email" id="editEmail" value="${email}" placeholder="Email">`;
        sectionField.innerHTML = `<input type="text" id="editSection" value="${section}" placeholder="Section">`;

        document.getElementById("editButton").textContent = "Save Profile";
        isEditing = true;
    } else {
        // Switch back to display mode
        const newLastName = document.getElementById("editLastName").value;
        const newFirstName = document.getElementById("editFirstName").value;
        const newMiddleName = document.getElementById("editMiddleName").value;
        const newEmail = document.getElementById("editEmail").value;
        const newSection = document.getElementById("editSection").value;

        // Update displayed values
        document.getElementById("studentName").innerHTML = `${newLastName}, ${newFirstName} ${newMiddleName}.`;
        document.getElementById("email").innerHTML = newEmail;
        document.getElementById("studentSection").innerHTML = `<span class="section">BSIT</span> ${newSection}`;

        document.getElementById("editButton").textContent = "Edit Profile";
        isEditing = false;

        // Optional: Send updated data to backend
        const studentNumber = document.getElementById("studentNumber").textContent;
        fetch(`http://192.168.254.150:3000/students/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_number: studentNumber,
                firstname: newFirstName,
                middlename: newMiddleName,
                lastname: newLastName,
                email: newEmail,
                section: newSection
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Update success:", data);
        })
        .catch(err => {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        });
    }
});
