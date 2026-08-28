const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

db.serialize(() => {
    db.all("SELECT * FROM blog_person ORDER BY date_queried DESC LIMIT 3;", (err, rows) => {
        if (err) console.error(err);
        else console.log("blog_person:", rows);
    });
    db.all("SELECT * FROM auth_user ORDER BY date_joined DESC LIMIT 3;", (err, rows) => {
        if (err) console.error(err);
        else console.log("auth_user:", rows);
    });
    db.all("SELECT * FROM blog_profile LIMIT 3;", (err, rows) => {
        if (err) console.error(err);
        else console.log("blog_profile:", rows);
    });
});

db.close();
