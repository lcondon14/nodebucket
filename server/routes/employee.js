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
const { takeLast } = require('rxjs');

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
 * getTask
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
 * createTasks
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
}

//Schema validation for tasks
const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        properties: {
        _id: { type: 'string' },
        text: { type: 'string' }
      },
      required: ['_id', 'text' ],
      additionalProperties: false
    }
  },
  done: {
    type: 'array',
    items: {
      properties: {
      _id: { type: 'string' },
      text: { type: 'string' }
    },
    required: ['_id', 'text'],
    additionalProperties: false
  }
}
}
}
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


/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   put:
 *     summary: Update tasks for an employee by empId
 *     description: Update the tasks (todo and done) for a specific employee by providing their empId.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *               done:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *           example:
 *             todo: []  # Empty array for empId 1011
 *             done:
 *               - _id: "65ba9332d19ae6a0f91be040"
 *                 text: "Take a vacay"  # Task for empId 1009
 *     responses:
 *       '204':
 *         description: Tasks updated successfully.
 *       '400':
 *         description: Bad request. Invalid input format.
 *       '404':
 *         description: Employee not found.
 *       '500':
 *         description: Internal server error. Unable to update tasks.
 *         content:
 *           application/json:
 *             example:
 *               type: "error"
 *               status: 500
 *               message: "Unable to update tasks for empId{empId}"
 *               stack: "Error: Unable to update tasks for empId{empId}\n at /path/to/employee.js:XXX:XX\n at process.processTicksAndRejections (node:internal/process/task_queues:XX:XX)\n at async mongo (/path/to/mongo.js:XX:XX)"
 */
router.put('/:empId/tasks', async (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      const err = new Error('Employee ID must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    const validator = ajv.compile(tasksSchema);
    const isValid = validator(req.body);

    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return;
    }

    mongo(async (db) => {
      const employee = await db.collection('employees').findOne({ empId });

      if (!employee) {
        const err = new Error('Unable to find employee with empId' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: req.body.todo, done: req.body.done } }
      );

      if (!result.modifiedCount) {
        const err = new Error('Unable to update tasks for empId' + empId);
        err.status = 500;
        console.error('err', err);
        next(err);
        return;
      }

      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});


/**
 * deleteTask
 * @swagger
 * /api/employees/{empId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task for an employee by empId and taskId
 *     description: Delete a specific task for a given employee by providing their empId and taskId.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Task deleted successfully.
 *       '400':
 *         description: Bad request. Invalid input format.
 *       '404':
 *         description: Employee or task not found.
 *       '500':
 *         description: Internal server error. Unable to delete task.
 *         content:
 *           application/json:
 *             example:
 *               type: "error"
 *               status: 500
 *               message: "Unable to delete task for empId {empId} and taskId {taskId}"
 *               stack: "Error: Unable to delete task for empId {empId} and taskId {taskId}"
 */

router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  try {
    let { empId, taskId } = req.params;
    empId = parseInt(empId, 10);

    // empId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    mongo(async db => {
      let employee =await db.collection('employees').findOne({ empId });

      // Response if employee is not found
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }
      if (!employee.todo) employee.todo = []; // creates a todo array if employee does not have one
      if (!employee.done) employee.done = []; // creates a done array if employee does not have one
      
      const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString());//filters todo array
      const done = employee.done.filter(task => task._id.toString() !== taskId.toString());// filters done array

      //update the employee record with the new todo and done arrays
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: todo, done: done}}
      )
      
      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
})
// Export router
module.exports = router;