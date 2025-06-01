import { AbstractControl, ValidationErrors } from '@angular/forms';

export function rucValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;

  if (!value) return null;

  const isRUC10 = /^10\d{9}$/.test(value);
  const isRUC20 = /^20\d{9}$/.test(value);
  const isExtranjero = /^[A-Z0-9]{6,15}$/.test(value) && !value.startsWith('10') && !value.startsWith('20');

  return (isRUC10 || isRUC20 || isExtranjero) ? null : { invalidRUC: true };
}
