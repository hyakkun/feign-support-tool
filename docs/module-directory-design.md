# モジュール責務とディレクトリ移行設計

## 目的

`src/` 直下に集まったモジュールを、確定した責務境界に沿って配置し直す。対象はファイルの配置と import の更新であり、盤面の機能・データ形式・画面の見た目は変更しない。

この設計は [`board-state-architecture.md`](board-state-architecture.md) の「将来のディレクトリ構成」を具体化するものである。現在の構成は移行前のものであり、本書の構成を一度に適用しない。

## 配置の原則

- `src/index.js` は `react-scripts` が要求する固定の entry point として残し、`app/` はアプリケーションの起動処理と依存の組み立てだけを担当する。盤面のルール、テーブル列、ポップアップ送信の実装を置かない。
- `board/model/` はゲーム盤面の不変設定、初期データ、純粋なデータ変換を担当する。React、DOM、ポップアップには依存しない。
- `board/state/` は `BoardState`、reducer、操作列、互換 runtime と、それらを利用する盤面操作 hook を担当する。テーブル描画コンポーネントには依存しない。
- `board/table/` は盤面の HTML table、列定義、formatter、editor を担当する。盤面を更新する場合は callback または state 層の公開 API を利用する。
- `board/popup/` は盤面 snapshot を対象とした別ウィンドウの生成・保持と送信を担当する。テーブル実装には依存しない。
- `components/` は盤面の表示形式に依存しない入力・表示部品を置く。状態は props と callback を通じて受け取る。
- テストは実装ファイルに隣接させ、移動時には実装と同じコミットで移動する。共通テストヘルパーが生じた場合だけ `test/` を新設する。

依存方向は次のように一方向とする。矢印の逆向きの import は作らない。

```text
src/index.js ──> app
                  ├─ board/table ──> board/state ──> board/model
                  ├─ board/popup ──> board/state
                  └─ components
```

`board/table/` と `board/popup/` は、必要な selector や純粋関数を `board/state/` から利用できる。ただし、`board/state/`、`board/model/` が UI・DOM・popup を import することは避ける。`app/` は各領域を接続する唯一の場所とする。

## 目標ディレクトリ構成

```text
src/
├─ index.js                           # react-scripts 用の固定 entry point
├─ index.test.js                      # entry point を通す統合テスト
├─ app/
│  ├─ bootstrap.js                    # ReactDOM の起動だけ
│  └─ FeignSupportToolRoot.js         # 状態・hook・画面部品の組み立て
├─ board/
│  ├─ model/
│  │  ├─ boardConfig.js               # 固定設定と legacy 設定の生成
│  │  ├─ roleCatalog.js               # 役職カタログ、陣営、表示名
│  │  ├─ roleOptionTokens.js          # 役職候補の token 生成
│  │  ├─ actionOptions.js              # 役職ごとの行動候補
│  │  ├─ eventRows.js                 # 固定イベント行と死亡イベント規則
│  │  ├─ playerRows.js                # 参加者行と参加者候補
│  │  └─ tutorialBoardData.js         # 固定チュートリアル盤面
│  ├─ state/
│  │  ├─ boardState.js                # BoardState の生成・selector
│  │  ├─ boardReducer.js              # 状態遷移
│  │  ├─ boardCommands.js             # reducer action creator
│  │  ├─ boardActionSequence.js       # 複合操作を action 列へ変換
│  │  ├─ boardOperations.js           # 盤面行・日付・リセットの純粋操作
│  │  ├─ legacyBoardRuntime.js        # legacy editor 向け導出値の互換境界
│  │  └─ hooks/
│  │     ├─ useBoardStateCommit.js    # reducer 反映と runtime 同期
│  │     ├─ useBoardToolbarActions.js # 翌日・メモ・表示設定
│  │     ├─ useBoardCellActions.js    # セル保存・色変更
│  │     └─ useNameBoardActions.js    # 名前設定・リセット
│  └─ table/
│     ├─ BoardTable.js                # HTML table と編集状態
│     ├─ boardTableSetup.js            # テーブル構成の組み立て
│     ├─ boardTableFormatters.js       # legacy 値をテーブル表示へ変換
│     ├─ tableFormatters.js            # 汎用 formatter 部品
│     ├─ boardColumnSorts.js           # 列ソート規則
│     ├─ identityColumnDefinitions.js  # 色・名前列
│     ├─ roleColumnDefinitions.js      # 役・死亡役職列
│     ├─ dayColumnDefinitions.js       # 日別の行動・対象列
│     └─ editors/
│        ├─ ColorSelect.js
│        ├─ InsaneSelect.js
│        ├─ RoleSelect.js
│        ├─ roleSelectState.js         # RoleSelect 専用の選択状態
│        └─ DeadSelect.js
│  └─ popup/
│     ├─ popupBridge.js               # snapshot の整形・postMessage
│     ├─ popupWindowController.js     # window.open と window 参照管理
│     └─ usePopupActions.js           # popup の UI 操作 hook
├─ components/
│  ├─ NameInputPanel.js               # 名前入力・リセット・表示設定 UI
│  └─ MemoArea.js                     # 盤面外メモ UI
├─ styles/
│  └─ index.scss                      # 全体スタイル（移行時に import 先も更新）
├─ setupTests.js
└─ reportWebVitals.js
```

`App.js`、`App.css`、`logo.svg`、`index.css` は Create React App の初期生成物で、現在の起動経路では利用していない。ファイル移動には含めず、参照の再確認とブラウザ確認を行った別コミットで削除可否を判断する。`reportWebVitals.js` も、計測を再導入する予定がない限り同じ監査対象とする。

### 初期生成物の監査結果（2026-09-10）

