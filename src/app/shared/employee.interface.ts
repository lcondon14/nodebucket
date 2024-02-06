/**
 * Title: employee.interface.ts
 * Author: Laurel Condon
 * Date: 28 Jan 2024
 */

import { Item } from './item.interface';

export interface Employee {
    empId: number;
    todo: Item[];
    done: Item[];
    doing: Item[];
}