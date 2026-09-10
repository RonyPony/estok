import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Dashboard, DashboardApiService } from './dashboard-api.service';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppStatCard } from '../../shared/ui/stat-card';
import { AppMoney } from '../../shared/ui/money';
import { AppStatusBadge } from '../../shared/ui/status-badge';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { HasPermission } from '../../shared/directives/has-permission';
@Component({selector:'app-dashboard-page',imports:[RouterLink,MatButtonModule,MatIconModule,MatProgressBarModule,AppPageHeader,AppStatCard,AppMoney,AppStatusBadge,HasPermission],templateUrl:'./dashboard-page.html',styles:'.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-bottom:18px}.dashboard-grid{display:grid;grid-template-columns:1.7fr 1fr;gap:20px;margin-top:24px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.section-title h2{margin:0}.section-title a{font-size:11px}.chart{display:flex;align-items:end;gap:8px;height:200px;border-bottom:1px solid var(--border);padding-top:20px}.chart>div{flex:1;min-width:5px;background:var(--brand);border-radius:5px 5px 0 0}.list-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border);gap:14px;font-size:12px}.list-row small{display:block;color:var(--muted);margin-top:4px}.note{margin:18px 0 0;font-size:11px}.welcome-strip{display:flex;align-items:center;gap:12px;background:var(--brand-soft);padding:15px 20px;border-radius:10px;color:var(--brand);font-size:12px;margin-bottom:26px}@media(max-width:1200px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.dashboard-grid{grid-template-columns:1fr}.stats{gap:10px}}'})
export class DashboardPageComponent {
  readonly state=inject(AuthStateService);private readonly api=inject(DashboardApiService);readonly data=signal<Dashboard|null>(null);readonly error=signal(false);
  constructor(){this.load();}
  load(){this.error.set(false);this.api.get().subscribe({next:d=>this.data.set(d),error:()=>this.error.set(true)});}
  height(total:number){const max=Math.max(...(this.data()?.salesChart.map(x=>x.total)??[1]),1);return Math.max(3,total/max*100);}
}
