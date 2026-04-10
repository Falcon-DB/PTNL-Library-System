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
            console.error("Profile menu elements not found");
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
  console.log("Signup clicked");
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (pass !== confirm) {
    alert("Passwords do not match");
    return false;
  }

  try {
    const res = await fetch("/api/auth/signup", {
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
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } else {
      alert(data.error || "Signup failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }

  return false;
}
//LOGIN FUNCTION
async function loginUser() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "/home";
    } else {
      alert(data.error);
    }

  } catch (err) {
    alert("Server not reachable");
  }

  return false;
}
//logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}
//Quary function
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("sendQueryBtn");

  if (!btn) return;

  btn.addEventListener("click", async function(e) {
    e.preventDefault();

    const message = document.querySelector("textarea").value;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    if (!message.trim()) {
      alert("Message cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.user_id,
          message: message
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Message sent successfully!");
        document.querySelector("textarea").value = "";
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
});
document.getElementById("sendQueryBtn").addEventListener("click", function(e) {
  e.preventDefault();
  sendQuery();
});
//Subscription function
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("subscribeForm");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("subscribeEmail").value;

    if (!email) {
      alert("Enter email");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Subscribed successfully!");
        form.reset();
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });

});
//feedback function
//LOAD CHECK
console.log("JS LOADED ✅");

document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM READY ✅");

  //STAR RATING SYSTEM
  const stars = document.querySelectorAll("#stars i");
  const ratingInput = document.getElementById("rating");

  console.log("Stars found:", stars.length);
  console.log("Rating input:", ratingInput);

  let selectedRating = 0;

  if (stars.length > 0 && ratingInput) {

    stars.forEach((star, index) => {

      //CLICK
      star.addEventListener("click", () => {
        selectedRating = index + 1;
        ratingInput.value = selectedRating;

        updateStars(selectedRating);

        console.log("Selected Rating:", selectedRating);
      });

      //HOVER EFFECT
      star.addEventListener("mouseover", () => {
        updateStars(index + 1);
      });

      star.addEventListener("mouseout", () => {
        updateStars(selectedRating);
      });

    });

    function updateStars(count) {
      stars.forEach((star, i) => {
        if (i < count) {
          star.classList.add("active");
        } else {
          star.classList.remove("active");
        }
      });
    }

  } else {
    console.log("Stars or rating input NOT found ❌");
  }

  //FEEDBACK SUBMIT
  const form = document.getElementById("feedbackForm");
  console.log("Form found:", form);

  if (form) {

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("FORM SUBMIT TRIGGERED");

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const rating = document.getElementById("rating")?.value;
      const comment = document.getElementById("comment")?.value;

      console.log("DATA:", rating, comment);

      if (!rating || rating === "0") {
        alert("Please select a rating");
        return;
      }

      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: user.user_id,
            rating: rating,
            comment: comment
          })
        });

        const data = await res.json();
        console.log("RESPONSE:", data);

        if (res.ok) {
          alert("Feedback submitted successfully!");

          // RESET
          form.reset();
          selectedRating = 0;
          ratingInput.value = "0";

          // Reset stars
          stars.forEach(star => star.classList.remove("active"));

        } else {
          alert(data.error || "Failed to submit feedback");
        }

      } catch (err) {
        console.error("ERROR:", err);
        alert("Server error");
      }

    });

  } else {
    console.log("Form NOT found ❌");
  }

});

//LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}