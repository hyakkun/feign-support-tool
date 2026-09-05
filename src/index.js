import React, { useState } from 'react'
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import ReactDOM from 'react-dom';
import { Container } from 'reactstrap';
import Select, { components } from "react-select";
import CreatableSelect from 'react-select/creatable';
import { Transition } from "react-transition-group";
import {
    ACTION_ITEM,
    actionItemsForRoleLabels,
    createLegacyRoleOptions,
    createRoleImageMap,
} from "./roleCatalog";
import {
    createLegacyEventRows,
    isDeathEventLabel,
} from "./eventRows";
import './index.scss';



const FeignTool = {};
FeignTool.tutorialData = [{ "keyid": 0, "id": 0, "name": ["名前例", 19], "color": ["/feign-support-tool/icon/Yellow.png", "#ffe352"], "role": [["ねずみ", 1, 1], ["真結果", 5, 4]], "target_day2": [["最初に", 0, 2]], "action_day2": [["ポリス", 1, 1], ["重要結果", 0, 4]] }, { "keyid": 1, "id": 1, "name": ["名前は", 4], "color": ["/feign-support-tool/icon/Magenta.png", "#ff00df"], "role": [["インベ", 0, 1]], "deadRole": [], "target_day1": [["ページ下部", 0, 2]], "action_day1": [["ねずみ", 1, 1], ["クリーナ", 2, 1], ["バカ結果？", 4, 4]], "target_day2": [], "action_day2": [] }, { "keyid": 2, "id": 2, "name": ["最初に", 2], "color": ["/feign-support-tool/icon/Blue.png", "#4b6fd7"], "role": [], "action_day2": [] }, { "keyid": 3, "id": 3, "name": ["ページ下部", 19], "color": ["/feign-support-tool/icon/DarkBlue.png", "#3817e3"], "role": [["トラッパ", 0, 1], ["真結果", 5, 4]], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["成功", 0, 0], ["真結果", 5, 4]] }, { "keyid": 4, "id": 4, "name": ["入力欄に", 1], "color": ["/feign-support-tool/icon/Red.png", "#b3000b"], "role": [["トラッパ", 0, 1]], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["失敗", 0, 0]], "deadRole": [["ボマー", 3, 1]] }, { "keyid": 5, "id": 5, "name": ["改行区切り", 19], "color": ["/feign-support-tool/icon/Pink.png", "#ff8fb3"] }, { "keyid": 6, "id": 6, "name": ["で入力", 19], "color": ["/feign-support-tool/icon/Cyan.png", "#31d7c7"], "action_day1": [["補導", 0, 0]] }, { "keyid": 7, "id": 7, "name": ["setName", 4], "color": ["/feign-support-tool/icon/Purple.png", "#71348b"], "role": [["ルック", 0, 1]], "target_day1": [["改行区切り", 0, 2]], "action_day1": [["使い方参照", 0, 2], ["バカ結果？", 4, 4]], "target_day2": [["で設定", 0, 2]] }, { "keyid": 8, "id": 8, "name": ["で設定", 19], "color": ["/feign-support-tool/icon/Green.png", "#2a7b0c"], "role": [], "action_day1": [["蘇生", 0, 0]] }, { "keyid": 9, "id": 9, "name": ["詳細は", 19], "color": ["/feign-support-tool/icon/Brown.png", "#654321"], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["罠", 0, 0]] }, { "keyid": 10, "id": 10, "name": ["入力欄横", 16], "color": ["/feign-support-tool/icon/White.png", "#ffffff"], "target_day1": [["で設定", 0, 2]], "role": [["ルック", 0, 1]], "action_day1": [["入力欄に", 0, 2], ["改行区切り", 0, 2]], "target_day2": [["ページ下部", 0, 2]], "action_day2": [["setName", 0, 2], ["バカ結果？", 4, 4]] }, { "keyid": 11, "id": 11, "name": ["使い方参照", 4], "color": ["/feign-support-tool/icon/Orange.png", "#ff871f"], "deadRole": [["バカ", 1, 1]] }, { "keyid": -1, "id": -1, "name": ["追放", 19], "target_day1": [["入力欄に", 0, 2]] }, { "keyid": -2, "id": -2, "name": ["殺害", 19], "target_day2": [["使い方参照", 0, 2]], "target_day1": [["で設定", 0, 2], ["蘇生", 0, 4]], "action_day1": [] }, { "keyid": -3, "id": -3, "name": ["爆発", 19], role: [["ボマー", 3, 1]] }, { "keyid": -4, "id": -4, "name": ["医者", 19], role: [["医者", 1, 1]], "target_day1": [["で設定", 0, 2], ["蘇生", 0, 4]] }, { "keyid": -5, "id": -5, "name": ["対立", 19] }, { "keyid": -6, "id": -6, "name": ["ﾗｲﾝ", 19] }];
FeignTool.tutorialNameStringList = ["名前例", "最初に", "名前は", "ページ下部", "入力欄に", "改行区切り", "で入力", "setName", "で設定", "詳細は", "入力欄横", "使い方参照",];

FeignTool.allRoleLabel = [
    { name: "赤確", roletypeNum: 0,  },
    { name: "青確", roletypeNum: 1, },
    { name: "緑確", roletypeNum: 2, },
    { name: "緑確バ", roletypeNum: 3 },
    { name: "バカ", roletypeNum: 4, },
    { name: "緑赤バ", roletypeNum: 5 },
    { name: "緑青バ", roletypeNum: 6 },
    { name: "赤青バ", roletypeNum: 7 },
    { name: "黒目バ", roletypeNum: 8 },
    { name: "緑目バ", roletypeNum: 9 },
    { name: "赤目バ", roletypeNum: 10 },
    { name: "青目バ", roletypeNum: 11 },
    { name: "緑赤", roletypeNum: 12,  },
    { name: "緑青", roletypeNum: 13,  },
    { name: "赤青", roletypeNum: 14, },
    { name: "黒目", roletypeNum: 15, },
    { name: "緑目", roletypeNum: 16, },
    { name: "赤目", roletypeNum: 17, },
    { name: "青目", roletypeNum: 18, },
    { name: "不明", roletypeNum: 19, },

];

