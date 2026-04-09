import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  alertCircleOutline
} from 'ionicons/icons';

type Role = 'freelancer' | 'client' | 'admin';
type Status = 'pending' | 'approved' | 'rejected';

interface AlertItem {
  title: string;
  message: string;
  status: Status;
  type: string;
  date: string;
  role: Role;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class NotificationsPage implements OnInit {
  role: Role = 'freelancer';

  alerts: AlertItem[] = [
    { title: 'Account review', message: 'Your freelancer profile is pending admin review. We will email you soon.', status: 'pending', type: 'account', date: 'Today', role: 'freelancer' },
    { title: 'Gig approved', message: 'UI Kit Revamp was approved and is now visible in the marketplace.', status: 'approved', type: 'gig', date: 'Today', role: 'freelancer' },
    { title: 'Store item rejected', message: 'Thumbnail pack needs clearer licensing details.', status: 'rejected', type: 'store', date: 'Yesterday', role: 'freelancer' },
    { title: 'Payment in progress', message: 'Order #1045 is released minus 15% fee. Expect funds in 24h.', status: 'approved', type: 'payout', date: 'Yesterday', role: 'freelancer' },
    { title: 'Account approved', message: 'Welcome! You can now post jobs and buy gigs.', status: 'approved', type: 'account', date: 'Today', role: 'client' },
    { title: 'Gig purchase', message: 'You bought “Brand identity starter”. 15% platform fee applied.', status: 'approved', type: 'order', date: 'Today', role: 'client' },
    { title: 'Verification required', message: 'Please upload your company info to keep hiring safely.', status: 'pending', type: 'compliance', date: 'Yesterday', role: 'client' },
    { title: 'New report', message: 'User flagged Gig #220. Please review.', status: 'pending', type: 'report', date: 'Today', role: 'admin' },
    { title: 'Payout queue', message: '12 withdrawals ready. 15% commission already deducted.', status: 'approved', type: 'finance', date: 'Today', role: 'admin' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    addIcons({
      notificationsOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    const roleParam = this.route.snapshot.queryParamMap.get('role') as Role | null;
    const storedRole = localStorage.getItem('currentRole') as Role | null;
    if (roleParam) {
      this.role = roleParam;
      localStorage.setItem('currentRole', this.role);
    } else if (storedRole) {
      this.role = storedRole;
    }
  }

  get filteredAlerts() {
    return this.alerts.filter(a => a.role === this.role);
  }

  goHome() {
    if (this.role === 'client') this.router.navigate(['/client/home']);
    else if (this.role === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/freelancer/home']);
  }
}
