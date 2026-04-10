//ELEMENTS
const form = document.getElementById("addBookForm");
const message = document.getElementById("message");
const submitBtn = form.querySelector(".btn");

//FORM SUBMIT
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    message.innerText = "";
    message.className = "message";

    const selected = document.getElementById("authorSelect").value;
    const manual = document.getElementById("authorInput").value.trim();
    const user = JSON.parse(localStorage.getItem("user"));

    //USER CHECK
    if (!user || !user.user_id) {
        message.innerText = "Please login first";
        message.classList.add("error");
        return;
    }

    const data = {
        title: document.getElementById("title").value.trim(),
        edition: document.getElementById("edition").value.trim(),
        isbn: document.getElementById("isbn").value.trim(),
        condition: document.getElementById("condition").value,

        //AUTHOR LOGIC
        author_id: selected !== "other" ? selected : null,
        author_name: selected === "other" ? manual : null,

        user_id: user.user_id
    };

    //VALIDATION
    if (!data.title) {
        message.innerText = "Title is required";
        message.classList.add("error");
        return;
    }

    if (!data.condition) {
        message.innerText = "Please select book condition";
        message.classList.add("error");
        return;
    }

    if (!data.author_id && !data.author_name) {
        message.innerText = "Please select or enter an author";
        message.classList.add("error");
        return;
    }

    //LOADING STATE
    submitBtn.innerText = "Adding Book...";
    submitBtn.disabled = true;

    try {
        const res = await fetch("/api/add-book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            message.innerText = "✅ Book added successfully!";
            message.classList.add("success");

            form.reset();

            //RESET AUTHOR INPUT
            document.getElementById("authorInput").style.display = "none";

        } else {
            message.innerText = result.error || "Failed to add book";
            message.classList.add("error");
        }

    } catch (err) {
        console.error(err);
        message.innerText = "Server error";
        message.classList.add("error");
    } finally {
        //RESET BUTTON
        submitBtn.innerText = "Add Book";
        submitBtn.disabled = false;
    }
});


//LOAD AUTHORS
async function loadAuthors() {
    try {
        const res = await fetch("/api/authors");

        if (!res.ok) {
            throw new Error("Failed to fetch authors");
        }

        const authors = await res.json();

        const select = document.getElementById("authorSelect");

        //CLEAR EXISTING (SAFETY)
        select.innerHTML = `<option value="">Select Author</option>`;

        authors.forEach(author => {
            const option = document.createElement("option");
            option.value = author.AuthorID;
            option.textContent = author.Name;
            select.appendChild(option);
        });

        //ADD OTHER OPTION
        const other = document.createElement("option");
        other.value = "other";
        other.textContent = "Other...";
        select.appendChild(other);

    } catch (err) {
        console.error("Failed to load authors:", err);
    }
}

//INIT LOAD
loadAuthors();


//HANDLE "OTHER" AUTHOR INPUT
document.getElementById("authorSelect").addEventListener("change", function () {
    const input = document.getElementById("authorInput");

    if (this.value === "other") {
        input.style.display = "block";
        input.focus(); //UX improvement
    } else {
        input.style.display = "none";
        input.value = ""; //clear input
    }
});