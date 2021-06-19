import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InfinityDataSourceJSONOptions } from './../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const FlavourEditor = (props: Props) => {
  return <>Flavour Editor</>;
};
