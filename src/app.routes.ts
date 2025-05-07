import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginComponent } from './app/login/login.component';
import { EmpresasComponent } from './app/modules/empresas/empresas.component';
import { UsuariosComponent } from './app/modules/usuarios/usuarios.component';
import { AuthGuard } from './app/auth/auth.guard';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'empresa', data: { breadcrumb: 'Mantenimiento > Empresas' }, component:EmpresasComponent},
            { path: 'usuario', data: { breadcrumb: 'Mantenimiento > Usuarios' }, component: UsuariosComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'notfound', component: Notfound },
    //{ path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
