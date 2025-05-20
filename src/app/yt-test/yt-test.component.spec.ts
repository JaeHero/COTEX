import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YtTestComponent } from './yt-test.component';

describe('YtTestComponent', () => {
  let component: YtTestComponent;
  let fixture: ComponentFixture<YtTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YtTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YtTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
