-- 🔥 CREATE DATABASE
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LibraryDB')
BEGIN
    CREATE DATABASE LibraryDB;
END
GO

USE LibraryDB;
GO

-- 🔥 USERS TABLE
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
CREATE TABLE Users( 
    users_id INT PRIMARY KEY IDENTITY(1,1), 
    full_name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'student'
);

-- 🔥 FEEDBACK TABLE
IF OBJECT_ID('Feedback', 'U') IS NOT NULL DROP TABLE Feedback;
CREATE TABLE Feedback (
    feedback_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES Users(users_id)
    ON DELETE CASCADE
);

-- 🔥 FEEDBACK HISTORY
IF OBJECT_ID('FeedbackHistory', 'U') IS NOT NULL DROP TABLE FeedbackHistory;
CREATE TABLE FeedbackHistory (
    feedbackHistory_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    rating INT,
    comment TEXT,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES Users(users_id)
    ON DELETE CASCADE
);

-- 🔥 QUERIES TABLE
IF OBJECT_ID('Queries', 'U') IS NOT NULL DROP TABLE Queries;
CREATE TABLE Queries (
    query_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES Users(users_id)
    ON DELETE CASCADE
);

-- 🔥 SUBSCRIPTIONS
IF OBJECT_ID('Subscriptions', 'U') IS NOT NULL DROP TABLE Subscriptions;
CREATE TABLE Subscriptions (
    subscriptions_id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 🔥 INDEXES (PERFORMANCE BOOST)
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_feedback_user ON Feedback(user_id);
CREATE INDEX idx_queries_user ON Queries(user_id);

-- 🔥 SAMPLE DATA (OPTIONAL TEST)
INSERT INTO Users (full_name, email, password)
VALUES 
('Test User', 'test@example.com', '1234');

SELECT * FROM Users;