import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HTTL SHOP';
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header/footer for auth routes
      this.showLayout = !event.url.includes('/login') &&
        !event.url.includes('/register') &&
        !event.url.includes('/auth/') &&
        !event.url.includes('/forgot-password') &&
        !event.url.includes('/reset-password');
    });
  }
}
