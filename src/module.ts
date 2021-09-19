import { DataSourcePlugin } from '@grafana/data';
import { InfinityConfigEditor, InfinityQueryEditor, InfinityVariableEditor } from './editors';
import { InfinityDatasource } from './datasource';
import { InfinityConfig, InfinityQuery, InfinitySecureConfig } from 'types';

export const plugin = new DataSourcePlugin<InfinityDatasource, InfinityQuery, InfinityConfig, InfinitySecureConfig>(
  InfinityDatasource
)
  .setConfigEditor(InfinityConfigEditor)
  .setQueryEditor(InfinityQueryEditor)
  .setVariableQueryEditor(InfinityVariableEditor);
