import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagesClientPage } from './messages-client.page';

describe('MessagesClientPage', () => {
  let component: MessagesClientPage;
  let fixture: ComponentFixture<MessagesClientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesClientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
