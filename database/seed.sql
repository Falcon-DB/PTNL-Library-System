--DATABASE CONTEXT
USE LibraryDB;
--INITIAL ADMIN USER
INSERT INTO Users (full_name, email, password, role)
VALUES (
    'Frosty Falcon',
    'frostyfalcon.db@gmail.com',
    'bv9@5xxXxx',
    'admin'
);

--BASIC DEBUG QUERIES
SELECT * FROM Users;
SELECT * FROM Books;
SELECT * FROM Authors;
SELECT * FROM Queries;
SELECT * FROM Listings;
SELECT * FROM Subscriptions;
SELECT * FROM Feedback;
SELECT * FROM Transactions;
SELECT * FROM Requests;
SELECT * FROM Wishlist;
--CLEANUP / RESET OPERATIONS
TRUNCATE TABLE Users;
TRUNCATE TABLE Books;
TRUNCATE TABLE Authors;
TRUNCATE TABLE Queries;
TRUNCATE TABLE Listings;
TRUNCATE TABLE Subscriptions;
TRUNCATE TABLE Feedback;
TRUNCATE TABLE Transactions;
TRUNCATE TABLE Requests;
TRUNCATE TABLE Wishlist;

--BULK USER INSERT
INSERT INTO Users (full_name, email, password, role) VALUES
('Arjun Sharma', 'arjun.s@email.com', 'Pass123!', 'student'),
('Sana Khan', 'sana.k@email.com', 'Pass123!', 'student'),
('Liam O''Connor', 'liam.oc@email.com', 'Pass123!', 'student'),
('Aisha Patel', 'aisha.p@email.com', 'Pass123!', 'student'),
('Chen Wei', 'chen.w@email.com', 'Pass123!', 'student');

--INITIAL AUTHORS
INSERT INTO Authors (Name, Bio, Country, Date_of_Birth, Date_of_death) VALUES
('J.K. Rowling', 'British author, best known for Harry Potter.', 'UK', '1965-07-31', NULL),
('George R.R. Martin', 'American novelist and short story writer.', 'USA', '1948-09-20', NULL),
('Fyodor Dostoevsky', 'Russian novelist and philosopher.', 'Russia', '1821-11-11', '1881-02-09'),
('Haruki Murakami', 'Japanese writer of surrealist fiction.', 'Japan', '1949-01-12', NULL),
('Gabriel García Márquez', 'Colombian novelist and Nobel laureate.', 'Colombia', '1927-03-06', '2014-04-17');

--INITIAL BOOKS
INSERT INTO Books (Title, AuthorID, Edition, ISBN) VALUES
('Harry Potter and the Philosopher''s Stone', 1, '1st Edition', '9780747532699'),
('A Game of Thrones', 2, 'Hardcover', '9780553103540'),
('Crime and Punishment', 3, 'Classic Reprint', '9780140449136'),
('Kafka on the Shore', 4, 'Paperback', '9781400079278'),
('One Hundred Years of Solitude', 5, 'Special Edition', '9780060883287');

--INITIAL LISTINGS
INSERT INTO Listings (UserID, BookID, Condition, IsAvailable, ApprovalStatus) VALUES
(1, 1, 'good', 1, 'approved'),
(2, 2, 'new', 1, 'approved'),
(3, 3, 'old', 0, 'pending'),
(4, 4, 'good', 1, 'approved'),
(5, 5, 'new', 1, 'approved');