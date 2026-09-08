import React, { useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom';
import {
    ACTION_ITEM,
    createLegacyRoleToken,
} from "./roleCatalog";
import {
    deathRoleRecordsFromEventCell,
    allowsReviveForEventLabel,
    fixedDeathRoleIdForEventLabel,
    isDeathEventLabel,
} from "./eventRows";
import {
    parsePlayerNames,
} from "./playerRows";
import { createBoardConfig } from "./boardConfig";
import { actionOptionsForRoleLabels, roleLabelsForRow } from "./actionOptions";
import { createBoardTableFormatters } from "./boardTableFormatters";
import { ColorSelect } from "./ColorSelect";
import { InsaneSelect } from "./InsaneSelect";
import { RoleSelect } from "./RoleSelect";
import { DeadSelect } from "./DeadSelect";
import {
    createBoardState,
    selectTableColumns,
    selectTableData,
} from "./boardState";
import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { sendPopupSnapshot } from "./popupBridge";
import { BoardTable } from "./BoardTable";
import { NameInputPanel } from "./NameInputPanel";
import { createLegacyBoardRuntime } from "./legacyBoardRuntime";
import { TUTORIAL_PLAYER_NAMES, TUTORIAL_ROWS } from "./tutorialBoardData";
import './index.scss';



const FeignTool = {};

Object.assign(FeignTool, createBoardConfig(process.env.PUBLIC_URL));
FeignTool.fixedDeathRoleForEvent = (eventLabel) => {
    const roleId = fixedDeathRoleIdForEventLabel(eventLabel);
    return roleId ? createLegacyRoleToken(roleId, FeignTool.actionType) : undefined;
};
const initialBoardState = createBoardState({
    board: TUTORIAL_ROWS,
    playerNames: TUTORIAL_PLAYER_NAMES,
    isTutorial: true,
    dayCount: 2,
});
const legacyBoardRuntime = createLegacyBoardRuntime({
    initialState: initialBoardState,
    actionType: FeignTool.actionType,
});
FeignTool.getColorNameDictionary = () => legacyBoardRuntime.getColorNameDictionary();
FeignTool.getTableData = () => legacyBoardRuntime.getTableData();
FeignTool.getPlayerOptions = () => legacyBoardRuntime.getPlayerOptions();
FeignTool.column_template = {
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
        const valueIsResultColor = (array) => (
            array && array.length && array[0][2] === 4);
        const newvalue = (value, row) => {
            let nvalue = (value || []).slice();
            while (valueIsResultColor(nvalue)) nvalue.shift();
            return nvalue;
        }
        const newa = newvalue(a, rowA);
        const newb = newvalue(b, rowB);
        const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
        if (order === 'asc') return res;
        else return -res;
    },
    editable: true,
};

