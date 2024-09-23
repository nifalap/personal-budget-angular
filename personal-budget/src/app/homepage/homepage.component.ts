import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';

import Chart from 'chart.js/auto';

import * as d3 from 'd3';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public dataSource: any = {
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#ffcd56',
          '#ff6384',
          '#36a2eb',
          '#fd6b19',
          '#83FF33',
          '#F633FF',
          '#FF3333',
          '#a38080',
        ],
      },
    ],
    labels: [],
  };

  public newDataSource: any = [];

  private svg: any;
  private width = 650;
  private height = 300;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2;
  private colors: any;
  private pie: any;
  private titles: string[] = [];

  constructor(private dataService: DataService) {}

  private createSvg(): void {
    this.svg = d3
      .select('#pie-chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );
  }

  private createColors(): void {
    const titles = this.dataSource.labels;

    this.colors = d3
      .scaleOrdinal()
      .domain(titles)
      .range([
        '#ffcd56',
        '#ff6384',
        '#36a2eb',
        '#fd6b19',
        '#83FF33',
        '#F633FF',
        '#FF3333',
        '#a38080',
      ]);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.budget));

    // Build the pie chart
    this.svg
      .selectAll('pieces')
      .data(pie(this.newDataSource))
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(this.radius))
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr('stroke', '#121926')
      .style('stroke-width', '1px');

    // Add labels
    const labelLocation = d3.arc().innerRadius(100).outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(this.newDataSource))
      .enter()
      .append('text')
      .text((d: any) => d.data.title)
      .attr(
        'transform',
        (d: any) => 'translate(' + labelLocation.centroid(d) + ')'
      )
      .style('text-anchor', 'middle')
      .style('font-size', 15);
  }

  createChart() {
    const ctx = <HTMLCanvasElement>document.getElementById('myChart');
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
    });
  }

  ngOnInit(): void {
    if (
      this.dataService.getDataSource().length == 0 ||
      this.dataService.getNewDataSource().length == 0
    ) {
      this.dataService.fetchDataFromBackend().subscribe((res: any) => {
        for (var i = 0; i < res.myBudget.length; i++) {
          this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
          this.dataSource.labels[i] = res.myBudget[i].title;

          this.newDataSource.push({
            title: res.myBudget[i].title,
            budget: res.myBudget[i].budget,
          });
        }
        this.dataService.setDataSource(this.dataSource);
        this.dataService.setNewDataSource(this.newDataSource);

        // console.log(this.dataService.getDataSource());
        this.createChart();
        this.createSvg();
        this.createColors();
        this.drawChart();
      });
    } else {
      this.createChart();
      this.createSvg();
      this.createColors();
      this.drawChart();
    }
  }
}
