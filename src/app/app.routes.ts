import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },

  { path: 'onboarding', loadComponent: () => import('./pages/onboarding/onboarding.page').then(m => m.OnboardingPage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  { path: 'role-select', loadComponent: () => import('./pages/role-select/role-select.page').then(m => m.RoleSelectPage) },
  { path: 'field-select', loadComponent: () => import('./pages/field-select/field-select.page').then(m => m.FieldSelectPage) },

  // Freelancer
  { path: 'freelancer/home', loadComponent: () => import('./pages/freelancer/home-freelancer/home-freelancer.page').then(m => m.HomeFreelancerPage) },
  { path: 'freelancer/profile', loadComponent: () => import('./pages/freelancer/profile-freelancer/profile-freelancer.page').then(m => m.ProfileFreelancerPage) },
  { path: 'freelancer/messages', loadComponent: () => import('./pages/freelancer/messages-freelancer/messages-freelancer.page').then(m => m.MessagesFreelancerPage) },
  { path: 'freelancer/job-detail', loadComponent: () => import('./pages/freelancer/job-detail/job-detail.page').then(m => m.JobDetailPage) },
  { path: 'freelancer/apply-job', loadComponent: () => import('./pages/freelancer/apply-job/apply-job.page').then(m => m.ApplyJobPage) },
  { path: 'freelancer/my-gigs', loadComponent: () => import('./pages/freelancer/my-gigs/my-gigs.page').then(m => m.MyGigsPage) },

  // Client
  { path: 'client/home', loadComponent: () => import('./pages/client/home-client/home-client.page').then(m => m.HomeClientPage) },
  { path: 'client/profile', loadComponent: () => import('./pages/client/profile-client/profile-client.page').then(m => m.ProfileClientPage) },
  { path: 'client/add-job', loadComponent: () => import('./pages/client/add-job/add-job.page').then(m => m.AddJobPage) },
  { path: 'client/posted-jobs', loadComponent: () => import('./pages/client/posted-jobs/posted-jobs.page').then(m => m.PostedJobsPage) },
  { path: 'client/messages', loadComponent: () => import('./pages/client/messages-client/messages-client.page').then(m => m.MessagesClientPage) },

  // Shared
  { path: 'store', loadComponent: () => import('./pages/store/store.page').then(m => m.StorePage) },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage) },
  { path: 'admin/dashboard', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage) },
  {
    path: 'freelancer/add-gig',
    loadComponent: () => import('./pages/freelancer/add-gig/add-gig.page').then( m => m.AddGigPage)
  },
  {
  path: 'freelancer/add-gig',
  loadComponent: () => import('./pages/freelancer/add-gig/add-gig.page').then(m => m.AddGigPage)
},
];
