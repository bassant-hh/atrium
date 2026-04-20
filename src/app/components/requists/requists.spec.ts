import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Requists } from './requists';

describe('Requists', () => {
  let component: Requists;
  let fixture: ComponentFixture<Requists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Requists]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Requists);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
