import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { MessageService } from 'primeng/api';
import { CustomHttpInterceptor } from './app/auth/http-interceptor';
import { adaptLegacyInterceptor } from './app/auth/interceptor-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
    provideHttpClient(withInterceptors([
      adaptLegacyInterceptor(CustomHttpInterceptor)
    ])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      translation:
      {
        emptyMessage: 'No hay resultados',
        emptyFilterMessage: 'No se encontraron coincidencias',
        choose: 'Elegir',
        searchMessage: 'Escriba para buscar',
        clear: 'Limpiar',
      }
    }),
    MessageService
  ]
};
