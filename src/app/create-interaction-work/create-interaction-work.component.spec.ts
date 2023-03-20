import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInteractionWorkComponent } from './create-interaction-work.component';

describe('CreateInteractionWorkComponent', () => {
  let component: CreateInteractionWorkComponent;
  let fixture: ComponentFixture<CreateInteractionWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateInteractionWorkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInteractionWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
