import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';
import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts"; 

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})

export class ReportPage extends BasePage {

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  endPointLabel: string;
  endPointMethod: string;
  filterDate: any;

  constructor(
    public pageService: PageService,
    public activatedRoute: ActivatedRoute
  ) {
    super(pageService);
    this.activatedRoute.queryParams.subscribe((params) => {
      this.endPointMethod = params.type;
      this.filterDate = {
        startDate: params.startDate,
        endDate: params.endDate
      };
      this.endPointLabel = 'Reporte: ' + this.settings.reportTypes[this.endPointMethod].label;
      this.setChartOptions();
      this.getReport();
    })
  }
  getReport() {
    let endPoint = this.settings.endPoints.reports + this.settings.endPointsMethods.reports[this.endPointMethod]
    endPoint += this.getQueryString(this.filterDate);

    this.pageService.httpGet(endPoint, true)
      .then( (res) => {
        this.cleanEmptyValues(res);
      })
      .catch( (err) => {
        this.pageService.showError(err);
      })
  }

  cleanEmptyValues(response: any) {
    let labels = [];
    let series = [];

    for(let index in response.series) {
      if(response.series[index] > 0) {
        labels.push(response.categories ? response.categories[index] : response.labels[index]);
        series.push(response.series[index]);
      }
    }

    this.chartOptions.labels = labels;
    this.chartOptions.series = series;
  }

  getSubtitle() {
    if(this.filterDate.startDate && this.filterDate.endDate)  return 'Entre el ' + this.filterDate.startDate + ' y el ' + this.filterDate.endDate;
    if(this.filterDate.startDate)  return 'Desde el ' + this.filterDate.startDate;
    if(this.filterDate.endDate)  return 'Hasta el ' + this.filterDate.endDate;
    return '';
  }

  downloadReport() {
    this.pageService.downloadImage('graphic-container', this.settings.reportTypes[this.endPointMethod].label);
  }

  setChartOptions() {
    this.chartOptions = {
      colors: ['#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FF99', '#99FFFF', '#99CCFF', '#9999FF', '#CC99FF', '#FF99FF', '#FF99CC', '#E0E0E0'],
      chart: {
        type: "pie",
        height: 700,
        toolbar: {
          show: false
        },
      },
      labels: [],
      legend: {
        show: true,
        position: 'bottom',
        labels: {
          colors: '#000000',
        },
        fontSize: '14px',
      },
      title: {
        text: this.settings.reportTypes[this.endPointMethod].label,
        align: 'center',
        floating: false,
        offsetY: 0,
        style: {
          fontSize: '16px',
          color: '#777777'
        }
      },
      subtitle: {
        text: this.getSubtitle(),
        align: 'center',
        floating: false,
        offsetY: 25,
        style: {
          fontSize: '16px',
          color: '#777777'
        }
      },
      series: null
    }
  }
}
