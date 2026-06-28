import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRedManagementPageComponent } from './node-red-management-page.component';

describe('NodeRedManagementPageComponent', () => {
  let component: NodeRedManagementPageComponent;
  let fixture: ComponentFixture<NodeRedManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NodeRedManagementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeRedManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
