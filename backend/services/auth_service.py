from db import get_connection

# 🔥 SIGNUP
def create_user(data):
    conn = get_connection()
    if not conn:
        return None

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO Users (full_name, email, password)
            VALUES (?, ?, ?)
            """,
            (data["full_name"], data["email"], data["password"])
        )
        conn.commit()
        return True

    except Exception as e:
        print("Signup Error:", e)
        return None


# 🔥 LOGIN
def login_user(email, password):
    conn = get_connection()
    if not conn:
        return None

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT users_id, full_name, email, role
        FROM Users
        WHERE email = ? AND password = ?
        """,
        (email, password)
    )

    row = cursor.fetchone()

    if row:
        return {
            "user_id": row[0],
            "full_name": row[1],
            "email": row[2],
            "role": row[3]
        }

    return None