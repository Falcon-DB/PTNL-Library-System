-- 🔥 DATABASE CONTEXT
USE LibraryDB;

-- 🔥 INITIAL ADMIN USER
INSERT INTO Users (full_name, email, password, role)
VALUES (
    'Frosty Falcon',
    'frostyfalcon.db@gmail.com',
    'bv9@5xxXxx',
    'admin'
);

-- 🔥 BASIC DEBUG QUERIES
SELECT * FROM Users;
SELECT * FROM Books;
SELECT * FROM Authors;
SELECT * FROM Queries;
SELECT * FROM Listings;
SELECT * FROM Subscriptions;
SELECT * FROM Feedback;
SELECT * FROM Transactions;
SELECT * FROM Requests;

-- 🔥 CLEANUP / RESET OPERATIONS
TRUNCATE TABLE Transactions;

UPDATE Listings 
SET ApprovalStatus = 'approved' 
WHERE UserID = 1;

-- 🔥 BULK USER INSERT
INSERT INTO Users (full_name, email, password, role) VALUES
('Arjun Sharma', 'arjun.s@email.com', 'Pass123!', 'student'),
('Sana Khan', 'sana.k@email.com', 'Pass123!', 'student'),
('Liam O''Connor', 'liam.oc@email.com', 'Pass123!', 'student'),
('Aisha Patel', 'aisha.p@email.com', 'Pass123!', 'student'),
('Chen Wei', 'chen.w@email.com', 'Pass123!', 'student');

-- 🔥 INITIAL AUTHORS
INSERT INTO Authors (Name, Bio, Country, Date_of_Birth, Date_of_death) VALUES
('J.K. Rowling', 'British author, best known for Harry Potter.', 'UK', '1965-07-31', NULL),
('George R.R. Martin', 'American novelist and short story writer.', 'USA', '1948-09-20', NULL),
('Fyodor Dostoevsky', 'Russian novelist and philosopher.', 'Russia', '1821-11-11', '1881-02-09'),
('Haruki Murakami', 'Japanese writer of surrealist fiction.', 'Japan', '1949-01-12', NULL),
('Gabriel García Márquez', 'Colombian novelist and Nobel laureate.', 'Colombia', '1927-03-06', '2014-04-17');

-- 🔥 INITIAL BOOKS
INSERT INTO Books (Title, AuthorID, Edition, ISBN) VALUES
('Harry Potter and the Philosopher''s Stone', 5, '1st Edition', '9780747532699'),
('A Game of Thrones', 7, 'Hardcover', '9780553103540'),
('Crime and Punishment', 3, 'Classic Reprint', '9780140449136'),
('Kafka on the Shore', 4, 'Paperback', '9781400079278'),
('One Hundred Years of Solitude', 5, 'Special Edition', '9780060883287');

-- 🔥 INITIAL LISTINGS
INSERT INTO Listings (UserID, BookID, Condition, IsAvailable, ApprovalStatus) VALUES
(1, 3, 'good', 1, 'approved'),
(2, 4, 'new', 1, 'approved'),
(3, 5, 'old', 1, 'pending'),
(4, 6, 'good', 1, 'approved'),
(5, 7, 'new', 1, 'approved');

-- 🔥 MANUAL CLEANUP / TESTING
DELETE FROM Books WHERE BookID = 1;
DELETE FROM Listings WHERE ListingID = 1;
DELETE FROM Authors WHERE AuthorID = 2;

-- 🔥 SECOND SET OF AUTHORS
INSERT INTO Authors (Name, Bio, Country, Date_of_Birth, Date_of_death) VALUES
('Jane Austen', 'English novelist known primarily for her six major novels.', 'UK', '1775-12-16', '1817-07-18'),
('George Orwell', 'English novelist, essayist, and critic of totalitarianism.', 'UK', '1903-06-25', '1950-01-21'),
('Toni Morrison', 'American novelist and Nobel Prize winner.', 'USA', '1931-02-18', '2019-08-05'),
('Frank Herbert', 'American science fiction novelist, creator of Dune.', 'USA', '1920-10-08', '1986-02-11'),
('Paulo Coelho', 'Brazilian lyricist and novelist.', 'Brazil', '1947-08-24', NULL);

-- 🔥 SECOND SET OF BOOKS
INSERT INTO Books (Title, AuthorID, Edition, ISBN) VALUES
('Pride and Prejudice', 8, 'Penguin Classics', '9780141439518'),
('1984', 9, 'Signet Classic', '9780451524935'),
('Beloved', 10, 'Vintage International', '9781400033416'),
('Dune', 11, '40th Anniversary Ed', '9780441013593'),
('The Alchemist', 12, '25th Anniversary', '9780062315007');

-- 🔥 SECOND SET OF LISTINGS
INSERT INTO Listings (UserID, BookID, Condition, IsAvailable, ApprovalStatus) VALUES
(1, 8, 'good', 1, 'approved'),
(2, 9, 'new', 1, 'approved'),
(3, 10, 'good', 1, 'approved'),
(4, 11, 'old', 1, 'approved'),
(5, 12, 'new', 0, 'approved');

-- 🔥 FINAL UPDATE
UPDATE Listings 
SET IsAvailable = 1 
WHERE ListingID = 2;