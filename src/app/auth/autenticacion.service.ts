import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs' 
import { map, tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http' 
import { HttpService } from '../shared/http.service'
import { IniciarSesionRequest } from '../models/usuario/usuario.interface'
import { MensajesToastService } from '../shared/mensajes-toast.service'
import { environment } from '../../environments/environment'

const apiServicio = 'api/v1/usuarios/'

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  constructor(
    private readonly http: HttpService,
    private readonly httpClient: HttpClient, 
     
  ) {
  
  }

  iniciarSesion(request: IniciarSesionRequest): Observable<any> {
  return this.http.obtenerQueryPost<any>(apiServicio + 'login', request);
}
  
  
  refreshToken(): Observable<string> {
    const requestRefresh = {} as any
    requestRefresh.token = this.obtenerRefreshToken()
    return this.httpClient.post<any>(apiServicio + 'refreshToken', requestRefresh).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken) 
      }),
      map(response => response.data)
    )
  }

  /*public get usuarioLogeado(): any | null {
    return this.usuarioSesion.value
  }*/

  logout(): void {
    if (this.estaAutenticado()) {
      localStorage.clear()
     // this.usuarioSesion.next(null)
    }
   
  }

  obtenerVersion(){
    return environment.version
  }

  obtenerToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  } 

  estaAutenticado(): boolean {
    const token = this.obtenerToken()
    if (!token) {
      return false // No hay token
    }

    // Decodificar el token para obtener la fecha de expiración
    const tokenPayload = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(tokenPayload.exp * 1000) // Multiplicar por 1000 para convertir segundos a milisegundos

    // Verificar si el token ha expirado
    const ahora = new Date()
    return expirationDate > ahora
  }

  private decodeToken(): TokenPayload | null {
    const token = this.obtenerToken()
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
      } catch (error) {
        console.error('Error decoding JWT', error)
        return null
      }
    }
    return null
  }

  obtenerNombresApe(): string {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return `${tokenPayload.nombres} ${tokenPayload.apellidoP} ${tokenPayload.apellidoM}`
    }
    return ''
  }

  obtenerPerfil(): string {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.perfil || tokenPayload.descCliente || ''
    }
    return ''
  }

  obtenerCodUsuario(): number | null {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.codigoUsuario
    }
    return null
  }

  obtenerCodEmpresa(): number | null {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.codigoEmpresa
    }
    return null
  }

  obtenerCodPerfil(): number | null {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.codigoRol
    }
    return null
  }

  obtenerCodCliente(): number | null {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.cliente
    }
    return null
  }

   obtenerCodTipoUsuario(): number | null {
    const tokenPayload = this.decodeToken()
    if (tokenPayload) {
      return tokenPayload.tipoUsuario
    }
    return null
  }

  getDatosToken() {
    const token = localStorage.getItem('accessToken')

    if (!token) return null

    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload
    } catch (error) {
      return null
    }
  }

  
}

type TokenPayload = {
  codigoEmpresa: number
  cliente: number
  codigoRol: number
  codigoUsuario: number
  tipoUsuario: number
  nombres: string
  apellidoP: string
  apellidoM: string
  perfil?: string
  descCliente?: string
}
