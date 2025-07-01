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
import { TabViewModule } from 'primeng/tabview';
import { Chart } from 'chart.js';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ListadoParametrosResponse, ParametroResponse } from '../../models/parametro/parametro.interface';
import { AutenticacionService } from '../../auth/autenticacion.service';
import { DashboardService } from '../../service/dashboard.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ClienteResponse } from '../../models/cliente/cliente.interface';
import { ClienteService } from '../../service/cliente.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';


export interface FiltroResiduos {
  anio: number;
  mes?: number;
  idLocal?: number | string;
  idResiduoSolido?: number | string;
}
interface LocalAgrupado {
  descLocal: string;
  [residuo: string]: string | number;
}

export interface ResumenResiduos {
  nombrePlanta: string;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, FormsModule, DropdownModule,
    ButtonModule, CommonModule, TabViewModule, ChartModule,
    MultiSelectModule, ProgressBarModule, CardModule, PanelModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  chartPlugins = [ChartDataLabels];
  filtroForm!: FormGroup;
  empresas: ClienteResponse[] = [];
  anios: ParametroResponse[] = [];
  meses: any[] = MESES;
  localesFiltro: any[] = [];
  loading: boolean = false;
  dataResumen: ResumenResiduos[] = [];
  residuos: any[] = [];
  chartLocalesData: any;
  chartLocalesOptions!: any;
  chartResiduosData: any;
  chartOptions: any;
  idCliente: any;
  idAnio: any
  idMeses!: any;
  idLocales!: any;
  idResiduos!: any;
  graficoResiduos!: any[]
  chartData: any;
  chartStackedOptions = {};
  constructor(private fb: FormBuilder, private localService: LocalService,
    private residuosService: ResiduoService,
    private autenticacionService: AutenticacionService,
    private mensajeService: MensajesToastService,
    private clienteService: ClienteService,
    private dashboardService: DashboardService,
    private parametroService: ParametroService) {
    Chart.register(ChartDataLabels);

  }

   cambiarCliente() {
    this.listarLocales()
  }

  listarLocales() {
    this.loading = true;

    forkJoin({
      locales: this.localService.listado(this.obtenerCodCliente(),'', 1),
       residuos: this.residuosService.listado(this.obtenerCodCliente(),'', 1),
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ locales, residuos }) => {

        this.localesFiltro = locales.codigo === 0 ? locales.respuesta : [];
        this.residuos = residuos.codigo === 0 ? residuos.respuesta : [];
        this.idLocales = []
        this.idResiduos = []
      });
  }

  obtenerCodCliente(){
    return this.esCliente() ? this.autenticacionService.getDatosToken()?.cliente || 0 : this.idCliente;
  }



  listarGraficoBarra() {
    this.dashboardService.listarGraficoBarra(
      this.obtenerCodCliente(),
      this.idAnio || 0,
      this.idLocales,
      this.idMeses,
      this.idResiduos
    ).pipe(
      catchError((error) => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }),
      finalize(() => (this.loading = false))
    )
      .subscribe((res: any) => {
        this.graficoResiduos = res.codigo === 0 ? res.respuesta : [];
        this.getStackedBarChartData();
      });
  }

  listarGraficoVertical() {
    this.dashboardService.listarGraficoVertical(
      this.esCliente() ? this.autenticacionService.getDatosToken()?.codigoEmpresa || 0 : this.idCliente,
      this.idAnio || 0,
      this.idLocales,
      this.idMeses,
      this.idResiduos
    ).pipe(
      catchError((error) => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }),
      finalize(() => (this.loading = false))
    )
      .subscribe((res: any) => {
        // this.residuos = res.codigo === 0 ? res.respuesta : [];
      });
  }

  getPrimaryColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-primary-300') || '#2196f3';
  }

  generatePastelColors(count: number): string[] {
    const colors: string[] = [];
    const baseHue = 160; // Aproximado de #34d399 (verde esmeralda)

    for (let i = 0; i < count; i++) {
      const hue = (baseHue + i * 35) % 360;
      colors.push(`hsl(${hue}, 60%, 75%)`); // pastel = baja saturación + alta luminancia
    }

    return colors;
  }

  setearChartOpciones() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.chartStackedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`
          }
        },
        legend: {
          position: 'top',
          labels: {
            font: { size: 12 },
            color: '#444'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          },
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          },
        }
      }
    }
  }

  getStackedBarChartData() {
    this.setearChartOpciones()
    const locales = this.getLocalesAgrupados();
    const residuos = this.graficoResiduos.map(r => r.descResiduo);
    const baseColor = this.generatePastelColors(this.graficoResiduos.length);

    const datasets = residuos.map((residuo, index) => ({
      label: residuo,

      data: locales.map(loc => loc[residuo] || 0),
      stack: 'residuos'
    }));

    this.chartData = {
      labels: locales.map(loc => loc.descLocal),
      datasets
    };
  }

  applyAlphaToHex(hex: string, alpha: number): string {
    // Convierte "#2196f3" a rgba
    if (!hex.startsWith('#')) return hex;

    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0.1), 1)})`;
  }

  getLocalesAgrupados(): LocalAgrupado[] {
    if (!this.graficoResiduos?.length) return [];

    const localesMap: { [key: string]: LocalAgrupado } = {};

    for (const residuo of this.graficoResiduos) {
      for (const local of residuo.detalleDashboard) {
        const key = local.descLocal;

        if (!localesMap[key]) {
          localesMap[key] = { descLocal: local.descLocal };
        }

        localesMap[key][residuo.descResiduo] = local.total;
      }
    }

    return Object.values(localesMap);
  }

  generateColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 60%, 55%)`;
  }
  buildChart() {
    const locales = this.getLocalesAgrupados();
    const residuos = this.graficoResiduos.map(r => r.descResiduo);

    this.chartData = {
      labels: locales.map(l => l.descLocal),
      datasets: residuos.map(residuo => ({
        label: residuo,
        backgroundColor: this.generateColor(residuo),
        data: locales.map(l => l[residuo] || 0)
      }))
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: false, ticks: { color: '#444' } },
        y: { beginAtZero: true, ticks: { color: '#444' } }
      },
      plugins: {
        legend: { position: 'top' }
      }
    };
  }

  getPorcentaje(valor: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
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

  esCliente() {
    return this.autenticacionService.getDatosToken()?.tipoUsuario == 1
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
      locales: this.localService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa,'', 1),
      residuos: this.residuosService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa,'', 1),
      empresas: this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa, "", "", 1),
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ anios, locales, residuos, empresas }) => {
        this.anios = anios.codigo === 0 ? anios.respuesta : [];
        this.localesFiltro = locales.codigo === 0 ? locales.respuesta : [];
        this.residuos = residuos.codigo === 0 ? residuos.respuesta : [];
        this.empresas = empresas.codigo === 0 ? empresas.respuesta : [];
      });
  }
  limpiar() {
    this.filtroForm.reset();
    this.dataResumen = [];
    this.chartOptions.labels = [];
    this.chartOptions.datasets[0].data = [];

  }

  buscar() {
    this.listarGraficoBarra()
    this.listarGraficoVertical()
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
