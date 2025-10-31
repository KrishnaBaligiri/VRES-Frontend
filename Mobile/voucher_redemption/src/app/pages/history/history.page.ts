import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

type Redemption = {
  code: string;
  method: 'scan' | 'manual';
  date: string;
  status: 'Success' | 'Failed' | 'Pending';
};

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage {
  history: Redemption[] = [];

  constructor(private alert: AlertController,private router: Router) {}

  ionViewWillEnter() {
    const key = 'voucher_history';
    this.history = JSON.parse(localStorage.getItem(key) || '[]');
  }

  async clearHistory() {
    const confirm = await this.alert.create({
      header: 'Clear history?',
      message: 'This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('voucher_history');
            this.history = [];
          },
        },
      ],
    });
    await confirm.present();
  }

  async logout() {
  const alert = await this.alert.create({
    header: 'Logout',
    message: 'Are you sure you want to logout?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'OK',
        handler: () => {
          // Clear storage if needed
          localStorage.clear();

          // Navigate back to login
          this.router.navigate(['/login']);
        },
      },
    ],
  });

  await alert.present();
}
}
