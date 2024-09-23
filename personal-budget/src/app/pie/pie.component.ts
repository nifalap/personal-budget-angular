import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import * as d3 from 'd3';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pb-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss'],
})
export class PieComponent implements OnInit {
  private width: number = 960;
  private height: number = 450;
  private radius: number = Math.min(this.width, this.height) / 2;

  private svg: any;
  private color: any;
  private pie: any;
  private arc: any;
  private outerArc: any;
  private _current: any;

  constructor(private http: HttpClient, private dataService: DataService, @Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createSvg();
      this.createPie();
      this.dataService.fetchData().subscribe(() => {
        this.change(this.dataService.getBudgetData());
      });
    }
  }

  private createSvg() {
    this.svg = d3
      .select('#d3Chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    this.svg.append('g').attr('class', 'slices');
    this.svg.append('g').attr('class', 'labels');
    this.svg.append('g').attr('class', 'lines');
  }

  private createPie() {
    this.color = d3
      .scaleOrdinal()
      .domain([])
      .range([
        '#98abc5',
        '#8a89a6',
        '#7b6888',
        '#6b486b',
        '#a05d56',
        '#d0743c',
        '#ff8c00',
      ]);

    this.pie = d3
      .pie()
      .sort(null)
      .value((d: any) => d.budget);

    this.arc = d3
      .arc()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    this.outerArc = d3
      .arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);
  }

  private change(data: any) {
    const key = (d: any) => d.data.title;

    /* ------- PIE SLICES -------*/
    const slice = this.svg
      .select('.slices')
      .selectAll('path.slice')
      .data(this.pie(data), key);

    slice
      .enter()
      .insert('path')
      .style('fill', (d: any) => this.color(d.data.title))
      .attr('class', 'slice');

    slice
      .transition()
      .duration(1000)
      .attrTween('d', (d: any) => {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: number) => this.arc(interpolate(t));
      });

    slice.exit().remove();

    /* ------- TEXT LABELS -------*/

    const text = this.svg
      .select('.labels')
      .selectAll('text')
      .data(this.pie(data), key);

    text
      .enter()
      .append('text')
      .attr('dy', '.35em')
      .text((d: any) => d.data.title);

    const midAngle = (d: any) =>
      d.startAngle + (d.endAngle - d.startAngle) / 2;

    text
      .transition()
      .duration(1000)
      .attrTween('transform', (d: any) => {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: number) => {
          const d2 = interpolate(t);
          const pos = this.outerArc.centroid(d2);
          pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        };
      })
      .styleTween('text-anchor', (d: any) => {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: number) => {
          const d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? 'start' : 'end';
        };
      });

    text.exit().remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/
    const polyline = this.svg
      .select('.lines')
      .selectAll('polyline')
      .data(this.pie(data), key);

    polyline.enter().append('polyline');

    polyline
      .transition()
      .duration(1000)
      .attrTween('points', (d: any) => {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: number) => {
          const d2 = interpolate(t);
          const pos = this.outerArc.centroid(d2);
          pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [this.arc.centroid(d2), this.outerArc.centroid(d2), pos];
        };
      });

    polyline.exit().remove();
  }
}
