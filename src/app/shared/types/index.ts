export type IStep = {
  id: number;
  workflowId: number;
  stepId: number;
  icon: string;
  color: string;
  description: string;
  stepName: string;
  code: string;
  isActive: boolean;
  isFirstStep: boolean;
  isFinalStep: boolean;
  workflowStepActionTemplates: IActionTemplate[];
  workflow: IWorkflow;
  position?: IPosition;
};

export type IAction = {
  id: number | string;
  name: string;
  label: string;
  code: string;
  direction: string;
  color: string;
  icon: string;
};

export type IActionTemplate = {
  id: number | string;
  workflowId: number;
  stepId: number;
  actionTypeId: number;
  isJustificationRequired: boolean;
  isActive: boolean;
  actionType: IAction;
};

export type IPosition = {
  x: number;
  y: number;
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
  shouldAnimate: boolean;
};
