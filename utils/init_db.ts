import { QueryTypes, Sequelize } from "sequelize";
import path from "node:path";

//Run this command just once to initialized a `database.db` file in the repository's directory
const db_path = path.join(__dirname, "..", "database.db")
const db = new Sequelize({
    dialect:'sqlite',
    storage:db_path,
    logging:false,
    host:'localhost'
});
(async () => {
    await db.query(
        `CREATE TABLE "characters" (
            "name"	TEXT NOT NULL UNIQUE,
            "whkId"	VARCHAR(30),
            "whkToken"	VARCHAR(200) NOT NULL,
            PRIMARY KEY("whkId")
        );`
    );
    await db.query(
        `CREATE TABLE "quotes" (
            "quote"	TEXT NOT NULL,
            "author_whkId"	VARCHAR(30) NOT NULL,
            "quote_id"	INTEGER,
            FOREIGN KEY("author_whkId") REFERENCES "characters"("whkId"),
            PRIMARY KEY("quote_id" AUTOINCREMENT)
        );`
    )
})();