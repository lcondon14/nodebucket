"use strict";

const { MongoClient } = require("mongodb");
const MONGO_URL = "mongodb+srv://<nodebucket_user>:<s3cret>@bellevueuniversity.ytwiz26.mongodb.net/nodebucket?retryWrites=true&w=majority";

const mongo = async(operations, next) => {
    try {
        console.log("Connecting to db...");
        const client = await MongoClient.connect(MONGO_URL, {
           useNewUrlParser: true,
           useUnifiedTopology: true, 
        });
        const db = client.db("nodebuket");
        console.log("Connected to db.");

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
