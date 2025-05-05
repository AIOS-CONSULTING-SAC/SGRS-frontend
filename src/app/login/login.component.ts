import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { IniciarSesionRequest } from '../models/usuario/usuario.interface';
import { AutenticacionService } from '../auth/autenticacion.service';
import { MensajesToastService } from '../shared/mensajes-toast.service';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  email: string = '';

  password: string = '';

  checked: boolean = false;

  constructor( private  autenticacionService: AutenticacionService,
    private mensajeToast: MensajesToastService,
    
    private router: Router,
    private route: ActivatedRoute,
  ){

  }

  cmdLogin() { 
    const request: IniciarSesionRequest = new IniciarSesionRequest();
    request.usuario = this.email;
    request.password = this.password;
    this.autenticacionService.iniciarSesion(request).subscribe({
      next: () => {
        this.mensajeToast.exito('Bienvenido', 'Inicio de sesión exitoso');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) { 
          this.router.navigateByUrl(returnUrl); 
        } else { 
          this.router.navigate(['/dashboard']); 
        }
      },
      error: (error: any) => { 
        this.mensajeToast.error('Fallo al iniciar sesión', error.message || 'Error en el servicio.');
      }
    });
    
     
  }

}
