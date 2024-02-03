/**
 * Title: task.service.ts
 * Author: Laurel Condon
 * Date: 28 Jan 2024
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './item.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  //Get all tasks for a specific employee
  getTasks(empID: number){
    return this.http.get('/api/employees/' + empID + '/tasks')
  }

  // Add a new task to a specific employee
  addTask(empID: number, text: string){
    return this.http.post('/api/employees/' + empID + '/tasks', { text })
  }

/**
 * @description deleteTask function to delete a task for an employee by employeeId
 * @param empId
 * @param taskId
 * @returns status code 204 (no content)
 */
deleteTask(empId: number, taskId: string) {
  console.log('/api/employees/' + empId + '/tasks/' + taskId); // log the task id to the console
  return this.http.delete('/api/employees/' + empId + '/tasks/' + taskId);
}

/** 
 * @description updateTask function to update a task for an employeeId
 * @param empId 
 * @param todo list of todo tasks
 * @param done list of tasks done
 * @returns status code 204 (no content)
 */
updateTask(empId: number, todo: Item[], done: Item[]) {
  return this.http.put('/api/employees/' + empId + '/tasks', {
    todo,
    done
  })
}
}