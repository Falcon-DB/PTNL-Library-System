from db import get_connection

def create_query(user_id, message):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO Queries (user_id, message)
            VALUES (?, ?)
            """,
            (user_id, message)
        )
        conn.commit()
        return True
    except Exception as e:
        print("Query Error:", e)
        return False