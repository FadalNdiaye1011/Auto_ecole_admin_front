import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { captErrorInterceptor } from './core/interceptors/capt-error.interceptor';
import { injectTokenInterceptor } from './core/interceptors/inject-token.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        captErrorInterceptor,
        injectTokenInterceptor
      ])
    )
  ]
};
