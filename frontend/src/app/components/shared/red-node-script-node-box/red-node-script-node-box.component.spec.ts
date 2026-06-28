import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedNodeScriptNodeBoxComponent } from './red-node-script-node-box.component';

describe('RedNodeScriptNodeBoxComponent', () => {
  let component: RedNodeScriptNodeBoxComponent;
  let fixture: ComponentFixture<RedNodeScriptNodeBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedNodeScriptNodeBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedNodeScriptNodeBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
