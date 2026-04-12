from db import get_connection

# GET USER BOOKS
def get_user_books(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            B.Title,
            A.Name,
            T.StartDate,
            T.DueDate,
            T.ReturnDate,
            T.Status
        FROM Transactions T
        JOIN Listings L ON T.ListingID = L.ListingID
        JOIN Books B ON L.BookID = B.BookID
        JOIN Authors A ON B.AuthorID = A.AuthorID
        WHERE T.BorrowerID = ?
        ORDER BY T.CreatedAt DESC
        """

        cursor.execute(query, (user_id,))

        books = []
        for row in cursor.fetchall():
            books.append({
                "title": row[0],
                "author": row[1],
                "issue_date": str(row[2]),
                "due_date": str(row[3]),
                "return_date": str(row[4]) if row[4] else "Not Returned",
                "status": row[5]
            })

        return books

    except Exception as e:
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()

# DUE DATE PAGE
def get_overdue_books(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            B.Title,
            A.Name,
            T.DueDate,
            T.ReturnDate,
            T.Status
        FROM Transactions T
        JOIN Listings L ON T.ListingID = L.ListingID
        JOIN Books B ON L.BookID = B.BookID
        JOIN Authors A ON B.AuthorID = A.AuthorID
        WHERE T.BorrowerID = ?
          AND T.Status = 'active'
          AND T.DueDate < GETDATE()
        ORDER BY T.DueDate ASC
        """

        cursor.execute(query, (user_id,))

        books = []
        for row in cursor.fetchall():
            books.append({
                "title": row[0],
                "author": row[1],
                "due_date": str(row[2]),
                "return_date": str(row[3]) if row[3] else "Not Returned",
                "status": row[4]
            })

        return books

    except Exception as e:
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()

# GET USER ID HELPER
def get_user_id_from_session(session):
    return session.get("user_id")

# ADD TO WISHLIST
def add_to_wishlist(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT WishlistID FROM Wishlist
            WHERE UserID = ? AND BookID = ?
        """, (user_id, book_id))

        existing = cursor.fetchone()

        if existing:
            return {"message": "Already in wishlist"}

        # Insert into Wishlist
        cursor.execute("""
            INSERT INTO Wishlist (UserID, BookID)
            OUTPUT INSERTED.WishlistID
            VALUES (?, ?)
        """, (user_id, book_id))

        wishlist_id = cursor.fetchone()[0]

        # Insert into History
        cursor.execute("""
            INSERT INTO Wishlist_History (WishlistID, users_id, BookID, action)
            VALUES (?, ?, ?, 'added')
        """, (wishlist_id, user_id, book_id))

        conn.commit()
        return {"message": "Book added to wishlist"}

    except Exception as e:
        print("ADD ERROR:", e)
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()

# REMOVE FROM WISHLIST
def remove_from_wishlist(user_id, book_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Get WishlistID BEFORE delete
        cursor.execute("""
            SELECT WishlistID FROM Wishlist
            WHERE UserID = ? AND BookID = ?
        """, (user_id, book_id))

        row = cursor.fetchone()
        wishlist_id = row[0] if row else None

        if not wishlist_id:
            return {"message": "Item not found in wishlist"}

        # Delete from Wishlist
        cursor.execute("""
            DELETE FROM Wishlist
            WHERE UserID = ? AND BookID = ?
        """, (user_id, book_id))

        # Insert into History
        cursor.execute("""
            INSERT INTO Wishlist_History (WishlistID, users_id, BookID, action)
            VALUES (?, ?, ?, 'removed')
        """, (wishlist_id, user_id, book_id))

        conn.commit()
        return {"message": "Book removed from wishlist"}

    except Exception as e:
        print("REMOVE ERROR:", e)
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()

# GET CURRENT WISHLIST
def get_wishlist(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT 
                b.BookID,
                b.Title,
                a.Name AS Author,
                b.ISBN
            FROM Wishlist w
            JOIN Books b ON w.BookID = b.BookID
            JOIN Authors a ON b.AuthorID = a.AuthorID
            WHERE w.UserID = ?
            ORDER BY w.CreatedAt DESC
        """, (user_id,))

        rows = cursor.fetchall()

        wishlist = []
        for row in rows:
            wishlist.append({
                "book_id": row[0],
                "title": row[1],
                "author": row[2],
                "isbn": row[3]
            })

        return wishlist

    except Exception as e:
        print("GET WISHLIST ERROR:", e)
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()