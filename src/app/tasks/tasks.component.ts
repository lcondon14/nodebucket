/**
 * Title: tasks.component.ts
 * Author: Laurel Condon
 * Date: 28 Jan 2024
 */

import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  employee: Employee;
  empId: number;
  todo: Item[];
  done: Item[];
  doing: Item[];
  errorMessage: string;
  successMessage: string;

  newTaskForm: FormGroup = this.fb.group({
    text: [null, Validators.compose ([ Validators.required, Validators.minLength(3), Validators.maxLength(50)])]
  });

  constructor(private cookieService: CookieService, private taskService: TaskService, private fb: FormBuilder) {
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];
    this.doing =[];
    this.errorMessage = '';
    this.successMessage = '';

    this.empId = parseInt(this.cookieService.get('session_user'), 10);

    this.taskService.getTasks(this.empId).subscribe({
      next: (res: any) => {
        console.log('Employee: ', res);
        this.employee = res;
      },
      error: (err) => {
        console.error('error: ', err);
        this.errorMessage = err.message;
        this.hideAlert();
      },
      complete: () => {
        if (this.employee.todo) {
          this.todo = this.employee.todo;
        } else {
          this.todo = [];
        }
        if (this.employee.done) {
          this.done = this.employee.done;
        } else {
          this.done = [];
        }
        if (this.employee.doing){
          this.doing = this.employee.doing;
        } else {
          this.doing = [];
        }

      }
   });
  }

  // Add task to todo list
  addTask() {
    const text = this.newTaskForm.controls['text']?.value;

    this.taskService.addTask(this.empId, text).subscribe({
      next: (task: any) => {
        console.log('Task added: ', task);
        this.successMessage = 'Task added successfully';
        const newTask = {
          _id: task._id,
          text: text
        }

        this.todo.push(newTask);
        this.newTaskForm.reset();

        this.hideAlert();

      },
      error: (err) => {
        console.log('Error: ', err);
        this.errorMessage = 'Unable to add task';
        this.hideAlert();
      }
  });
  }

  //delete task
  deleteTask(taskId: string) {
    console.log(`Task item: ${taskId}`)

  //confirm dialog
  if (!confirm('Are you sure you want to delete this task?')){
    return; // Do nothing if the user cancels
  }  

  this.taskService.deleteTask(this.empId, taskId).subscribe({

    next: (res: any) => {
      console.log('Task deleted with id', taskId)

      if (!this.todo) this.todo = [] // If the todo array is null set it to an empty array
      if (!this.done) this.done = [] //if the done array is null set to an empty array
      if (!this.doing) this.doing = [] // if the doing array is null set to an empty array
      this.successMessage = 'Task deleted successfully!' // Sets the success message
      this.hideAlert() // call the hideAlert()function
    },
    //if there is an error, log it to the console and set the error message
    error: (err) => {
      console.log('error', err)
      this.errorMessage = err.message
      this.hideAlert()// Call the hideAlert() functions
    }
  })
  }

 // Drop event
 drop(event: CdkDragDrop<any[]>) {
  if (event.previousContainer === event.container) {
    //If the item is dropped in the same container, move it to the new index
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)

    console.log('Moved item in array', event.container.data)
  
    // Call the updateTaskList() function and pass in the empID, todo and done arrays
    this.updateTaskList(this.empId, this.todo, this.done, this.doing)

  } else {
    //if the item is dropped in a different container, move it to the enw container
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    )
    console.log('Moved item in array', event.container.data) //log the new array to the console

    //call the updateTaskList()function and pass in the empId, todo and done arrays
    this.updateTaskList(this.empId, this.todo, this.done, this.doing)
  }
}


  hideAlert() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }

  /**
   * @param empId
   * @param todo 
   * @param done 
   * @param doing
   * @returns void
   */
  
  updateTaskList(empId: number, todo: Item[], done: Item[], doing: Item[]) {
    this.taskService.updateTask(empId, todo, done, doing).subscribe({
      next: (res: any) => {
        console.log('task updated successfully')
      },
      error: (err) => {
      console.log('error', err)
      this.errorMessage = err.message
      this.hideAlert()
      }
    })
  }
}
