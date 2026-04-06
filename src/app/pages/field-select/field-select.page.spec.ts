import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldSelectPage } from './field-select.page';

describe('FieldSelectPage', () => {
  let component: FieldSelectPage;
  let fixture: ComponentFixture<FieldSelectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