FeignTool.roleLabel = [
    { name: "不明", roletypeNum: 19 , index:0},
    { name: "緑確", roletypeNum: 2, index: 1},
    { name: "赤確", roletypeNum: 0, index: 2},
    { name: "青確", roletypeNum: 1, index: 3},
    { name: "バカ", roletypeNum: 4, index: 4},
    { name: "緑目", roletypeNum: 16, index: 5},
    { name: "赤目", roletypeNum: 17, index: 6},
    { name: "青目", roletypeNum: 18, index: 7},
    { name: "緑赤", roletypeNum: 12, index: 8},
    { name: "緑青", roletypeNum: 13, index: 9},
    { name: "赤青", roletypeNum: 14, index: 10},
    { name: "黒目", roletypeNum: 15, index: 11},
    { name: "Hoge", roletypeNum: -1, index: 12},
];

FeignTool.insaneRoleLabel = [
    { name: "不明", roletypeNum: 19 },
    { name: "緑確バ", roletypeNum: 3 },
    { name: "赤確", roletypeNum: 0 },
    { name: "青確", roletypeNum: 1 },
    { name: "バカ", roletypeNum: 4 },
    { name: "緑目バ", roletypeNum: 9 },
    { name: "赤目バ", roletypeNum: 10 },
    { name: "青目バ", roletypeNum: 11 },
    { name: "緑赤バ", roletypeNum: 5 },
    { name: "緑青バ", roletypeNum: 6 },
    { name: "赤青バ", roletypeNum: 7 },
    { name: "黒目バ", roletypeNum: 8 },
    { name: "Hoge", roletypeNum: -1 },
];

FeignTool.roleLabelBgColor = ["#fdd", "#ddf", "#dfd", "linear-gradient(#ffd 0%, #ffd 50%, #dfd 50%, #dfd 100%)", "#ffd" ];

