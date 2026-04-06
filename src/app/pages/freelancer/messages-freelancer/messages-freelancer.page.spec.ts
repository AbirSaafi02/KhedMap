import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagesFreelancerPage } from './messages-freelancer.page';

describe('MessagesFreelancerPage', () => {
  let component: MessagesFreelancerPage;
  let fixture: ComponentFixture<MessagesFreelancerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesFreelancerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
