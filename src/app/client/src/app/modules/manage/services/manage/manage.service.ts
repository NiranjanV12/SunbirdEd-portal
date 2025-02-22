import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, RequestParam, ServerResponse, HttpOptions } from '@sunbird/shared';
import { LearnerService } from '../../../core/services/learner/learner.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash-es';
@Injectable({
  providedIn: 'root'
})
export class ManageService {

  /**
  * reference of config service.
  */
  public configService: ConfigService;
  /**
  * reference of learner service.
  */
  public learnerService: LearnerService;
  /**
  * for making upload api calls
  * @param {RequestParam} requestParam interface
  */
  constructor(configService: ConfigService, learnerService: LearnerService, public httpClient: HttpClient) {
    this.configService = configService;
    this.learnerService = learnerService;
  }

  /**
 * This method is used to call upload api to upload organizations file
 */
  public bulkOrgUpload(req): Observable<ServerResponse> {
    const httpOptions: RequestParam = {
      url: this.configService.urlConFig.URLS.ADMIN.BULK.ORGANIZATIONS_UPLOAD,
      data: req
    };
    return this.learnerService.post(httpOptions);
  }
  /**
  * This method is used to call status api to get the status of uploaded file
  */
  getBulkUploadStatus(processId) {
    const options = {
      url: this.configService.urlConFig.URLS.ADMIN.BULK.STATUS + '/' + processId
    };
    return this.learnerService.get(options);
  }

  public getData(slug: any, fileName: any, downloadFileName?: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    if (downloadFileName) {
      headers = new HttpHeaders({
        'Content-Disposition': 'attachment',
        'filename': downloadFileName
      });
    }
    return this.httpClient.get('/admin-reports/' + slug + '/' + fileName, {
      headers: headers
    })
      .pipe(
        map(res => {
          const result = {
            responseCode: 'OK'
          };
          result['result'] = get(res, 'result') || res;
          return result;
        })
      );
  }
  updateRoles(requestParam) {
    const option = {
      url: this.configService.urlConFig.URLS.ADMIN.UPDATE_USER_ORG_ROLES,
      data: {
          'request': {
            'userId': requestParam.userId,
            'organisationId': requestParam.orgId,
            'roles': requestParam.roles
          }
        }
    };

    return this.learnerService.post(option);
  }

}
