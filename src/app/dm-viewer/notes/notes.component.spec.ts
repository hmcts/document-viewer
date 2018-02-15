import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';

import {NotesComponent} from './notes.component';
import {DebugElement} from '@angular/core';
import {AnnotationService, Note} from '../annotations/annotation.service';
import {HttpClientTestingModule, HttpTestingController, RequestMatch} from '@angular/common/http/testing';
import {SessionService} from '../../auth/session.service';
import {CookieService} from 'angular2-cookie/core';
import {WindowService} from '../../utils/window.service';
import {AppConfig} from '../../app.config';

const jwt = '12345';

describe('NotesComponent', () => {
  let component: NotesComponent;
  let element: DebugElement;
  let fixture: ComponentFixture<NotesComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let appConfig: AppConfig;
  const val = 'https://anno-url/annotation-sets';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotesComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [AnnotationService, SessionService, WindowService, CookieService, AppConfig]
    })
      .compileComponents();
  }));

  beforeEach(async(() => {
    sessionService = TestBed.get(SessionService);
    sessionService.createSession({
      token: jwt
    });
    fixture = TestBed.createComponent(NotesComponent);
    httpMock = TestBed.get(HttpTestingController);
    appConfig = TestBed.get(AppConfig);
    spyOn(appConfig, 'getAnnotationUrl').and.returnValue(val);
    component = fixture.componentInstance;
    element = fixture.debugElement;
    component.url = 'https://doc123';
    fixture.detectChanges();
  }));

  describe('when no notes are loaded', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('https://anno-url/annotation-sets/find-all-by-document-url?url=https://doc123');
      req.flush({
        _embedded: {
          annotationSets: []
        }
      });
      component.page = 0;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialise to page 0', () => {
      expect(component.page).toEqual(0);
    });

    it('should default to 0 pages', () => {
      expect(component.numPages).toEqual(0);
    });

    describe('when there is a note against the current page', () => {
      beforeEach(() => {
        component.currentNote = new Note('', 'A note');
        fixture.detectChanges();
      });

      describe('and we swap to the next page', () => {
        beforeEach(() => {
          component.page = 1;
          fixture.detectChanges();
        });

        it('should update the current note to a blank note', () => {
          expect(component.currentNote.content).toEqual('');
        });

        describe('when we swap back to the previous page', () => {
          beforeEach(() => {
            component.page = 0;
            fixture.detectChanges();
          });

          it('should update the current note to the first page note', () => {
            expect(component.currentNote.content).toEqual('A note');
          });
        });
      });
    });
  });

  describe('when notes are loaded', () => {
    beforeEach(async(() => {
      const req = httpMock.expectOne('https://anno-url/annotation-sets/find-all-by-document-url?url=https://doc123');
      req.flush({
        _embedded: {
          annotationSets: [{
            uuid: '1234',
            annotations: [{
              uuid: '1',
              page: 2,
              type: 'PAGENOTE',
              comments: [{
                content: 'Page 2 note'
              }],
              '_links': {
                self: 'https://anno-url/annotation-sets/1234/annotation/1'
              }
            }, {
              uuid: '2',
              page: 1,
              type: 'PAGENOTE',
              comments: [{
                content: 'Page 1 note'
              }],
              '_links': {
                self: 'https://anno-url/annotation-sets/1234/annotation/2'
              }
            }, {
              uuid: '3',
              page: 1,
              type: 'COMMENT',
              comments: [{
                content: 'Page 1 comment'
              }],
              '_links': {
                self: 'https://anno-url/annotation-sets/1234/annotation/3'
              }
            }],
            '_links': {
              self: {
                href: 'https://anno-url/annotation-sets/1234'
              },
              'add-annotation': {
                href: 'https://anno-url/annotation-sets/1234/annotation'
              }
            }
          }]
        }
      });
      fixture.detectChanges();
    }));

    it('should filter out the non page note annotations', () => {
      expect(component.notes.length).toBe(2);
    });

    it('should update the current note to the loaded note', () => {
      expect(component.currentNote.content).toEqual('Page 1 note');
    });

    describe('when we change the current note and save', () => {
      beforeEach(async(() => {
        component.currentNote = new Note('', 'New page 1 note');
        component.notesForm.form.markAsDirty();
        fixture.detectChanges();
        component.save();

        const req = httpMock.expectOne('https://anno-url/annotation-sets/1234/annotation');
        req.flush({}, {status: 200, statusText: 'Good!'});
      }));

      it('should set the form to pristine', () => {
        expect(component.notesForm.form.dirty).toBe(false);
      });
    });
  });

  function newEvent(eventName: string, bubbles = false, cancelable = false) {
    const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
  }

});