const tableFormatters = createBoardTableFormatters({
    ...FeignTool,
    getColorNameDictionary: () => legacyBoardRuntime.getColorNameDictionary(),
    getPlayerIsIcon: () => legacyBoardRuntime.getPlayerIsIcon(),
});
FeignTool.formatter_templete = tableFormatters.cellFormatter;
FeignTool.dead_formatter = tableFormatters.deathFormatter;
FeignTool.deadFormatter = tableFormatters.deathFormatter;
FeignTool.target_day = {
    ...FeignTool.column_template,
    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
        if (!(column.dataField in row)) row[column.dataField] = [];
        let options = legacyBoardRuntime.getPlayerOptions();
        if (row.id < 0) {
            if (isDeathEventLabel(row.name[0]))
                return (
                    <DeadSelect config={FeignTool} {...editorProps} value={value} row={row} options={legacyBoardRuntime.getPlayerOptions().concat(FeignTool.actionRevive)} fixedDeathRole={FeignTool.fixedDeathRoleForEvent(row.name[0])} dataField={column.dataField} text={column.text} />
                );
            if (allowsReviveForEventLabel(row.name[0])) options = options.concat(FeignTool.actionRevive);
        }
        return (
            <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={options} dataField={column.dataField} text={column.text} />
        );
    },
};
FeignTool.action_day = {
    text: '　',
    ...FeignTool.column_template,
    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
        if (!(column.dataField in row)) row[column.dataField] = [];
        let allrole = [];
        if (row.id < 0 && isDeathEventLabel(row.name[0]))
            return (
                <DeadSelect config={FeignTool} {...editorProps} value={value} row={row} options={legacyBoardRuntime.getPlayerOptions().concat(FeignTool.actionRevive)} fixedDeathRole={FeignTool.fixedDeathRoleForEvent(row.name[0])} dataField={column.dataField} text={column.text} />
            );
        if (row.id < 0 && allowsReviveForEventLabel(row.name[0])) {
            const newOptions = legacyBoardRuntime.getPlayerOptions().concat(FeignTool.actionRevive);
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
            );
        }
        allrole = roleLabelsForRow(row);
        const optionsByActionItem = {
            [ACTION_ITEM.ROLE]: FeignTool.role,
            [ACTION_ITEM.PLAYER]: legacyBoardRuntime.getPlayerOptions(),
            [ACTION_ITEM.RESULT]: FeignTool.actionResult,
        };
        const newOptions = actionOptionsForRoleLabels(allrole, optionsByActionItem, FeignTool.hr);
        return (
            <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
        );
    },
};
FeignTool.defaultColumns = [
    {
        text: '　',
        dataField: 'color',
        editable: true,
        sort: true,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const res = a > b ? 1 : (a < b ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        formatter: (cell, row) => {
            if (cell && cell.length > 1) {
                if (legacyBoardRuntime.getNameIsIcon() && row.id >= 0) {
                    return <div className="tableCell" id={"color_tableid_" + row.id}><div className="colorIconContainer"><img src={cell[0]} alt={`${row.name[0]}の色`} /></div></div>;
                }
                return <div className="tableCell" id={"color_tableid_" + row.id}><div className="colorpicker" style={{ display: "block", backgroundColor: cell[1] }}>　</div></div>;
            }
                    return <div className="tableCell" id={"color_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = false;
            return (
                <ColorSelect {...editorProps} value={value} row={row} options={FeignTool.colorList} dataField={column.dataField} text={column.text} onColorChange={(name, color) => legacyBoardRuntime.handleColorChange(name, color)} />
            );
        },
    },
    {
        text: '名',
        dataField: 'name',
        sort: true,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            let res = a[1] > b[1] ? 1 : (a[1] < b[1] ? -1 : 0);
            if (res === 0) res = a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        editable: true,
        formatter: (cell, row) => {
            if (cell) {
                return <div className="tableCell" id={"name_tableid_" + row.id}><span className="might" style={FeignTool.optionbackground[cell[1]]}>{cell[0]}</span></div>;
            }
            return <div className="tableCell" id={"name_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            return (
                <InsaneSelect {...editorProps} value={value} row={row} options={FeignTool.roleLabel} optionBackgrounds={FeignTool.optionbackground} insaneRoleOptions={FeignTool.insaneRoleLabel} allRoleLabels={FeignTool.allRoleLabel} dataField={column.dataField} text={column.text} />
            );
        },
    },
    {
        text: '役',
        dataField: 'role',
        ...FeignTool.column_template,
        formatter: FeignTool.formatter_templete('role'),
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const valueIsResultColor = (array) => {
                return (array && array.length && array[0][2] === 4);
            };
            const newvalue = (value, row) => {
                if (value && value.length) {
                    let nvalue = value.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return nvalue[0][0] + "z" + nvalue[0][1];
                }
                if (row.deadRole && row.deadRole.length) {
                    let nvalue = row.deadRole.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return nvalue[0][0] + "0" + nvalue[0][1];
                }
                return "";
            }
            const newa = newvalue(a, rowA);
            const newb = newvalue(b, rowB);
            const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = [];
            const roleWithTrue = [...FeignTool.role, FeignTool.br, { id: 103, name: "バ", roletype: [true, false, false, false, false], actionType: 4 }, { id: 104, name: "真", roletype: [true, false, false, false, false], actionType: 4 }];
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={roleWithTrue} dataField={column.dataField} text={column.text} />
            );
        },
    },
    {
        text: '死',
        dataField: 'deadRole',
        formatter: FeignTool.formatter_templete('deadRole'),
        ...FeignTool.column_template,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const valueIsResultColor = (array) => {
                return (array && array.length && array[0][2] === 4);
            };
            const newvalue = (value, row) => {
                if (value && value.length) {
                    let nvalue = value.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return "0" + nvalue[0][0] + nvalue[0][1];
                }
                if (row.role && row.role.length) {
                    let nvalue = row.role.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return "2" + nvalue[0][0] + nvalue[0][1];
                }
                return "1";
            }
            const newa = newvalue(a, rowA);
            const newb = newvalue(b, rowB);
            const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = [];
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={FeignTool.role} dataField={column.dataField} text={column.text} />
            );
        },
    },
    { ...FeignTool.target_day, formatter: FeignTool.dead_formatter('target_day1'), text: '1', dataField: 'target_day1', },
    { ...FeignTool.action_day, formatter: FeignTool.dead_formatter('action_day1'), dataField: 'action_day1', },
];
FeignTool.tutorialBaseColumns = FeignTool.defaultColumns.slice(0, -2);
FeignTool.playerBaseColumns = FeignTool.tutorialBaseColumns.map((column, index) => (
    index === 1 ? { ...column, text: "名前" } : column
));
FeignTool.tableDefinition = {
    tutorialBaseColumns: FeignTool.tutorialBaseColumns,
    playerBaseColumns: FeignTool.playerBaseColumns,
    targetDay: FeignTool.target_day,
    actionDay: FeignTool.action_day,
    deadFormatter: FeignTool.deadFormatter,
};


