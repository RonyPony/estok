import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { branding } from '../../core/config/branding';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  readonly brand = branding;
  readonly loginUrl = new URL('/login', environment.siteBaseUrl).href;
  readonly registerUrl = new URL('/register', environment.siteBaseUrl).href;
}
