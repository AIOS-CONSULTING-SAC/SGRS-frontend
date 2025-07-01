import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from '../app.config';


export const serverConfig: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(),
    // Agrega aquí cualquier provider específico del servidor
  ]
});

export const config = mergeApplicationConfig(appConfig, serverConfig);