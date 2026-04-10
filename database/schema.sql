-- 🔥 DATABASE SETUP
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LibraryDB')
BEGIN
    CREATE DATABASE LibraryDB;
END
GO

USE LibraryDB;
GO

-- 🔥 CORE TABLES (USER SYSTEM)
-- USERS
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
CREATE TABLE Users( 
    users_id INT PRIMARY KEY IDENTITY(1,1), 
    full_name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'student'
);

-- SUBSCRIPTIONS
IF OBJECT_ID('Subscriptions', 'U') IS NOT NULL DROP TABLE Subscriptions;
CREATE TABLE Subscriptions (
    subscriptions_id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 🔥 USER INTERACTION TABLES
-- FEEDBACK
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

-- FEEDBACK HISTORY
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

-- QUERIES
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

-- 🔥 CONTENT TABLES (BOOK SYSTEM)
-- AUTHORS
IF OBJECT_ID('Authors', 'U') IS NOT NULL DROP TABLE Authors;
CREATE TABLE Authors (
    AuthorID INT PRIMARY KEY IDENTITY(1,1),

    Name NVARCHAR(255) NOT NULL,
    Bio NVARCHAR(MAX),
    Country NVARCHAR(100),

    CreatedAt DATETIME DEFAULT GETDATE()
);

-- AUTHOR ALTERATIONS (kept intact)
ALTER TABLE Authors
ADD Date_of_Birth Date not null;

ALTER TABLE Authors
ADD Date_of_death Date;

ALTER TABLE Authors
ADD Age AS (
    DATEDIFF(YEAR, Date_of_Birth, ISNULL(Date_of_death, GETDATE())) - 
    CASE 
        WHEN DATEADD(YEAR, DATEDIFF(YEAR, Date_of_Birth, ISNULL(Date_of_death, GETDATE())), Date_of_Birth) > ISNULL(Date_of_death, GETDATE()) 
        THEN 1 ELSE 0 
    END
);

ALTER TABLE Authors
DROP COLUMN Age;

ALTER TABLE Authors
ALTER COLUMN Date_of_Birth DATE NULL;


-- BOOKS
IF OBJECT_ID('Books', 'U') IS NOT NULL DROP TABLE Books;
CREATE TABLE Books (
    BookID BIGINT PRIMARY KEY IDENTITY(1,1),

    Title NVARCHAR(255) NOT NULL,
    AuthorID INT NOT NULL,

    Edition NVARCHAR(50),
    ISBN NVARCHAR(50),

    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID)
);


-- LISTINGS
IF OBJECT_ID('Listings', 'U') IS NOT NULL DROP TABLE Listings;
CREATE TABLE Listings (
    ListingID BIGINT PRIMARY KEY IDENTITY(1,1),

    UserID INT NOT NULL,
    BookID BIGINT NOT NULL,

    Condition NVARCHAR(20) NOT NULL 
        CHECK (Condition IN ('new','good','old')),

    IsAvailable BIT DEFAULT 1,

    ApprovalStatus NVARCHAR(20) DEFAULT 'pending'
        CHECK (ApprovalStatus IN ('pending','approved','rejected')),

    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(users_id),
    FOREIGN KEY (BookID) REFERENCES Books(BookID)
);

-- 🔥 REQUEST SYSTEM
IF OBJECT_ID('Requests', 'U') IS NOT NULL DROP TABLE Requests;

CREATE TABLE Requests (
    RequestID BIGINT PRIMARY KEY IDENTITY(1,1),

    BookID BIGINT NOT NULL,
    UserID INT NOT NULL,

    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (UserID) REFERENCES Users(users_id)
);

-- 🔥 TRANSACTION SYSTEM
CREATE TABLE Transactions (
    TransactionID BIGINT PRIMARY KEY IDENTITY(1,1),

    RequestID BIGINT NULL,

    ListingID BIGINT NOT NULL,
    BorrowerID INT NOT NULL,

    StartDate DATETIME NULL,
    DueDate DATETIME NOT NULL,
    ReturnDate DATETIME NULL,

    ConditionBefore NVARCHAR(255),
    ConditionAfter NVARCHAR(255),

    Status NVARCHAR(20) DEFAULT 'active'
        CHECK (Status IN ('active','returned','late','cancelled')),

    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (ListingID) REFERENCES Listings(ListingID),
    FOREIGN KEY (BorrowerID) REFERENCES Users(users_id),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID) ON DELETE SET NULL
);


-- 🔥 INDEXES (PERFORMANCE)
-- CORE INDEXES
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_feedback_user ON Feedback(user_id);
CREATE INDEX idx_queries_user ON Queries(user_id);

-- AUTHOR / BOOK INDEXES
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_authors_name')
CREATE INDEX idx_authors_name ON Authors(Name);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_books_author')
CREATE INDEX idx_books_author ON Books(AuthorID);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_books_title')
CREATE INDEX idx_books_title ON Books(Title);

-- LISTING INDEXES
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_listings_user')
CREATE INDEX idx_listings_user ON Listings(UserID);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_listings_book')
CREATE INDEX idx_listings_book ON Listings(BookID);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_listings_available')
CREATE INDEX idx_listings_available ON Listings(IsAvailable);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_listings_book_available')
CREATE INDEX idx_listings_book_available 
ON Listings(BookID, IsAvailable);

-- TRANSACTION INDEXES
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_transactions_borrower')
CREATE INDEX idx_transactions_borrower ON Transactions(BorrowerID);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_transactions_listing')
CREATE INDEX idx_transactions_listing ON Transactions(ListingID);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_transactions_user_status')
CREATE INDEX idx_transactions_user_status 
ON Transactions(BorrowerID, Status);

CREATE INDEX idx_transactions_request ON Transactions(RequestID);

-- UNIQUE ACTIVE BORROW
CREATE UNIQUE INDEX idx_unique_active_borrow
ON Transactions(ListingID)
WHERE Status = 'active';