let FeignTool_popupWindow = null;

const FeignSupportToolRoot = () => {
    const [boardState, dispatch] = useReducer(boardReducer, initialBoardState);
    const [tableRevision, setTableRevision] = useState(0);
    const [nameText, setNameText] = useState("");
    const PlayerIsIcon = boardState.display.playerIsIcon;
    const NameIsIcon = boardState.display.nameIsIcon;
    const { dayCount, isTutorial } = boardState;
    const [nameStringList, setNameStringList] = useState(TUTORIAL_PLAYER_NAMES);
    const data = selectTableData(boardState);
    const columns = useMemo(() => selectTableColumns({ dayCount, isTutorial }, FeignTool.tableDefinition), [dayCount, isTutorial]);
    const syncLegacyBoard = (nextState) => {
        legacyBoardRuntime.sync(nextState);
    };
    const applyBoardAction = (action) => {
        return applyBoardActions([action]);
    };
    const applyBoardActions = (actions) => {
        const nextState = actions.reduce(
            (state, action) => boardReducer(state, action),
            { ...boardState, board: data },
        );
        dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
        syncLegacyBoard(nextState);
        return nextState;
    };
    legacyBoardRuntime.setColorChangeHandler((playerName, color) => {
        applyBoardAction({ type: BOARD_ACTION.SET_PLAYER_COLOR, playerName, color });
        setTableRevision((revision) => revision + 1);
    });

    const onChangeText = (e) => {
        setNameText(e.target.value);
    }
    const onClickButton = () => {
        if (!boardState.playerNames.length || boardState.isTutorial || window.confirm("現在の内容を消去して、新しい名前リストを設定しますか？")) {
            const newNameStringList = parsePlayerNames(nameText);
            setNameStringList(newNameStringList);
            const nextState = boardReducer(boardState, {
                type: BOARD_ACTION.INITIALIZE_BOARD,
                playerNames: newNameStringList,
                eventRows: FeignTool.ActionsNameList,
            });
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(1, nextState);
        } else if (window.confirm("名前リストを更新しますか？（名前が削除・変更されたデータは消去されます）")) {
            const newNameStringList = parsePlayerNames(nameText);
            const nextState = boardReducer(
                { ...boardState, board: data, playerNames: nameStringList },
                { type: BOARD_ACTION.SET_PLAYER_NAMES, playerNames: newNameStringList },
            );
            setNameStringList(newNameStringList);
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(nextState.dayCount, nextState);
        }
    }
    const AddDay = () => {
        const nextState = applyBoardAction({ type: BOARD_ACTION.ADD_DAY });
        PopupWin(nextState.dayCount, nextState);
    }
    const AddRow = () => {
        const nextState = applyBoardAction({ type: BOARD_ACTION.ADD_MEMO_ROW });
        PopupWin(nextState.dayCount, nextState);
    }

    const playerIconChangeHandler = (event) => {
        applyBoardAction({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "playerIsIcon", value: event.target.checked });
    };
    const nameIconChangeHandler = (event) => {
        applyBoardAction({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "nameIsIcon", value: event.target.checked });
    };
    const onClickReset = () => {
        if (window.confirm("入力内容をリセットしますか？")) {
            const nextState = boardReducer({ ...boardState, board: data }, { type: BOARD_ACTION.RESET_BOARD, eventRows: FeignTool.ActionsNameList });
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            PopupWin(1, nextState);
            return;
        }
        PopupWin(1);
    };
    const onOpenPopup = () => {
        FeignTool_popupWindow = window.open(
            process.env.PUBLIC_URL + '/popup.html',
            'FeignTool_popupWindow',
            'width=1000, height=300'
        );
        const sendWhenReady = () => {
            if (!FeignTool_popupWindow || FeignTool_popupWindow.closed) return;
            if (FeignTool_popupWindow.document.readyState !== "complete") {
                window.setTimeout(sendWhenReady, 100);
                return;
            }
            PopupWin(boardState.dayCount);
        };
        window.setTimeout(sendWhenReady, 100);
    };
    const MemeArea = () => {
        return (
            <div>
                <textarea style={{ width: "100vw", height: "20rem", border: "solid #ddd", outline: "none" }} placeholder="メモ" />
            </div>
        );
    }
    const PopupWin = (day, state = { ...boardState, board: data }) => {
        sendPopupSnapshot({ popupWindow: FeignTool_popupWindow, state, day, origin: window.location.origin });
    }
    const onCellSave = (oldValue, newValue, row, column) => {
        const deathRoleActions = isDeathEventLabel(row.name[0])
            ? deathRoleRecordsFromEventCell(row.name[0], newValue, FeignTool.actionType).map((record) => ({
                type: BOARD_ACTION.RECORD_DEATH_ROLE,
                playerName: record.playerName,
                roleToken: record.roleToken || FeignTool.fixedDeathRoleForEvent(row.name[0]),
                preventDuplicate: Boolean(record.fixedDeathRoleId),
            }))
            : [];
        const nextState = applyBoardActions([
            { type: BOARD_ACTION.UPDATE_CELL, rowId: row.id, field: column.dataField, value: newValue },
            ...deathRoleActions,
        ]);
        if (FeignTool_popupWindow) PopupWin(nextState.dayCount, nextState);
        if (column.dataField === 'name' || row.id < 0) setTableRevision((revision) => revision + 1);
    };

    return (
        <div>
            <div >
                <button onClick={AddDay}>翌日</button>
                <BoardTable
                    data={data}
                    columns={columns}
                    tableKey={`table-${PlayerIsIcon}-${NameIsIcon}-${tableRevision}`}
                    onCellSave={onCellSave}
                    roleLabelBgColor={FeignTool.roleLabelBgColor}
                    onAddMemo={AddRow}
                />
            </div>
            {MemeArea()}
            <NameInputPanel
                nameText={nameText}
                onNameTextChange={onChangeText}
                onOpenPopup={onOpenPopup}
                playerIsIcon={PlayerIsIcon}
                nameIsIcon={NameIsIcon}
                onPlayerIconChange={playerIconChangeHandler}
                onNameIconChange={nameIconChangeHandler}
                onSetNames={onClickButton}
                onReset={onClickReset}
            />
        </div>

    );

}


// ========================================

ReactDOM.render(
    <FeignSupportToolRoot />,
    document.getElementById('root')
);
