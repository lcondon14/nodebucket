
"use strict";

const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");

router.get("/:empId", (req, res, next) => {
    try {
        let { empId } = req.params;
        empId = parseInt(empId, 10);

        if (isNaN(empId)){
            const err = new Error ("Employee must be a number");
            err.status = 400;
            console.log("err", err);
            next(err);
            return; // exit out of if 
        }

        mongo(async db => {
            const employee = await db.collection("employees").findOne ({empId}); 

            if (!employee) {
            const err = new Error("employee not found" + empId);
            err.status= 404;
            console.log("err", err)
            next(err);
            return; //exit out of the if statement
        }

        res.send(employee);
    });

    } catch (err) {
        console.error("error", err)
        next(err);
    }
})


module.exports = router;