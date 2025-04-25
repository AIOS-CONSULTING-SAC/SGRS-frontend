import { Component, EventEmitter, Output } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioResponse } from '../../../models/usuario/usuario.interface';
import { CommonModule } from '@angular/common';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';

@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, CommonModule, DropdownModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent {
  usuarios: UsuarioResponse[] = [
    { id: 1, descEmpresa: 'ISOSEG PERÚ', tipoUsuario: 'Interno', rol: 'Administrador', nombres: 'Jaime', apellidos:'Santos',nroDocumento: '40442334', estado: 'Activo' },
    { id: 1, descEmpresa: 'FORTICLIENT SAC', tipoUsuario: 'Externo', rol: 'Invitado', nombres: 'Jaime', apellidos:'Santos',nroDocumento: '40442334', estado: 'Activo' },
    { id: 1, descEmpresa: 'GALAXY BIS', tipoUsuario: 'Externo', rol: 'Invitado', nombres: 'Jaime', apellidos:'Santos',nroDocumento: '40442334', estado: 'Activo' },
  ];
  loading = false;
  razonSocial: string = '';
  ruc = '';
  estado: 'Activo' | 'Inactivo' | '' = 'Activo';
  tipoUsuario: '1' | '2' | '' = '1';
  rol:  '1' | '2' | '' = '';
  empresa:'1' | '2' | '' = '';
  @Output() registrar = new EventEmitter();
  @Output() editar = new EventEmitter<UsuarioResponse>();

  constructor(private confirmationService: ConfirmationService, 
    private messageService: MensajesToastService) {
    this.buscar();
  }

  buscar() {
    this.loading = true;
    /*this.empresaService.listar({ razonSocial: this.razonSocial, ruc: this.ruc, estado: this.estado })
      .subscribe(empresas => {
        this.empresas = empresas;
        this.loading = false;
      });*/
  }

  limpiar() {
    this.razonSocial = '';
    this.ruc = '';
    this.estado = 'Activo';
    this.buscar();
  }

  eliminar(empresa: UsuarioResponse) {
    console.log(empresa);
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar el usuario <b>' + empresa.nombres + '</b> ? <br /><br />Podrá reactivar en cualquier momento.',
      header: 'Eliminar empresa',
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
        this.messageService.exito('Éxito', 'El usuario <b>' + empresa.nombres + '</b> fue desactivada correctamente.');
      }
    });
  }
}
