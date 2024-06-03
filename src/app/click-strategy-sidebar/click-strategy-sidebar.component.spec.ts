import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickStrategySidebarComponent } from './click-strategy-sidebar.component';

describe('ClickStrategySidebarComponent', () => {
  let component: ClickStrategySidebarComponent;
  let fixture: ComponentFixture<ClickStrategySidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClickStrategySidebarComponent]
    });
    fixture = TestBed.createComponent(ClickStrategySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
