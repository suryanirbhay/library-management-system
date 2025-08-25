CREATE TABLE adminLogin(
    email VARCHAR(50) PRIMARY KEY,
    password VARCHAR(20)
);


CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    genre VARCHAR(50),
    publication_year INT,
    available_copies INT NOT NULL,
    total_copies INT NOT NULL
);

CREATE TABLE users (
    usn CHAR(12) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    address VARCHAR(255)
);

CREATE TABLE user_logins (
    usn CHAR(12) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (usn) REFERENCES users(usn)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    usn CHAR(12),
    book_id INT,
    transaction_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (usn) REFERENCES users(usn),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

CREATE TABLE logs(
    logid INT PRIMARY KEY AUTO_INCREMENT,
    logvalue VARCHAR(300)
);

DELIMITER //

CREATE TRIGGER after_user_login
AFTER UPDATE ON user_logins
FOR EACH ROW
BEGIN
    IF NEW.last_login IS NOT NULL THEN
        INSERT INTO logs (logvalue)
        VALUES (CONCAT('User with USN ', NEW.usn, ' logged in at ', NEW.last_login));
    END IF;
END //

DELIMITER ;