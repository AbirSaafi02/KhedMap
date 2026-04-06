import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddGigPage } from './add-gig.page';

describe('AddGigPage', () => {
  let component: AddGigPage;
  let fixture: ComponentFixture<AddGigPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
