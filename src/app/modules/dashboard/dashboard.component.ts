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
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
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
import { LoadingComponent } from '../../shared/loading/loading.component'; 
Chart.register(ChartDataLabels);

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
  imports: [ReactiveFormsModule, FormsModule, DropdownModule, TabsModule,
    ButtonModule, CommonModule, ChartModule, LoadingComponent,
    MultiSelectModule, ProgressBarModule, CardModule, PanelModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  chartPlugins = [ChartDataLabels];
  empresas: ClienteResponse[] = [];
  anios: ParametroResponse[] = [];
  meses: any[] = MESES;
  localesFiltro: any[] = [];
  loading: boolean = false;
  dataResumen: ResumenResiduos[] = [];
  residuos: any[] = [];
  chartResiduosData: any;
  chartOptions: any;
  idCliente: any;
  idAnio: any
  idMeses!: any;
  idLocales!: any;
  idResiduos!: any;
  graficoResiduos!: any[]
  graficoResiduosDona!: any[]
  chartData: any;
  chartStackedOptions = {};
  donutData!: ChartData<'doughnut'>;
  donutOptions!: ChartConfiguration<'doughnut'>['options'];
  barData!: any;
  barOptions!: any;
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
      locales: this.localService.listado(this.obtenerCodCliente(), '', 1),
      residuos: this.residuosService.listado(this.obtenerCodCliente(), '', 1),
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
        this.idLocales = null
        this.idResiduos = null
      });
  }

  obtenerCodCliente() {
    return this.esCliente() ? this.autenticacionService.getDatosToken()?.cliente || 0 : this.idCliente;
  }



  listarGraficoBarra() {
    this.loading = true
    this.dashboardService.listarGraficoBarra(
      this.obtenerCodCliente(),
      this.idAnio || 0,
      this.idLocales ?? this.localesFiltro.map(r => r.local).join(','),
      this.idMeses ?? this.meses.map(r => r.value).join(','),
      this.idResiduos ?? this.residuos.map(r => r.residuo).join(','),
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
      this.obtenerCodCliente(),
      this.idAnio || 0,
      this.idLocales ?? this.localesFiltro.map(r => r.local).join(','),
      this.idMeses ?? this.meses.map(r => r.value).join(','),
      this.idResiduos ?? this.residuos.map(r => r.residuo).join(','),
    ).pipe(
      catchError((error) => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }),
      finalize(() => (this.loading = false))
    )
      .subscribe((res: any) => {
        this.graficoResiduosDona = res.codigo === 0 ? res.respuesta : [];
        this.buildChartDona(this.graficoResiduosDona)
        this.buildChartBarras(this.graficoResiduosDona)
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

 private buildChartBarras(data: any[]) {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  const filtered = data.filter(r => parseFloat(r.totalAnio) > 0);

  const labels = filtered.map(r => r.descResiduo);
  const values = filtered.map(r => parseFloat(r.totalAnio));
  const colors = this.generateColors(values.length);

  this.barData = {
    labels,
    datasets: [
      {
        label: 'Cantidad por Residuo',
        data: values,
        backgroundColor: colors
      }
    ]
  };

  this.barOptions = {
    indexAxis: 'y', // Barras horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx:any) => `${ctx.label}: ${Number(ctx.raw).toLocaleString('es-PE')}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor },
        title: {
          display: true,
          text: 'Cantidad',
          color: textColor
        }
      },
      y: {
        ticks: { color: textColor },
        title: {
          display: true,
          text: 'Tipo de Residuo',
          color: textColor
        }
      }
    }
  };
}



 private buildChartDona(data: any[]) {
  const minValueToDisplay = 1; // Valor mínimo para mostrar individualmente
  const documentStyle = getComputedStyle(document.documentElement);

  const filtered = data.filter(r => parseFloat(r.totalAnio) > 0);

  // Separar valores relevantes y otros
  const aboveThreshold = filtered.filter(r => parseFloat(r.totalAnio) > minValueToDisplay);
  const belowThreshold = filtered.filter(r => parseFloat(r.totalAnio) <= minValueToDisplay);

  const otherTotal = belowThreshold.reduce((sum, r) => sum + parseFloat(r.totalAnio), 0);

  const labels = [...aboveThreshold.map(r => r.descResiduo), ...(otherTotal > 0 ? ['Otros'] : [])];
  const values = [...aboveThreshold.map(r => parseFloat(r.totalAnio)), ...(otherTotal > 0 ? [otherTotal] : [])];

  const colors = this.generateColors(values.length);

  this.donutData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      hoverOffset: 4
    }]
  };

  this.donutOptions = {
    responsive: true,
    
    maintainAspectRatio: false,
    animation: {
      duration: 0 
    },
    cutout: '10%',
    plugins: {
      datalabels: {
        color: '#000000',
        display: (ctx:any) => ctx.dataset.data[ctx.dataIndex] > minValueToDisplay,
        formatter: (v) => v.toLocaleString('es-PE', { maximumFractionDigits: 3 }),
        font: {
          weight: 'bold',
          size: 0
        },
        textShadowColor: 'rgba(255,255,255,0.8)',
        textShadowBlur: 4
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 14,
          padding: 16,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${Number(ctx.raw).toLocaleString('es-PE')}`
        }
      }
    }
  };
}



  private generateColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i); // 0‑360°
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
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
      datasets: datasets
    };
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


  ngOnInit() {
    this.cargarFiltrosIniciales();
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

  esCliente() {
    return this.autenticacionService.getDatosToken()?.tipoUsuario == 1
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
      //locales: this.localService.listado(this.obtenerCodCliente(), '', 1),
      residuos: this.residuosService.listado(this.obtenerCodCliente(), '', 1),
      empresas: this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa, "", "", 1),
    })
      .pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(({ anios, residuos, empresas }) => {
        this.anios = anios.codigo === 0 ? anios.respuesta : [];
       // this.localesFiltro = locales.codigo === 0 ? locales.respuesta : [];
        this.residuos = residuos.codigo === 0 ? residuos.respuesta : [];
        this.empresas = empresas.codigo === 0 ? empresas.respuesta : [];
      });
  }
  limpiar() {
    this.idAnio = null;
    this.idMeses = null;
    this.idLocales = null;
    this.idResiduos = null
    this.idCliente = null
    this.dataResumen = [];
    this.graficoResiduos = []
    this.chartOptions.labels = [];
    this.chartOptions.datasets[0].data = [];


  }

  buscar() {
    if (this.obtenerCodCliente() == null || this.obtenerCodCliente() == 0) {
      this.mensajeService.advertencia('Validación', 'Debe seleccionar una empresa.')
      return
    }

    if (this.idAnio == null) {
      this.mensajeService.advertencia('Validación', 'Debe especificar año.')
      return
    }
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
