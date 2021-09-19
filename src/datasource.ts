import { Observable } from 'rxjs';
import { flatten } from 'lodash';
import { DataQueryRequest, DataQueryResponse, LoadingState, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { LegacyVariableProvider, InfinityVariableProvider, migrateLegacyQuery } from './app/variablesQuery';
import { replaceVariables, isDataSourceQuery } from './app/queryUtils';
import { InfinityConfig, InfinityQuery, InfinityVariableQuery, InfinityInstanceSettings } from './types';

export class InfinityDatasource extends DataSourceWithBackend<InfinityQuery, InfinityConfig> {
  constructor(private instanceSettings: InfinityInstanceSettings) {
    super(instanceSettings);
  }
  annotations = {};
  private replaceGlobalQueryWithInfinityQuery(q: InfinityQuery): InfinityQuery {
    if (
      q.type === 'global' &&
      q.global_query_id &&
      this.instanceSettings.jsonData.global_queries &&
      this.instanceSettings.jsonData.global_queries.length > 0
    ) {
      const matchingQuery = this.instanceSettings.jsonData.global_queries.find((tq) => tq.id === q.global_query_id);
      return matchingQuery && matchingQuery.query ? matchingQuery.query : q;
    }
    return q;
  }
  private getResults(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const promises: any[] = [];
    options.targets
      .filter((t: InfinityQuery) => t.hide !== true)
      .forEach((t: InfinityQuery) => {
        promises.push(
          new Promise((resolve, reject) => {
            const globalReplacedQuery = this.replaceGlobalQueryWithInfinityQuery(t);
            const query = replaceVariables(globalReplacedQuery, options.scopedVars);
            switch (query.type) {
              case 'csv':
              case 'html':
              case 'json':
              case 'xml':
              case 'graphql':
                new InfinityProvider(query, this)
                  .query()
                  .then((res) => resolve(res))
                  .catch((ex) => {
                    reject(ex);
                  });
                break;
              case 'series':
                const startTime = new Date(options.range.from.toDate()).getTime();
                const endTime = new Date(options.range.to.toDate()).getTime();
                new SeriesProvider(query).query(startTime, endTime).then(resolve).catch(reject);
                break;
              case 'global':
                reject('unknown global query');
                break;
              default:
                reject('unknown query');
            }
          })
        );
      });
    return Promise.all(promises)
      .then((results) => {
        return { data: flatten(results) };
      })
      .catch((ex) => {
        throw ex;
      });
  }
  query(options: DataQueryRequest<InfinityQuery>): Observable<DataQueryResponse> {
    return new Observable<DataQueryResponse>((subscriber) => {
      this.getResults(options)
        .then((result) => {
          subscriber.next({ ...result, state: LoadingState.Done });
        })
        .catch((error) => {
          subscriber.next({ data: [], error, state: LoadingState.Error });
          subscriber.error(error);
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  }
  metricFindQuery(variableQuery: InfinityVariableQuery): Promise<Array<MetricFindValue & { value?: string }>> {
    return new Promise((resolve) => {
      let query = migrateLegacyQuery(variableQuery);
      switch (query.queryType) {
        case 'infinity':
          if (query.infinityQuery && isDataSourceQuery(query.infinityQuery)) {
            const infinityVariableProvider = new InfinityVariableProvider(
              query.infinityQuery,
              this.instanceSettings as InfinityConfig,
              this
            );
            infinityVariableProvider.query().then((res) => {
              resolve(flatten(res));
            });
          } else {
            resolve([]);
          }
          break;
        case 'legacy':
        default:
          const legacyVariableProvider = new LegacyVariableProvider(query.query);
          legacyVariableProvider.query().then((res) => {
            resolve(flatten(res));
          });
          break;
      }
    });
  }
}
