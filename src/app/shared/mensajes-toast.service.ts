import { Injectable } from '@angular/core'
import { MessageService } from 'primeng/api'

@Injectable({
  providedIn: 'root'
})
export class MensajesToastService {
  constructor(private readonly messageService: MessageService) { }
  exito(summary: string = 'Éxito', details: string) {
    this.messageService.add({ severity: 'success', summary, detail: details })
  }

  info(summary: string, details: string) {
    this.messageService.add({ severity: 'info', summary, detail: details })
  }

  advertencia(summary: string, details: string) {
    this.messageService.add({ severity: 'warn', summary, detail: details })
  }

  advertenciaWithCustomTime(summary: string, detail: string, life = 5_000) {
    this.messageService.add({ severity: 'warn', summary, detail, life })
  }

  advertenciaDetailWithCustomTime(detail: string, life = 5_000) {
    this.messageService.add({ severity: 'warn', detail, life })
  }

  errorDetail(details: string) {
    this.messageService.add({ severity: 'error', detail: details })
  }

  errorDetailWithCustomTime(detail: string, life = 5_000) {
    this.messageService.add({ severity: 'error', detail, life })
  }

  errorDetailWithCustomTimeAndSummary(summary: string, detail: string, life = 5_000) {
    this.messageService.add({ severity: 'error', summary, detail, life })
  }

  error(summary: string, details: string) {
    this.messageService.add({ severity: 'error', summary, detail: details })
  }

  personalizado(summary: string, details: string, icon: string) {
    this.messageService.add({ severity: 'custom', summary, detail: details, icon })
  }

  showTopLeft() {
    this.messageService.add({ key: 'tl', severity: 'info', summary: 'Info', detail: 'Message Content' })
  }

  showTopCenter() {
    this.messageService.add({ key: 'tc', severity: 'warn', summary: 'Warn', detail: 'Message Content' })
  }

  showBottomCenter() {
    this.messageService.add({ key: 'bc', severity: 'success', summary: 'Success', detail: 'Message Content' })
  }

  showConfirm() {
    this.messageService.clear()
    this.messageService.add({ key: 'c', sticky: true, severity: 'warn', summary: 'Are you sure?', detail: 'Confirm to proceed' })
  }

  errorServicio(message: string, errorResponse: any) {
    this.error('Error', message)
  }

  errorServicioConsulta(error: any) {
    this.errorServicio('Se presentó un problema al realizar la consulta.', error)
    return []
  }

  errorServicioGuardado(error: any) {
    this.errorServicio('Se presentó un problema al realizar acción.', error)
    return []
  }
}
