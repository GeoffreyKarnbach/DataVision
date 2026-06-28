import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphNodeInspectorComponent } from './graph-node-inspector.component';

describe('GraphNodeInspectorComponent', () => {
  let component: GraphNodeInspectorComponent;
  let fixture: ComponentFixture<GraphNodeInspectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphNodeInspectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphNodeInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
