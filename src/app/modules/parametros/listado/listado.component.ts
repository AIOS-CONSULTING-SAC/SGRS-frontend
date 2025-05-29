import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, DropdownModule, ButtonModule, InputTextModule, CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService, MensajesToastService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  tituloComponente = '';

  @Output() registrar = new EventEmitter();
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
  modulos = [
    { label: 'Módulo A', value: 'MOD1' },
    { label: 'Módulo B', value: 'MOD2' }
  ];

  opciones = [
    { label: 'Opción X', value: 'OPX' },
    { label: 'Opción Y', value: 'OPY' }
  ];

  prefijos = [
    { label: 'Pre 1', value: 'PRE1' },
    { label: 'Pre 2', value: 'PRE2' }
  ];

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
      .listado(
        this.codModulo,
        this.codOpcion,
        this.codPrefijo,
        this.desc1,
        this.desc2,
        undefined, // desc3
        undefined, // int01
        undefined, // int02
        undefined, // int03
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
      console.log(parametro);
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
            .eliminar(parametro.parametro, this.autenticacionService.getDatosToken()?.codigoUsuario ?? 0)
            .pipe(finalize(() => this.buscar()))
            .subscribe({
              next: (res) => {
                if (res.codigo === 0) {
                  this.mensajeService.exito('Éxito','Se desactivó el parámetro correctamente');
                } else {
                  this.mensajeService.error('Error',res.mensaje || 'Error al eliminar');
                }
              },
              error: (err) => this.mensajeService.errorServicioGuardado(err)
            });
        }, 
      });
    }
   

}
