import { Layout, TablePaginationConfig, Row, Col } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { deleteCategory, deleteSelectionCategories, getListCategories } from 'api/courses';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { ROUTES } from 'constants/constants';
import { useDebounce } from 'hooks';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import FilterCard from './components/FilterCard';

import './custom_style.css';

interface IFields {
  search?: string;
  category?: string;
  leaningMethod?: string;
  programType?: string;
}

const Category = () => {
  const history = useNavigate();
  const [form] = useForm();
  const [messageWarning, setMessageWarning] = useState('');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dataDropdown, setDataDropdown] = useState([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchDropdown, setSearchDropdown] = useState<string>('');
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState<string>('5');
  const [order, setOrder] = useState<string>('ASC');
  const debounceValue = useDebounce(searchDropdown, 300);
  const [categoryId, setCategoryId] = useState<number | string>();
  const [isModalDeleteCategory, setIsModalDeleteCategory] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: Number(limit),
    position: [],
  });

  const { mutate: mutateCategories, isLoading: isLoadingCategories } = useMutation(
    'getListCategories',
    getListCategories,
    {
      onSuccess: (result) => {
        setSelection([]);
        const categoriesList = result?.data?.listCategories;
        setLimit(String(result?.data.limit));
        setPagination({
          current: result?.data.page,
          pageSize: Number(limit),
          total: result?.data.total,
          position: [],
        });
        setCategories(
          categoriesList.map((category: { id: number; categoryName: string }) => ({
            categoryName: category.categoryName,
            key: category.id,
          })),
        );
      },
    },
  );

  const { mutate: mutateDropdown } = useMutation('getListCategories', getListCategories, {
    onSuccess: (result) => {
      const categoriesList = result?.data?.listCategories;
      setDataDropdown(
        categoriesList.map((category: { id: number; categoryName: string }) => ({
          categoryName: category.categoryName,
          id: category.id,
        })),
      );
    },
  });
  useEffect(() => {
    mutateDropdown({
      limit: Number(limit),
      page: 1,
      search: debounceValue,
      sort: 'categoryName',
      order: order,
    });
  }, [debounceValue]);

  const searchResult = useMemo(
    () => (
      <>
        {debounceValue ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px]">
            {dataDropdown?.length > 0 ? (
              dataDropdown?.map((course: { id: number; categoryName: string }) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer"
                  onClick={() => {
                    history(`${ROUTES.update_category}/${course.id}`);
                  }}
                  key={course.id}
                >
                  {course.categoryName}
                </div>
              ))
            ) : debounceValue ? (
              <div className="text-center font-fontFamily font-normal pt-4 word-break">
                No results found for “{debounceValue}”
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </>
    ),
    [debounceValue, dataDropdown],
  ) as ReactElement<string>;

  const onValuesChange = (values: IFields) => {
    const search = values.search || '';
    setSearchDropdown(search);
  };

  const messageWarningDeleteCourse = useMemo(() => {
    return `You are not allowed to delete the selected category as the category that you have selected is tagged to a course.`;
  }, []);

  const { mutate: mutateDelete } = useMutation('deleteCategory', deleteCategory, {
    onSuccess: () => {
      setIsModalDeleteCategory(false);
      if (categories?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      mutateCategories({
        limit: Number(limit),
        page: pagination?.current as number,
        search: searchValue,
        sort: 'categoryName',
        order: order,
      });
    },
    onError: ({ response }) => {
      setIsModalDeleteCategory(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete category.');
      } else {
        setMessageWarning(messageWarningDeleteCourse);
      }
    },
  });

  const handleTableChange = (paginate: TablePaginationConfig) => {
    setPagination({ ...pagination, ...paginate });
  };

  const onFinish = (values: IFields) => {
    const search = values.search || '';
    setSearchValue(search || '');
    mutateCategories({
      limit: Number(limit),
      page: 1,
      search,
      sort: 'categoryName',
      order: order,
    });
  };

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys);
  };

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = useCallback(
    (value: string) => {
      setOrder(value);
      setPagination({ ...pagination, current: 1 });
    },
    [pagination],
  );

  const onChangeAction = (value: string) => {
    if (value === 'selection') {
      setIsModalConfirm(true);
      setMessageConfirmDelete(
        selection?.length > 1
          ? 'Are you sure you want to delete the selected categories? This action cannot be undone.'
          : 'Are you sure you want to delete this category? This action cannot be undone.',
      );
    }
    // else if (value === 'all') {
    //   setMessageWarning(
    //     `Can't delete all categories. There are still courses in these categories!`,
    //   );
    // }
  };

  const errorMessage = useMemo(() => {
    return selection?.length > 1
      ? 'You are not allowed to delete the selected categories as one of the category that you have selected is tagged to a course.'
      : 'You are not allowed to delete the selected category as the category that you have selected is tagged to a course.';
  }, [selection]);

  const { mutate: mutateDeleteSelectionCategories } = useMutation(
    'deleteSelectionCategories',
    deleteSelectionCategories,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        setSelection([]);
        mutateCategories({
          limit: Number(limit),
          page: 1,
          search: searchValue,
          sort: 'categoryName',
          order: order,
        });
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete categories.');
        } else {
          setMessageWarning(errorMessage);
        }
      },
    },
  );

  const handleDeleteSelection = () => {
    mutateDeleteSelectionCategories({ categoryIds: Array.isArray(selection) ? selection : [] });
  };

  const handleReset = useCallback(() => {
    setSearchDropdown('');
    setSearchValue('');
    setOrder('ASC');
    setLimit('5');
    setSelection([]);
    form.resetFields();
    mutateCategories({
      limit: Number(5),
      page: 1,
      search: '',
      sort: 'categoryName',
      order: 'ASC',
    });
  }, [limit]);

  useEffect(() => {
    mutateCategories({
      limit: Number(limit),
      page: pagination?.current as number,
      search: searchValue,
      sort: 'categoryName',
      order: order,
    });
  }, [pagination.current, limit, order]);

  const renderModalDeleteCategory = () => {
    return (
      isModalDeleteCategory && (
        <ModalCustom
          visible={true}
          onCancel={() => {
            setIsModalDeleteCategory(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          titleCenter
          onSubmit={() => {
            mutateDelete({ id: Number(categoryId) });
          }}
        >
          <div>Are you sure you want to delete this category? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'categoryName',
      fixed: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: any) => (
        <div className="flex">
          <div
            className="cursor-pointer"
            onClick={() => {
              history(`${ROUTES.update_category}/${record.key}`);
            }}
          >
            <CustomTooltip title="Edit">
              <EditSVG className="icon-hover" />
            </CustomTooltip>
          </div>
          <div
            className="cursor-pointer ml-5"
            onClick={(e) => {
              e.stopPropagation();
              setCategoryId(record.key);
              setIsModalDeleteCategory(true);
            }}
          >
            <CustomTooltip title="Delete">
              <TrashSVG className="icon-hover" />
            </CustomTooltip>
          </div>
        </div>
      ),
    },
  ];

  const renderModalConfirm = useCallback(() => {
    return (
      isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleDeleteSelection}
          onCancel={() => {
            setIsModalConfirm(false);
          }}
          title="Confirmation"
          titleCenter
          content={messageConfirmDelete}
        />
      )
    );
  }, [isModalConfirm]);

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Warning"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Row className="flex justify-between items-center bg-transparent px-0 mt-5 ">
        <Col className="mb-2 mr-2">
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
            Category
          </p>
        </Col>

        <Col className="mb-2">
          <ButtonCustom
            color="orange"
            onClick={() => {
              history(ROUTES.update_category);
            }}
          >
            New Category
          </ButtonCustom>
        </Col>
      </Row>

      <FilterCard
        onFinish={onFinish}
        form={form}
        onValuesChange={onValuesChange}
        handleReset={handleReset}
        dropdown={{ overlay: searchResult }}
      />

      <TableCustom
        isSearch={searchValue ? true : false}
        hidePageSize
        searchNotFound={
          categories.length > 0 ? undefined : (
            <SearchNotFound isBackgroundWhite text={searchValue} />
          )
        }
        columns={columns}
        data={categories}
        pagination={pagination}
        isLoading={isLoadingCategories}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            history(`${ROUTES.update_category}/${record.key}`);
          },
        })}
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: Math.ceil(Number(pagination.total) / Number(pagination.pageSize)),
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
          show: true,
          options: [
            { label: 'Category Name (A-Z)', value: 'ASC' },
            { label: 'Category Name (Z-A)', value: 'DESC' },
          ],
          onChange: onFilter,
          value: order,
        }}
        action={{
          show: selection.length > 0 ? true : false,
          onSelect: onChangeAction,
          options: [
            // { value: 'all', label: 'Delete All' },
            { value: 'selection', label: 'Delete' },
          ],
        }}
      />
      {renderModalWarning()}
      {renderModalDeleteCategory()}
      {renderModalConfirm()}
    </Layout>
  );
};

export default Category;
