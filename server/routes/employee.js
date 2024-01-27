/**
 * Title: employee.js
 * Author: Laurel Condon
 * Date: 22 Jan 2024
 */

const express = require('express');
const router = express.Router();

const { mongo } = require('../utils/mongo');

const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv();

/**
 * findEmployeeById
 * @swagger
 * /api/employees/{empId}:
 *   get:
 *     summary: Find employee by ID
 *     description: Retrieves employee details by providing their ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee ID.
 *       '400':
 *         description: Bad request, invalid employee ID.
 *       '404':
 *         description: Employee not found.
 *       '500':
 *         description: Internal server error.
 */



// Get employee by empId
router.get("/:empId",  (req, res, next) => {
  try{
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Error handling for invalid employee ID
    if (isNaN(empId)) {
      const err = new Error('Employee ID must be a number');
      err.status = 400;
      console.log(err);
      next(err);
      return;
    }

    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      // Error handling for employee not found
      if (!employee) {
        const err = new Error('Employee not found');
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }
      res.send(employee);
    });
  }
  catch(err) {
  console.error("Error: ". err);
  next(err);
  }
})

// Get all employees, added for swagger and soap testing.
router.get("/", (req, res, next) => {
  try{
    mongo(async db => {
      const employees = await db.collection('employees').find().toArray();
      res.send(employees);
    });
  }
  catch(err) {
    console.error("Error: ", err);
    next(err);
  }
})
/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   get:
 *     summary: Finds all tasks with employee ID
 *     description: Retrieves tasks with employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tasks
 *         required: true
 *         description: tasks
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */

//Employee tasks API
router.get('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      const err = new Error('Employee ID must be a number');
      err.status = 400;
      console.log(err);
      next(err);
      return;
    }

    mongo(async db => {
    const employee = await db.collection('employees').findOne(
      { empId },
      { projection: { empId: 1, todo: 1, done:1 }}
    )

    //Return error if no tasks found.
    if(!employee) {
      const err = new Error('Unable to find employee for empId: ' + empId);
      err.status = 404;
      console.error("err", err);
      next(err);
      return;
    }

    // Return tasks if no error.
    res.send(employee);

    }, next);

  } catch(err) {
    console.error("Error: ", err);
    next(err);
  }
});

/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   post:
 *     summary: Creates a task for employee
 *     description: Create a task for employee ID.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID tasks
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */

// Schema Validation
const taskSchema = {
  type: 'object',
  properties: {
    text:{ type: 'string' },
  },
  required: ['text'],
  additionalProperties: false
};

// Create tasks API
router.post('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Error handling for invalid employee ID
    if (isNaN(empId)) {
      const err = new Error('Employee ID must be a number');
      err.status = 400;
      console.error("err", err);
      next(err);
      return;
    }

    // Error handling for request body.
    const { text } = req.body;
    const validator = ajv.compile(taskSchema);
    const isValid = validator({ text });

    // Error handling for invalid request body.
    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error("err", err);
      next(err);
      return;
    }

    mongo(async db =>{
      const employee = await db.collection('employees').findOne({ empId });
      if (!employee) {
        const err = new Error('Employee not found');
        err.status = 404;
        console.error("err", err);
        next(err);
        return;
      }

      const task = {
        _id: new ObjectId(),
        text
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: task } }
      )

      if (!result.modifiedCount) {
        const err = new Error('Unable to add task for empId: ' + empId);
        err.status = 500;
        console.error("err", err);
        next(err);
        return;
      }

      res.status(201).send({ id: task._id });

    }, next)
  } catch (err) {
    console.error("Error: ", err);
   next(err);
}
});

// Export router
module.exports = router;