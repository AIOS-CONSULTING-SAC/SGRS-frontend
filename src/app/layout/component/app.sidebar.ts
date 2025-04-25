import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';
import { AppFooter } from './app.footer';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, AppFooter],
    template: ` <div class="layout-sidebar">
        <app-menu></app-menu>
        <app-footer></app-footer>
    </div>`
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}
