import { ElementRef, Injectable } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
 
import * as FileSaver from 'file-saver'

@Injectable({
  providedIn: 'root' 
})
export class UtilService {
  // Función para convertir texto a mayúsculas
  convertirAMayusculas(texto: string): string {
    return texto.toUpperCase()
  }

  redirigirAUrl(url: string): void {
    window.location.href = url
  }

  generarExcel(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const EXCEL_EXTENSION = '.xlsx'
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    })
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION)
  }

  exportarExcel(data: any[], fileName: string) {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(data)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' })
      this.generarExcel(excelBuffer, fileName)
    }).catch(error => { console.error(error) })
  }

  esCampoInvalido(control: AbstractControl): boolean {
    // Si el control está deshabilitado, verificar si es requerido
    if (control.disabled) {
      if (control.value === '' && control.validator && control.touched) {
        return true
      }
    }

    // Si el control no está deshabilitado, verificar si es inválido y ha sido tocado
    return control.invalid && control.touched
  }

  esFechaHoraValida(fecha: any): boolean {
    return fecha instanceof Date && !isNaN(fecha.getTime())
  }

  obtenerMensajeError(control: AbstractControl, nombreCampo: string): string {
    return control && control.hasError('required') && control.touched ? 'Campo requerido' : ''
  }

  obtenerMensajeErrorDefecto(): string {
    return 'Campo requerido'
  }

  formatDecimals(value: string) {
    return Number(value).toFixed(2)
  }

  formatDateInDDMMYYYY(date: Date, separator = '/') {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()

    return `${day}${separator}${month}${separator}${year}`
  }

  formatDateInYYYYMMDD(date: Date, separator = '/') {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()

    return `${year}${separator}${month}${separator}${day}`
  }

  formatDateInDDMMYYYYhhmm(date: Date, separator = '/') {
    const day = date.getDate()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

    return `${day}${separator}${month}${separator}${year} ${hours}:${minutes}`
  }

  getCurrentDateDDMMYYYYhhmm(separator = '/') {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

    return `${day}${separator}${month}${separator}${year} ${hours}:${minutes}`
  }

  getCurrentDateDDMMYYYY(separator = '/') {
    return this.getCurrentDateDDMMYYYYhhmm(separator).split(' ')[0]
  }

  esEnterKey(event: any): boolean {
    return event.key === 'Enter' || event.code === 'Enter'
  }

  esKeyName(event: KeyboardEvent, key: string): boolean {
    return event.key === key || event.code === key
  }

  obtenerValueElement(event: any): string {
    return (event.target as HTMLInputElement).value
  }

  validarDNI(dni: string): boolean {
    const soloNumeros = dni.toString().replace(/\D/g, '')
    const expresionDNI = /^\d{7,8}(?:[-\s]\d{4})?$/
    if (expresionDNI.test(soloNumeros) && !(/[a-zA-Z]/g.test(dni)) && soloNumeros === dni.replace(/(\d)[\s.]+(?=\d)/g, '$1')) {
      return true
    }
    return false
  }

  markAllControlsAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched()
      } else if (control instanceof FormGroup) {
        this.markAllControlsAsTouched(control)
      }
    })
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  calcularEdad(birthDayString: string) {
    const birthday = new Date(birthDayString)
    const today = new Date()

    let years = today.getFullYear() - birthday.getFullYear()
    let months = today.getMonth() - birthday.getMonth()
    let days = today.getDate() - birthday.getDate()

    // Ajustar los días y months si aún no se ha llegado a la fecha de cumpleaños en el mes actual
    if (months < 0 || (months === 0 && days < 0)) {
      years--
      months = (months + 12) % 12
    }

    // Calcular los días
    if (days < 0) {
      const pastMonthDate = new Date(today.getFullYear(), today.getMonth(), 0)
      days += pastMonthDate.getDate()
    }

    return { years, months, days }
  }

  calcularEdadv2(birthDayString: string) {
    // Convertir la fecha de DD/MM/YYYY a YYYY-MM-DD
    const [day, month, year] = birthDayString.split('/')
    const birthday = new Date(`${year}-${month}-${day}`)
    const today = new Date()

    let years = today.getFullYear() - birthday.getFullYear()
    let months = today.getMonth() - birthday.getMonth()
    let days = today.getDate() - birthday.getDate()

    if (months < 0 || (months === 0 && days < 0)) {
      years--
      months = (months + 12) % 12
    }

    if (days < 0) {
      const pastMonthDate = new Date(today.getFullYear(), today.getMonth(), 0)
      days += pastMonthDate.getDate()
    }

    return { years, months, days }
  }

  formatName(fullName: string) {
    return fullName
      .replaceAll(/  +/g, ' ')
      .split(' ')
      .filter(Boolean)
      .join(' ')
  }

  formatNameUpperCase(fullName: string) {
    return fullName
      .toUpperCase()
      .trim()
      .replaceAll(/  +/g, ' ')
      .split(' ')
      .filter(Boolean)
      .join(' ')
  }

  obtenerCamaClass(estado: string): string {
    switch (estado) {
      case '000001':
        return 'p-button-success'
      case '000002':
        return 'p-button-warning'
      case '000003':
        return 'p-button-danger'
      case '000004':
        return 'p-button-primary'
      case '000005':
        return 'p-button-plain'
      default:
        return ''
    }
  }

  obtenerEstadoCama(estado: string): string {
    switch (estado) {
      case '000001':
        return 'DISPONIBLE'
      case '000002':
        return 'ALTA MÉDICA'
      case '000004':
        return 'BLOQUEADO'
      case '000005':
        return 'PRESTADO'
      default:
        return 'OCUPADO'
    }
  }

  codigoEstado(estado: any): string {
    return estado.slice(7)
  }

  obtenerCamaTooltip(cama: any): string {
    let tooltip = 'Cama: ' + cama.ambAlias + '-' + cama.camaFisica + '.'
    if (cama.primerNombrePaciente !== '') {
      tooltip += '\nPaciente: ' + cama.nombreCompleto
    }
    return tooltip
  }

  soloTextoYAcentos(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Tab']
    const allowedChars = /[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/

    if (!allowedKeys.includes(event.key) && !allowedChars.test(event.key)) {
      event.preventDefault()
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Tab']
    const allowedChars = /^[0-9]+$/

    if (!allowedKeys.includes(event.key) && !allowedChars.test(event.key)) {
      event.preventDefault()
    }
  }

  obtenerAnio() {
    const fechaActual: Date = new Date()
    return fechaActual.getFullYear()
  }

  obtenerMes() {
    const fechaActual: Date = new Date()
    return fechaActual.getMonth() + 1
  }

  setearDate(fechaIngresada: any) {
    return new Date(fechaIngresada)
  }

  abrirPestaniaImpresion(respuesta: any) {
    const blob = new Blob([respuesta], { type: 'application/pdf' })
    const fileURL = URL.createObjectURL(blob)
    const opcionesImpresion = 'width=800,height=600,fullscreen=no,toolbar=no,scrollbars=yes,resizable=yes'
    window.open(fileURL, '_blank', opcionesImpresion)
  }

  dataURItoBlob(dataURI: any, type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const byteString = window.atob(dataURI)
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const int8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([int8Array], { type })
    return blob
  }

  saveAsBlobDirect(data: any, filename: any) {
    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = filename + '.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }

  saveAsBlob(data: any, filename: any) {
    const url = window.URL.createObjectURL(this.dataURItoBlob(data))
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = filename + '.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }

  saveAsBlobCsv(data: any, filename: string) {
    const blob = new Blob([data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = filename + '.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }
  saveAsBlobXls(data: any, filename: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = filename + '.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }

  hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  bytesToDataURL(bytes: Uint8Array): string {
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    return url
  }

  formatoNDigitos(digitos: number, numero: string): string {
    return numero.padStart(digitos, '0')
  }

  inputSoloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/
    const inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      // Si el carácter no es numérico, previene la inserción del mismo
      event.preventDefault()
      return false
    }

    return true
  }

  guardarEnLocalStorage(combos: any[], cacheKey: any) {
    if (Array.isArray(combos) && combos.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(combos))
    }
  }

  groupBy<T>(array: T[], key: keyof T): GroupedResult<T> {
    return array.reduce((result: GroupedResult<T>, currentValue: T) => {
      const groupKey = currentValue[key] as string

      if (!result[groupKey]) {
        result[groupKey] = []
      }

      result[groupKey].push(currentValue)

      return result
    }, {})
  }

  verifyActiveElement(element: HTMLInputElement | ElementRef<any> | null) {
    if (
      !element ||
      (
        element instanceof HTMLInputElement &&
        document.activeElement !== element
      ) ||
      (
        element instanceof ElementRef &&
        document.activeElement !== element.nativeElement
      )
    ) {
      return false
    }

    return true
  }

  focusElement(element: HTMLInputElement | ElementRef<any> | null) {
    if (element instanceof HTMLInputElement) {
      element.focus()
    } else if (element instanceof ElementRef) {
      element.nativeElement.focus()
    }
  }

  formatMedicoNombre(medico?: Medico | null) {
    if (!medico) return ''

    return `${medico.numeroColegiatura} - ${this.formatName(
      `${medico.apellidoPaterno} ${medico.apellidoMaterno}`
    )}, ${this.formatName(
      `${medico.primerNombre} ${medico.segundoNombre ?? ' '}`
    )}`
  }

  leftPad(params: { value: string, size: number, character?: string }): string {
    const { value, size, character = '0' } = params
    const paddingNeeded = size - value.length

    if (paddingNeeded > 0) {
      return character.repeat(paddingNeeded) + value
    } else {
      return value
    }
  }

  generarHoras(validarTiempoActual = false, desdeFecha = new Date()) {
    const horas: string[] = []
    const inicio = 0 // 00:00 am en minutos
    const fin = 24 * 60 - 15 // 11:45 pm en minutos (23:45)

    const currentHours = desdeFecha.getHours()
    const currentMinutes = desdeFecha.getMinutes()
    const currentTimeInMinutes = currentHours * 60 + currentMinutes

    for (let tiempo = inicio; tiempo <= fin; tiempo += 15) {
      if (validarTiempoActual && tiempo <= currentTimeInMinutes) {
        continue // Omitir tiempos menores o iguales a la hora actual
      }

      const hora24 = Math.floor(tiempo / 60)
      const minuto = tiempo % 60
      const periodo = hora24 >= 12 ? 'pm' : 'am'
      const hora12 = hora24 % 12 === 0 ? 12 : hora24 % 12
      const horaFormateada = `${hora12.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')} ${periodo}`
      horas.push(horaFormateada)
    }

    return horas
  }

  parseLocalDate(dateString: string) {
    const [year, month, day] = dateString.split('-').map(Number)

    return new Date(year, month - 1, day)
  }

  esMayorIgual14Anios(anios: number) {
    return anios >= 14
  }

  esMenor14Anios(anios: number) {
    return anios < 14
  }

  mmToPt(mm: number) {
    return mm * 2.8346
  }

  obtenerIniciales({
    apellidoPaterno,
    apellidoMaterno,
    primerNombre,
    segundoNombre
  }: {
    apellidoPaterno: string
    apellidoMaterno: string
    primerNombre: string
    segundoNombre?: string
  }) {
    return `${apellidoPaterno[0]}${apellidoMaterno[0]}${primerNombre[0]}${segundoNombre?.[0] ?? ''}`.toLocaleUpperCase().replaceAll(' ', '')
  }

  formatText(text: string): string {
    if (!text) return ''

    return text.replace(/\n/g, '<br>')
  }

  async getBase64Image(imgUrl: string, type = 'image/png'): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imgUrl
      img.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL(type)
        resolve(dataURL) // Retorna el Base64 como promesa
      }
      img.onerror = function () {
        reject(new Error('Error al cargar la imagen'))
      }
    })
  }

  convertFileToHex(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        const hexString = bytes.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
        resolve(hexString);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
 
  esDigito(char: string): boolean {
    return /\d/.test(char);
  }
 
  esLetra(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }
 
  obtenerFiltroBusqueda(filt: string): string { 
    return filt.trim().toUpperCase();
  }

  validateInput(unit: string, value: string): boolean {
    const numericValue = parseFloat(value);
    switch (unit.trim().toLowerCase()) {
      case '°c':
        return /^\d+(\.\d{0,2})?$/.test(value) && numericValue >= 0 && numericValue <= 99;
      case 'kg':
        return /^\d+(\.\d{0,2})?$/.test(value) && numericValue >= 0.5 && numericValue <= 300;
      case 'cm':
        return /^\d+$/.test(value) && numericValue >= 1 && numericValue <= 270;
      case 'mmhg':
      case 'latidos x min':
      case 'resp x min':
        return /^\d+$/.test(value) && numericValue >= 0 && numericValue <= 250;
      case '%':
        return /^\d+$/.test(value) && numericValue >= 0 && numericValue <= 100;
      default:
        return true;
    }
  }

  calculateIMC(peso: number, talla: number): number {
    const tallaMetros = talla / 100;
    const imc = peso / (tallaMetros * tallaMetros);
    return parseFloat(imc.toFixed(2));
  }

  saveAsBlobDocx(data: any, filename: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = filename + '.docx'
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }
}




type GroupedResult<T> = Record<string, T[]>

type Medico = {
  apellidoPaterno: string
  apellidoMaterno: string
  primerNombre: string
  segundoNombre: string
  numeroColegiatura: string
}
