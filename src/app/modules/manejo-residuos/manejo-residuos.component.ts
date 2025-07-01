import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { GuardarManejoResiduoRequest, ListadoLocalResiduosResponse, LocalGroup, ManejoResiduoResponse } from '../../models/residuo/residuo.interface';
import { FormHelper } from '../../shared/form.helper';
import { ClienteService } from '../../service/cliente.service';
import { AutenticacionService } from '../../auth/autenticacion.service';
import { catchError, EMPTY, finalize, forkJoin, from, mergeMap, of } from 'rxjs';
import { ClienteResponse, ListadoClientesResponse } from '../../models/cliente/cliente.interface';
import { MensajesToastService } from '../../shared/mensajes-toast.service';
import { ParametroService } from '../../service/parametro.service';
import { PARAMETROS } from '../../shared/sistema-enums';
import { ParametroResponse } from '../../models/parametro/parametro.interface';
import { LocalService } from '../../service/local.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ManejoResiduoService } from '../../service/manejo-residuo.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { SidebarModule } from 'primeng/sidebar';
@Component({
  selector: 'app-manejo-residuos',
  standalone: true,
  imports: [DropdownModule, TableModule, ButtonModule, CommonModule, SidebarModule,
    MultiSelectModule, ReactiveFormsModule, FormsModule, LoadingComponent],
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
  residuosPorLocal: any[] = [];
  meses = ['Ene', 'Febr', 'Mar', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agos', 'Sept', 'Oct', 'Nov', 'Dic'];
  modoEdicion: boolean = false;
  loading: boolean = false
  expandedRows: { [key: number]: boolean } = {};
  registrosModificados: {
    [key: string]: GuardarManejoResiduoRequest;
  } = {};

  mostrarFiltros: boolean = false;
  constructor(
    private autenticacionService: AutenticacionService,
    private clienteService: ClienteService,
    private menajoResiduoService: ManejoResiduoService,
    private localService: LocalService,
    private parametroService: ParametroService,
    private mensajeService: MensajesToastService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      empresa: [null, Validators.required],
      anio: [null,  Validators.required],
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

  editar() {
    this.modoEdicion = !this.modoEdicion;
    
  }

  guardar() { 
    const idEstado = 1;
    const anio = this.form.get('anio').value;
    const requests = Object.values(this.registrosModificados)
      .map(item => ({
        codLocal: item.codLocal,
        codResiduo: item.codResiduo,
        anio,
        detalle: item.detalle.filter(d => d.cantidad !== null && !isNaN(d.cantidad)),
        idEstado, 
      }))
      .filter(req => req.detalle.length > 0);

    this.loading = true

    from(requests)
      .pipe(
        mergeMap((req) =>
          this.menajoResiduoService.registrar(req).pipe(
            catchError(err => {
               const mensaje = this.obtenerMensajeDeError(err, req);
              this.mensajeService.error('Error al guardar', mensaje);
              return of(null);
            })
          )
        )
      )
      .subscribe({
        next: res => {
          this.mensajeService.exito('Completado', 'Todos los residuos fueron enviados');
        },
        complete: () => {
          this.loading = false
          this.registrosModificados = {};
          this.modoEdicion = false
          this.buscar()
        }
      });
  }

  obtenerMensajeDeError(error: any, req: GuardarManejoResiduoRequest): string {
  const local = req.codLocal;
  const residuo = req.codResiduo;

  if (error?.error?.message) {
    return `Local ${local}, residuo ${residuo}: ${error.error.message}`;
  }

  if (error?.status === 0) {
    return `No se pudo conectar al servidor (Local ${local}, residuo ${residuo}).`;
  }

  return `Error desconocido al guardar Local ${local}, residuo ${residuo}.`;
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
    const key = `${residuo.codLocal}_${residuo.codResiduo}`;
    const anio = this.form.get('anio').value;

    if (regex.test(valor) || valor === '') {
      residuo['mes' + mesIndex.toString().padStart(2, '0')] = valor;
    } else {
      // Si se pasa de 3 decimales, recorta automáticamente
      const corregido = parseFloat(valor).toFixed(3);
      input.value = corregido;
      residuo['mes' + mesIndex.toString().padStart(2, '0')] = corregido;
    }
  
    const cantidad = parseFloat(valor);
    const mes = mesIndex;

    // Crear si no existe
    if (!this.registrosModificados[key]) {
      this.registrosModificados[key] = {
        codLocal: residuo.codLocal,
        codResiduo: residuo.codResiduo,
        anio,
        detalle: []
      };
    }

    // Reemplazar o agregar
    const detalle = this.registrosModificados[key].detalle;
    const index = detalle.findIndex(d => d.mes === mes);
    if (index !== -1) {
      detalle[index].cantidad = cantidad;
    } else {
      detalle.push({ mes, cantidad });
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
      locales: this.localService.listado(this.form.get('empresa').value, '',1)
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
    if(!this.form.valid){
      this.form.markAllAsTouched();
      return
    }

    this.loading = true;
    this.menajoResiduoService.listado(this.form.get('empresa').value, this.form.get('anio').value, this.form.get('local').value ?? this.localesFiltro.map(r => r.local).join(',')).pipe(
      catchError((errorResponse: any) => {
        this.mensajeService.errorServicioConsulta(errorResponse);

        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ListadoLocalResiduosResponse) => {
      const { respuesta, codigo } = response;
      if (codigo === 0) this.localesResiduos = respuesta
      else this.localesResiduos = []
      const seleccionados = this.form.value.local;
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
