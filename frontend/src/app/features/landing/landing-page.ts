import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { branding } from '../../core/config/branding';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent { readonly brand = branding; }
