import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Activedeliveries } from './activedeliveries';

describe('Activedeliveries', () => {
  let component: Activedeliveries;
  let fixture: ComponentFixture<Activedeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activedeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Activedeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
