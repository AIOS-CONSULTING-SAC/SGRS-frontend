import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { ListadoParametrosResponse, ParametroResponse } from '../../../models/parametro/parametro.interface';
import { ParametroService } from '../../../service/parametro.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { ActivatedRoute, Data } from '@angular/router';
import { PARAMETROS } from '../../../shared/sistema-enums';
@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, DropdownModule, ButtonModule, InputTextModule, CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService, MensajesToastService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  tituloComponente = '';

  @Output() registrar = new EventEmitter<ParametroResponse[]>();
  @Output() editar = new EventEmitter<ParametroResponse>();
  parametros: ParametroResponse[] = [];
  loading = false;

  // Filtros
  codModulo?: string;
  codOpcion?: string;
  codPrefijo?: string;
  desc1?: string;
  desc2?: string;
  idEstado?: string;

  // Combos
  @Input() modulos: ParametroResponse[] = [];

  opciones: ParametroResponse[] = [];

  prefijos: ParametroResponse[] = [];

  estados = [
    { label: 'Activo', value: '1' },
    { label: 'Inactivo', value: '0' }
  ];

  constructor(private parametroService: ParametroService,
    private mensajeService: MensajesToastService,
    private readonly route: ActivatedRoute,
    private autenticacionService: AutenticacionService,
    private confirmationService: ConfirmationService
  ) {
    this.buscar();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: Data) => {
      this.tituloComponente = data['breadcrumb']
    })
  
  }

  buscar() {
    this.loading = true;
    this.parametroService
      .listado(1,
        this.codModulo,
        this.codOpcion,
        this.codPrefijo,
        this.desc1,
        this.desc2,
        undefined, // desc3
        undefined, // int01
        undefined, // int02 
        this.idEstado
      ).pipe(
        catchError((errorResponse: any) => {
          this.mensajeService.errorServicioConsulta(errorResponse);

          return EMPTY;
        }), finalize(() => { this.loading = false })
      ).subscribe((response: ListadoParametrosResponse) => {
        const { respuesta, codigo } = response;
        if (codigo === 0) this.parametros = respuesta
        else this.parametros = []

      });
  }

  cambiarModulo() {

    this.loading = true
    this.parametroService.listado(3, this.codModulo).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.opciones = response.respuesta;
      } else {
        this.opciones = [];
      }
    });
  }

  cambiarOpcion() {
    this.loading = true
    this.parametroService.listado(4, this.codModulo, this.codOpcion).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.prefijos = response.respuesta;
      } else {
        this.prefijos = [];
      }
    });
  }

  limpiar() {
    this.codModulo = undefined;
    this.codOpcion = undefined;
    this.codPrefijo = undefined;
    this.desc1 = undefined;
    this.desc2 = undefined;
    this.idEstado = undefined;
    this.parametros = [];
  }

  eliminar(parametro: ParametroResponse) {
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar el parámetro <b>' + parametro.descripcion1 + '</b> ? <br /><br />Podrá reactivar en cualquier momento.',
      header: 'Eliminar parámetro',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'danger',
      },

      accept: () => {
        this.parametroService
          .eliminar(parametro.parametro)
          .pipe(finalize(() => this.buscar()))
          .subscribe({
            next: (res) => {
              if (res.codigo === 0) {
                this.mensajeService.exito('Éxito', 'Se desactivó el parámetro correctamente');
              } else {
                this.mensajeService.error('Error', res.mensaje || 'Error al eliminar');
              }
            },
            error: (err) => this.mensajeService.errorServicioGuardado(err)
          });
      },
    });
  }


}
