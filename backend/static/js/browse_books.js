//ELEMENTS
const container = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");

// 🔥 HELPER (ADDED)
function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.user_id || null;
    } catch {
        return null;
    }
}

//LOAD BOOKS
async function loadBooks(query = "") {
    try {
        const res = await fetch(`/api/browse-books?search=${encodeURIComponent(query)}`);

        if (!res.ok) {
            throw new Error("Failed to fetch books");
        }

        const books = await res.json();

        container.innerHTML = "";

        if (!books || books.length === 0) {
            container.innerHTML = "<p>No books found</p>";
            return;
        }

        // 🔥 FETCH WISHLIST ONCE (ADDED)
        let wishlistIds = [];
        const userId = getUserId();

        if (userId) {
            try {
                const resWish = await fetch(`/api/wishlist?user_id=${userId}`);
                const wishlist = await resWish.json();
                wishlistIds = wishlist.map(b => b.book_id);
            } catch (e) {
                console.error("Wishlist fetch error:", e);
            }
        }

        books.forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";

            // 🔥 CHECK IF IN WISHLIST (ADDED)
            const isLiked = wishlistIds.includes(book.book_id);

            card.innerHTML = `
    <span 
        class="heart-icon ${isLiked ? "liked" : ""}" 
        onclick="toggleWishlist(event, ${book.book_id})"
    >
        <svg viewBox="0 0 24 24" class="heart-svg">
            <path d="M12 21s-6.5-4.35-10-8.28C-1.5 8.4 1.5 3 6.5 3c2.54 0 4.04 1.5 5.5 3C13.46 4.5 14.96 3 17.5 3 22.5 3 25.5 8.4 22 12.72 18.5 16.65 12 21 12 21z"/>
        </svg>
    </span>

    <h3>${book.title}</h3>
    <p><strong>Author:</strong> ${book.author}</p>
    <p><strong>ISBN:</strong> ${book.isbn || "N/A"}</p>

    <p style="color:#3b82f6; font-size:13px;">Click to view details →</p>
`;

            //CLICK HANDLER
            card.onclick = () => openBookDetails(book.book_id);

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading books:", err);
        container.innerHTML = "<p style='color:red;'>Error loading books</p>";
    }
}

//SEARCH BUTTON
function searchBooks() {
    const query = searchInput.value.trim();
    loadBooks(query);
}

//LIVE SEARCH (DEBOUNCE)
let timeout = null;

searchInput.addEventListener("input", function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        loadBooks(this.value.trim());
    }, 400);
});

//INITIAL LOAD
loadBooks();

//FETCH BOOK DETAILS (MODAL)
async function openBookDetails(bookId) {
    try {
        const res = await fetch(`/api/book-details/${bookId}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to fetch details");
        }

        document.getElementById("modalTitle").innerText = "Book Details";
        document.getElementById("modalOwner").innerText = "Owner: " + data.owner;
        document.getElementById("modalCondition").innerText = "Condition: " + data.condition;

        const borrowBtn = document.getElementById("borrowBtn");
        const requestBtn = document.getElementById("requestBtn");

        const user = JSON.parse(localStorage.getItem("user"));

        borrowBtn.disabled = false;
        requestBtn.style.display = "none";
        // SYNC HEART
        try {
            if (wishlistBtn && user && user.user_id) {
                const wishlist = await resWish.json();

                const exists = wishlist.some(b => b.book_id === data.book_id);

                if (exists) {
                    wishlistBtn.classList.add("liked");
                }
            }
        } catch (e) {
            console.error("Wishlist sync error:", e);
        }

        if (data.available) {
            borrowBtn.innerText = "Borrow Book";
            borrowBtn.style.background = "#10b981";
            borrowBtn.onclick = () => borrowBook(data.listing_id);

        } else {
            borrowBtn.style.background = "#ef4444";

            if (user && user.user_id === data.borrower_id) {
                borrowBtn.innerText = "Return Book";
                borrowBtn.disabled = false;
                borrowBtn.onclick = () => returnBook(data.listing_id);

            } else {
                borrowBtn.innerText = "Borrowed";
                borrowBtn.disabled = true;

                requestBtn.style.display = "inline-block";
                requestBtn.innerText = "Request Book";
                requestBtn.style.background = "#f59e0b";
                requestBtn.onclick = () => requestBook(data.book_id);
            }
        }

        document.getElementById("bookModal").classList.remove("hidden");

    } catch (err) {
        console.error("Error loading details:", err);
        alert("Failed to load book details");
    }
}

//CLOSE MODAL
function closeModal() {
    document.getElementById("bookModal").classList.add("hidden");
}

//CLOSE MODAL ON OUTSIDE CLICK
window.onclick = function (event) {
    const modal = document.getElementById("bookModal");
    if (event.target === modal) {
        closeModal();
    }
};

//BORROW BOOK
async function borrowBook(listingId) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.user_id) {
        alert("Please login first");
        return;
    }

    try {
        const res = await fetch("/api/borrow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                listing_id: listingId,
                user_id: user.user_id
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Book borrowed successfully!");
            closeModal();
            loadBooks();
        } else {
            alert(data.error || "Failed to borrow book");
        }

    } catch (err) {
        console.error("Borrow error:", err);
        alert("Server error while borrowing");
    }
}

//REQUEST BOOK
async function requestBook(bookId) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.user_id) {
        alert("Login required");
        return;
    }

    try {
        const res = await fetch("/api/request-book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                book_id: bookId,
                user_id: user.user_id
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Request submitted!");
        } else {
            alert(data.error || "Request failed");
        }

    } catch (err) {
        console.error("Request error:", err);
        alert("Server error while requesting");
    }
}

//RETURN BOOK
async function returnBook(listingId) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.user_id) {
        alert("Login required");
        return;
    }

    try {
        const res = await fetch("/api/return-book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                listing_id: listingId,
                user_id: user.user_id
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Book returned successfully!");
            closeModal();
            loadBooks();
        } else {
            alert(data.error || "Return failed");
        }

    } catch (err) {
        console.error("Return error:", err);
        alert("Server error while returning");
    }
}