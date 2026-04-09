USE LibraryDB;

INSERT INTO Users (full_name, email, password, role)
VALUES (
    'Frosty Falcon',
    'frostyfalcon.db@gmail.com',
    'bv9@5xxXxx',
    'admin'
);

INSERT INTO Users (full_name, email, password, role)
VALUES (
    'Gourab karmakar',
    'karmakar@gmail.com',
    '123456',
    'admin'
);

select*from Feedback;
select*from Queries;
select * from Users;
SELECT*FROM Subscriptions;
SELECT * FROM Users WHERE email = 'frostyfalcon.db@gmail.com';