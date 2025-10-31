import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {
  AlertController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  voucherCode = '';
  // --- Define your backend API URL here ---
  private apiUrl =
    'https://vouchers-api.infosharesystems.io/vres/redemption'; // <-- IMPORTANT: Replace with your actual backend URL

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router,
    private http: HttpClient, // Inject HttpClient to make API calls
    private loadingCtrl: LoadingController
  ) {}

  /**
   * This function is called after scanning or manually entering a code.
   * It handles the API call to the '/initiate' endpoint.
   */
  async initiateRedemption() {
    if (!this.voucherCode) {
      this.showToast('Please enter or scan a voucher code.', 'warning');
      return;
    }

    // --- IMPORTANT: Get the logged-in vendor's ID ---
    // You must implement logic to retrieve the current vendor's ID.
    // It's typically stored in localStorage or a state management service after login.
    const vendorId = localStorage.getItem('vendorId'); // Example: retrieving from localStorage

    if (!vendorId) {
      this.showToast(
        'Could not find Vendor ID. Please log in again.',
        'danger'
      );
      return;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      this.showToast(
        'Authentication token not found. Please log in again.',
        'danger'
      );
      return;
    }

    const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
  };

    const requestBody = {
      voucherCode: this.voucherCode,
      vendorId: parseInt(vendorId, 10), // Ensure vendorId is a number
    };

    const loading = await this.loadingCtrl.create({
      message: 'Initiating redemption...',
    });
    await loading.present();

    this.http
      .post(`${this.apiUrl}/initiate`, requestBody, httpOptions)
      .pipe(
        finalize(() => {
          loading.dismiss(); // Ensure the loading indicator is dismissed
        })
      )
      .subscribe({
        next: (response: any) => {
          this.showToast(response.message, 'success');
          // On success, navigate to the verification page to enter the OTP
          this.router.navigate(['/verification'], {
            queryParams: { code: this.voucherCode },
          });
          localStorage.setItem('voucherCode', this.voucherCode); // Store voucher code for verification page
          this.voucherCode = ''; // Clear the input field
        },
        error: (err) => {
          console.error('API Error:', err);
          // Show a helpful error message from the backend if available
          const errorMessage =
            err.error?.message || 'An unknown error occurred.';
          this.showToast(`Error: ${errorMessage}`, 'danger');
        },
      });
  }

  // --- QR Code Scan ---
  // This method now calls `initiateRedemption` on success.
  async scanVoucher() {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();
      document.body.classList.add('qr-scanner-active'); // CSS class to make webview transparent

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        this.voucherCode = result.content || '';
        this.showToast(`Scanned: ${this.voucherCode}`, 'medium');
        // Call the initiate function after a successful scan
        this.initiateRedemption();
      }
    } catch (err) {
      console.error('Scan Error:', err);
      this.showToast('Scan failed. Please grant camera permission.', 'danger');
    } finally {
      // This block ensures the scanner is always stopped properly
      document.body.classList.remove('qr-scanner-active');
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    }
  }

  // --- Manual Voucher Submission ---
  // This method is now simplified to just call `initiateRedemption`.
  submitVoucher() {
    this.initiateRedemption();
  }

  // --- Toast Message Helper ---
  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    toast.present();
  }

  // --- Logout Confirmation ---
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'OK',
          handler: () => {
            // It's good practice to also remove specific items
            localStorage.removeItem('vendorId');
            localStorage.removeItem('authToken');
            localStorage.removeItem('voucherCode');
            // localStorage.clear(); // Use if you want to clear everything
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }
}
