import { Injectable } from '@angular/core';
import type { IStep } from '../types';
import { Observable, of } from 'rxjs';

/**
 * A service that manages workflow data, including retrieving, storing, and updating data.
 *
 * @class WorkflowService
 */
@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  /**
   * The main data array containing workflow steps.
   *
   * @member {IStep[]} mainData
   */
  mainData: IStep[] | undefined;

  /**
   * A dummy data array containing workflow steps.
   *
   * @member {IStep[]} dummyData
   */
  dummyData: IStep[] = [
    {
      id: 1,
      workflowId: 1,
      stepId: 1,
      stepName: 'Form',
      description: 'Invoice Upload Form',
      code: 'form',
      icon: 'menu',
      color: 'orange',
      isActive: true,
      isFirstStep: true,
      isFinalStep: false,
      workflowStepActionTemplates: [
        {
          id: 1,
          workflowId: 1,
          stepId: 2,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 8,
            name: 'Send',
            label: 'Sent',
            code: 'send',
            direction: 'next',
            // direction: 'last',
            color: 'green',
            icon: 'check',
          },
        },
      ],
      position: {
        x: 0,
        y: 0,
      },
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
    {
      id: 2,
      workflowId: 1,
      stepId: 2,
      stepName: "Finance Manager's Approval",
      description: 'Mahesh Vyas',
      code: 'finance-managers-approval',
      icon: 'notepad-edit',
      color: 'green',
      isActive: true,
      isFirstStep: false,
      isFinalStep: false,
      workflowStepActionTemplates: [
        {
          id: 1,
          workflowId: 1,
          stepId: 3,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 5,
            name: 'Approve',
            label: 'Approved',
            code: 'approve',
            direction: 'next',
            color: 'green',
            icon: 'check',
          },
        },
        {
          id: 2,
          workflowId: 1,
          stepId: 5,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 2,
            name: 'Reject',
            label: 'Rejected',
            code: 'reject',
            // direction: 'last',

            direction: 'next',
            color: 'red',
            icon: 'cross',
          },
        },
      ],
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
    {
      id: 3,
      workflowId: 1,
      stepId: 3,
      stepName: 'Expense Reimbursement Form',
      description: 'Mahesh Vyas',
      code: 'expense-reimbursement-form',
      icon: 'file-right',
      color: 'orange',
      isActive: true,
      isFirstStep: false,
      isFinalStep: false,
      workflowStepActionTemplates: [
        {
          id: 1,
          workflowId: 1,
          stepId: 4,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 8,
            name: 'Send',
            label: 'Sent',
            code: 'send',
            direction: 'next',
            color: 'green',
            // icon: 'black-left',
            // icon: 'arrows-circle',
            icon: 'check',
          },
        },
      ],
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
    {
      id: 4,
      workflowId: 1,
      stepId: 4,
      stepName: 'Approval Report',
      code: 'approval-report',
      description: 'Mahesh Vyas',
      icon: 'book',
      color: 'purple',
      isActive: true,
      isFirstStep: false,
      isFinalStep: false,
      workflowStepActionTemplates: [
        {
          id: 1,
          workflowId: 1,
          stepId: 6,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 7,
            name: 'Complete',
            label: 'Completed',
            code: 'complete',
            direction: 'last',
            // direction: 'previous',
            color: 'green',
            icon: 'check',
          },
        },
      ],
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
    {
      id: 5,
      workflowId: 1,
      stepId: 5,
      stepName: 'Your invoice has been denied',
      code: 'invoice-denied',
      description: 'Mahesh Vyas',
      icon: 'sms',
      color: 'red',
      isActive: true,
      isFirstStep: false,
      isFinalStep: false,
      workflowStepActionTemplates: [
        {
          id: 1,
          workflowId: 1,
          stepId: 6,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: 7,
            name: 'Complete',
            label: 'Completed',
            code: 'complete',
            // direction: 'previous',
            direction: 'last',
            color: 'green',
            icon: 'check',
          },
        },
      ],
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
    {
      id: 6,
      workflowId: 1,
      stepId: 6,
      stepName: 'End',
      description: 'Mahesh Vyas',
      code: 'end',
      icon: 'menu',
      color: 'blue',
      isActive: true,
      isFirstStep: false,
      isFinalStep: true,
      workflowStepActionTemplates: [],
      workflow: {
        id: 1,
        name: 'Workflow 1',
        alias: 'W1',
        requestPrefix: 'W1',
        isActive: true,
      },
    },
  ];
  constructor() {}

  /**
   * Stores the dummy data in the local storage.
   */
  storeDataInLocalStorage(): void {
    localStorage.setItem('dummyData', JSON.stringify(this.dummyData));
  }

  /**
   * Retrieves data from the local storage or returns the dummy data if no data is stored.
   *
   * @returns {IStep[]} The retrieved or dummy data array.
   */
  retrieveDataFromLocalStorage(): IStep[] {
    const storedData = localStorage.getItem('dummyData');
    if (storedData) {
      return (this.mainData = JSON.parse(storedData));
    } else {
      // If no data is stored, initialize with your default data
      return (this.mainData = this.dummyData);
    }
  }

  /**
   * Returns an Observable of the retrieved or dummy data array.
   *
   * @returns {Observable<IStep[]>} An Observable that emits the data array.
   */
  getData(): Observable<IStep[]> {
    return of(this.retrieveDataFromLocalStorage());
  }

  /**
   * Saves the provided data to the local storage and returns an Observable with a success or error message.
   *
   * @param {IStep[]} data - The data array to be saved.
   * @returns {Observable<string>} An Observable that emits a success or error message.
   */
  saveData(data: IStep[]): Observable<string> {
    this.dummyData = data;
    try {
      localStorage.setItem('dummyData', JSON.stringify(data));
      return of('Data updated successfully!');
    } catch (error) {
      return of('Filed to update data!');
    }
  }
}
