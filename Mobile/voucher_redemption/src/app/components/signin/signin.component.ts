import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CustomEvents } from 'src/app/services/custom-events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Http } from 'src/app/services/http';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  @Output() getCardStatus = new EventEmitter<string>();

  signinForm: FormGroup;
  openForgotPassword: any = false;
  showPassword = false;
  errorMessage: string = ''; // For displaying login errors

  constructor(
    private events: CustomEvents,
    private fb: FormBuilder,
    private router: Router,
    private http: Http
  ) {
    this.signinForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Listen for event to toggle forgot password view
    this.events.subscribe('action:openlogin', (data) => {
      if (data.msg === 'openlogincomp') {
        this.openForgotPassword = false;
      } else {
        this.openForgotPassword = true;
      }
    });
  }

  ngOnInit() {}

  forgotPassword() {
    this.openForgotPassword = true;
    this.events.publish('action:openForgotpwd', {
      msg: 'openfgtpwd',
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.signinForm.valid) {
      const payload = this.signinForm.value;

      this.http.login(payload).subscribe(
        (response) => {
          console.log('responseFromApi:', response);
          localStorage.setItem('authToken', response.jwtToken);
          localStorage.setItem('vendorId', response.userId);
          this.router.navigate(['/tabs/home']);
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );
    } else {
      this.signinForm.markAllAsTouched();
    }
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
