import { getTemplateSrv } from '@grafana/runtime';
import { CSVParser, JSONParser, XMLParser, HTMLParser } from './parsers';
import {
  InfinityQuery,
  InfinityDataQuery,
  InfinityHTMLQuery,
  InfinityCSVQuery,
  InfinityJSONQuery,
  InfinityGraphqlQuery,
  InfinityXMLQuery,
} from '../types';
import { InfinityDatasource } from './../datasource';
import { normalizeURL } from './utils';
import { isDataSourceQuery } from './queryUtils';

export class InfinityProvider {
  constructor(private target: InfinityDataQuery, private datasource: InfinityDatasource) {}
  private async formatResults(res: any) {
    const query = this.target;
    if (query.type !== 'csv') {
      query.root_selector = getTemplateSrv().replace(query.root_selector);
    }
    switch (this.target.type) {
      case 'html':
        return new HTMLParser(res, query as Extract<InfinityQuery, InfinityHTMLQuery>).getResults();
      case 'json':
      case 'graphql':
        return new JSONParser(
          res,
          query as Extract<InfinityQuery, InfinityJSONQuery | InfinityGraphqlQuery>
        ).getResults();
      case 'xml':
        let xmlData = await new XMLParser(res, query as Extract<InfinityQuery, InfinityXMLQuery>);
        return xmlData.getResults();
      case 'csv':
        return new CSVParser(res, query as Extract<InfinityQuery, InfinityCSVQuery>).getResults();
      default:
        return undefined;
    }
  }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      if (isDataSourceQuery(this.target) && this.target.source === 'url') {
        const url = normalizeURL(this.target.url);
        this.datasource
          .postResource('proxy', { ...this.target, url })
          .then(resolve)
          .catch(reject);
      } else {
        reject('not a remote source');
      }
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'inline') {
        resolve(this.formatResults(this.target.data));
      } else {
        this.fetchResults()
          .then((res) => {
            resolve(this.formatResults(res));
          })
          .catch((ex) => {
            reject(ex);
          });
      }
    });
  }
}
