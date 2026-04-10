import pyodbc

def get_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost\\SQLEXPRESS;"
            "DATABASE=LibraryDB;"
            "Trusted_Connection=yes;"
        )
        return conn
    except Exception as e:
        print("DB ERROR:", e)
        return None