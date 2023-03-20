import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOriginalWorkComponent } from './create-original-work.component';

describe('CreateOriginalWorkComponent', () => {
  let component: CreateOriginalWorkComponent;
  let fixture: ComponentFixture<CreateOriginalWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOriginalWorkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOriginalWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
