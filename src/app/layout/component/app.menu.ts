import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AutenticacionService } from '../../auth/autenticacion.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {

    constructor(private autenticacionService: AutenticacionService) {

    }
    model: MenuItem[] = [];

    ngOnInit() {
        const codPerfil = this.autenticacionService.obtenerCodTipoUsuario(); // o desde tu servicio
        console.log(codPerfil)
        if (codPerfil == 1) {
            // Solo Dashboard
            this.model = [
                {
                    items: [
                        { label: 'Dashboard', icon: '', routerLink: ['/dashboard'] }
                    ]
                }
            ];
        } else {
            // Menú completo
            this.model = [
                {
                    items: [
                        { label: 'Dashboard', icon: '', routerLink: ['/dashboard'] },
                        { label: 'Gestión de Residuos', icon: '', routerLink: ['/uikit/input'] },
                        {
                            label: 'Mantenimiento',
                            items: [
                                { label: 'Empresa', icon: '', routerLink: ['/empresa'] },
                                { label: 'Usuarios', icon: '', routerLink: ['/usuario'] },
                                { label: 'Parametro', icon: '', routerLink: ['/parametro'] }
                            ]
                        }
                    ]
                }
            ];
        }
    }
}
