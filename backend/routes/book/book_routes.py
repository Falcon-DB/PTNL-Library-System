from flask import Blueprint, request, jsonify
from db import get_connection
from services.book_service import add_book_service

book_bp = Blueprint("book", __name__)

#ADD BOOK
@book_bp.route("/api/add-book", methods=["POST"])
def add_book():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    result = add_book_service(data, user_id)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)

#GET AUTHORS
@book_bp.route("/api/authors", methods=["GET"])
def get_authors():
    conn = get_connection()

    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()

    try:
        cursor.execute("SELECT AuthorID, Name FROM Authors ORDER BY Name")

        authors = [
            {"AuthorID": row[0], "Name": row[1]}
            for row in cursor.fetchall()
        ]

        return jsonify(authors)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#BROWSE BOOKS
@book_bp.route("/api/browse-books", methods=["GET"])
def browse_books():
    search = request.args.get("search", "")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            B.BookID,
            B.Title,
            A.Name,
            B.ISBN
        FROM Listings L
        JOIN Books B ON L.BookID = B.BookID
        JOIN Authors A ON B.AuthorID = A.AuthorID
        WHERE L.ApprovalStatus = 'approved'
        AND (
            B.Title LIKE ? OR
            A.Name LIKE ? OR
            B.ISBN LIKE ?
        )
        """

        param = f"%{search}%"

        cursor.execute(query, (param, param, param))

        books = [
            {
                "book_id": row[0],
                "title": row[1],
                "author": row[2],
                "isbn": row[3]
            }
            for row in cursor.fetchall()
        ]

        return jsonify(books)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#BOOK DETAILS
@book_bp.route("/api/book-details/<int:book_id>", methods=["GET"])
def book_details(book_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT TOP 1
            L.ListingID,
            L.IsAvailable,
            U.full_name,
            L.Condition,
            T.BorrowerID
        FROM Listings L
        JOIN Users U ON L.UserID = U.users_id
        LEFT JOIN Transactions T 
            ON L.ListingID = T.ListingID AND T.Status = 'active'
        WHERE L.BookID = ? 
        AND L.ApprovalStatus = 'approved'
        ORDER BY L.CreatedAt DESC
        """

        cursor.execute(query, (book_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Book not found"}), 404

        return jsonify({
            "listing_id": row[0],
            "available": bool(row[1]),
            "owner": row[2],
            "condition": row[3],
            "borrower_id": row[4],
            "book_id": book_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#BORROW BOOK
@book_bp.route("/api/borrow", methods=["POST"])
def borrow_book():
    data = request.get_json()

    listing_id = data.get("listing_id")
    borrower_id = data.get("user_id")

    if not listing_id or not borrower_id:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        #Check availability
        cursor.execute(
            "SELECT IsAvailable, Condition FROM Listings WHERE ListingID = ?",
            (listing_id,)
        )
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Listing not found"}), 404

        if row[0] == 0:
            return jsonify({"error": "Book already borrowed"}), 400

        condition_before = row[1]

        #Insert transaction
        cursor.execute("""
        INSERT INTO Transactions (
            RequestID, ListingID, BorrowerID,
            StartDate, DueDate, ConditionBefore
        )
        VALUES (?, ?, ?, GETDATE(), DATEADD(DAY, 60, GETDATE()), ?)
        """, (None, listing_id, borrower_id, condition_before))

        #Safe update (prevents race condition)
        cursor.execute("""
        UPDATE Listings 
        SET IsAvailable = 0 
        WHERE ListingID = ? AND IsAvailable = 1
        """, (listing_id,))

        if cursor.rowcount == 0:
            conn.rollback()
            return jsonify({"error": "Already borrowed"}), 400

        conn.commit()
        return jsonify({"message": "Book borrowed successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#REQUEST BOOK
@book_bp.route("/api/request-book", methods=["POST"])
def request_book():
    data = request.get_json()

    book_id = data.get("book_id")
    user_id = data.get("user_id")

    if not book_id or not user_id:
        return jsonify({"error": "Missing data"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        #Prevent duplicate requests
        cursor.execute("""
        SELECT 1 FROM Requests 
        WHERE BookID = ? AND UserID = ?
        """, (book_id, user_id))

        if cursor.fetchone():
            return jsonify({"error": "Already requested"}), 400

        #Insert request
        cursor.execute("""
        INSERT INTO Requests (BookID, UserID)
        OUTPUT INSERTED.RequestID
        VALUES (?, ?)
        """, (book_id, user_id))

        request_id = cursor.fetchone()[0]

        conn.commit()

        return jsonify({
            "message": "Request submitted",
            "request_id": request_id
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#RETURN BOOK
@book_bp.route("/api/return-book", methods=["POST"])
def return_book():
    data = request.get_json()

    listing_id = data.get("listing_id")
    user_id = data.get("user_id")

    if not listing_id or not user_id:
        return jsonify({"error": "Missing data"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        #Check active transaction
        cursor.execute("""
        SELECT TransactionID, BorrowerID 
        FROM Transactions 
        WHERE ListingID = ? AND Status = 'active'
        """, (listing_id,))

        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "No active transaction"}), 400

        if row[1] != user_id:
            return jsonify({"error": "Unauthorized return"}), 403

        transaction_id = row[0]

        #Update transaction
        cursor.execute("""
        UPDATE Transactions
        SET Status = 'returned',
            ReturnDate = GETDATE()
        WHERE TransactionID = ?
        """, (transaction_id,))

        #Update listing
        cursor.execute("""
        UPDATE Listings
        SET IsAvailable = 1
        WHERE ListingID = ?
        """, (listing_id,))

        conn.commit()
        return jsonify({"message": "Book returned successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
#Add-wishlist
@book_bp.route("/api/wishlist/add", methods=["POST"])
def add_to_wishlist():
    data = request.get_json()
    user_id = data.get("user_id")
    book_id = data.get("book_id")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO Wishlist (UserID, BookID)
        VALUES (?, ?)
        """, (user_id, book_id))

        conn.commit()
        return jsonify({"message": "Added to wishlist"})

    except:
        return jsonify({"error": "Already in wishlist"}), 400

    finally:
        cursor.close()
        conn.close()

#Remove from wishlist
@book_bp.route("/api/wishlist/remove", methods=["POST"])
def remove_from_wishlist():
    data = request.get_json()

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        DELETE FROM Wishlist
        WHERE UserID = ? AND BookID = ?
        """, (data["user_id"], data["book_id"]))

        conn.commit()
        return jsonify({"message": "Removed"})

    finally:
        cursor.close()
        conn.close()

#Get wishlist
@book_bp.route("/api/wishlist", methods=["GET"])
def get_wishlist():
    user_id = request.args.get("user_id")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        SELECT B.BookID, B.Title, A.Name, B.ISBN
        FROM Wishlist W
        JOIN Books B ON W.BookID = B.BookID
        JOIN Authors A ON B.AuthorID = A.AuthorID
        WHERE W.UserID = ?
        """, (user_id,))

        return jsonify([
            {
                "book_id": row[0],
                "title": row[1],
                "author": row[2],
                "isbn": row[3]
            }
            for row in cursor.fetchall()
        ])

    finally:
        cursor.close()
        conn.close()