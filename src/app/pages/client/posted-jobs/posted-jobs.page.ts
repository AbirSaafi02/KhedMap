import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-posted-jobs',
  templateUrl: './posted-jobs.page.html',
  styleUrls: ['./posted-jobs.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PostedJobsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
