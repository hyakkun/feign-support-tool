# 盤面状態アーキテクチャ

## 目的

`index.js` に混在している盤面データ、色辞書、名前一覧、表示設定、ポップアップ送信を分離し、役職追加・UI改善・依存関係更新を安全にする。画面や既存の盤面保存形式を一度に置き換えない。

## 設計判断

- React の `BoardState` を可変状態の唯一の正本にする。
- `FeignTool_tableData`、`FeignTool_nameList`、`FeignTool_colorNameDic` のような可変モジュール変数は、段階移行後に廃止する。
- 既存タプル形式は、当面 `BoardState` から導出する互換ビューとして維持する。
- 役職・イベント・結果などの不変設定は `boardConfig`、`roleCatalog`、`eventRows` に置く。`BoardState` には複製しない。
- ポップアップは別の状態を持たず、現在の `BoardState` から作ったスナップショットを受け取る。

## 状態の境界

```ts
type BoardState = {
  board: LegacyBoardRow[];       // 移行中の正本。将来は domain-model.md の Board へ変換する
  playerNames: string[];         // 入力順の参加者名。board から検証できるが編集操作に必要
  display: {
    playerIsIcon: boolean;
    nameIsIcon: boolean;
  };
  isTutorial: boolean;
  dayCount: number;
};

type LegacyBoardRow = {
  id: number;
  keyid: number;
  name: [string, number];
  color?: LegacyColor;
  role?: LegacyCellItem[];
  deadRole?: LegacyCellItem[];
  [dayField: `target_day${number}` | `action_day${number}`]: LegacyCellItem[];
};

type LegacyColor = [iconPath: string, hex: string];
type LegacyCellItem = [label: string, displayType: number, itemType: number, playerRowId?: number];
```

色辞書は `board` のプレイヤー行の `color` から `selectColorByPlayerName` で導出する。`BoardState` に重複して保持しない。

## 操作

操作は reducer または同等の純粋関数として定義し、UI コンポーネントは操作を dispatch するだけにする。

| 操作 | 入力 | 主な更新 |
| --- | --- | --- |
| `setPlayerNames` | 改行入力または名前配列 | 参加者行の追加・削除・保持、選択肢更新 |
| `setPlayerColor` | 名前、色 | 該当プレイヤーの色、色辞書 |
| `updateCell` | 行 ID、日、列、セル値 | 盤面の一セル |
| `recordDeathRole` | 対象、役職、固定役職か | 死亡役職、アニメーション用トークン |
| `addDay` | なし | `dayCount` と日別列 |
| `addMemoRow` | なし | 新しいメモ行 |
| `resetBoard` | なし | 色を維持して役職・行動・メモを初期化 |
| `setDisplayOption` | 表示種別、真偽 | `display` のみ |

現在 `playerRows`、`eventRows`、`boardOperations` にある純粋関数は、これらの操作実装の基礎として再利用する。

## Selector と互換アダプター

React コンポーネントは可能な限り state 全体を受け取らず、次の selector を通じて必要な値を得る。

```ts
selectTableData(state): LegacyBoardRow[]
selectPlayerOptions(state): LegacyOption[]
selectColorByPlayerName(state): Record<string, LegacyColor>
selectTableColumns(state, tableDefinition): TableColumn[]
selectPopupSnapshot(state, day): PopupSnapshot
```

盤面描画は `selectTableData` と `selectTableColumns`、ポップアップ送信は `selectPopupSnapshot` を使う。これにより、描画実装を変更しても reducer とドメイン操作を維持できる。

## コンポーネント境界

現在の責務は次のように分ける。

```text
FeignSupportToolRoot
├─ 盤面操作            : 翌日、表示設定
├─ BoardTable          : ネイティブ HTML table、セル編集、メモ行追加
│  ├─ ColorSelect
│  ├─ InsaneSelect
│  ├─ RoleSelect
│  └─ DeadSelect
├─ NameInputPanel      : 名前入力、setName、リセット、補助表示起動
├─ メモ入力            : textarea（Root 内のローカル実装）
└─ PopupBridge         : ポップアップへ snapshot を送信
```

`RoleSelect` と `DeadSelect` は state を直接変更しない。選択結果を `onUpdateCell`、死亡役職の結果を `onRecordDeathRole` で親へ通知する。これが完全なファイル分離の前提である。

## 段階的な移行

1. 完了: 現行テストを基準として `BoardState` と selector の仕様をテストで定義した。
2. 完了: `display` と `dayCount` を reducer 管理へ移した。
3. 完了: `board`、`playerNames`、色辞書の導出を `useReducer` と selector へ移した。テーブルに渡す個別の `data` state は廃止済みである。
4. 完了: ポップアップ送信を `popupBridge` へ分離した。
5. 完了: `BoardTable`、`NameInputPanel`、`RoleSelect`、`DeadSelect` を分離した。
6. 完了: ネイティブ HTML `table` へ置換し、旧テーブルライブラリと `reactstrap` を依存関係から削除した。
7. 未着手: legacy タプルと `domain-model.md` の `Board` を相互変換する関数を追加し、保存・描画を段階的に移行する。

各段階で `npm test`、`npm run build`、名前設定・役職入力・自爆/道連れ・ポップアップのブラウザ確認を行う。依存関係の更新は、状態・描画の変更と別コミットに分ける。

## 現在の移行状況

2026-09 時点で、盤面の正本は `BoardState` であり、次の操作は `boardReducer` を通じて更新する。テーブルに渡す `data` の個別 state は廃止済みである。

