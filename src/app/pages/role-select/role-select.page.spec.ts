import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleSelectPage } from './role-select.page';

describe('RoleSelectPage', () => {
  let component: RoleSelectPage;
  let fixture: ComponentFixture<RoleSelectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
