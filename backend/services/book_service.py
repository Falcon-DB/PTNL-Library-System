from db import get_connection

def add_book_service(data, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        title = data.get("title")
        edition = data.get("edition")
        isbn = data.get("isbn")
        condition = data.get("condition")

        author_id = data.get("author_id")
        author_name = data.get("author_name")

        #AUTHOR LOGIC (CLEAN)
        if not author_id:
            if not author_name:
                return {"error": "Author is required"}

            # Check if author already exists
            cursor.execute("SELECT AuthorID FROM Authors WHERE Name = ?", (author_name,))
            author = cursor.fetchone()

            if author:
                author_id = author[0]
            else:
                cursor.execute(
                    "INSERT INTO Authors (Name) OUTPUT INSERTED.AuthorID VALUES (?)",
                    (author_name,)
                )
                author_id = cursor.fetchone()[0]

        #Insert Book
        cursor.execute(
            """
            INSERT INTO Books (Title, AuthorID, Edition, ISBN)
            OUTPUT INSERTED.BookID
            VALUES (?, ?, ?, ?)
            """,
            (title, author_id, edition, isbn)
        )
        book_id = cursor.fetchone()[0]

        #Insert Listing
        cursor.execute(
            """
            INSERT INTO Listings (UserID, BookID, Condition)
            VALUES (?, ?, ?)
            """,
            (user_id, book_id, condition)
        )

        conn.commit()
        return {"message": "Book added successfully"}

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()