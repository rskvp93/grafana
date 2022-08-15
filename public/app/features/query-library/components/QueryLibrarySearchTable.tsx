import { css } from '@emotion/css';
import React, { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { of } from 'rxjs';

import { GrafanaTheme2 } from '@grafana/data';
import { FilterInput, HorizontalGroup, LinkButton, Spinner, useStyles2 } from '@grafana/ui';

import { SearchResultsTable } from '../../search/page/components/SearchResultsTable';
import { getGrafanaSearcher, SearchQuery } from '../../search/service';

import { DatasourceTypePicker } from './DatasourceTypePicker';

const QueryLibrarySearchTable = () => {
  const styles = useStyles2(getStyles);

  const [datasourceType, setDatasourceType] = useState<string | null>(null);
  const [searchQueryBy, setSearchByQuery] = useState<string>('');

  const searchQuery = useMemo<SearchQuery>(() => {
    const query: SearchQuery = {
      query: '*',
      explain: true,
      kind: ['query'],
    };

    if (datasourceType?.length) {
      query.ds_type = datasourceType;
    }

    // @TODO searchQueryBy

    return query;
  }, [datasourceType]);

  const results = useAsync(() => {
    return getGrafanaSearcher().search(searchQuery);
  }, [searchQuery]);

  if (results.loading) {
    return <Spinner />;
  }

  const found = results.value;
  return (
    <div className={styles.tableWrapper}>
      <HorizontalGroup width="100%" justify="space-between" spacing={'md'} height={25}>
        <HorizontalGroup>
          <FilterInput
            placeholder="Search queries by name, source, or variable"
            autoFocus={false}
            value={searchQueryBy}
            onChange={setSearchByQuery}
            width={50}
          />
          Filter by datasource type
          <DatasourceTypePicker
            current={datasourceType}
            onChange={(newDsType) => {
              setDatasourceType(() => newDsType);
            }}
          />
        </HorizontalGroup>

        <div className={styles.createQueryButton}>
          <LinkButton size="md" href={`query-library/new`} icon="plus" title="Create Query">
            {'Create Query'}
          </LinkButton>
        </div>
      </HorizontalGroup>

      <AutoSizer className={styles.table}>
        {({ width, height }) => {
          return (
            <SearchResultsTable
              response={found!}
              width={100}
              height={100}
              clearSelection={() => {}}
              keyboardEvents={of()}
              onTagSelected={() => {}}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default QueryLibrarySearchTable;

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    tableWrapper: css`
      height: 100%;
      margin-top: 20px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    `,
    table: css`
      margin-top: 20px;
      width: 100%;
      height: 100%;
    `,
    createQueryButton: css`
      text-align: center;
    `,
    filtersGroup: css`
      padding-top: 10px;
      margin-top: 30px;
    `,
  };
};
