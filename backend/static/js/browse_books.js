//ELEMENTS
const container = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");

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

        books.forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";

            card.innerHTML = `
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

        //RESET
        borrowBtn.disabled = false;
        requestBtn.style.display = "none";

        if (data.available) {
            //AVAILABLE
            borrowBtn.innerText = "Borrow Book";
            borrowBtn.style.background = "#10b981";
            borrowBtn.onclick = () => borrowBook(data.listing_id);

        } else {
            //BORROWED
            borrowBtn.style.background = "#ef4444";

            //CHECK OWNER
            if (user && user.user_id === data.borrower_id) {
                // ✅ RETURN BUTTON
                borrowBtn.innerText = "Return Book";
                borrowBtn.disabled = false;
                borrowBtn.onclick = () => returnBook(data.listing_id);

            } else {
                //OTHER USER
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