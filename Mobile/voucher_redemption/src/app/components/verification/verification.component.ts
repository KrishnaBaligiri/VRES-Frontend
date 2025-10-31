import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 1. Import HttpClient
import { environment } from 'src/environments/environment'; // Optional: for base URL

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
})
export class VerificationComponent implements OnInit {
  localvoucherCode = localStorage.getItem('voucherCode') || ''; // Retrieve voucher code from localStorage
  localvendorId = localStorage.getItem('vendorId') || ''; // Retrieve vendor ID from localStorage
  otpValues: any = {
    val1: '',
    val2: '',
    val3: '',
    val4: '',
    val5: '',
    val6: '',
  };
  otp: string = '';

  // --- DATA NEEDED FOR API ---
  // You must get this data from the previous screen (e.g., via routing or a service)
  voucherCode: string = this.localvoucherCode; // Example: Get this from route params
  vendorId: string = this.localvendorId; // Example: Get this from a user service
  // ---------------------------

  showOTPError: boolean = false;
  errorInvalid: boolean = false;
  displayLoader: boolean = false;

  // Define your API endpoint
  private apiUrl = 'https://vouchers-api.infosharesystems.io/vres/redemption/confirm'; // Use your actual backend URL

  // 2. Inject HttpClient and ActivatedRoute in the constructor
  constructor(private router: Router, private http: HttpClient) {}
  

  ngOnInit() {
    // Here you would typically get the voucherCode and vendorId
    // For example, from the route:
    // this.voucherCode = this.route.snapshot.paramMap.get('voucherCode');
  }

  // No changes needed for otpController, numericOnly, or backtoLogin methods

  async submit() {
    this.otp = Object.values(this.otpValues).join(''); // A cleaner way to join OTP values
    console.log('Entered OTP:', this.otp);

    // Validate OTP length
    if (this.otp.length < 6) {
      this.showOTPError = true;
      setTimeout(() => (this.showOTPError = false), 1500);
      return;
    }

    this.displayLoader = true;
    this.errorInvalid = false; // Reset error on new submission

    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('Authentication token not found. Please log in again.');
      this.displayLoader = false;
      this.errorInvalid = true; // Show an error
      setTimeout(() => (this.errorInvalid = false), 1500);
      return;
    }

    // 3. Create the httpOptions object with the Authorization header
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    // 3. Create the payload for the API request
    const payload = {
      voucherCode: this.voucherCode,
      otp: this.otp,
      vendorId: this.vendorId,
      geo_lat: 0.0, // You can implement geolocation or use defaults
      geo_lon: 0.0,
      deviceFingerprint: 'web-browser-fingerprint', // You can use a library for a real fingerprint
    };

    // 4. Make the HTTP POST request
    this.http.post<any>(this.apiUrl, payload, httpOptions).subscribe({
      next: (response) => {
        // --- SUCCESS ---
        console.log('API Response:', response);
        this.displayLoader = false;
        // Navigate on successful redemption
        this.router.navigate(['/tabs/home']);
        localStorage.removeItem('voucherCode'); // Clear voucher code from storage
      },
      error: (err) => {
        // --- ERROR ---
        console.error('API Error:', err);
        this.displayLoader = false;
        this.errorInvalid = true; // Show the "OTP is invalid" message
        setTimeout(() => (this.errorInvalid = false), 1500);
      },
    });
  }

  // (Your other methods: otpController, numericOnly, backtoLogin)
  otpController(event: any, next: any, prev: any): void {
    if (event.target.value.length === 1 && next) {
      next.setFocus();
    } else if (event.target.value.length === 0 && prev) {
      prev.setFocus();
    }
  }

  numericOnly(event: any): boolean {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '');
    event.target.value = sanitizedValue;
    return sanitizedValue;
  }

  backtoLogin() {
    this.router.navigate(['/tabs/home']);
  }
}
