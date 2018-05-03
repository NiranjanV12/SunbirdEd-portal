import { Injectable } from '@angular/core';
import { ResourceService, ConfigService, ServerResponse } from '@sunbird/shared';
import { LearnerService } from '@sunbird/core';

@Injectable()
export class SignupService {

  constructor(private learnerService: LearnerService, public configService: ConfigService) { }
  private formatRequest(request) {
    return {
      params: {},
      request: request
    };
  }
  signup(req) {
    console.log('inside signup service', req);
    const data = this.formatRequest(req);
    const options = {
      url: this.configService.urlConFig.URLS.USER.SIGNUP,
      data: data
    };
    return this.learnerService.post(options);
  }

}
