import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TabsModule } from 'primeng/tabs';
import { ChartModule } from 'primeng/chart';
import { MESES, PARAMETROS } from '../../shared/sistema-enums';
import { ParametroService } from '../../service/parametro.service';
import { LocalService } from '../../service/local.service';
import { ResiduoService } from '../../service/residuo.service';
import { ListadoLocalesEmpresaResponse } from '../../models/local/local.interface';
import { catchError, EMPTY, finalize, forkJoin, Observable } from 'rxjs';
import { MensajesToastService } from '../../shared/mensajes-toast.service';
import { ListadoResiduosEmpresaResponse } from '../../models/residuo/residuo.interface';
import { TabView, TabPanel, TabViewModule } from 'primeng/tabview';
import { Chart } from 'chart.js';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ListadoParametrosResponse } from '../../models/parametro/parametro.interface';


export interface FiltroResiduos {
  anio: number;
  mes?: number;
  idLocal?: number | string;
  idResiduoSolido?: number | string;
}

export interface ResumenResiduos {
  nombrePlanta: string;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, FormsModule, DropdownModule, ButtonModule, CommonModule, TabViewModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  chartPlugins = [ChartDataLabels];
  filtroForm!: FormGroup;
  anios: any[] = [];

  meses: any[] = MESES;

  locales: any[] = [];
  loading: boolean = false;
  dataResumen: ResumenResiduos[] = [];
  residuos: any[] = [];
  chartLocalesData: any;
  chartLocalesOptions!: any;
  chartResiduosData: any;
  chartOptions: any;

  constructor(private fb: FormBuilder, private localService: LocalService,
    private residuosService: ResiduoService,
    private mensajeService: MensajesToastService,
    private parametroService: ParametroService) {
    this.setForm();
    Chart.register(ChartDataLabels);
  }

  setForm() {
    this.filtroForm = this.fb.group({
      anio: [null, Validators.required],
      mes: [null],
      idLocal: [null],
      idResiduoSolido: [null]
    });
  }

  setDataPrueba() {
    this.dataResumen = [
      { nombrePlanta: 'Ancón', total: 22.13 },
      { nombrePlanta: 'Carapongo', total: 93.12 },
      { nombrePlanta: 'Cieneguilla', total: 184.16 },
      { nombrePlanta: 'Huascat', total: 297.87 },
      { nombrePlanta: 'José Gálvez', total: 204.85 },
      { nombrePlanta: 'Julio C. Tello', total: 933.33 },
      { nombrePlanta: 'Manchay', total: 4_118.94 },
      { nombrePlanta: 'Pucusana', total: 1.05 },
      { nombrePlanta: 'Punta Hermosa', total: 7_336 },
      { nombrePlanta: 'San Antonio de Carapongo', total: 0.88 },
      { nombrePlanta: 'Punto A', total: 1_928.24 },
      { nombrePlanta: 'San Bartolo de Carapongo', total: 3_083.46 },
      { nombrePlanta: 'San Bartolo Norte', total: 117.76 },
      { nombrePlanta: 'San Bartolo Sur', total: 20_181.79 },
      { nombrePlanta: 'San Juan de Lurigancho', total: 9_573.09 },
      { nombrePlanta: 'Santa Clara', total: 34.12 },
      { nombrePlanta: 'Santa Rosa', total: 15_717.67 },
      { nombrePlanta: 'Ventanilla', total: 1_502.05 },
      { nombrePlanta: 'Santa María 1 y 2', total: 0.82 },
    ]
  }
  ngOnInit() {
    this.setDataPrueba();
    this.setChartLocales();
    this.cargarFiltrosIniciales();
    this.setChartResiduos()
  }

  downloadChart() {
    const canvas = document.getElementById('residuosChart') as HTMLCanvasElement;
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'residuos-por-ptar.png';
      link.href = image;
      link.click();
    }
  }

  setChartLocales() {
    this.chartLocalesData = {
      labels: this.dataResumen.map(p => p.nombrePlanta),
      datasets: [
        {
          label: 'Total de Residuos',
          backgroundColor: '#7CB342',
          data: this.dataResumen.map(p => p.total),
          borderRadius: 4,
          barThickness: 35
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x', // o 'y' para horizontal
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.dataset.label}: ${context.formattedValue}`
          }
        },
        title: {
          display: true,
          text: 'TOTAL DE RESIDUOS POR LOCAL',
          font: {
            size: 18
          }
        },
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#000',
          formatter: (value: number) => `${value} t`,
          font: {
            weight: 'bold',
            size: 12
          }
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Toneladas'
          }
        }
      }
    };

  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }


  setChartResiduos() {

    this.chartResiduosData = {
      labels: ['Arenas', 'Grasas', 'Lodos', 'Maleza y poda', 'Sólidos flotantes'],
      datasets: [{
        data: [8283.84, 3175.19, 73246.74, 83.59, 780.34],
        backgroundColor: ['#F37120', '#07A7E3', '#FFD700', '#E34234', '#6A0DAD']
      }]
    };

    this.chartOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#000'
          }
        }
      }
    };
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
      locales: this.localService.listado(2, 1),
      residuos: this.residuosService.listado(2, 1)
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ anios, locales, residuos }) => {
        this.anios = anios.codigo === 0 ? anios.respuesta : [];
        this.locales = locales.codigo === 0 ? locales.respuesta : [];
        this.residuos = residuos.codigo === 0 ? residuos.respuesta : [];
      });
  }
  limpiar() {
    this.filtroForm.reset();
    this.dataResumen = [];
    this.chartOptions.labels = [];
    this.chartOptions.datasets[0].data = [];

  }

  buscar() {

  }

  descargar(nombre: string) {
    const canvas = document.querySelector(`#${nombre}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${nombre}.png`;
      link.click();
    }
  }


}
