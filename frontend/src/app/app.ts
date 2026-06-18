import { Component, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { timer, switchMap, catchError, of, startWith } from 'rxjs';

const HEALTH_URL = 'http://localhost:3000/api/health';
const PING_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly apiOnline = signal(true);

  ngOnInit(): void {
    timer(0, PING_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get(HEALTH_URL).pipe(
            catchError(() => of(null))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.apiOnline.set(response !== null);
      });
  }
}
