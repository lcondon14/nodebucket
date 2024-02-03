/**
 * Title: mongo.js
 * Author: Laurel Condon
 * Date: 22 Jan 2024
 */

'use strict'

const { MongoClient } = require('mongodb');
const config = require('./config');

const MONGO_URL = config.dbUrl;
const mongo = async(operations, next) => {
    try {
        console.log("Connecting to db...");
        const client = await MongoClient.connect(MONGO_URL, {
           useNewUrlParser: true,
           useUnifiedTopology: true, 
        });

        const db = client.db(config.dbname);
        console.log("Connected to MongoDB.");

        await operations(db);
        console.log("Operation was successful");

        client.close();
        console.log("Connection to db closed.")
    } catch (err) {
        const error = new Error("Error connecting to db: ", err);
        error.status = 500;

        console.log("Error connecting to db: ", err);
        next(error);
    }
};



module.exports = { mongo };