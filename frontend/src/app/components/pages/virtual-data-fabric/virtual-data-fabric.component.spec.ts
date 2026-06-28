import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualDataFabricComponent } from './virtual-data-fabric.component';

describe('VirtualDataFabricComponent', () => {
  let component: VirtualDataFabricComponent;
  let fixture: ComponentFixture<VirtualDataFabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirtualDataFabricComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualDataFabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
