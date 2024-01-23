/**
 * Title: config.js
 * Author: Laurel Condon
 * Date: 22 Jan 2024
 */


'use strict'

const db = {
    username: "nodebucket_user",
    password: "s3cret",
    name: "nodebucket"

};

const config = {
port: "3000",
dbUrl:`mongodb+srv://${db.username}:${db.password}@cluster0.hqsaxpy.mongodb.net/${db.name}?retryWrites=true&w=majority`,
dbname: db.name
};


module.exports = config