import { AbstractControl, FormGroup } from '@angular/forms'; 
import { UtilService } from './util.service';

export class FormHelper { 
    utilService: UtilService = new UtilService();
    constructor(private formGroup: FormGroup) { }

    obtenerMensajeError(control: AbstractControl, campo: string): string {
    if (control.errors) {
      if (control.errors['required']) {
        return `El campo es obligatorio.`;
      }
      if (control.errors['pattern']) {
        return `El formato del campo  no es válido.`;
      }
      if (control.errors['minlength']) {
        return `El campo debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      }
      if (control.errors['maxlength']) {
        return `El campo debe tener como máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
      }
      if (control.errors['email']) {
        return `El campo debe ser un correo válido.`;
      }
    }
    return this.obtenerMensajeErrorDefecto();
  }


    obtenerMensajeErrorDefecto(): string {
        return this.utilService.obtenerMensajeErrorDefecto();
    }

    esCampoInvalido(campo: string): boolean {
        const control = this.formGroup.get(campo);
        if (control){
            return this.utilService.esCampoInvalido(control);
        }
        else { return false }
    }

    esClaseInvalido(campo: string): string {
        const control = this.formGroup.get(campo);
        if (control)
            return this.utilService.esCampoInvalido(control) ? 'ng-invalid ng-dirty' : '';
        else { return '' }
    }
}