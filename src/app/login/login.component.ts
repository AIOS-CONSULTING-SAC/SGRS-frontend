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
import { BehaviorSubject } from 'rxjs';
import { LoadingComponent } from '../shared/loading/loading.component';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, CheckboxModule, InputTextModule, 
    LoadingComponent,
    PasswordModule, FormsModule, RouterModule, RippleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly usuarioSesion!: BehaviorSubject<string | null>
  email: string = '';
  password: string = '';
  checked: boolean = false;
  loading: boolean = false;
  constructor(private autenticacionService: AutenticacionService,
    private mensajeToast: MensajesToastService,

    private router: Router,
    private route: ActivatedRoute,

  ) {
    this.usuarioSesion = new BehaviorSubject<string | null>(
      localStorage.getItem('accessToken')
    )
  }

  get version(){
    return this.autenticacionService.obtenerVersion()
  }

  cmdLogin() {
    const request: IniciarSesionRequest = {
      usuario: this.email,
      password: this.password
    };
    this.loading = true
    this.autenticacionService.iniciarSesion(request).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          this.loading = false
          const { accessToken, refreshToken } = response.respuesta;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken); 
          this.mensajeToast.exito('Bienvenido', 'Inicio de sesión exitoso');

          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/dashboard');
        } else {
          this.mensajeToast.error('Fallo al iniciar sesión', response.mensaje || 'Credenciales incorrectas');
        }
      },
      error: (error: any) => {
          this.loading = false
        this.mensajeToast.error('Error de servicio', error.message || 'No se pudo conectar al servidor.');
      }
    });
  }


}