FeignTool.optionbackground = [
    { background: FeignTool.roleLabelBgColor[0] },
    { background: FeignTool.roleLabelBgColor[1] },
    { background: FeignTool.roleLabelBgColor[2] },
    { background: FeignTool.roleLabelBgColor[3] },

    { background: FeignTool.roleLabelBgColor[4] },

    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #fdd 50%, #fdd 100%)" },
    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ddf 50%, #ddf 100%)" },
    { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ddf 50%, #ddf 100%)" },

    { background: "linear-gradient(45deg, #fdd 0%, #fdd 35%, #ddf 35%, #ddf 60%, #ffd 60%, #ffd 100%) " },
    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ffd 50%, #ffd 100%)" },
    { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ffd 50%, #ffd 100%)" },
    { background: "linear-gradient(45deg, #ddf 0%, #ddf 50%, #ffd 50%, #ffd 100%)" },

    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #fdd 50%, #fdd 100%)" },
    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ddf 50%, #ddf 100%)" },
    { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ddf 50%, #ddf 100%)" },

    { background: "linear-gradient(45deg, #fdd 0%, #fdd 35%, #ddf 35%, #ddf 60%, transparent 60%, transparent 100%) " },
    { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, transparent 50%, transparent 100%)" },
    { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, transparent 50%, transparent 100%)" },
    { background: "linear-gradient(45deg, #ddf 0%, #ddf 50%, transparent 50%, transparent 100%)" },


    { background: "transparent" },


]

FeignTool.roletype = ["role unknown", "role crew", "role imp", "role neutral", "role insane", "role sane"];
FeignTool.roletypeColor = ["#ddd", "#8f8", "#f88", "#88f", "#ff8", "#8ff", "#888"];


FeignTool.actionType = { action: 0, role: 1, name: 2, created: 3, option: 4 };
FeignTool.role = createLegacyRoleOptions(FeignTool.actionType).concat({
    id: -1,
    name: "？",
    roletype: [true, true, true, true, true],
    actionType: FeignTool.actionType.role,
});
FeignTool.roleImage = createRoleImageMap(process.env.PUBLIC_URL);
FeignTool.actionResult = [
    { id: 100, name: "成功", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 101, name: "失敗", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 102, name: "？", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 103, name: "バカ結果？", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.option },
    { id: 104, name: "真結果", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.option },
    { id: 105, name: "補導", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 106, name: "罠", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 107, name: "在宅", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 108, name: "来客", roletype: [true, true, true, true, false], actionType: FeignTool.actionType.action },
    { id: 109, name: "蘇生", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.action },
    { id: 110, name: "重要結果", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.option },];
FeignTool.actionRevive = { id: 111, name: "蘇生", roletype: [true, false, false, false, false], actionType: FeignTool.actionType.option };
FeignTool.reviveImage = process.env.PUBLIC_URL + "/image/Revive.png";

FeignTool.otheActions = ["追放", "キル", "爆発", "CO", "不明"];
FeignTool.hr = { id: -3, name: "hr", roletype: [false, false, false, false, false], actionType: FeignTool.actionType.option };
FeignTool.br = { id: -4, name: "br", roletype: [false, false, false, false, false], actionType: FeignTool.actionType.option };
FeignTool.ActionsNameList = createLegacyEventRows(FeignTool.actionType);
const tutorialEventsByLabel = new Map(FeignTool.tutorialData
    .filter((row) => row.id < 0)
    .map((row) => [row.name[0], row]));
FeignTool.tutorialData = FeignTool.tutorialData
    .filter((row) => row.id >= 0)
    .concat(FeignTool.ActionsNameList.map((eventRow) => ({
        ...(tutorialEventsByLabel.get(eventRow.name[0]) || eventRow),
        keyid: eventRow.keyid,
        id: eventRow.id,
    })));
FeignTool.column_template = {
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
        const valueIsResultColor = (array) => (
            array && array.length && array[0][2] === 4);
        const newvalue = (value, row) => {
            let nvalue = value.slice();
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

FeignTool.formatter_templete = (dataField) => ((cell, row) => {
    let insane = false;
    let sane = false;
    let important = false;
    let directionColumn = row.id < 0;
    if (FeignTool_playerIsIcon) directionColumn = false;
    else if (!directionColumn) {
        let nameNum = 0;
        cell?.forEach((item) => { if (item[2] === 2) nameNum++; });
        if (nameNum > 1) directionColumn = true;
    }
    let roles = cell?.map((item, i) => {
        if (item[2] !== 2) {
            if (item[2] > 2) {
                if (item[0] === "バカ結果？") {
                    insane = true;
                    return;
                } else if (item[0] === "真結果") {
                    sane = true;
                    return;
                }
                if (item[0] === "重要結果") {
                    important = true;
                    return;
                }
                if (!directionColumn && item[2] === 4 && item[0] === "蘇生" && i > 0) {
                    return <span key={item + i} style={{ position: "relative" }}><img className="revive" src={FeignTool.reviveImage} alt={item[0]} /></span>;
                }
            }
            if (item[0] in FeignTool.roleImage) return <img key={item + i} className={FeignTool.roletype[item[1]]} src={FeignTool.roleImage[item[0]]} alt={item[0]} />;
        } else if (FeignTool_playerIsIcon && item[0] in FeignTool_colorNameDic) {
            return <span key={item + i} className="iconContainer"><img src={FeignTool_colorNameDic[item[0]][0]} alt={item[0]} /><span className="iconTextContainer "><span className="iconText">{item[0]}</span></span></span>;
        }
        if (directionColumn && item[2] === 2) return <span key={item + i} className="name"><span className={FeignTool.roletype[item[1]]} > {item[0]}</span></span>;
        else return <span key={item + i} className={FeignTool.roletype[item[1]]} > {item[0]}</span>;
    }).filter((e) => e);
    roles = <div>{roles?.length ? roles : "　"}</div>;
    if (insane || sane) roles = <div className={(insane ? "InsaneResult " : "SaneResult")} > {roles}</div>;
    if (important) roles = <div className="Important" >{roles}</div>;
    return <div className="tableCell" id={dataField + "_tableid_" + row.id}>{roles}</div>;
});
FeignTool.dead_formatter = (dataField) => ((cell, row) => {
    if (dataField in row && isDeathEventLabel(row.name[0])) {
        const items = row[dataField];
        const moveItems = [];
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].length > 3 && items[i][2] === FeignTool.actionType.role) {
                const item = (items[i][0] in FeignTool.roleImage) ? <img className={FeignTool.roletype[items[i][1]]} src={FeignTool.roleImage[items[i][0]]} alt={items[i]} /> : items[i][0];
                let count = -1;
                for (let j = 0; j < i; j++)if (items[j][2] === FeignTool.actionType.name) count++;
                moveItems.push(<MoveItem key={i} num={count} startId={dataField + "_tableid_" + row.id} endId={"deadRole_tableid_" + items[i][3]} item={item} />);
                items.splice(i, 1);
            }
        }
        return <div className="tableCell">{(FeignTool.formatter_templete(dataField))(cell, row)}{moveItems}</div>;
    } else return (FeignTool.formatter_templete(dataField))(cell, row);
});
const MoveItem = (props) => {
    const [animate, setAnimate] = useState(true);
    const startTransform = "translate(" + 1.67 * props.num + "rem,0)";
    const endTransform = () => {
        const startElement = document.getElementById(props.startId);
        const endElement = document.getElementById(props.endId);
        if (startElement && endElement) {
            const startPos = startElement.getBoundingClientRect();
            const endPos = endElement.getBoundingClientRect();
            const moveX = endPos.left - startPos.left;
            const moveY = endPos.top - startPos.top;

            return "translate(" + moveX/0.9 + "px," + moveY/0.9 + "px)";
        } else return "translate(0,0)";
    }
    return (
        <Transition in={animate} appear={true} timeout={{ enter: 10, exit: 1100 }} unmountOnExit={true} onEntered={() => { setAnimate(false); }}>
            {(state) => (<span className="moveItem" style={{ transform: state === "entering" ? startTransform : endTransform() }}>{props.item}</span>)}
        </Transition>
    );
}
FeignTool.target_day = {
    ...FeignTool.column_template,
    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
        if (!(column.dataField in row)) row[column.dataField] = [];
        let options = FeignTool_nameList;
        if (row.id < 0) {
            if (isDeathEventLabel(row.name[0]))
                return (
                    <DeadSelect {...editorProps} value={value} row={row} options={FeignTool_nameList.concat(FeignTool.actionRevive)} dataField={column.dataField} text={column.text} />
                );
            if (row.name[0] === "医者" || row.name[0] === "爆発") options = options.concat(FeignTool.actionRevive);
        }
        return (
            <RoleSelect {...editorProps} value={value} row={row} options={options} dataField={column.dataField} text={column.text} />
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
                <DeadSelect {...editorProps} value={value} row={row} options={FeignTool_nameList.concat(FeignTool.actionRevive)} dataField={column.dataField} text={column.text} />
            );
        if (row.id < 0 && (row.name[0] === "医者" || row.name[0] === "爆発")) {
            const newOptions = FeignTool_nameList.concat(FeignTool.actionRevive);
            return (
                <RoleSelect {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
            );
        }
        if (("role" in row && row.role.length) || ("deadRole" in row && row.deadRole.length)) {
            if ("role" in row) allrole = allrole.concat(row.role?.map((item, i) => { return item[0]; }));
            if ("deadRole" in row) allrole = allrole.concat(row.deadRole?.map((item, i) => { return item[0]; }));
        }
        const optionsByActionItem = {
            [ACTION_ITEM.ROLE]: FeignTool.role,
            [ACTION_ITEM.PLAYER]: FeignTool_nameList,
            [ACTION_ITEM.RESULT]: FeignTool.actionResult,
        };
        const newOptions = actionItemsForRoleLabels(allrole).flatMap((actionItem, index) => [
            ...(index ? [FeignTool.hr] : []),
            ...optionsByActionItem[actionItem],
        ]);
        return (
            <RoleSelect {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
        );
    },
};
FeignTool.colorList = [
    [process.env.PUBLIC_URL + "/icon/White.png", "#ffffff"],
    [process.env.PUBLIC_URL + "/icon/Orange.png", "#ff871f"],
    [process.env.PUBLIC_URL + "/icon/Purple.png", "#71348b"],
    [process.env.PUBLIC_URL + "/icon/Green.png", "#2a7b0c"],
    [process.env.PUBLIC_URL + "/icon/Blue.png", "#4b6fd7"],
    [process.env.PUBLIC_URL + "/icon/Red.png", "#b3000b"],
    [process.env.PUBLIC_URL + "/icon/Yellow.png", "#ffe352"],
    [process.env.PUBLIC_URL + "/icon/Lime.png", "#83ff46"],
    [process.env.PUBLIC_URL + "/icon/Cyan.png", "#31d7c7"],
    [process.env.PUBLIC_URL + "/icon/Pink.png", "#ff8fb3"],
    [process.env.PUBLIC_URL + "/icon/Brown.png", "#654321"],
    [process.env.PUBLIC_URL + "/icon/Magenta.png", "#ff00df"],
    [process.env.PUBLIC_URL + "/icon/DarkBlue.png", "#3817e3"],
    [process.env.PUBLIC_URL + "/icon/DarkGreen.png", "#2a5b2b"],
    [process.env.PUBLIC_URL + "/icon/DarkOrange.png", "#ff4406"],
];
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
            if (FeignTool_nameIsIcon) {
                const name = row.name[0];
                if (row.id >= 0 && name in FeignTool_colorNameDic) {
                    return <div className="tableCell" id={"color_tableid_" + row.id}><div className="nameAreaIconContainer"><span className="iconContainer"><img src={FeignTool_colorNameDic[name][0]} alt={name} /><span className="iconTextContainer "><span className="iconText">{name}</span></span></span></div></div>;
                } else return <div className="tableCell" id={"color_tableid_" + row.id}>{name}</div>;
            } else if (cell && cell.length > 1) {
                return <div className="tableCell" id={"color_tableid_" + row.id}><div className="colorpicker" style={{ display: "block", backgroundColor: cell[1] }}>　</div></div>;
            }
                    return <div className="tableCell" id={"color_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = false;
            return (
                <ColorSelect {...editorProps} value={value} row={row} options={FeignTool.colorList} dataField={column.dataField} text={column.text} />
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
                return <div className="tableCell" id={"name_tableid_" + row.id}><span className="might" style={FeignTool.optionbackground[cell[1]]}>{FeignTool_nameIsIcon ? "　" : cell[0]}</span></div>;
            }
            return <div className="tableCell" id={"name_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            return (
                <InsaneSelect {...editorProps} value={value} row={row} options={FeignTool.roleLabel} dataField={column.dataField} text={column.text} />
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
                <RoleSelect {...editorProps} value={value} row={row} options={roleWithTrue} dataField={column.dataField} text={column.text} />
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
                <RoleSelect {...editorProps} value={value} row={row} options={FeignTool.role} dataField={column.dataField} text={column.text} />
            );
        },
    },
    { ...FeignTool.target_day, formatter: FeignTool.dead_formatter('target_day1'), text: '1', dataField: 'target_day1', },
    { ...FeignTool.action_day, formatter: FeignTool.dead_formatter('action_day1'), dataField: 'action_day1', },
];


let FeignTool_tableData = FeignTool.tutorialData;
let FeignTool_nameList = FeignTool.tutorialNameStringList.map((name, i) => { return { id: i + 200, name: name, roletype: [true, true, true, true, true,], actionType: 2 }; }).concat({ id: 199, name: "？", roletype: [true, false, false, false, false], actionType: 2 });
let FeignTool_colorNameDic = {};
let FeignTool_playerIsIcon = true;
let FeignTool_nameIsIcon = false;
let FeignTool_IsTutorial = true;
FeignTool.tutorialData.forEach((item) => {
    if (item.id < 0 || !("color" in item)) return;
    FeignTool_colorNameDic[item.name[0]] = item.color;
});

class ColorSelect extends React.Component {
    constructor(props) {
        super(props);
        let name = false;
        if (props.row.id >= 0) name = props.row.name[0];
        this.state = {
            value: this.props.row[props.dataField],
            name: name
        };
    }

    getValue() {
        if ("newValue" in this) return this.newValue;
        else return this.state.value;
    }

    handleOnUpdate(event) {
        if (event) {
            this.setState({
                value: event.value,
            })
            if (this.state.name) FeignTool_colorNameDic[this.state.name] = event.value;
            return event.value;
        }
        else return this.state.value;
    }

    render() {
        const { value, onUpdate, ...rest } = this.props;
        const optionstyle = {
            display: "inline-block",
            width: "2rem",
            height: "2rem",
            margin: "0.05rem",
            borderRadius: "0.5rem",
            padding: "0",
            borderCollapse: "collapse",
            border: "0.05rem solid #aaa",
        };
        const customStyles = {
            option: (provided, state) => {
                return ({
                    ...provided,
                    ...optionstyle,
                    backgroundColor: state.data.value[1],
                });
            },
            control: (provided) => ({
                ...provided,
                display: "flex"
            }),
            menu: (provided) => ({
                ...provided,
                width: "-moz-fit-content",
                width: "fit-content",
            }),
            menuList: (provided) => ({
                ...provided,
                width: "12.6rem",
            }),
            container: (provided) => ({
                ...provided,
                whiteSpace: "normal",
                width: "-moz-fit-content",
                width: "fit-content",
            }),
        };
        return (
            <Select
                {...rest} isClearable={false}
                key={this.props.dataField} name={this.props.text}
                onChange={(event) => { this.newValue = this.handleOnUpdate(event); return onUpdate(this.getValue()); }}
                className="select Color"
                defaultValue={() => { let color = this.props.row[this.props.dataField]; if (color) return { value: color, label: <div className="colorpicker" style={{ backgroundColor: color[1] }}>　</div> }; }}
                options={[...this.props.options.map((option) => { return { value: option, label: "　" } })]}
                menuIsOpen={true}
                autoFocus={true}
                styles={customStyles}
            />
        )
    }
}

class InsaneSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.row[props.dataField] ?? ["", 19,],
            insane: false
        };
    }

    getValue() {
        if ("newValue" in this) return this.newValue;
        else return this.state.value;
    }

    handleOnUpdate(event) {
        if (event) {
            this.setState({
                value: [this.state.value[0], event.value],
            })
            return [this.state.value[0], event.value];
        }
        else return this.state.value;
    }

    render() {
        const { value, onUpdate, ...rest } = this.props;
        const optionstyle = {
            display: "inline-block",
            width: "4rem",
            padding: "0.1rem",
            borderCollapse: "collapse",
            border: "0.05rem solid #aaa",
        };
        const customStyles = {
            option: (provided, state) => {
                const roletypeNum = state.data?.value ?? 19;
                return ({
                    ...provided,
                    ...optionstyle,
                    ...FeignTool.optionbackground[roletypeNum],
                });
            },
            control: (provided) => ({
                ...provided,
                display: "flex"
            }),
            menu: (provided) => ({
                ...provided,
                width: "-moz-fit-content",
                width: "fit-content",
            }),
            menuList: (provided) => ({
                ...provided,
                width: "16rem",
                marginLeft: "auto",
                marginRight: "auto",
            }),
            container: (provided) => ({
                ...provided,
                whiteSpace: "normal",
                width: "-moz-fit-content",
                width: "fit-content",
            }),
        };

        const insaneButton = (props) => {
            if (props.data.label) {
                if (props.data.label === "Hoge") {
                    return (
                        <div style={{ marginTop: "0.3rem" }}>
                            <button className="role insane" onClick={() => this.setState({ insane: !this.state.insane })}>自称バカ</button>
                        </div>
                    );
                }
            }
            return <components.Option {...props} />;
        }

        return (
            <Select
                {...rest} isClearable={false}
                key={this.props.dataField} name={this.props.text}
                onChange={(event) => { this.newValue = this.handleOnUpdate(event); return onUpdate(this.getValue()); }}
                className="selectInsane"
                defaultValue={() => { let role = this.props.row[this.props.dataField]; return { value: role, label: role[0] + "/" + FeignTool.allRoleLabel[role[1]]?.name }; }}
                options={[...this.props.options.map((option) => {
                    if (!this.state.insane) return { value: option.roletypeNum, label: option.name };
                    else {
                        let newoption = FeignTool.insaneRoleLabel[option.index];
                        return { value: newoption.roletypeNum, label: newoption.name };
                    }
                })]}
                menuIsOpen={true}
                autoFocus={true}
                styles={customStyles}
                components={{ Option: insaneButton }}
            />
        )
    }
}

