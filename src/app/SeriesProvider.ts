import { sample } from 'lodash';
import { RandomWalk, RANDOM_WORDS } from './RandomWalk';
import { InfinityQuery, InfinitySeriesQuery } from './../types';
export class SeriesProvider {
  constructor(private target: Extract<InfinityQuery, InfinitySeriesQuery>) {}
  query(startTime: number, endTime: number) {
    return new Promise((resolve, reject) => {
      let result = [];
      if (
        this.target.type === 'series' &&
        (this.target.source === 'random-walk' || this.target.source === 'expression')
      ) {
        if (this.target.seriesCount && this.target.seriesCount > 1) {
          for (let i = 1; i <= this.target.seriesCount; i++) {
            let seriesName = this.target.alias || sample(RANDOM_WORDS) || 'Random Walk';
            if (seriesName.indexOf('${__series.index}') > -1) {
              seriesName = seriesName.replace(/\${__series.index}/g, i.toString());
            } else {
              seriesName += ` ${this.target.alias ? i : ''}`;
            }
            let rw = new RandomWalk(startTime, endTime);
            let datapoints = rw.datapoints;
            if (this.target.source === 'expression') {
              let expression = this.target.expression || `$i`;
              expression = expression.replace(/\${__series.index}/g, (i - 1).toString());
              datapoints = rw.mapWithExpression(expression);
            }
            result.push({
              target: seriesName,
              datapoints: rw.overrideDatapoints(this.target.dataOverrides || [], datapoints),
            });
          }
        } else {
          let rw = new RandomWalk(startTime, endTime);
          let datapoints = rw.datapoints;
          if (this.target.source === 'expression') {
            let expression = this.target.expression || `$i`;
            expression = expression.replace(/\${__series.index}/g, '0');
            datapoints = rw.mapWithExpression(expression);
          }
          result.push({
            target: this.target.alias || 'Random Walk',
            datapoints: rw.overrideDatapoints(this.target.dataOverrides || [], datapoints),
          });
        }
      }
      resolve(result);
    });
  }
}