- 新規盤面作成、参加者更新、色変更、通常セル更新
- 追放・殺害・道連れの死亡役職記録、および自爆時の魔術師の自動記録
- メモ行追加、翌日追加、リセット、表示設定
- ポップアップ用スナップショットの生成・送信（`popupBridge`）
- `BoardTable`、`NameInputPanel`、`RoleSelect`、`DeadSelect` の分離と、ネイティブ HTML `table` による盤面描画

`BoardTable` と `NameInputPanel` は callback の接続を、`popupBridge` は送信内容を単体テストで固定している。役職・死亡イベントの詳細な選択手順は既存の純粋関数テストとブラウザ確認で担保する。

`legacyBoardRuntime` は、formatter と editor が必要とする既存タプル形式、参加者候補、色、表示設定を `BoardState` から導出する互換アダプターとして残る。`RoleSelect` と `DeadSelect` には getter を含む設定 props として渡す。セル編集の開始・終了は `BoardTable` のローカル state で管理し、保存時には reducer 操作へ集約する。

## 完了済みの優先作業

次の作業は完了している。

1. `columns` の生成を `selectTableColumns` に集約し、`dayCount` と日別列の二重管理を解消した。行背景色と formatter の設定もテーブル用モジュールへ分離した。
2. `legacyBoardRuntime` を導入し、`FeignTool_*` の可変盤面・参加者候補・色辞書・表示設定を導出値へ移した。セル編集の UI 状態は `BoardTable` に閉じ込めた。
3. 役職・対象・行動・死亡イベントについて、主要な選択手順の UI テストを追加した。
4. 素の HTML `table` による `BoardTable` を導入し、主要操作と周辺操作の回帰確認を実施した。
5. `react-bootstrap-table-next`、`react-bootstrap-table2-editor`、`reactstrap` を依存関係から削除した。

## 今後の作業

1. legacy タプルと `domain-model.md` の `Board` の境界を具体化する。まず相互変換の必要性、保存形式、段階移行の対象を決める。現時点で保存形式を変更する実装には着手しない。
2. `index.js` に残る `FeignTool` 設定と UI 組み立てを、設定・盤面操作・Root コンポーネントへ段階的に分離する。既存タプルの廃止は 1 の判断後に行う。
3. 2 の責務分割が一段落した時点で、確定した責務境界に沿ってディレクトリ構成を整理する。ファイル移動は専用の変更として扱い、機能変更とは混在させない。
4. UI テストを、日付ソート、リセット時のポップアップ更新、名前・色変更後の候補更新などの回帰事象へ拡充する。
5. React、`react-scripts`、その他の古い依存関係を、互換性調査・更新方針の決定・段階更新に分けて扱う。

## テーブルライブラリの将来方針

ネイティブ `BoardTable` への置換完了に伴い、`react-bootstrap-table-next`、`react-bootstrap-table2-editor`、`reactstrap` は依存関係から削除済みである。盤面・列・セル更新操作は props 契約に限定されているため、状態管理とドメイン操作はテーブル実装に依存しない。

列のリサイズ、フィルタ、ページングなど、ネイティブ実装にない汎用表機能が必要になった場合に限り、headless なテーブルライブラリを比較対象とする。

### ネイティブテーブル置換の結果

`experiment/native-board-table` で、`react-bootstrap-table-next` に依存しない `BoardTable` を試作した。既存の formatter と editor の props 契約を維持しつつ、セル編集、日付ヘッダーの昇順・降順ソート、メモ行追加、行の背景色を素の HTML `table` で実装した。

主要操作と周辺操作はブラウザで確認済みであり、置換の実現性を確認後、`feature/board-state-foundation` へ統合した。依存パッケージの削除は置換コミットとは分離し、テスト・ビルド・ブラウザ回帰確認後に完了した。

依存関係の更新とテーブル置換は同一変更に混在させない。

## 将来のディレクトリ構成

モジュール数の増加に対応し、`index.js` の設定・盤面操作・Root 組み立ての責務分割が一段落した段階で、確定した責務ごとに次の構成へ段階的に移す。責務が変動している間はファイル移動を行わない。

```text
src/
├─ app/
│  └─ index.js                 # Root の組み立てだけ
├─ board/
│  ├─ state/
│  │  ├─ boardState.js
│  │  ├─ boardReducer.js
│  │  └─ boardOperations.js
│  ├─ model/
│  │  ├─ boardConfig.js
│  │  ├─ playerRows.js
│  │  ├─ eventRows.js
│  │  ├─ actionOptions.js
│  │  └─ roleCatalog.js
│  ├─ table/
│  │  ├─ BoardTable.js
│  │  ├─ tableFormatters.js
│  │  └─ editors/
│  │     ├─ RoleSelect.js
│  │     ├─ DeadSelect.js
│  │     ├─ ColorSelect.js
│  │     └─ InsaneSelect.js
│  └─ popup/
│     └─ popupBridge.js
├─ components/
│  └─ NameInputPanel.js
└─ test/                       # 共通テストヘルパーが必要になった場合のみ
```

テストは実装ファイルと同じディレクトリに置く。たとえば `boardReducer.js` と `boardReducer.test.js` を並べることで、変更対象と検証を近接させる。

移動は一括で行わず、`index.js` の責務分割完了後に専用ブランチまたは専用コミットで実施する。まず `board/table/` と `board/table/editors/`、次に `board/state/` と `board/model/`、最後に root を `app/` へ移す。各段階で import の更新、`npm test`、`npm run build`、必要なブラウザ確認を完了させてから次へ進む。

## 非目標

- ゲーム上の真偽、秘匿情報、視点別可視性を state に追加しない。
- 暫定画像を公開用 state や設定へ含めない。
- この移行で盤面データの永続化方式や GitHub Pages のデプロイ方式を変更しない。
