import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropStrategySidebarComponent } from './drag-drop-strategy-sidebar.component';

describe('DragDropStrategySidebarComponent', () => {
  let component: DragDropStrategySidebarComponent;
  let fixture: ComponentFixture<DragDropStrategySidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DragDropStrategySidebarComponent]
    });
    fixture = TestBed.createComponent(DragDropStrategySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
