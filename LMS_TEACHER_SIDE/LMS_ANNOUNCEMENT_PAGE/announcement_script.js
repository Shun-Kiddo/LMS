 // Sidebar Toggle
      function myFunction(x) {
      x.classList.toggle("change");
      sidebar.classList.toggle('active');
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
     
      document.getElementById("announcementForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const response = await fetch("http://192.168.254.150:3000/announcements", {
          method: "POST",
          body: formData
        });

        try {
          const result = await response.json();
          alert(result.message);
          if (response.ok) {
            form.reset();
            fetchAnnouncements();
          }
        } catch (err) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          alert("Something went wrong. Check the console for details.");
        }
      });

    async function fetchAnnouncements() {
    try{
      const response = await fetch("http://192.168.254.150:3000/announcements");
      const announcements = await response.json();

      const list = document.getElementById("AnnouncementList");
      list.innerHTML = "";

      announcements.forEach(announcement => {
        const time = new Date(announcement.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const date = new Date(announcement.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const { id, title, content, attachment} = announcement;

        list.innerHTML += `
          <div class="announcement_item">
            <p class="time">${date} - ( ${time} )</p>
            <h3 class="title">${title}</h3>
            <p>${content}</p>
            <div class="lesson-actions">
            ${attachment ? `<a class="viewAttachment" href="http://192.168.254.150:3000${attachment}" target="_blank">View Attachment</a>` : ""}
            <button class="delete-btn" onclick="deleteAnnouncement(${id})">Delete</button>
            <button class="edit-btn" onclick="editAnnouncement(${id})">Update</button>
            </div>
          </div>`;
      });
    } catch (err) {
            console.error("Error fetching activities:", err);
        }
    }
    
    // to Delete announcement
    async function deleteAnnouncement(id) {
      if (!confirm("Are you sure you want to delete")) return;
      const res = await fetch(`http://192.168.254.150:3000/announcements/${id}`, { method: "DELETE" });
      if (res.ok)fetchAnnouncements();
    }

    // to Edit announcement
    async function editAnnouncement(id) {
      const title = prompt("Enter new title:");
      const content = prompt("Enter new content:");
      if (!title || !content) return alert("Title and content are required!");

      const res = await fetch(`http://192.168.254.150:3000/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      const result = await res.json();
      alert(result.message);
      fetchAnnouncements();
    }
fetchAnnouncements();