class RoleSelect extends React.Component {
    constructor(props) {
        super(props);
        let isLook = false;
        let isInv = false;
        let defaultRoleTypeNum = props.dataField === "role" ? -1 : -2;
        if (props.dataField.indexOf('action_day') >= 0) {
            isLook = (props.allRole.indexOf("ルック") >= 0);
            isInv = (props.allRole.indexOf("インベ") >= 0);
            if (isInv && this.props.row[props.dataField]) {
                const roles = this.props.row[props.dataField].filter(item => item[2] === FeignTool.actionType.role);
                if (roles.length === 1 && roles[0][1] === 1) defaultRoleTypeNum = -3;
            }
        }
        this.state = {
            value: this.props.row[props.dataField] ?? [],
            defaultRoleTypeNum: defaultRoleTypeNum,
            roleTypeNum: defaultRoleTypeNum,
            isLook: isLook,
            isInv: isInv,
        };
    }

    getValue() {
        if ("newValue" in this) return this.newValue;
        else return this.state.value;
    }

    checkFinish() {
        if (this.newValue.length <= this.state.value.length) {
            if (this.state.isLook && this.newValue.length > 0) return false;
            return true;
        }
        const newItem = this.newValue[this.newValue.length - 1];
        if (this.state.isLook) {
            if (newItem[2] !== FeignTool.actionType.name) return true;
            else return false;
        } else if (this.state.isInv) {
            if (newItem[2] !== FeignTool.actionType.role) return true;
            const roles = this.newValue.filter(item => item[2] === FeignTool.actionType.role);
            if (roles.length !== 1) return true;
            if (roles[0][1] === 1) this.setState({ roleTypeNum: -3 });
            else this.setState({ roleTypeNum: -2 });
            return false;

        } else return true;
    }

