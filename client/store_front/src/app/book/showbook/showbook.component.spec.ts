import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowbookComponent } from './showbook.component';

describe('ShowbookComponent', () => {
  let component: ShowbookComponent;
  let fixture: ComponentFixture<ShowbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowbookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
