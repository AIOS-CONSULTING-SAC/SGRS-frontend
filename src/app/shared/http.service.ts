import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private readonly http: HttpClient) { }

  obtenerQueryGet<T>(
    endpoint: string,
    params?: any,
    contentType: string = 'application/json'
  ): Observable<T> {
    const headers = this.createHeaders(contentType)
  
    return this.http.get<T>(endpoint, { headers, params })
  }

  obtenerQueryGetPdf<T>(
    endpoint: string,
    params?: any,
    contentType: string = 'application/json',
    responseType: 'json' | 'arraybuffer' = 'json'
  ): Observable<T> {
    const headers = this.createHeaders(contentType)
    return this.http.get<T>(endpoint, { headers, params, responseType: responseType as any })
  }

  obtenerQueryGetConCsvComoRespuesta(
    endpoint: string,
    params?: any,
    contentType: string = 'text/csv'
  ): Observable<Blob> {
    const headers = this.createHeaders(contentType)

    return this.http.get(endpoint, { headers, params, responseType: 'blob' })
  }

  obtenerQueryPost<T>(endpoint: string, data: any, contentType: string = 'application/json'): Observable<T> {
    const headers = this.createHeaders(contentType)
    return this.http.post<T>(endpoint, data, { headers })
  }

  obtenerQueryPostConPdfComoRespuesta(endpoint: string, data: any, contentType: string = 'application/json') {
    const headers = this.createHeaders(contentType)
    return this.http.post(endpoint, data, { headers, responseType: 'blob' })
  }

  obtenerQueryPut<T = any>(
    endpoint: string,
    data: any,
    params?: any,
    contentType: string = 'application/json'
  ): Observable<T> {
    const headers = this.createHeaders(contentType)
    return this.http.put<T>(endpoint, data, { headers, params })
  }

  obtenerQueryDelete<T>(endpoint: string, params?: any, contentType: string = 'application/json'): Observable<T> {
    const headers = this.createHeaders(contentType)
    return this.http.delete<T>(endpoint, { headers, params })
  }

  private createHeaders(contentType: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': contentType,
      Authorization: 'Bearer ' + localStorage.getItem('accesstoken')
      // Puedes agregar otros encabezados aquí si es necesario
    })
  }
}