- `App.js`、`App.css`、`logo.svg`、`index.css`、`reportWebVitals.js` は、現行の `src/index.js` から始まる import 経路で参照されていない。`App.js` が `logo.svg` と `App.css` を参照するだけである。
- `web-vitals` は `reportWebVitals.js` の動的 import でのみ使用されている。計測を導入しない方針であれば、初期生成物の削除後に依存関係からも除去できる。
- `public/manifest.json` が参照する `logo192.png`、`logo512.png`、および `public/index.html` が参照する favicon は公開物の一部である。今回の未使用 source 監査・削除対象には含めない。

削除する場合は、まず source の5ファイルを専用コミットで除去してテスト・ビルド・ブラウザ確認を行う。`web-vitals` と lockfile の変更は依存関係変更として別コミットに分ける。

## 現行モジュールの責務と移行先

| 現行モジュール | 現在の責務 | 移行先 |
| --- | --- | --- |
| `index.js` | React の起動、Root の組み立て、依存の接続 | `src/index.js`（薄い entry）、`app/bootstrap.js`、`app/FeignSupportToolRoot.js` |
| `boardState.js`、`boardReducer.js` | 状態の生成・参照と状態遷移 | `board/state/` |
| `boardCommands.js`、`boardActionSequence.js`、`boardOperations.js` | reducer の action と複合・純粋操作 | `board/state/` |
| `legacyBoardRuntime.js` | legacy 形式の editor/formatter が使う導出値 | `board/state/` |
| `useBoardStateCommit.js`、`useBoardToolbarActions.js`、`useBoardCellActions.js`、`useNameBoardActions.js` | Root から呼び出す盤面操作 hook | `board/state/hooks/` |
| `boardConfig.js`、`roleCatalog.js`、`roleOptionTokens.js` | 役職・盤面の固定設定と選択 token | `board/model/` |
| `actionOptions.js`、`eventRows.js`、`playerRows.js` | 行動候補、イベント行、参加者行の規則 | `board/model/` |
| `tutorialBoardData.js` | 固定チュートリアル盤面 | `board/model/` |
| `BoardTable.js`、`boardTableSetup.js` | table の描画と構成の組み立て | `board/table/` |
| `boardTableFormatters.js`、`tableFormatters.js` | セル値の表示変換 | `board/table/` |
| `boardColumnSorts.js`、`identityColumnDefinitions.js`、`roleColumnDefinitions.js`、`dayColumnDefinitions.js` | ソートと列定義 | `board/table/` |
| `ColorSelect.js`、`InsaneSelect.js`、`RoleSelect.js`、`roleSelectState.js`、`DeadSelect.js` | table セル editor | `board/table/editors/` |
| `popupBridge.js`、`popupWindowController.js`、`usePopupActions.js` | ポップアップの送信、window 管理、UI 操作 | `board/popup/` |
| `NameInputPanel.js`、`MemoArea.js` | Root が配置する汎用 UI 部品 | `components/` |
| `index.scss` | 画面全体のスタイル | `styles/index.scss` |

## 段階的な移行計画

各段階は機能変更を含めず、`git mv` と import 更新を中心にした専用コミットとする。相対 import の更新漏れを検出するため、各段階で `npm test` と `npm run build` を実行する。DOM に関わる領域を移す段階では、既存の主要操作をブラウザでも確認する。

1. **テーブル領域を移す**
   `board/table/` と `board/table/editors/` を作り、table、列定義、formatter、editor と隣接テストを移す。依存関係が局所的であり、画面上の確認対象が明確なため最初に行う。
2. **モデル領域を移す**
   `board/model/` へ固定設定・行規則・チュートリアルデータとテストを移す。React への依存がないことを確認し、循環依存を持ち込まない。
3. **状態・盤面操作領域を移す**
   `board/state/` と `board/state/hooks/` へ state、reducer、操作、互換 runtime、hook とテストを移す。`legacyBoardRuntime` はまだ削除せず、境界として位置だけを移す。
4. **ポップアップと汎用部品を移す**
   `board/popup/`、`components/`、`styles/` を作り、ポップアップ一式、入力部品、スタイルを移す。ポップアップを開く・更新する・閉じた後に再度開くことをブラウザ確認する。
5. **Root と entry point を分ける**
   現在の `index.js` の `FeignSupportToolRoot` を `app/FeignSupportToolRoot.js`、ReactDOM の起動を `app/bootstrap.js` に移す。`react-scripts` が `src/index.js` を固定 entry point として使うため、同ファイルは `app/bootstrap.js` を読み込むだけの薄い入口として残す。`index.test.js` は entry point を通す統合テストとして維持する。
6. **未使用の初期生成物を監査する**
   `App.js`、`App.css`、`logo.svg`、`index.css`、`reportWebVitals.js` の参照有無を再確認する。削除する場合は、上記の移動と分けた小さなコミットにし、ブラウザ確認を行う。

段階 1 から 5 の間に新機能が必要になった場合は、移動中の領域へ最小限に追加するか、いったん移行を完了してから機能ブランチへ戻る。大量の移動と振る舞い変更を同一コミットに混在させない。

## 完了条件

- `src/` 直下には `react-scripts` 用の entry point、entry point の統合テスト、テスト設定以外のドメイン実装を残さない。
- 各モジュールが上記の依存方向を守り、`board/model/` と `board/state/` から UI/DOM へ逆依存しない。
- 実装とテストが隣接し、ファイル移動後もテスト名・対象責務が追跡できる。
- `app/FeignSupportToolRoot.js` は状態、hook、表示部品を接続するだけで、盤面規則・列定義・ポップアップ通信の詳細を含まない。
- 各移動段階で `npm test`、`npm run build`、該当するブラウザ確認を完了する。
