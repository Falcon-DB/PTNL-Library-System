from db import get_connection

def add_subscription(email):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO Subscriptions (email) VALUES (?)",
            (email,)
        )
        conn.commit()
        return True
    except Exception as e:
        print("Subscription Error:", e)
        return False