import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KgPageComponent } from './kg-page.component';

describe('KgPageComponent', () => {
  let component: KgPageComponent;
  let fixture: ComponentFixture<KgPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KgPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KgPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
