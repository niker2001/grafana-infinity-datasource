import { getTemplateSrv } from '@grafana/runtime';
import { ScopedVars } from '@grafana/data';
import { InfinityQuery, InfinityDataQuery, InfinityInstanceSettings } from '../types';

const replaceVariable = (input: string, scopedVars: ScopedVars): string => {
  return getTemplateSrv().replace(input || '', scopedVars, 'glob');
};

export const isDataSourceQuery = (query: InfinityQuery | InfinityDataQuery): query is InfinityDataQuery => {
  return (
    query.type === 'csv' ||
    query.type === 'json' ||
    query.type === 'xml' ||
    query.type === 'html' ||
    query.type === 'graphql'
  );
};

export const replaceVariables = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  let newQuery = { ...query };
  if (isDataSourceQuery(newQuery)) {
    newQuery = {
      ...newQuery,
      filters: (newQuery.filters ? [...newQuery.filters] : []).map((filter) => {
        filter.value = filter.value.map((val) => {
          return getTemplateSrv().replace(val || '', scopedVars, 'glob');
        });
        return filter;
      }),
    };
  }
  if (isDataSourceQuery(newQuery) && newQuery.source === 'url') {
    newQuery = {
      ...newQuery,
      url: replaceVariable(newQuery.url, scopedVars),
      url_options: {
        ...newQuery.url_options,
        data: replaceVariable(newQuery.url_options?.data || '', scopedVars),
        params: newQuery.url_options?.params?.map((param) => {
          return {
            ...param,
            value: getTemplateSrv().replace(param?.value || '', scopedVars, 'glob'),
          };
        }),
        headers: newQuery.url_options?.headers?.map((header) => {
          return {
            ...header,
            value: getTemplateSrv().replace(header?.value || '', scopedVars, 'glob'),
          };
        }),
      },
    };
  }
  if (isDataSourceQuery(newQuery) && newQuery.source === 'inline') {
    newQuery = {
      ...newQuery,
      data: replaceVariable(newQuery.data, scopedVars),
    };
  }
  return newQuery;
};

export const IsValidInfinityQuery = (query: InfinityQuery): boolean => {
  if (
    query &&
    query.type !== undefined &&
    (query.type === 'csv' || query.type === 'json' || query.type === 'xml') &&
    query.source === 'url'
  ) {
    return query.url !== undefined && query.url !== '';
  } else if (
    query &&
    query.type !== undefined &&
    (query.type === 'csv' || query.type === 'json' || query.type === 'xml') &&
    query.source === 'inline'
  ) {
    return query.data !== undefined && query.data !== '';
  } else {
    return query !== undefined && query.type !== undefined;
  }
};

export const getDefaultGlobalQueryID = (ins: InfinityInstanceSettings): string => {
  let queries = ins.jsonData.global_queries;
  return queries && queries.length > 0 ? queries[0].id : '';
};
