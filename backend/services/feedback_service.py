from db import get_connection

def submit_feedback(user_id, rating, comment):
    conn = get_connection()

    if not conn:
        return False

    cursor = conn.cursor()

    try:
        if not user_id or not rating:
            return False

        rating = int(rating)

        if rating < 1 or rating > 5:
            return False
        cursor.execute(
            "SELECT rating, comment FROM Feedback WHERE user_id = ?",
            (user_id,)
        )
        existing = cursor.fetchone()

        if existing:
            old_rating, old_comment = existing
            cursor.execute(
                """
                INSERT INTO FeedbackHistory (user_id, rating, comment)
                VALUES (?, ?, ?)
                """,
                (user_id, old_rating, old_comment)
            )
            cursor.execute(
                """
                UPDATE Feedback
                SET rating = ?, comment = ?, updated_at = GETDATE()
                WHERE user_id = ?
                """,
                (rating, comment, user_id)
            )

        else:
            cursor.execute(
                """
                INSERT INTO Feedback (user_id, rating, comment)
                VALUES (?, ?, ?)
                """,
                (user_id, rating, comment)
            )

        conn.commit()
        return True

    except Exception as e:
        print("Feedback Error:", e)
        conn.rollback()
        return False

    finally:
        cursor.close()
        conn.close()