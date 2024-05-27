export type IStep = {
  id: number;
  workflowId: number;
  stepId: number;
  stepName: string;
  code: string;
  isActive: boolean;
  isFirstStep: boolean;
  isFinalStep: boolean;
  workflowStepActionTemplates: IActionTemplate[];
  workflow: IWorkflow;
};

export type IAction = {
  id: number;
  name: string;
  label: string;
  code: string;
  direction: string;
  color: string;
  icon: string;
};

export type IActionTemplate = {
  id: number;
  workflowId: number;
  stepId: number;
  actionTypeId: number;
  isJustificationRequired: boolean;
  isActive: boolean;
  actionType: IAction;
};

export type IWorkflow = {
  id: number;
  name: string;
  alias: string;
  requestPrefix: string;
  isActive: boolean;
};

export type IReteSettings = {
  isReadOnly: boolean;
  isMiniMap: boolean;
};
