//UI LOGIC
document.addEventListener("DOMContentLoaded", () => {

    //NAV TOGGLE
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    //CHART (SAFE LOAD)
    const ctx = document.getElementById('libraryChart');
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2021', '2022', '2023', '2024', '2025'],
                datasets: [{
                    data: [4000, 6000, 8500, 10000, 12000],
                    tension: 0.4
                }]
            }
        });
    }
});

/*PROFILE DROPDOWN MENU*/
(function () {
    // Wait until full page is loaded (safe for all cases)
    window.addEventListener("load", () => {

        const profileMenu = document.querySelector('.profile-menu');
        const profileTrigger = document.querySelector('.profile-trigger');
        const profileDropdown = document.querySelector('.profile-dropdown');

        //Safety check
        if (!profileMenu || !profileTrigger || !profileDropdown) {
            console.error("❌ Profile menu elements not found");
            return;
        }

        //Toggle dropdown on click
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        //Prevent closing when clicking inside dropdown
        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        //Close dropdown when clicking anywhere outside
        document.addEventListener('click', () => {
            profileMenu.classList.remove('active');
        });

        //Optional: Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                profileMenu.classList.remove('active');
            }
        });

    });
})();
//SIGNUP FUNCTION
async function signupUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const res = await fetch("http://127.0.0.1:5000/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      full_name: name,
      email: email,
      password: pass
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Signup successful!");
    window.location.href = "login.html";
  } else {
    alert(data.error);
  }

  return false;
}
//LOGIN FUNCTION
async function loginUser() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("user", JSON.stringify(data));
    window.location.href = "index.html";
  } else {
    alert(data.error);
  }

  return false;
}