import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingPageComponent } from './mapping-page.component';

describe('MappingPageComponent', () => {
  let component: MappingPageComponent;
  let fixture: ComponentFixture<MappingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MappingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
