import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeFreelancerPage } from './home-freelancer.page';

describe('HomeFreelancerPage', () => {
  let component: HomeFreelancerPage;
  let fixture: ComponentFixture<HomeFreelancerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeFreelancerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
