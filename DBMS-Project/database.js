const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 10);
const currentTime = currentDate.toLocaleTimeString();

const pool = mysql
  .createPool({
    host: process.env.HOST_NAME,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  })
  .promise();

async function getBooks() {
  const [rows] = await pool.query("SELECT * FROM books");
  return JSON.stringify(rows);
}

async function insertBook(
  bookName,
  isbn,
  genre,
  publicationYear,
  avalCopies,
  totalCopies
) {
  const result = await pool.query(
    `
    INSERT INTO books (title,isbn,genre,publication_year,available_copies,total_copies)
    VALUES(?,?,?,?,?,?)
    `,
    [bookName, isbn, genre, publicationYear, avalCopies, totalCopies]
  );

  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Inserted book with ISBN ? Date : ${formattedDate} ${currentTime}")
    `,
    [isbn]
  );
  return { result, updatelog };
}

async function deleteBook(bookid) {
  const r = await pool.query(
    `
    DELETE FROM transactions 
    where book_id =?
    `,
    [bookid]
  );
  const result = await pool.query(
    `
    DELETE FROM books
    WHERE book_id = ?
    `,
    [bookid]
  );
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Deleted book with ID ? Date : ${formattedDate} ${currentTime}")
    `,
    [bookid]
  );
  return { result, updatelog };
}

async function editBook(
  bookid,
  title,
  isbn,
  genre,
  publication_year,
  available_copies,
  total_copies
) {
  const result = await pool.query(
    `
    UPDATE books
    SET title = ?,
    isbn = ?,
    genre = ?,
    publication_year = ?,
    available_copies=?,
    total_copies =?
    WHERE book_id = ? 
    `,
    [
      title,
      isbn,
      genre,
      publication_year,
      available_copies,
      total_copies,
      bookid,
    ]
  );
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("updated book with ID ? Date : ${formattedDate} ${currentTime}")
    `,
    [bookid]
  );
  return { result, updatelog };
}

async function isValidStudentLogin(usn, password) {
  const [result] = await pool.query(
    `
    select usn,password from user_logins 
    where usn = ? `,
    [usn]
  );

  // To validate the result
  if (result.length == 0) {
    // print user not found
    console.log("user not found");
    return -1;
  } else if (result[0].password == password) {
    // redirect to login page
    return 0;
  } else {
    return -2;
    // password is invalid
  }
  // console.log(result);
}
async function isValidAdminLogin(email, password) {
  const [result] = await pool.query(
    `
    SELECT email,password FROM adminlogin
    where email = ?
    `,
    [email]
  );

  if (result.length == 0) {
    console.log("user not found");
    return -1;
  } else if (result[0].password == password) {
    return 0;
    //valid
  } else {
    return -2;
    //password invalid
  }
}

async function getUsers() {
  const [result] = await pool.query(`
    SELECT * FROM users    
    `);
  return result;
}

async function deleteUser(usn) {
  const deleteTransactions = await pool.query(`
        DELETE FROM transactions
        WHERE usn = '${usn}'
    `);

  const deleteUserLogins = await pool.query(`
        DELETE FROM user_logins
        WHERE usn = '${usn}'
    `);

  const deleteUsers = await pool.query(`
        DELETE FROM users
        WHERE usn = '${usn}'
    `);
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Deleted user with USN ? Date : ${formattedDate} ${currentTime}")
    `,
    [usn]
  );

  return {
    deleteTransactions,
    deleteUserLogins,
    deleteUsers,
    updatelog,
  };
}

async function addUser(usn, fname, lname, email, pnumber, address, password) {
  const result = pool.query(
    `INSERT INTO users(usn, first_name , last_name , email, phone_number, address)
    VALUES(?,?,?,?,?,?)`,
    [usn, fname, lname, email, pnumber, address]
  );

  const addUserLogin = await pool.query(
    `
    INSERT INTO user_logins VALUES(?,?)
    `,
    [usn, password]
  );

  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Added user with USN ? Date : ${formattedDate} ${currentTime}")
    `,
    [usn]
  );

  return {
    result,
    addUserLogin,
    updatelog,
  };
}

async function editUser(
  newFirstName,
  newLastName,
  newEmail,
  newPhoneNumber,
  newAddress,
  usn,
  newPassword
) {
  try {
    const [userUpdateResult] = await pool.query(
      `UPDATE users SET first_name=?, last_name=?, email=?, phone_number=?, address=? WHERE usn=?`,
      [newFirstName, newLastName, newEmail, newPhoneNumber, newAddress, usn]
    );
    const [loginUpdateResult] = await connection.execute(
      `UPDATE user_logins SET password=? WHERE usn=?`,
      [newPassword, usn]
    );
  } catch (err) {
    console.log(err);
  }
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Edited user with USN ? Date : ${formattedDate} ${currentTime}")
    `,
    [usn]
  );

  return {
    userUpdateResult,
    loginUpdateResult,
    updatelog,
  };
}
// ----------------------------
// function for logs
async function getLogs() {
  const [result] = await pool.query(`SELECT * FROM logs`);
  return JSON.stringify(result);
}

//----------------------------- issue book
async function issueBook(usn, bid) {
  const result = await pool.query(
    `
  INSERT INTO transactions (usn, book_id, transaction_date, due_date)
  VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY));

  `,
    [usn, bid]
  );

  const updateAvalBook = await pool.query(
    `
  UPDATE books
  SET available_copies = available_copies - 1
  WHERE book_id = ?;
  `,
    [bid]
  );
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Issued book to  user with USN ? Date : ${formattedDate} ${currentTime}")
    `,
    [usn]
  );
  return {
    result,
    updatelog,
    updateAvalBook,
  };
}

async function showUserTransaction(usn) {
  const [result] = await pool.query(`
    
      SELECT
      transactions.transaction_id,
      users.usn,
      users.first_name,
      users.last_name,
      users.email,
      users.phone_number,
      books.title AS book_name,
      transactions.transaction_date,
      transactions.due_date,
      transactions.return_date,
      transactions.fine_amount
      FROM
      transactions
      JOIN users ON transactions.usn = users.usn
      JOIN books ON transactions.book_id = books.book_id
      WHERE
      transactions.usn = ? ;
  
  `,[usn]);

  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Issued book to  user with USN ? Date : ${formattedDate} ${currentTime}")
    `,
    [usn]
  );
    const rslt = JSON.stringify(result);
  return rslt;
}


async function returnBook(tid){
  const [result] = await pool.query(`
  UPDATE books
  SET available_copies = available_copies + 1
  WHERE book_id = (
      SELECT book_id
      FROM transactions
      WHERE transaction_id = ?
  );
  
  `,[tid]);
  
  const rmFromTransactions = await pool.query(`
  DELETE FROM transactions
  WHERE transaction_id = ?;
  
  `,[tid])
  const updatelog = await pool.query(
    `
    INSERT INTO logs (logvalue) VALUES("Transaction deleted  wid transaction id  ? Date : ${formattedDate} ${currentTime}")
    `,
    [tid]
  );
  return result;
};



module.exports = {
  getBooks,
  insertBook,
  deleteBook,
  editBook,
  isValidStudentLogin,
  isValidAdminLogin,
  getUsers,
  deleteUser,
  addUser,
  editUser,
  getLogs,
  issueBook,
  showUserTransaction,
  returnBook
  
};
