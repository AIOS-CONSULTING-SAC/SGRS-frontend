import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ListadoLocalResiduosResponse, LocalGroup, ManejoResiduoResponse } from '../../models/residuo/residuo.interface';
import { FormHelper } from '../../shared/form.helper';
import { ClienteService } from '../../service/cliente.service';
import { AutenticacionService } from '../../auth/autenticacion.service';
import { catchError, EMPTY, finalize, forkJoin } from 'rxjs';
import { ClienteResponse, ListadoClientesResponse } from '../../models/cliente/cliente.interface';
import { MensajesToastService } from '../../shared/mensajes-toast.service';
import { ParametroService } from '../../service/parametro.service';
import { PARAMETROS } from '../../shared/sistema-enums';
import { ParametroResponse } from '../../models/parametro/parametro.interface';
import { LocalService } from '../../service/local.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ManejoResiduoService } from '../../service/manejo-residuo.service';

@Component({
  selector: 'app-manejo-residuos',
  standalone: true,
  imports: [DropdownModule, TableModule, ButtonModule, CommonModule, MultiSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manejo-residuos.component.html',
  styleUrl: './manejo-residuos.component.scss'
})
export class ManejoResiduosComponent {

  form: FormGroup | any;
  formHelper !: any;
  locales: LocalGroup[] = [];
  empresas: ClienteResponse[] = [];
  anios: ParametroResponse[] = [];
  tituloComponente: string = 'Manejo de Residuos';
  localesFiltro: any[] = [];
  localesResiduos: ManejoResiduoResponse[] = [];
  //residuosOriginal: Residuo[] = []; // llenado por backend
  residuosPorLocal: any[] = [];
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  modoEdicion: boolean = false;
  loading: boolean = false
  expandedRows: { [key: number]: boolean } = {};
  constructor(
    private autenticacionService: AutenticacionService,
    private clienteService: ClienteService,
    private menajoResiduoService: ManejoResiduoService,
    private localService: LocalService,
    private parametroService: ParametroService,
    private mensajeService: MensajesToastService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      empresa: [null],
      anio: [null],
      local: [null]
    });
  }

  ngOnInit(): void {
    this.formHelper = new FormHelper(this.form);
    this.cargarFiltrosIniciales()
  }

  limpiar() {
    this.form.reset({ empresa: 1, año: 2025, local: null });

  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  desactivarEdicion() {
    this.modoEdicion = false;
  }

  permitirSoloNumerosDecimal(event: KeyboardEvent) {
  const inputChar = event.key;

  // Permitir números y un punto (.)
  if (!/^[0-9.]$/.test(inputChar)) {
    event.preventDefault();
    return;
  }

  const input = event.target as HTMLInputElement;

  // Solo permitir un punto decimal
  if (inputChar === '.' && input.value.includes('.')) {
    event.preventDefault();
  }
}

  validar3Decimales(event: Event, residuo: any, mesIndex: number) {
  const input = event.target as HTMLInputElement;
  const valor = input.value;

  // Permite números con hasta 3 decimales
  const regex = /^\d*(\.\d{0,3})?$/;

  if (regex.test(valor) || valor === '') {
    residuo['mes' + mesIndex.toString().padStart(2, '0')] = valor;
  } else {
    // Si se pasa de 3 decimales, recorta automáticamente
    const corregido = parseFloat(valor).toFixed(3);
    input.value = corregido;
    residuo['mes' + mesIndex.toString().padStart(2, '0')] = corregido;
  }
}
  cargarFiltrosIniciales() {
    this.loading = true;

    forkJoin({
      anios: this.parametroService.listado(
        1,
        PARAMETROS.MODULOS.MANTENIMIENTO,
        PARAMETROS.MANTENIMIENTO.OPCIONES.EMPRESAS,
        PARAMETROS.MANTENIMIENTO.EMPRESAS.ANIOS
      ),
      empresas: this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa, "", "", 1),
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ anios, empresas }) => {
        this.anios = anios.codigo === 0 ? anios.respuesta : [];
        this.empresas = empresas.codigo === 0 ? empresas.respuesta : [];
      });
  }

  cambiarCliente() {
    this.listarLocales()
  }

  listarLocales() {
    this.loading = true;

    forkJoin({
      locales: this.localService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa, 1)
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ locales }) => {

        this.localesFiltro = locales.codigo === 0 ? locales.respuesta : [];
      });
  }

  buscar() {
    console.log(this.form.getRawValue());

    this.loading = true;
    this.menajoResiduoService.listado(this.form.get('empresa').value, this.form.get('anio').value, this.form.get('local').value).pipe(
      catchError((errorResponse: any) => {
        this.mensajeService.errorServicioConsulta(errorResponse);

        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ListadoLocalResiduosResponse) => {
      const { respuesta, codigo } = response;
      if (codigo === 0) this.localesResiduos = respuesta
      else this.localesResiduos = []
      const seleccionados = this.form.value.local; // array de locales seleccionados
      const filtrado = seleccionados && seleccionados.length
        ? this.localesResiduos.filter(r => seleccionados.includes(r.codLocal))
        : this.localesResiduos;

      this.residuosPorLocal = this.groupByLocal(filtrado);
    });


  }

  groupByLocal(data: ManejoResiduoResponse[]): any[] {
    const mapa = new Map<number, any>();
    for (const r of data) {
      if (!mapa.has(r.codLocal)) {
        mapa.set(r.codLocal, {
          codLocal: r.codLocal,
          descLocal: r.descLocal,
          residuos: [],
          total: 0
        });
      }
      mapa.get(r.codLocal).residuos.push(r);
      mapa.get(r.codLocal).total += r.total;
    }
    console.log(mapa.values());
    return Array.from(mapa.values());
  }

  expandAll() {
    const expanded: { [key: number]: boolean } = {};
    for (const local of this.residuosPorLocal) {
      expanded[local.codLocal] = true;
    }
    this.expandedRows = expanded;
  }

  collapseAll() {
    this.expandedRows = {};
  }

 navegarConFlechas(event: KeyboardEvent, codLocal: number) {
  const input = event.target as HTMLElement;
  const row = +input.getAttribute('data-row')!;
  const col = +input.getAttribute('data-col')!;
  const local = input.getAttribute('data-local');

  let selector: string | null = null;

  switch (event.key) {
    case 'ArrowRight':
      selector = `[data-local="${local}"][data-row="${row}"][data-col="${col + 1}"]`;
      break;
    case 'ArrowLeft':
      selector = `[data-local="${local}"][data-row="${row}"][data-col="${col - 1}"]`;
      break;
    case 'ArrowDown':
      selector = `[data-local="${local}"][data-row="${row + 1}"][data-col="${col}"]`;
      break;
    case 'ArrowUp':
      selector = `[data-local="${local}"][data-row="${row - 1}"][data-col="${col}"]`;
      break;
  }

  if (selector) {
    const siguiente = document.querySelector(selector) as HTMLInputElement;
    if (siguiente) {
      event.preventDefault();
      siguiente.focus();
      siguiente.select();
    }
  }
}
}
