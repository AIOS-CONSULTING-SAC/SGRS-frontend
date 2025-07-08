import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AutenticacionService } from '../../auth/autenticacion.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
               <img src="https://isosegperu.com/wp-content/uploads/2025/02/LOGO_1_ISOSEG-BLANCO.png" style="height:50px" alt="">
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                 
                
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" 
            pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" 
            leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!-- <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button> -->
                    <div  class="layout-topbar-action-perfil ">
                        <span>{{nombresCompletos}}</span>
                        <small style="text-transform: uppercase;display:block;font-weight:bolder">{{descPerfil}}</small>
                    </div>
                    <button type="button" (click)="logout()" class="layout-topbar-action">
                        <i class="pi pi-sign-out"></i>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    constructor(public layoutService: LayoutService,
        private router: Router,
        private autenticacion: AutenticacionService,
    ) { }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.autenticacion.logout();
        this.router.navigate(["/login"]);
    }

    get nombresCompletos() {
        const datosToken = this.autenticacion.getDatosToken();
        return `${datosToken?.nombres} ${datosToken?.apellidoP} ${datosToken?.apellidoM}`;
    }

    get descPerfil(){
       return this.autenticacion.obtenerPerfil();
        
    }
}
