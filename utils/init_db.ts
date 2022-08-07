import sqlite3 from "sqlite3"

//Run this command just once to initialized a `database.db` file in the repository's directory

const db = new sqlite3.Database('../database.db', sqlite3.OPEN_CREATE, err => {
    if (err) throw err;
    console.log("Successfully connected on 'database.db'.");
    db.serialize(()=>{
        db.run(`CREATE TABLE "characters" (
            "name"	TEXT NOT NULL UNIQUE,
            "avatar"	TEXT,
            "whkId"	VARCHAR(30),
            "whkToken"	VARCHAR(200) NOT NULL,
            PRIMARY KEY("whkId")
        );`);
        db.run(`CREATE TABLE "quotes" (
            "quote"	TEXT NOT NULL,
            "author_whkId"	VARCHAR(30) NOT NULL,
            "quote_id"	INTEGER,
            FOREIGN KEY("author_whkId") REFERENCES "characters"("whkId"),
            PRIMARY KEY("quote_id" AUTOINCREMENT)
        );`);
        db.close(err => {if (err) throw err; console.log("Database closed.")});
    })
});