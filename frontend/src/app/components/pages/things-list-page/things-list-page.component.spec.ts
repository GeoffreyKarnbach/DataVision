import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThingsListPageComponent } from './things-list-page.component';

describe('ThingsListPageComponent', () => {
  let component: ThingsListPageComponent;
  let fixture: ComponentFixture<ThingsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThingsListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThingsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
