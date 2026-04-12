// HELPER FUNCTION
function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.user_id || null;
    } catch {
        return null;
    }
}

// LOAD ISSUED BOOKS
async function loadMyBooks(userId = null) {
    try {
        //Get user_id
        if (!userId) {
            const userData = localStorage.getItem("user");

            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    userId = user?.user_id;
                } catch (e) {
                    console.error("Error parsing user data:", e);
                }
            }
        }

        //If still no user → redirect
        if (!userId) {
            alert("Please login first");
            window.location.href = "/login";
            return;
        }

        //Fetch data from backend
        const response = await fetch(`/api/my-books?user_id=${userId}`);

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        const table = document.getElementById("issuedBooksTable");

        // Safety check
        if (!table) return;

        // Clear table
        table.innerHTML = "";

        //Backend error
        if (data.error) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">${data.error}</td>
                </tr>
            `;
            return;
        }

        //No books
        if (!Array.isArray(data) || data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        📚 No books issued yet <br>
                        <small>Start browsing and borrow your first book</small>
                    </td>
                </tr>
            `;
            return;
        }

        //Populate table (optimized)
        let html = "";

        data.forEach(book => {

            const statusClass =
                book.status === "active" ? "status-active" :
                book.status === "returned" ? "status-returned" :
                book.status === "late" ? "status-late" : "";

            html += `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.issue_date}</td>
                    <td>${book.due_date}</td>
                    <td>${book.return_date}</td>
                    <td class="${statusClass}">${book.status}</td>
                </tr>
            `;
        });

        table.innerHTML = html;

    } catch (error) {
        console.error("Error loading books:", error);

        const table = document.getElementById("issuedBooksTable");

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">Something went wrong. Try again.</td>
                </tr>
            `;
        }
    }
}

// LOGOUT FUNCTION
function logoutUser() {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");

    window.location.href = "/login";
}

// LOAD USER INFO
function loadUserInfo() {
    try {
        const userData = localStorage.getItem("user");

        if (!userData) return;

        const user = JSON.parse(userData);

        const userElement = document.getElementById("userName");

        if (userElement && user?.full_name) {
            userElement.innerText = user.full_name;
        }

    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

// AUTO LOAD ON PAGE
document.addEventListener("DOMContentLoaded", () => {

    const path = window.location.pathname;

    if (path === "/my-books") {
        loadMyBooks();
    }

    if (path === "/due-books") {
        loadDueBooks();
    }

    if (path === "/wishlist") {
        loadWishlist();
    }

    loadUserInfo();
});

// LOAD DUE BOOKS
async function loadDueBooks() {
    try {
        const userId = getUserId();

        if (!userId) {
            alert("Please login first");
            window.location.href = "/login";
            return;
        }

        const response = await fetch(`/api/due-books?user_id=${userId}`);

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        const tableWrapper = document.querySelector(".library-table-wrapper");
        const table = document.getElementById("dueBooksTable");
        const message = document.getElementById("dueMessage");

        if (!table || !message || !tableWrapper) return;

        table.innerHTML = "";

        if (data.error) {
            message.innerText = data.error;
            tableWrapper.style.display = "none";
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            message.innerText = "🎉 All your books are on track!";
            tableWrapper.style.display = "none";
            return;
        }

        message.innerText = "⚠️ You have overdue books";
        tableWrapper.style.display = "block";

        let html = "";

        data.forEach(book => {
            html += `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td class="due-late">${book.due_date}</td>
                    <td class="status-late">Overdue</td>
                </tr>
            `;
        });

        table.innerHTML = html;

    } catch (error) {
        console.error("Error loading due books:", error);
    }
}
// =========================
// ❤️ ADD / REMOVE (TOGGLE)
// =========================
async function toggleWishlist(event, bookId) {
    event.stopPropagation();

    const userId = getUserId();

    if (!userId) {
        alert("Login required");
        return;
    }

    const heart = event.currentTarget;

    try {
        if (heart.classList.contains("liked")) {

            // ❌ REMOVE FROM WISHLIST
            await fetch("/api/wishlist/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    book_id: bookId
                })
            });

            // UI UPDATE → 🤍
            heart.classList.remove("liked");

        } else {

            // ❤️ ADD TO WISHLIST
            await fetch("/api/wishlist/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    book_id: bookId
                })
            });

            // UI UPDATE → ❤️
            heart.classList.add("liked");
        }

    } catch (error) {
        console.error("Wishlist error:", error);
    }
}


// =========================
// 📚 LOAD WISHLIST PAGE
// =========================
async function loadWishlist() {
    try {
        const userId = getUserId();

        if (!userId) {
            alert("Please login first");
            window.location.href = "/login";
            return;
        }

        const response = await fetch(`/api/wishlist?user_id=${userId}`);

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        const container = document.getElementById("wishlistContainer");
        const count = document.getElementById("wishlistCount");

        if (!container) return;

        container.innerHTML = "";

        // ❌ EMPTY STATE
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    ❤️ No favorites yet <br>
                    <small>Start browsing and add books to your wishlist</small>
                </div>
            `;
            if (count) count.innerText = "";
            return;
        }

        // ✅ COUNT DISPLAY
        if (count) {
            count.innerText = `${data.length} books saved`;
        }

        // 📚 RENDER BOOK CARDS
        data.forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";

            card.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn || "N/A"}</p>

                <button class="remove-btn" onclick="removeFromWishlist(${book.book_id})">
                    Remove ❤️
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading wishlist:", error);

        const container = document.getElementById("wishlistContainer");

        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    ⚠️ Failed to load wishlist
                </div>
            `;
        }
    }
}


// =========================
// ❌ REMOVE FROM WISHLIST
// =========================
async function removeFromWishlist(bookId) {
    const userId = getUserId();

    if (!userId) return;

    try {
        await fetch("/api/wishlist/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                book_id: bookId
            })
        });

        // 🔄 REFRESH LIST AFTER REMOVE
        loadWishlist();

    } catch (error) {
        console.error("Remove wishlist error:", error);
    }
}