import { Layout, TablePaginationConfig } from 'antd';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { roundingNumber } from 'constants/index';
import { useMemo, useState } from 'react';


export interface IFinancial {
  id: number;
  key: string;
  reference: string;
  transactionDate: string;
  debit: number;
  credit: number;
  balance: number;
}

const DATA = [
  {
    id: 1,
    key: '1',
    reference: 'Invoice 1',
    transactionDate: '01/03/2022',
    debit: 0,
    credit: 123,
    balance: 892,
  },
  {
    id: 2,
    key: '2',
    reference: 'Invoice 1',
    transactionDate: '01/03/2022',
    debit: 0,
    credit: 672,
    balance: 12.13,
  },
];

const FinancialDetail = () => {
  const [financialData, setFinancialData] = useState<IFinancial[]>(DATA);
  const [limit, setLimit] = useState('5');

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });


  const columns = [
    {
      title: 'Reference',
      dataIndex: 'reference',
      fixed: true,
      width: 250,
      render: (text: string, record: IFinancial) => {
        return (
          <div>
            <CustomTooltip title={record.reference}>
              <div className="custom-text-ellipsis">{record.reference}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Transaction Date',
      dataIndex: 'transactionDate',
      fixed: true,
      width: 250,
      render: (text: string, record: IFinancial) => {
        return (
          <div>
            <CustomTooltip title={record.transactionDate}>
              <div className="custom-text-ellipsis">{record.transactionDate}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      fixed: true,
      width: 200,
      render: (text: string, record: IFinancial) => {
        return <div>{roundingNumber(record.debit)}</div>;
      },
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      width: 200,
      render: (text: string, record: IFinancial) => {
        return <div>{roundingNumber(record.credit)}</div>;
      },
      fixed: true,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      render: (text: string, record: IFinancial) => {
        return <div>{roundingNumber(record.balance)}</div>;
      },
      fixed: true,
    },
  ];

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <TableCustom
        hideColSelection
        columns={columns}
        data={financialData}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={() => ({
          onClick: () => {},
        })}
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: pageSize,
          });
        }}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        filters={{
          show: false,
          options: [],
          minWidth: 'min-w-[270px]',
        }}
      />
    </Layout>
  );
};

export default FinancialDetail;
