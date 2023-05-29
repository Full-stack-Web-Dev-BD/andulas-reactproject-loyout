import { Form, Input, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import CustomTooltip from 'components/Tooltip';
import React, { useCallback, useEffect, useState } from 'react';

import { ReactComponent as ContentSVG } from 'assets/icons/content_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as BlockSVG } from 'assets/icons/block_icon.svg';
import { ReactComponent as PenNoteSVG } from 'assets/icons/pen_note_icon.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as CheckedSVG } from 'assets/icons/checked_icon.svg';
import { ReactComponent as CloseSVG } from 'assets/icons/x-icon.svg';
import { ReactComponent as LinkSVG } from 'assets/icons/link.svg';
import { ReactComponent as OutlineCheckedSVG } from 'assets/icons/outline_checked_icon.svg';

import { IUnit, ListUnit } from '..';
import { useNavigate } from 'react-router-dom';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { ReactComponent as WebContentSVG } from 'assets/icons/web_content_icon.svg';
import { ReactComponent as CameraSVG } from 'assets/icons/camera_icon.svg';
import { ReactComponent as PlaySVG } from 'assets/icons/play_icon.svg';
import { ReactComponent as DocumentSVG } from 'assets/icons/document_icon.svg';
import { ReactComponent as TagSVG } from 'assets/icons/tag_icon.svg';
import { ReactComponent as FrameSVG } from 'assets/icons/frame_icon.svg';
import { ReactComponent as WarningSVG } from 'assets/icons/warning_icon.svg';
import { ReactComponent as ListSVG } from 'assets/icons/list_icon.svg';
import { ReactComponent as AssignmentSVG } from 'assets/icons/assignment_icon.svg';
import { ReactComponent as ComputerSVG } from 'assets/icons/computer_icon.svg';
import { UnitType } from 'api/content_management';
import "./style.css";

interface IProps {
    setActiveTab: (values: number) => void;
    listUnits: ListUnit[],
    setListUnits: (values: any) => void;
    setIsChanging: (value: boolean) => void;
}

const Reorder = (props: IProps) => {

    const {
        setActiveTab,
        listUnits,
        setListUnits,
        setIsChanging,
    } = props;

    const [listDnDUnits, setListDnDUnits] = useState<any[]>([]);

    const handleBack = () => {
        setActiveTab(0);
    };

    const onDragEnd = (result: any) => {
        const newItems = Array.from(listDnDUnits);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        setListDnDUnits(newItems);
    };

    const handleSaveReorder = useCallback(() => {
        const temp = [...listDnDUnits].map((unit, index) => {
            return {
                ...unit,
                order: index + 1,
            }
        });
        setListUnits(temp);
        setIsChanging(true);
        setActiveTab(0);
    }, [listDnDUnits, listUnits])

    useEffect(() => {
        if (listUnits?.length > 0) {
            const temp = [...listUnits].map((unit, index) => {
                return {
                    ...unit,
                    order: index + 1,
                }
            });
            setListDnDUnits(temp);
        }
        else {
            setListDnDUnits([]);
        }
    }, [listUnits]);

    const renderUnitIcon = (items: IUnit) => {
        switch (items.unitType) {
            case UnitType.CONTENT:
                if (items.isUploadedFile) {
                    return (
                        <LinkSVG />
                    )
                }
                else {
                    return (
                        <ContentSVG />
                    )
                }
            case UnitType.WEB_CONTENT:
                return (
                    <WebContentSVG />
                )
            case UnitType.VIDEO:
                return (
                    <CameraSVG />
                )
            case UnitType.AUDIO:
                return (
                    <PlaySVG />
                )
            case UnitType.DOCUMENT:
                return (
                    <DocumentSVG />
                )
            case UnitType.SCORM_XAPI_CMI5:
                return (
                    <TagSVG />
                )
            case UnitType.FRAME:
                return (
                    <FrameSVG />
                )
            case UnitType.TEST:
                return (
                    <WarningSVG />
                )
            case UnitType.SURVEY:
                return (
                    <ListSVG />
                )
            case UnitType.ASSIGNMENT:
                return (
                    <AssignmentSVG />
                )
            case UnitType.INSTRUCTOR_LED_TRAINING:
                return (
                    <WarningSVG />
                )
            case UnitType.SECTION:
                return (
                    <ComputerSVG />
                )
            default:
                return (
                    <ContentSVG />
                )
        }
    }

    return (
        <div className="flex gap-x-3 flex-col cus-table__list-unit">
            <div className='scroll_x'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {listDnDUnits.map((unit, index) => (
                                    <Draggable key={unit.order} draggableId={unit.order.toString()} index={index}>
                                        {(providedIn) => {
                                            return (
                                                <div
                                                    className=""
                                                    ref={providedIn.innerRef}
                                                    {...providedIn.draggableProps}
                                                    {...providedIn.dragHandleProps}
                                                >
                                                    <div
                                                        className={`list-unit-item relative flex items-center justify-between mb-4 bg-white`}
                                                    >
                                                        <div
                                                            className="ml-5 flex item-center justify-center absolute content-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <CustomTooltip title="Content">
                                                                {/* {
                                                                    unit.isUploadedFile ? (
                                                                        <LinkSVG />
                                                                    ) : (
                                                                        <ContentSVG />
                                                                    )
                                                                } */}
                                                                {
                                                                    renderUnitIcon(unit)
                                                                }
                                                            </CustomTooltip>
                                                        </div>
                                                        <Input
                                                            className='cus-input-wsp'
                                                            onChange={() => { }}
                                                            placeholder={'Unit Name'}
                                                            value={unit.unitName || ""}
                                                            disabled
                                                        />
                                                        <>
                                                            <div
                                                                className="cursor-pointer ml-1 unit_action_icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <CustomTooltip title="Rename">
                                                                    <EditSVG className="icon-hover" />
                                                                </CustomTooltip>
                                                            </div>
                                                            <div
                                                                // className={`cursor-pointer ml-1 unit_action_icon ${unit.isUploadedFile ? "disabled" : ""}`}
                                                                className={`cursor-pointer ml-1 unit_action_icon ${unit.unitType === UnitType.CONTENT && unit.isUploadedFile ? "disabled" : ""}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!unit.isUploadedFile) {
                                                                    }
                                                                }}
                                                            >
                                                                <CustomTooltip title="Edit">
                                                                    <PenNoteSVG className="icon-hover" />
                                                                </CustomTooltip>
                                                            </div>
                                                            <div
                                                                className="cursor-pointer ml-1 unit_action_icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <CustomTooltip title="Duplicate">
                                                                    <DuplicateSVG className="icon-hover" />
                                                                </CustomTooltip>
                                                            </div>
                                                            <div
                                                                className="cursor-pointer ml-1 unit_action_icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <CustomTooltip title={unit.isDisabled ? "Unblock" : "Block"}>
                                                                    {
                                                                        unit.isDisabled ? (
                                                                            <OutlineCheckedSVG className="icon-hover" />
                                                                        ) : (
                                                                            <BlockSVG className="icon-hover" />
                                                                        )
                                                                    }
                                                                </CustomTooltip>
                                                            </div>
                                                            <div
                                                                className="cursor-pointer ml-1 unit_action_icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <CustomTooltip title="Delete">
                                                                    <TrashSVG className="icon-hover" />
                                                                </CustomTooltip>
                                                            </div>
                                                        </>
                                                        <div
                                                            className="drag-item-layer"
                                                            style={{
                                                                position: "absolute",
                                                                top: "0",
                                                                bottom: "0",
                                                                left: "0",
                                                                right: "0",
                                                                zIndex: "1"
                                                            }}
                                                        >

                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <div className="flex gap-x-3 justify-end mt-4">
                <ButtonCustom
                    color="orange"
                    onClick={handleSaveReorder}
                >
                    Save
                </ButtonCustom>
            </div>
        </div>
    );
}

export default Reorder;