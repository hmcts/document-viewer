import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmViewerComponent } from './dm-viewer.component';
import { PdfViewerComponent} from './viewers/pdf-viewer/pdf-viewer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';
import {SessionService} from '../auth/session.service';
import {CookieModule} from 'ngx-cookie';
import {ImgViewerComponent} from './viewers/img-viewer/img-viewer.component';
import {ViewerAnchorDirective} from './viewers/viewer-anchor.directive';
import {UnsupportedViewerComponent} from './viewers/unsupported-viewer/unsupported-viewer.component';
import {ViewerFactoryService} from './viewers/viewer-factory.service';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {NotesComponent} from './annotations/notes/notes.component';
import {FormsModule} from '@angular/forms';
import {WindowService} from '../utils/window.service';
import {ImagePipe} from '../utils/image-pipe';
import {DmViewerModule} from './dm-viewer.module';

const url = 'http://api-gateway.dm.com/documents/1234-1234-1234';

describe('DmViewerComponent', () => {
  let component: DmViewerComponent;
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<DmViewerComponent>;
  let element: DebugElement;

  beforeEach(async(() => {
    const testingModule = TestBed.configureTestingModule({
      imports: [DmViewerModule, HttpClientTestingModule]
    });

    testingModule.compileComponents();
  }));

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    fixture = TestBed.createComponent(DmViewerComponent);
    component = fixture.componentInstance;
    component.url = url;
    element = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('when the mime type is an image', () => {
    beforeEach(() => {
      const req = httpMock.expectOne(url);
      req.flush({
        mimeType: 'image/jpeg',
        originalDocumentName: 'image.jpeg',
        _links: {
          binary: {
            href: `${url}/binary`
          }
        }
      });
      fixture.detectChanges();
    });

    it('should display document name', () => {
      expect(element.nativeElement.querySelector('h1').textContent).toEqual('image.jpeg');
    });

    it('img element should be visible', () => {
      expect(element.nativeElement.querySelector('app-img-viewer')).toBeTruthy();
    });

    it('and pdf element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-pdf-viewer')).not.toBeTruthy();
    });
  });

  describe('when the mime type is pdf', () => {
    beforeEach(() => {
      const req = httpMock.expectOne(url);
      req.flush({
        mimeType: 'application/pdf',
        originalDocumentName: 'cert.pdf',
        _links: {
          binary: {
            href: `${url}/binary`
          }
        }
      });
      fixture.detectChanges();
    });

    it('should display document name', () => {
      expect(element.nativeElement.querySelector('h1').textContent).toEqual('cert.pdf');
    });

    it('img element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-img-viewer')).not.toBeTruthy();
    });

    it('pdf element should be visible', () => {
      expect(element.nativeElement.querySelector('app-pdf-viewer')).toBeTruthy();
    });
  });

  describe('when the mime type is unsupported', () => {
    beforeEach(() => {
      const req = httpMock.expectOne(url);
      req.flush({
        mimeType: 'text/plain',
        originalDocumentName: 'plain.txt',
        _links: {
          binary: {
            href: `${url}/binary`
          }
        }
      });
      fixture.detectChanges();
    });

    it('should display document name', () => {
      expect(element.nativeElement.querySelector('h1').textContent).toEqual('plain.txt');
    });

    it('should show a message with link to download', () => {
      expect(element.nativeElement.querySelector('p').innerHTML)
        .toContain(`${url}/binary`);
    });

    it('img element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-img-viewer')).not.toBeTruthy();
    });

    it('pdf element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-pdf-viewer')).not.toBeTruthy();
    });
  });

  describe('when the server returns an error', () => {
    beforeEach(() => {
      const req = httpMock.expectOne(url);
      const mockErrorResponse = {
        status: 404, statusText: 'Not Found'
      };
      const data = 'Invalid request parameters';
      req.flush(data, mockErrorResponse);
      fixture.detectChanges();
    });

    it('should display an error with the status', () => {
      expect(element.nativeElement.querySelector('.error-summary').textContent).toContain('404');
    });

    it('img element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-img-viewer')).not.toBeTruthy();
    });

    it('pdf element should not be visible', () => {
      expect(element.nativeElement.querySelector('app-pdf-viewer')).not.toBeTruthy();
    });

  });

});
