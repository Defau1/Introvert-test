import { bootstrapApplication } from '@angular/platform-browser';
import {MatNativeDateModule} from '@angular/material/core';
import {importProvidersFrom} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {CheckboxComponent} from './app/checkbox/checkbox.component';

bootstrapApplication(CheckboxComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(MatNativeDateModule)
  ]
}).catch(err => console.error(err));
