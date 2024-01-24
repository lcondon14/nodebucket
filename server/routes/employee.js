/**
 * Title: employee.js
 * Author: Laurel Condon
 * Date: 22 Jan 2024
 */

'use strict'

const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");
const Ajv = require('ajv');
const { ObjectId } = require("mongodb");


const ajv = new Ajv();

router.get("/:empId", (req, res, next) => {
    console.log("made to the api");
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
            const employee = await db.collection('employees').findOne({empId}); 

            if (!employee) {
            const err = new Error("employee not found" + empId);
            err.status= 404;
            console.log("err", err)
            next(err);
            return; //exit out of the if statement
        }

        res.send(employee);
    
    }, next)

} catch (err) {
        console.error("error", err)
        next(err);
    }
})

    router.get('/:empId/tasks', (req, res, next) => {
        try {
            let { empId } = req.params;
            empId = parseInt(empId, 10);
    
            if (isNaN(empId)) {
                const err = new Error('Input must be a number');
                err.status = 400;
                console.error("err", err);
                next(err);
                return;
            }
    
            mongo(async db => {
                const employee = await db.collection('employees').findOne(
                    { empId },
                    { projection: { empId: 1, todo: 1, done: 1}}
                )
                console.log('employees', employee);

    
     if (!employee) {
        const err = new Error('Unable to find employee');
        err.status = 404;
        console.error("err", err);
        next(err);
        return;
     }

     res.send(employee);
    }, next)
    
        } catch (err) {
            console.error('err', err);
            next(err);
        }
    })

router.post('/:empId/tasks', (req, res, next) => {
    try {
        let { empId } = req.params;
        empId = parseInt(empId, 10);

        if (isNaN(empId)) {
            const err = new Error('Input must be a number');
            err.status = 400;
            console.error("err", err);
            next(err);
            return;
        }
//req.body validation
const taskSchema = {
    type: "object",
    properties: {
        text: { type: 'string' }
    },
    required: ['text'],
    additionalProperties: false
};

const { text } = req.body;
const validator = ajv.compile(taskSchema);
const isValid = validator({ text });

if (!isValid) {
    const err = new Error('Bad Request');
    err.status = 400;
    console.error("err", err);
    next(err);
    return;
}
mongo(async db => {
    const employee = await db.collection('employees').findOne({ empId });

    if (!employee) {
        const err = new Error('Unable to find employee with empId');
    err.status = 404;
    err.errors = validator.errors;
    console.error("err", err);
   next(err);
    return;
    }

    const text = {
        _id: new ObjectId(),
        text
    };

    const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: text }}
        )

        if (!result.modifiedCount) {
            const err = new Error('Unable to create tasks' + empId)
            err.status = 500;
            console.error("err", err);
           next(err);
            return;
        }

        res.status(201).send({ id: text._id })
}, next);

        
        res.send(tasks)

    } catch (err) {
        console.error('err', err)
        next(err);
    }
    
})

module.exports = router;