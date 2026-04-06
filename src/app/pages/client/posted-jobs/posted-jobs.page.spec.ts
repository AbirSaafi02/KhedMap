import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostedJobsPage } from './posted-jobs.page';

describe('PostedJobsPage', () => {
  let component: PostedJobsPage;
  let fixture: ComponentFixture<PostedJobsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PostedJobsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
