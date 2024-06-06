export type Preset = {
  createItem(name: string, icon: string, index?: number): HTMLElement | null;
  removeItem(element: HTMLElement): void;
};