    handleOnUpdate(event) {
        if (event) {
            this.newValue = event.map(x => x.value);
            const finish = this.checkFinish();
            this.setState({
                value: this.newValue
            })
            return finish;
        } else {
            return true;
        }
    }

    render() {
        const { value, onUpdate, ...rest } = this.props
        const customStyles = {
            option: (provided, state) => {
                const style = (
                    {
                        ...provided,
                        display: "inline-block",
                        width: (typeof (state.label) === "string") ? "6rem" : (state.data.value[2] === 1 || state.data.value[2] === 4 ?"2.25rem" : "2rem"),
                        padding: "0.1rem",
                        borderCollapse: "collapse",
                        border: "0.05rem solid #aaa",
                        backgroundColor: FeignTool.roletypeColor[state.data.value[1]],
                        boxSizing: "border-box",
                    });
                if (state.data.value[2] === 2 && state.data.value[0] in FeignTool_colorNameDic)
                    style.background = "linear-gradient(transparent 80%, " + FeignTool_colorNameDic[state.data.value[0]][1] + " 18%)";
                return style;
            },
            control: (provided) => ({
                ...provided,
                display: "flex"
            }),
            multiValue: (provided, { data }) => {
                if (data.value[2] === 2 && data.value[0] in FeignTool_colorNameDic) return {
                    ...provided,
                    background: "linear-gradient(transparent 80%, " + FeignTool_colorNameDic[data.value[0]][1] + " 18%)",
                    border: "1px solid #888",
                };
                else return {
                    ...provided,
                    backgroundColor: FeignTool.roletypeColor[data.value[1]],
                };
            },
            menu: (provided) => ({
                ...provided,
                width: "-moz-fit-content",
                width: "fit-content",
            }),
            menuList: (provided) => ({
                ...provided,
                width: "18rem",
                marginLeft: "auto",
                marginRight: "auto",
            }),
            container: (provided) => ({
                ...provided,
                whiteSpace: "normal",
                width: "-moz-fit-content",
                width: "fit-content",
            }),
        };
        const toggleRoleTypeNum = (typeNum) => {
            if (typeNum === this.state.roleTypeNum) this.setState({ roleTypeNum: this.state.defaultRoleTypeNum });
            else this.setState({ roleTypeNum: typeNum });
        }
        const typeButton = (props) => {
            if (props.data.value?.length >= 2 && props.data.value[2]!==2) {
                if (props.data.value[0] === "Hoge") {
                    return (
                        <div style={{ display: "flex" }}>
                            <button className="roleButton crew" onClick={() => toggleRoleTypeNum(1)}>crew</button>
                            <button className="roleButton imp" onClick={() => toggleRoleTypeNum(2)}>imp</button>
                            <button className="roleButton neutral" onClick={() => toggleRoleTypeNum(3)}>neutral</button>
                            <button className="roleButton unknown" onClick={() => toggleRoleTypeNum(0)}>none</button>
                        </div>
                    );
                } else if (props.data.value[0] === "hr") {
                    return <hr style={{ display: "block" }} />;
                } else if (props.data.value[0] === "br") {
                    return <br />;
                }
            }
            return <components.Option {...props} />;
        }
        return (
            <CreatableSelect
                {...rest} isMulti
                key={this.props.dataField} name={this.props.text}
                onChange={(event) => { if (this.handleOnUpdate(event)) return onUpdate(this.getValue()); }}
                className="selectRole"
                defaultValue={this.props.row[this.props.dataField].map((role) => {
                    let label = role[0];
                    if (role[2] !== 2 && role[0] in FeignTool.roleImage) {
                        label = <img src={FeignTool.roleImage[role[0]]} alt={role[0]} />;
                    }
                    return { value: role, label: label }
                })}
                options={[...this.props.options.map((option) => {
                    let label = option.name;
                    let roleTypeNum = this.state.roleTypeNum < 0 ? (option["defaultRoletype" + (-this.state.roleTypeNum)] ?? 0) : (option.roletype[this.state.roleTypeNum] ? this.state.roleTypeNum : 0);

                    if (option.actionType !== FeignTool.actionType.name) {
                        if (option.name in FeignTool.roleImage) {
                            if (option.actionType === FeignTool.actionType.role)
                                label = <span className="selectImg"><img className="roleImg" src={FeignTool.roleImage[option.name]} alt={option.name} /></span>;
                            else
                                label = <span className="selectImg"><img src={FeignTool.roleImage[option.name]} alt={option.name} /></span>;
                        }
                        if (option.actionType === FeignTool.actionType.option) {
                            if (option.name === "バ") return { value: ["バカ結果？", 4, 4], label: <span className="roleOption">バ</span> };
                            if (option.name === "真") return { value: ["真結果", 5, 4], label: <span className="roleOption">真</span> };
                            if (option.name === "バカ結果？") roleTypeNum = 4;
                            else if (option.name === "真結果") roleTypeNum = 5;
                        }
                    }
                    return {
                        value: [option.name, roleTypeNum, option.actionType], label: label
                    };
                })]}
                components={{ Option: typeButton }}
                styles={customStyles}
                menuIsOpen={true}
                autoFocus={true}
                isClearable={true}
                getNewOptionData={(newOptionString) => ({ value: [newOptionString, 0, 3], label: newOptionString })}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                onMenuClose={() => { onUpdate(this.getValue()); }}
            />
        )
    }
}

class DeadSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.row[props.dataField] ?? [],
            roleTypeNum: -2,
            nameSelected: false
        };
    }

    getValue() {
        if ("newValue" in this) return this.newValue;
        else return this.state.value;
    }

    handleOnUpdate(event) {
        if (event) {
            this.newValue = event.map(x => x.value);
            if (event.length > this.state.value.length) {
                const newItem = event[event.length - 1].value;
                if (this.state.nameSelected && newItem[2] === FeignTool.actionType.role) {
                    const name = this.state.nameSelected;
                    this.setState({ nameSelected: false });
                    FeignTool_tableData.forEach((item) => {
                        if (item.name[0] === name && item.id >= 0) {
                            if (item.deadRole) item.deadRole.push([...newItem]);
                            else item.deadRole = [[...newItem]];
                            newItem.push(item.id);
                            item.keyid = item.id + ((item.keyid * 10) % 5 + 1) * 0.1 ;
                        }
                    });
                } else if (!this.state.nameSelected && newItem[2] === FeignTool.actionType.name) {
                    this.setState({ value: this.newValue, nameSelected: newItem[0] });
                    let roleExist = false;
                    FeignTool_tableData.forEach((item) => {
                        if (item.name[0] === newItem[0] && item.id >= 0) {
                            roleExist = item.deadRole && item.deadRole.length > 0;
                        }
                    });
                    return roleExist;
                }
            }
            this.setState({ value: this.newValue });
        }
        return true;
    }

    render() {
        const { value, onUpdate, ...rest } = this.props
        const customStyles = {
            option: (provided, state) => {
                const style = (
                    {
                        ...provided,
                        display: "inline-block",
                        width: (typeof (state.label) === "string") ? "6rem" : (state.data.value[2] === 1 || state.data.value[2] === 4 ? "2.25rem" : "2rem"),
                        padding: "0.1rem",
                        borderCollapse: "collapse",
                        border: "0.05rem solid #aaa",
                        backgroundColor: FeignTool.roletypeColor[state.data.value[1]],
                        boxSizing: "border-box",
                    });
                if (state.data.value[2] === 2 && state.data.value[0] in FeignTool_colorNameDic)
                    style.background = "linear-gradient(transparent 80%, " + FeignTool_colorNameDic[state.data.value[0]][1] + " 18%)";
                return style;
            },
            control: (provided) => ({
                ...provided,
                display: "flex"
            }),
            multiValue: (provided, { data }) => {
                if (data.value[2] === 2 && data.value[0] in FeignTool_colorNameDic) return {
                    ...provided,
                    background: "linear-gradient(transparent 80%, " + FeignTool_colorNameDic[data.value[0]][1] + " 18%)",
                    border: "1px solid #888",
                };
                else return {
                    ...provided,
                    backgroundColor: FeignTool.roletypeColor[data.value[1]],
                };
            },
            menu: (provided) => ({
                ...provided,
                width: "-moz-fit-content",
                width: "fit-content",
            }),
            menuList: (provided) => ({
                ...provided,
                width: "18rem",
                marginLeft: "auto",
                marginRight: "auto",
            }),
            container: (provided) => ({
                ...provided,
                whiteSpace: "normal",
                width: "-moz-fit-content",
                width: "fit-content",
            }),
        };
        const toggleRoleTypeNum = (typeNum) => {
            if (typeNum === this.state.roleTypeNum) this.setState({ roleTypeNum: -2 });
            else this.setState({ roleTypeNum: typeNum });
        }
        const typeButton = (props) => {
            if (props.data.value?.length >= 2 && props.data.value[2] !== 2) {
                if (props.data.value[0] === "Hoge") {
                    return (
                        <div style={{ display: "flex" }}>
                            <button className="roleButton crew" onClick={() => toggleRoleTypeNum(1)}>crew</button>
                            <button className="roleButton imp" onClick={() => toggleRoleTypeNum(2)}>imp</button>
                            <button className="roleButton neutral" onClick={() => toggleRoleTypeNum(3)}>neutral</button>
                            <button className="roleButton unknown" onClick={() => toggleRoleTypeNum(0)}>none</button>
                        </div>
                    );
                } else if (props.data.value[0] === "hr") {
                    return <hr style={{ display: "block" }} />;
                } else if (props.data.value[0] === "br") {
                    return <br />;
                }
            }
            return <components.Option {...props} />;
        }
        return (
            <CreatableSelect
                {...rest} isMulti isClearable={false}
                key={this.props.dataField} name={this.props.text}
                onChange={(event) => {
                    if (this.handleOnUpdate(event)) return onUpdate(this.getValue());
                }}
                className="selectRole"
                defaultValue={this.props.row[this.props.dataField].map((role) => {
                    let label = role[0];
                    if (role[2] !== 2 && role[0] in FeignTool.roleImage) {
                        label = <img src={FeignTool.roleImage[role[0]]} alt={role[0]} />;
                    }
                    return { value: role, label: label }
                })}
                options={(
                    this.state.nameSelected ? [...FeignTool.role.map((option) => {
                        let label = option.name;
                        let roleTypeNum = this.state.roleTypeNum < 0 ? (option["defaultRoletype" + (-this.state.roleTypeNum)] ?? 0) : (option.roletype[this.state.roleTypeNum] ? this.state.roleTypeNum : 0);

                        if (option.actionType !== FeignTool.actionType.name) {
                            if (option.name in FeignTool.roleImage) {
                                if (option.actionType === FeignTool.actionType.role)
                                    label = <span className="selectImg"><img className="roleImg" src={FeignTool.roleImage[option.name]} alt={option.name} /></span>;
                                else
                                    label = <span className="selectImg"><img src={FeignTool.roleImage[option.name]} alt={option.name} /></span>;
                            }
                            if (option.actionType === FeignTool.actionType.option) {
                                if (option.name === "バ") return { value: ["バカ結果？", 4, 4], label: <span className="roleOption">バ</span> };
                                if (option.name === "真") return { value: ["真結果", 5, 4], label: <span className="roleOption">真</span> };
                                if (option.name === "バカ結果？") roleTypeNum = 4;
                                else if (option.name === "真結果") roleTypeNum = 5;
                            }
                        }
                        return {
                            value: [option.name, roleTypeNum, option.actionType], label: label
                        };
                    }), { value: ["蘇生", 0, FeignTool.actionType.option], label: <span className="roleOption">蘇</span> }]:
                        [...FeignTool_nameList.concat(FeignTool.actionRevive).map((option) => ({ value: [option.name, 0, option.actionType], label: option.name}))]
                    )}
                components={{ Option: typeButton }}
                styles={customStyles}
                menuIsOpen={true}
                autoFocus={true}
                isClearable={true}
                getNewOptionData={(newOptionString) => ({ value: [newOptionString, 0, 3], label: newOptionString })}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                onMenuClose={() => { onUpdate(this.getValue()); }}
            />
        )
    }
}


class FeignTableErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (Array.isArray(FeignTool_tableData)) {
                let renderData = FeignTool_tableData.map((item, i) => (<div key={i}>{JSON.stringify(item)}</div>));
                return <div><h1>大変申し訳ありません、エラーが発生しました</h1><button onClick={() => { this.setState({ hasError: false }); }}>リトライ</button><div>{renderData}</div></div>;
            } else return <h1>大変申し訳ありません、エラーが発生しました</h1>;
        }
        return this.props.children;
    }
}
let FeignTool_popupWindow = null;

const FeignSupportToolRoot = () => {
    const [render, setRender] = useState(false);
    const [nameText, setNameText] = useState("");
    const [PlayerIsIcon, setPlayerIsIcon] = useState(FeignTool_playerIsIcon);
    const [NameIsIcon, setNameIsIcon] = useState(FeignTool_nameIsIcon);
    const [nameStringList, setNameStringList] = useState(FeignTool.tutorialNameStringList);
    const [data, setData] = useState(FeignTool.tutorialData);
    const [columns, setColumns] = useState(FeignTool.defaultColumns.concat([{ ...FeignTool.target_day, formatter: FeignTool.dead_formatter('target_day2'), text: '2', dataField: 'target_day2', }, { ...FeignTool.action_day, formatter: FeignTool.dead_formatter('action_day2'), dataField: 'action_day2', }]));

    const onChangeText = (e) => {
        setNameText(e.target.value);
    }
    const onClickButton = () => {
        if (!FeignTool_nameList.length || FeignTool_IsTutorial || window.confirm("現在の内容を消去して、新しい名前リストを設定しますか？")) {
            FeignTool_IsTutorial = false;
            const newNameStringList = [...new Set(nameText.split('\n'))].filter(e => e !== "");
            setNameStringList(newNameStringList);
            FeignTool_nameList = newNameStringList.map((name, i) => { return { id: i + 200, name: name, roletype: [true, true, true, true, true,], actionType: 2 }; }).concat({ id: 199, name: "？", roletype: [true, false, false, false, false], actionType: 2 });
            FeignTool_colorNameDic = {};
            const newColumns = FeignTool.defaultColumns.slice();
            const firstColumn = newColumns.shift();
            if (FeignTool_nameIsIcon) {
                if (firstColumn.dataField === "name") newColumns.unshift(firstColumn);
                else newColumns.splice(1, 0, firstColumn);
            } else {
                if (firstColumn.dataField === "color") newColumns.unshift(firstColumn);
                else newColumns.splice(1, 0, firstColumn);
            }
            newColumns[0].text = "　";
            newColumns[1].text = "名前";
            setColumns(newColumns);
            FeignTool_tableData = newNameStringList.map((name, i) => { return { keyid:i, id: i, name: [name, 19] }; }).concat(FeignTool.ActionsNameList.map((item) => Object.assign({}, item)));
            setData(FeignTool_tableData);
            PopupWin(1);
        } else if (window.confirm("名前リストを更新しますか？（名前が削除・変更されたデータは消去されます）")) {
            const newNameStringList = [...new Set(nameText.split('\n'))].filter(e => e !== "");
            FeignTool_nameList = newNameStringList.map((name, i) => { return { id: i + 200, name: name, roletype: [true, true, true, true, true,], actionType: 2 }; }).concat({ id: 199, name: "？", roletype: [true, false, false, false, false], actionType: 2 });
            let maxid = 0;
            let fixedData = null;
            let newData = data.map((item, i) => {
                if (item.id > maxid) maxid = item.id;
                if (item.id === -1) fixedData = item;
                if (newNameStringList.indexOf(item.name[0]) < 0 && item.id >= 0) return;
                else return item;
            }).filter((e) => e);
            if (newData.indexOf(fixedData) >= 0) {
                newNameStringList.forEach((name) => {
                    if (nameStringList.indexOf(name) < 0) {
                        newData.splice(newData.indexOf(fixedData), 0, { keyid: maxid + 1, id: maxid + 1, name: [name, 19] });
                        maxid++;
                    }
                });
            }
            FeignTool_colorNameDic = {};
            newData.forEach((item) => {
                if (item.id < 0 || !("color" in item)) return;
                FeignTool_colorNameDic[item.name[0]] = item.color;
            });
            setNameStringList(newNameStringList);
            FeignTool_tableData = newData;
            setData(newData);
            PopupWin((columns.length - 4) / 2);
        }
    }
    const AddDay = () => {
        const day = (columns.length - 4) / 2 + 1;
        setColumns(columns.concat([{ ...FeignTool.target_day, formatter: FeignTool.dead_formatter('target_day' + day), text: '' + day, dataField: 'target_day' + day, }, { ...FeignTool.action_day, formatter: FeignTool.dead_formatter('action_day' + day), dataField: 'action_day' + day, }]));
        PopupWin(day);
    }
    const AddRow = () => {
        let minNum = 0;
        data.forEach(item => { if (minNum > item.id) minNum = item.id });
        minNum--;
        FeignTool_tableData = data.concat({ keyid: minNum, id: minNum, name: ["メモ", 19] });
        setData(FeignTool_tableData);
        PopupWin((columns.length - 4) / 2);
    }

    const rowStyle = (row, rowIndex) => {
        if (row.id < 0)
            return { background: "#eee" };
        if (row.name && row.name[1] < FeignTool.roleLabelBgColor.length)
            return { background: FeignTool.roleLabelBgColor[row.name[1]] };
        else if (row.name && row.name[1] > 4 && row.name[1] <= 11)
            return { background: FeignTool.roleLabelBgColor[4] };
    };
    const NameInputArea = () => {
        const playerIconChangeHandler = (event) => {
            setPlayerIsIcon(event.target.checked);
            FeignTool_playerIsIcon = event.target.checked;
        };
        const nameIconChangeHandler = (event) => {
            setNameIsIcon(event.target.checked);
            FeignTool_nameIsIcon = event.target.checked;
            const newColumns = columns.slice();
            const firstColumn = newColumns.shift();
            if (FeignTool_nameIsIcon) {
                if (firstColumn.dataField === "name") newColumns.unshift(firstColumn);
                else newColumns.splice(1, 0, firstColumn);
            } else {
                if (firstColumn.dataField === "color") newColumns.unshift(firstColumn);
                else newColumns.splice(1, 0, firstColumn);
            }
            newColumns[0].text = "　";
            newColumns[1].text = "名前";
            setColumns(newColumns);
        };
        const onClickReset = () => {
            if (window.confirm("入力内容をリセットしますか？")) {
                const newData = data.map((item) => {
                    if ("color" in item) return { keyid: item.keyid, id: item.id, name: [item.name[0], 19], color: item.color };
                    else return { keyid: item.keyid, id: item.id, name: [item.name[0], 19] };
                }).filter(item => (item.id >= 0)).concat(FeignTool.ActionsNameList.map((item) => Object.assign({}, item)));
                const newColumns = FeignTool.defaultColumns.slice();
                const firstColumn = newColumns.shift();
                if (FeignTool_nameIsIcon) {
                    if (firstColumn.dataField === "name") newColumns.unshift(firstColumn);
                    else newColumns.splice(1, 0, firstColumn);
                } else {
                    if (firstColumn.dataField === "color") newColumns.unshift(firstColumn);
                    else newColumns.splice(1, 0, firstColumn);
                }
                newColumns[0].text = "　";
                newColumns[1].text = "名前";
                setColumns(newColumns);
                FeignTool_tableData = newData;
                setData(newData);
            }
            PopupWin(1);
        }

        const OpenNewWindow = () => {
            const onClickOpenNewWindow = () => {
                FeignTool_popupWindow = null;
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
                    PopupWin((columns.length - 4) / 2);
                };
                window.setTimeout(sendWhenReady, 100);
            };
            return (
                <button onClick={onClickOpenNewWindow}>
                    openDisplayWindow
                </button>
            );
        };
        return (
            <div>
                <div style={{ display: "flex" }}>
                    <textarea cols="20" rows="12" value={nameText} onChange={onChangeText} style={{ display: "inline-block" }} placeholder="名前入力欄：参加者の名前（五文字以内）を改行区切りで入力" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <a href="https://github.com/sawa90/feign-support-tool/blob/master/README.md" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "1rem" }}>使い方</a>
                        <div style={{ marginTop: "auto" }}>
                            <div>
                                <div style={{ margin: "1rem" }}>
                                    {OpenNewWindow()}
                                </div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={PlayerIsIcon}
                                        onChange={playerIconChangeHandler}
                                        id="iconCheckBox"
                                        style={{ marginLeft: "1rem" }}
                                    />
                                    アイコン
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={NameIsIcon}
                                        onChange={nameIconChangeHandler}
                                        id="nameIconCheckBox"
                                        style={{ marginLeft: "1rem" }}
                                    />
                                    名前欄アイコン
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button onClick={onClickButton}>setName</button>
                    <button onClick={onClickReset} style={{ marginLeft: "1rem" }}>リセット</button>
                </div>
            </div>
        );
    }
    const MemeArea = () => {
        return (
            <div>
                <textarea style={{ width: "100vw", height: "20rem", border: "solid #ddd", outline: "none" }} placeholder="メモ" />
            </div>
        );
    }
    const PopupWin = (day) => {
        if (FeignTool_popupWindow && !FeignTool_popupWindow.closed) {
            FeignTool_popupWindow.postMessage({
                type: "feign-board-snapshot",
                tableData: JSON.parse(JSON.stringify(FeignTool_tableData)),
                colorNameDic: JSON.parse(JSON.stringify(FeignTool_colorNameDic)),
                day,
            }, window.location.origin);
        }
    }

    return (
        <div>
            <div >
                <button onClick={AddDay}>翌日</button>
                <Container style={{ whiteSpace: "nowrap", display: "flex", alignItems: "flex-end"}}>
                    <FeignTableErrorBoundary>
                        <BootstrapTable
                            data={data}
                            columns={columns}
                            keyField="keyid"
                            bootstrap4={true}
                            cellEdit={cellEditFactory({
                                mode: "click", blurToSave: true, afterSaveCell: (oldValue, newValue, row, column) => {
                                    if (FeignTool_popupWindow) PopupWin((columns.length - 4) / 2);
                                    if (column.dataField === 'name' || row.id < 0) setRender(!render);
                                }
                            })}
                            rowStyle={rowStyle}
                        />
                    </FeignTableErrorBoundary>
                    <button onClick={AddRow} style={{ height:"fit-content" }}>メモ行追加</button>
                </Container>
            </div>
            {MemeArea()}
            {NameInputArea()}
        </div>

    );

}


// ========================================

ReactDOM.render(
    <FeignSupportToolRoot />,
    document.getElementById('root')
);
