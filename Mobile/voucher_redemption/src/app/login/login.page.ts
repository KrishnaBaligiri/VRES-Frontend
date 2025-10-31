import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomEvents } from '../services/custom-events';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  card: string = 'loginCard';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private events: CustomEvents
  ) {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.events.subscribe('action:openForgotpwd', (data) => {
      if (data.msg === 'openfgtpwd') {
        this.card = 'loginCard'; // keep showing login UI
        this.goToForgotPassword();
      }
    });
  }

  ngOnInit() {
    this.card = 'loginCard';
      
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  cardStatus(event: any) {
    if (event === 'LoginCard') {
      this.card = 'loginCard';
    } else {
      //this.card = 'verificationCard';
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      console.log('Login payload:', payload);
      this.card = ''
      // ✅ Replace with actual authentication logic (if needed)
      
      // Navigate directly to the Home or Voucher Redemption page after login
      this.router.navigate(['/tabs/home']); // or navigate to your redemption page
    }
  }

  goToForgotPassword() {
    // 🔹 Navigates to the Forgot Password page
    this.router.navigate(['/forgot-password']);
  }
}
