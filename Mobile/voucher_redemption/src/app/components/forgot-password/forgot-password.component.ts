import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  step = 1;
  generatedOtp: number | null = null;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Step 1 form → enter User ID
    this.forgotForm = this.fb.group({
      userId: ['', [Validators.required, Validators.email]],
    });

    // Step 2 form → enter OTP + new passwords
    this.resetForm = this.fb.group({
      otp: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  /** Step 1 → Generate OTP */
  async handleGetOtp() {
    if (this.forgotForm.invalid) {
      await this.showAlert('Please enter a valid email/User ID.');
      return;
    }

    this.generatedOtp = Math.floor(100000 + Math.random() * 900000);
    console.log('Generated OTP:', this.generatedOtp);

    await this.showAlert(
      'OTP has been sent to your registered email (mock).'
    );
    this.step = 2;
  }

  /** Step 2 → Submit new password */
  async handleSubmit() {
    const { otp, newPassword, confirmPassword } = this.resetForm.value;

    if (otp !== String(this.generatedOtp)) {
      await this.showAlert('Invalid OTP entered.');
      return;
    }
    if (newPassword !== confirmPassword) {
      await this.showAlert('Passwords do not match.');
      return;
    }

    await this.showAlert('Password reset successful! You can now log in.');
    this.router.navigate(['/login']);
  }

  handleCancel() {
    this.step = 1;
    this.forgotForm.reset();
    this.resetForm.reset();
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  /** Simple reusable alert */
  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Notice',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
