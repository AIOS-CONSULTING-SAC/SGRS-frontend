import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout'; 
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginComponent } from './app/login/login.component';
import { EmpresasComponent } from './app/modules/empresas/empresas.component';
import { UsuariosComponent } from './app/modules/usuarios/usuarios.component';
import { AuthGuard } from './app/auth/auth.guard';
import { ParametrosComponent } from './app/modules/parametros/parametros.component';
import { DashboardComponent } from './app/modules/dashboard/dashboard.component';
import { ManejoResiduosComponent } from './app/modules/manejo-residuos/manejo-residuos.component';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } },
            { path: 'empresa', data: { breadcrumb: 'Mantenimiento > Empresas' }, component: EmpresasComponent },
            { path: 'usuario', data: { breadcrumb: 'Mantenimiento > Usuarios' }, component: UsuariosComponent },
            { path: 'parametro', data: { breadcrumb: 'Mantenimiento > Parametros' }, component: ParametrosComponent },
            { path: 'manejo-residuos', data: { breadcrumb: 'Manejo de Residuos Sólidos' }, component: ManejoResiduosComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'notfound', component: Notfound },
    //{ path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
