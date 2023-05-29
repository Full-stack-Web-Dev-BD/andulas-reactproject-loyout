import { CalendarOutlined, SwapRightOutlined } from '@ant-design/icons';
import {
  Dropdown,
  Form,
  Input,
  Layout,
  Modal,
  Select,
  TablePaginationConfig,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { endAnnouncement, getAnnouncement } from 'api/announcement';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import { useDebounce } from 'hooks';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { IAnnouncementInfo } from '../notifications/announcement';
import './new-announcement/new-announcement.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import { EDITOR_CONFIG } from 'constants/constants';
import { truncateString } from 'helper/function';
import './style.css';

const optionsOrder = [
  { label: 'Author Name A-Z', value: 'author-ASC' },
  { label: 'Author Name Z-A', value: 'author-DESC' },
  { label: 'Posted Date & Time (Ascending)', value: 'createdAt-ASC' },
  { label: 'Posted Date & Time (Descending)', value: 'createdAt-DESC' },
];

const optionsCentre = [
  { label: 'All Centres', value: 'All Centres' },
  { label: 'Centre A', value: 'Centre A' },
  { label: 'Centre B', value: 'Centre B' },
  { label: 'Centre C', value: 'Centre C' },
];

const Announcement = () => {
  const [formModal] = Form.useForm();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [isShowSelect, setIsShowSelectt] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dataList, setDataList] = useState<IAnnouncementInfo>({ listAnnouncement: [] });
  const [announcementDetail, setAnnouncementDetail] = useState<any>();
  const [status, setStatus] = useState<'Ongoing' | 'End'>('Ongoing');
  const [isShowRestore, setIsShowRestore] = useState('');
  const [current, setCurrent] = useState(1);
  const [order, setOrder] = useState<string>('author-ASC');
  const [searchDropdown, setSearchDropdown] = useState<string>('');
  const [enteredSearchText, setEnteredSearchText] = useState<string>('');
  const debounceValue = useDebounce(searchDropdown, 300);
  const [dataDropdown, setDataDropdown] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const [selection, setSelection] = useState<any>([]);
  const [tab, setTab] = useState<number>(1);
  const [isModelConfirm, setIsModalConfirm] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: listAnnouncement } = useMutation('listAnnouncement', getAnnouncement, {
    onSuccess(data, variables, context) {
      setIsLoading(false);
      setIsSearch(false);
      const addKeyList = data.data.listAnnouncement.map((item: any) => {
        return {
          ...item,
          key: item.id,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
        };
      });
      setDataList({ ...data.data, listAnnouncement: addKeyList });
      setPagination({
        ...pagination,
        total: data.data.total,
        current: data.data.page,
      });
    },
  });

  const { mutate: mutateDropdown } = useMutation('listAnnouncement', getAnnouncement, {
    onSuccess(data, variables, context) {
      const annoucementList = data.data?.listAnnouncement.map((item: any) => {
        return {
          ...item,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
        };
      });

      setDataDropdown(annoucementList);
    },
  });
  useEffect(() => {
    mutateDropdown({
      limit: Number(pagination.pageSize),
      page: 1,
      search: debounceValue,
      sort: 'title',
      order: 'ASC',
    });
  }, [debounceValue]);

  const { mutate: endAnnouncementApi } = useMutation('endAnnouncement', endAnnouncement, {
    onSuccess(data, variables, context) {},
  });

  const fetchAnnouncement = async (filter?: {
    limit?: number;
    page?: number;
    search?: string;
    order?: string;
    sort?: string;
    status?: 'Ongoing' | 'End';
  }) => {
    const orderAndSort = order?.split('-') || [undefined, undefined];
    setIsLoading(true);
    setSelection([]);
    listAnnouncement({
      limit: filter?.limit || Number(pagination.pageSize),
      page: filter?.page || Number(current),
      search:
        filter?.search != null && filter?.search != undefined ? filter?.search : enteredSearchText,
      order: filter?.order || orderAndSort[1],
      sort: filter?.sort || orderAndSort[0],
      filters: `[{"status": "${filter?.status || status}"}]`,
    });
  };

  const handleClickPast = useCallback(() => {
    setTab(2);
    setStatus('End');
    setCurrent(1);
    setPagination({ ...pagination, current: 1 });
    fetchAnnouncement({ status: 'End', page: 1 });
    setIsShowSelectt(false);
  }, [pagination, debounceValue]);

  const handleClickCurrent = useCallback(() => {
    setTab(1);
    setStatus('Ongoing');
    setCurrent(1);
    setPagination({ ...pagination, current: 1 });
    fetchAnnouncement({ status: 'Ongoing', page: 1 });
    setIsShowSelectt(true);
  }, [pagination, debounceValue]);

  const handleSearch = useCallback(
    (e: any) => {
      setCurrent(1);
      setPagination({ ...pagination, current: 1 });
      setEnteredSearchText(e.search);
      setIsSearch(true);
      fetchAnnouncement({ page: 1, search: e.search });
    },
    [pagination, tab],
  );

  const onChangeLimit = useCallback(
    (value: string) => {
      const total = dataList.total;
      const maxPage = Math.ceil(Number(total) / Number(value));
      setPagination({ ...pagination, pageSize: Number(value) });
      if (current > maxPage) setCurrent(maxPage);
      else setCurrent(current);
    },
    [current, dataList.total],
  );

  const onFilter = useCallback(
    (value: string) => {
      setPagination({ ...pagination, current: 1 });
      setOrder(value);
    },
    [pagination],
  );

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'selection') {
        if (selection.length > 1) setIsShowRestore('announcements');
        else setIsShowRestore('announcement');
        setIsModalConfirm(true);
      }
    },
    [selection],
  );

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys.map((item) => Number(item)));
  };

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    if (order) {
      const orderAndSort = order.split('-');
      fetchAnnouncement({ sort: orderAndSort[0] || '', order: orderAndSort[1] || '' });
    }
  }, [order]);

  useEffect(() => {
    fetchAnnouncement({ limit: Number(pagination.pageSize) });
  }, [pagination.pageSize]);

  const columns = [
    {
      title: <>Announcement</>,
      dataIndex: 'title',
      key: 'title',
      width: '50%',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="title_annoucement_fix_width" style={{ width: 400 }}>
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: <>Author</>,
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: <>Date</>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => {
        return <div>{moment(text).format('YYYY/MM/DD, h:mm a')}</div>;
      },
      width: '25%',
    },
  ];

  function stripHTML(text: string) {
    const regex = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
    if (text) {
      const translateRe: any = /&(nbsp|amp|quot|lt|gt);/g;
      const translate: any = {
        nbsp: ' ',
        amp: '&',
        quot: '"',
        lt: '<',
        gt: '>',
      };
      return text
        .replace(translateRe, function (match, entity) {
          return translate[entity];
        })
        .replace(/&#(\d+);/gi, function (match, numStr) {
          const num = parseInt(numStr, 10);
          return String.fromCharCode(num);
        })
        .replace(regex, '');
    }
  }

  const searchResult = useMemo(
    () => (
      <>
        {debounceValue ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px]">
            {dataDropdown?.length > 0 ? (
              dataDropdown?.map((announcement: any) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer"
                  onClick={() => {
                    setAnnouncementDetail(announcement);
                    setVisible(true);
                  }}
                  key={announcement.id}
                >
                  {truncateString(announcement.title, 60)}
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
  );

  const onValuesChange = (values: { search: string }) => {
    const search = values.search || '';
    setSearchDropdown(search);
  };

  const ModalDetail = (data: any) => {
    const classes = data?.data?.classes.map((item: any) => item.className).join(', ');

    formModal.setFieldsValue({
      ...data.data,
      classes,
      message: data?.data?.message,
      duration: [moment(data?.data?.startDate), moment(data?.data?.endDate)],
    });
    return (
      <Modal
        className={`rounded-3xl p-0 `}
        width={600}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        style={{ zIndex: 100 }}
      >
        <span
          className={`font-fontFamily flex justify-left text-left
        font-bold text-2xl leading-8 tracking-tight mt-6 normal pb-[16px]`}
        >
          Announcement Details
        </span>

        <div className={`font-fontFamily font-normal text-sm mt-3}`}>
          <Form layout="vertical" form={formModal}>
            <div className="flex  justify-between gap-5 hide-search display-none">
              <Form.Item className="w-full" name="classes" label={'To'}>
                <Select
                  mode="multiple"
                  placeholder="Placeholder"
                  maxTagCount={2}
                  className={'announcement_select_multi'}
                  tagRender={(dataSelect) => {
                    return <div className="text-black classes_overflow">{dataSelect?.value}</div>;
                  }}
                  disabled
                />
              </Form.Item>
              <Form.Item name="author" label={'From'} className="w-full">
                <CustomInput
                  placeholder="Placeholder"
                  type="string"
                  disabled={true}
                  classNameCustom="text-black"
                />
              </Form.Item>
            </div>
            <Form.Item name="title" label={'Title'} className="w-full">
              <CustomInput
                disabled
                placeholder="Placeholder"
                type="string"
                classNameCustom="text-black title_annoucement_fix_width"
              />
            </Form.Item>
            <Form.Item name="message" label={'Message'} className="w-full">
              <CKEditor
                editor={ClassicEditor}
                config={EDITOR_CONFIG}
                data={formModal.getFieldValue('message')}
              />
            </Form.Item>
            <div className="flex items-center justify-between gap-5">
              <div className="w-full flex flex-col">
                <div>
                  <span>Duration</span>
                </div>
                <div className="range-picker-announcement justify-between rounded-xl w-full items-center mt-2">
                  <span>{moment(announcementDetail?.startDate).format('YYYY/MM/DD hh:mm a')}</span>
                  <SwapRightOutlined />
                  <span>{moment(announcementDetail?.endDate).format('YYYY/MM/DD hh:mm a')}</span>
                  <CalendarOutlined />
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    );
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6  ">
      <ModalDetail data={announcementDetail} />
      <ModalCustom
        onSubmit={() => {
          setIsShowRestore('');
          setIsModalConfirm(false);
          endAnnouncementApi({ id: selection });
          fetchAnnouncement();
          setSelection([]);
        }}
        visible={isModelConfirm}
        content={`Are you sure you want to end the selected ${isShowRestore}?`}
        title="End Announcement"
        okText="Confirm"
        onCancel={() => setIsModalConfirm(false)}
        cancelText="Cancel"
        titleCenter
      ></ModalCustom>
      <Row className="flex justify-between items-center bg-transparent px-0 ">
        <Col className="mb-2 mr-2">
          <p className="custom-font-header text-[1.75rem] font-fontFamily custom-font-header leading-9 font-bold mb-0">
            Announcement
          </p>
        </Col>
        <Col className="mb-2">
          <ButtonCustom
            className="custom-pading"
            color="orange"
            onClick={() => navigate('/announcement/new-announcement')}
          >
            New Announcement
          </ButtonCustom>
        </Col>
      </Row>
      <div className="filter-card">
        <Form
          className="w-full"
          name="basic"
          autoComplete="off"
          onFinish={handleSearch}
          onValuesChange={onValuesChange}
        >
          <Row className="flex gap-4 flex-wrap">
            <Col className="w-[calc(60%_-_0.67rem)] lg:w-[calc(60%-0.5rem)]">
              <Form.Item name="search" className="flex-1 mb-0">
                <Dropdown
                  getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
                  trigger={['click']}
                  overlay={searchResult}
                  placement="bottomRight"
                  className="w-full h-full"
                  overlayStyle={{ zIndex: 50 }}
                >
                  <Form.Item name="search" className={`w-[100%] mb-0`}>
                    <Input
                      placeholder="Search"
                      suffix={<img src={images.search} alt="search" />}
                      className="style_input_custom_login_page"
                    />
                  </Form.Item>
                </Dropdown>
              </Form.Item>
            </Col>
            <Col className="w-[calc(20%_-_0.67rem)] lg:w-[calc(40%-0.5rem)]">
              <Form.Item
                name={'centre'}
                className={'mb-0 custom-width-announcement-center-dropDown'}
              >
                <Select
                  //   disabled={select.disabled}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placeholder={'Centre'}
                  allowClear
                  options={optionsCentre}
                  className="text-main-font-color font-fontFamily text-sm"
                />
              </Form.Item>
            </Col>
            <Col className="w-[calc(20%_-_0.67rem)] lg:w-[20%]">
              <Form.Item className="mb-0">
                <ButtonCustom className="h-12 min-w-fit w-full" htmlType="submit" color="orange">
                  Search
                </ButtonCustom>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="flex z-10 w-[20%]  custom-width-announcement-center">
        <ButtonCustom
          className="w-20 h-10 rounded-3xl min-w-fit px-4"
          color={tab == 1 ? 'orange' : ''}
          onClick={() => {
            handleClickCurrent();
          }}
        >
          Current
        </ButtonCustom>
        <ButtonCustom
          className="w-20 h-10 rounded-3xl px-4 ml-4 min-w-fit"
          color={tab == 2 ? 'orange' : ''}
          onClick={() => {
            handleClickPast();
          }}
        >
          Past
        </ButtonCustom>
      </div>
      <div className="relative top-[-70px] xl:top-[0]">
        <TableCustom
          classNameFilter="w-full justify-end xl:justify-start"
          isRowSelect={isShowSelect}
          columns={columns}
          isLoading={isLoading}
          data={dataList?.listAnnouncement || []}
          pagination={
            dataList?.listAnnouncement && dataList?.listAnnouncement?.length > 0
              ? pagination
              : undefined
          }
          onChangeSelect={onChangeSelect}
          onChangePagination={(page) => {
            setCurrent(page);
            setPagination({
              ...pagination,
              current: page,
            });
            const orderAndSort = order?.split('-') || [undefined, undefined];
            if (tab === 2) {
              fetchAnnouncement({ page, sort: orderAndSort[0], order: orderAndSort[1] });
            } else fetchAnnouncement({ page });
          }}
          searchNotFound={
            dataList?.listAnnouncement && dataList?.listAnnouncement?.length > 0 ? undefined : (
              <SearchNotFound isBackgroundWhite text={debounceValue} />
            )
          }
          onLastPage={() => {
            const currentPage = Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
            setPagination({
              ...pagination,
              current: currentPage,
            });
            setCurrent(currentPage);
            const orderAndSort = order?.split('-') || [undefined, undefined];
            if (tab === 2) {
              fetchAnnouncement({
                page: currentPage,
                sort: orderAndSort[0],
                order: orderAndSort[1],
              });
            } else fetchAnnouncement({ page: currentPage });
          }}
          onFirstPage={() => {
            setPagination({ ...pagination, current: 1 });
            setCurrent(1);
            const orderAndSort = order?.split('-') || [undefined, undefined];
            if (tab === 2) {
              fetchAnnouncement({ page: 1, sort: orderAndSort[0], order: orderAndSort[1] });
            } else fetchAnnouncement({ page: 1 });
          }}
          viewItem={{
            onChange: onChangeLimit,
            value: pagination?.pageSize?.toString(),
          }}
          filters={{
            show: true,
            options: optionsOrder,
            onChange: onFilter,
            value: order,
            minWidth: 'min-w-[270px]',
          }}
          action={{
            show: selection.length > 0 && tab === 1 ? true : false,
            onSelect: onChangeAction,
            options: [{ value: 'selection', label: 'End Announcement' }],
          }}
          onRow={(record: any) => ({
            onClick: () => {
              setAnnouncementDetail(record);
              setVisible(true);
            },
          })}
        />
      </div>

      {/* {renderModalWarning()}
      {modalConfirmDeleteAdmin()}
      {renderModalConfirm()} */}
    </Layout>
  );
};

export default Announcement;
