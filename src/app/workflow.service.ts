import { Injectable } from '@angular/core';
import { IStep } from './types';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  dummyData: IStep[];
  constructor() {
    this.dummyData = [
      {
        id: 1,
        workflowId: 1,
        stepId: 1,
        stepName: 'Invoice Upload Form',
        code: 'form',
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
        code: 'finance-managers-approval',
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
        code: 'expense-reimbursement-form',
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
        code: 'end',
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
  }

  getData(): Observable<IStep[]> {
    return of(this.dummyData);
  }
}
