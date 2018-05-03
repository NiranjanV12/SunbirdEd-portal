import { Component, OnInit } from '@angular/core';
import { ResourceService, ConfigService, ToasterService } from '@sunbird/shared';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SignupService } from '../../services/signup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  /**
* sign up form name
*/
  signUpForm: FormGroup;
  /**
* Contains reference of FormBuilder
*/
  sbFormBuilder: FormBuilder;
  /**
* Contains list of languages from config file
*/
  languages: any;
  /**
* Boolean value to either show/hide app loader
*/
  showLoader = false;

  constructor(public resourceService: ResourceService, public configService: ConfigService,
    public router: Router, public signupService: SignupService, public toasterService: ToasterService) {
    this.languages = this.configService.dropDownConfig.COMMON.languages;
  }

  ngOnInit() {
    this.signUpForm = new FormGroup({
      userName: new FormControl(null, [Validators.required, Validators.pattern('^[-\\w\.\\$@\*\\!]{5,256}$')]),
      password: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*[A-Za-z\\s][0-9A-Za-z\\s]*$')]),
      lastName: new FormControl(null),
      phone: new FormControl(null, [Validators.required, Validators.pattern('^\\d{10}$')]),
      email: new FormControl(null, [Validators.required,
      Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]),
      language: new FormControl(null, [Validators.required])
    });
    this.signUpForm.valueChanges.map((value) => {
      if (value.firstName !== null && value.userName !== null) {
        value.firstName = value.firstName.trim();
        value.userName = value.userName.trim();
        return value;
      }
    }).subscribe((value) => {
    });
  }
  redirect() {
    this.router.navigate(['']);
  }
  onSubmitForm() {
    this.showLoader = true;
    this.signupService.signup(this.signUpForm.value).subscribe(res => {
      this.showLoader = false;
      this.toasterService.success(this.resourceService.messages.smsg.m0039);
      this.router.navigate(['']);
    },
      err => {
        this.showLoader = false;
        this.toasterService.error(err.error.params.errmsg);
      });
  }

}
