import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Consent, ConsentStatus } from '@project-sunbird/client-services/models';
import { CsUserService } from '@project-sunbird/client-services/services/user/interface';
import { TncService, UserService } from '@sunbird/core';
import { ResourceService, ServerResponse, ToasterService, UtilService } from '@sunbird/shared';
import * as _ from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-consent-pii',
  templateUrl: './consent-pii.component.html',
  styleUrls: ['./consent-pii.component.scss']
})
export class ConsentPiiComponent implements OnInit {

  @Input() showConsentPopup: boolean;
  @Input() collection;
  @ViewChild('profileDetailsModal') profileDetailsModal;
  consentPii = 'Yes';
  isDataShareOn = false;
  lastUpdatedOn = '';
  userInformation = [];
  editSetting = false;
  isTncAgreed = false;
  showTncPopup = false;
  termsAndConditionLink: string;
  unsubscribe = new Subject<void>();
  private usersProfile: any;
  constructor(
    @Inject('CS_USER_SERVICE') private csUserService: CsUserService,
    private toasterService: ToasterService,
    public userService: UserService,
    public resourceService: ResourceService,
    public tncService: TncService,
    public utilService: UtilService
  ) { }

  ngOnInit() {
    this.usersProfile = this.userService.userProfile;
    this.getUserInformation();
    this.getUserConsent();
  }

  getUserInformation() {
    this.userInformation['name'] = `${this.usersProfile.firstName} ${this.usersProfile.lastName}`;
    this.userInformation['userid'] = this.usersProfile.userId;
    this.userInformation['emailId'] = this.usersProfile.email;
    this.userInformation['phone'] = this.usersProfile.phone;

    if (_.get(this.usersProfile, 'userLocations.length')) {
      this.usersProfile.userLocations.forEach(locDetail => {
        if (locDetail.type === 'state') {
          this.userInformation['state'] = locDetail.name;
        }
        if (locDetail.type === 'district') {
          this.userInformation['district'] = locDetail.name;
        }
      });
    }

    if (_.get(this.usersProfile, 'declarations.length')) {
      for (const [key, value] of Object.entries(this.usersProfile.declarations[0].info)) {
        switch (key) {
          case 'declared-email':
            this.userInformation['emailId'] = value;
            break;
          case 'declared-phone':
            this.userInformation['phone'] = value;
            break;
          case 'declared-ext-id':
            this.userInformation['schoolId'] = value;
            break;
          case 'declared-school-udise-code':
            this.userInformation['schoolName'] = value;
            break;
        }
      }
    }
  }

  fetchTncData() {
    this.tncService.getTncConfig().pipe(takeUntil(this.unsubscribe)).subscribe((data: ServerResponse) => {
      const response = _.get(data, 'result.response.value');
      if (response) {
        try {
          const tncConfig = this.utilService.parseJson(response);
          const version = _.get(tncConfig, 'latestVersion') || {};
          this.termsAndConditionLink = tncConfig[version].url;
        } catch (e) {
          this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
        }
      }
    }, () => {
      this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
    }
    );
  }

  saveConsent() {
    const isActive = this.consentPii === 'Yes';
    this.updateUserConsent(isActive);
    this.toggleEditSetting();
  }

  toggleEditSetting() {
    this.editSetting = !this.editSetting;
  }

  showAndHidePopup(mode: boolean) {
    this.showTncPopup = mode;
  }

  getUserConsent() {
    const request = {
      userId: this.userService.userid,
      consumerId: this.collection.channel,
      objectId: this.collection.identifier
    };
    this.csUserService.getConsent(request, { apiPath: '/learner/user/v1' })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.isDataShareOn = _.get(res, 'consents[0].status') === ConsentStatus.ACTIVE;
        this.consentPii = this.isDataShareOn ? 'No' : 'Yes';
      }, error => {
        // If 404 then open popup
        console.error('error', error);
        this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      });
  }

  updateUserConsent(isActive: boolean) {
    const request: Consent = {
      status: isActive ? ConsentStatus.ACTIVE : ConsentStatus.REVOKED,
      userId: this.userService.userid,
      consumerId: this.collection.channel,
      objectId: this.collection.identifier,
      objectType: 'Collection'
    };
    this.csUserService.updateConsent(request, { apiPath: '/learner/user/v1' })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.toasterService.success(_.get(this.resourceService, 'messages.smsg.dataSettingSubmitted'));
        this.getUserConsent();
      }, error => {
        this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.dataSettingNotSubmitted'));
        console.error('Error while updating user consent', error);
      });
    this.showConsentPopup = false;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    if (_.get(this.profileDetailsModal, 'deny')) {
      this.profileDetailsModal.deny();
    }
  }
}
