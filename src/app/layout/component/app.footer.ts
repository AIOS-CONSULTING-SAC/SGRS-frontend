import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Desarrollado por 
        <a href="https://aios-consulting.com" target="_blank" rel="noopener noreferrer" class="text-constrast font-bold hover:underline">AIOS Consulting</a>
    </div>`
})
export class AppFooter {}
