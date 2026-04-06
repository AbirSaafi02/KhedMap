import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileFreelancerPage } from './profile-freelancer.page';

describe('ProfileFreelancerPage', () => {
  let component: ProfileFreelancerPage;
  let fixture: ComponentFixture<ProfileFreelancerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileFreelancerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
