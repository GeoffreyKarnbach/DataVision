import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveDataPlotterComponent } from './live-data-plotter.component';

describe('LiveDataPlotterComponent', () => {
  let component: LiveDataPlotterComponent;
  let fixture: ComponentFixture<LiveDataPlotterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveDataPlotterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveDataPlotterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
