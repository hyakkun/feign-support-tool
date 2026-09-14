# 依存関係更新計画

## 目的と範囲

この文書は、品質基盤を整備した後に行う依存関係更新の順序、判断基準、確認方法を定める。ここでは依存パッケージ、`package-lock.json`、Node の設定を変更しない。実際の更新は、リスク単位で別ブランチ・別 PR として実施する。

対象は、React、Vite、Vitest、テスト基盤、Sass、`react-select`、`react-transition-group`、`gh-pages` と、その推移依存である。

## 現状（2026-09-14）

### 実行環境と直接依存

- Node は `mise.toml` と CI で **24.14.0** に固定している。現 lockfile で `npm ci`、`npm run test:run`、production build は成功している。
- React / React DOM は 18.3.1、Vite は 8.3.0、`@vitejs/plugin-react` は 6.1.1、Vitest は 5.0.0、jsdom は 29.1.1、`react-select` は 5.10.2、`react-transition-group` は 4.4.5、Sass は 1.104.1 である。
- Testing Library は React 18 と互換の `@testing-library/react` 15.0.7、`@testing-library/jest-dom` 6.9.1、`@testing-library/user-event` 14.6.7 を使用している。
- `npm audit --omit=dev` は **0 vulnerabilities** を報告している。`gh-pages` 3 系の major 更新と公開手順は、別途互換性・リリース方式の検討を要する。

### ツールチェーンのリスク

- CRA とその webpack、development server、Babel、Workbox 系の推移依存は Vite 移行により lockfile から除去された。CRA 由来だった `fs.F_OK` 非推奨警告と Browserslist 更新通知も解消している。
- Vite は GitHub Pages の project site に対応するため `base: "/feign-support-tool/"` を明示する。アプリ内で静的 asset を組み立てる箇所は `import.meta.env.BASE_URL` を利用する。
- Vitest は Jest と互換性のある assertion API を提供するが、mock API は `vi` を使う。JSX を含む実装・テストは `.jsx` 拡張子として、Vite の標準変換対象に合わせる。
- `npm audit fix --force` による一括更新は、意図しない major 更新を招くため引き続き使用しない。

### ビルド基盤の判断

Create React App は公式に新規利用非推奨となり、アクティブなメンテナーがいないため既存アプリは framework または Vite / Parcel / Rsbuild などの build tool へ移行するよう案内されている。[React: Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)

本ツールは GitHub Pages で公開するクライアント専用の単一画面アプリであり、サーバー、ルーティング、データ取得を必要としていない。このため **Vite による SPA build** を採用した。これは公式が CRA の既存アプリに build tool への移行を案内していることと、現行の静的公開方式からの影響が最も小さい、という本プロジェクト固有の判断である。framework 導入は、複数 URL・サーバー処理・データ取得を将来導入する場合に再評価する。

## 更新順序

### 0. 共通準備

各更新ブランチは `feature/quality-foundation` の最新 HEAD から作成する。開始前後に必ず次を実施する。

1. `npm ci`
2. `npm run test:run`
3. `npm run build`
4. 変更対象に応じたブラウザ確認（盤面セル編集、名前・色、popup、GitHub Pages の asset path）

更新 PR には、変更前後の `npm outdated` と `npm audit` の要約、lockfile の意図、ブラウザ確認結果を記録する。

### 1. 小規模な直接依存更新

候補ブランチ: `chore/direct-dependency-updates`

- `react-scripts` を 5.0.1 にする。
- `react-select` 5.10.2、`react-transition-group` 4.4.5、Sass 1.104.1 を**一度に一つずつ**更新する。
- `@testing-library/jest-dom` と `@testing-library/react` は、React 17 を維持する間は respective 5 系 / 12 系の最終 patch に限定する。

この段階では React の major、`user-event` 14、`gh-pages` 6、build tool は更新しない。更新ごとに lockfile をコミットし、選択 UI、色・役職入力、popup をブラウザで確認する。

#### 実施記録: `react-scripts` 5.0.1（2026-09-13）

- `react-scripts` を 5.0.0 から 5.0.1 へ更新した。
- npm が `eslint-plugin-jest` 25.7.0 を解決すると、CRA が使用する ESLint 8.6.0 で `Environment key "jest/globals" is unknown` が発生した。既知の 25.7.0 の互換性問題であるため、`package.json` の `overrides` により 25.6.0 を固定した。これは CRA 5.0.1 の許容範囲内であり、直接依存には追加していない。
- `CI=true npm test -- --watchAll=false` は 32 スイート・77 件、`npm run build` は成功した。盤面、名前・色、役職・行動、自爆・道連れ、popup、リセットをブラウザで確認済みである。
- `npm audit --omit=dev` は 87 件から 80 件へ減少した。ただし CRA / webpack 系の根本的な解消は Vite 移行まで持ち越す。`fs.F_OK` の Node 非推奨警告も残る。

#### 実施記録: `react-select` 5.10.2（2026-09-13）

- `react-select` を 5.2.1 から 5.10.2 へ更新した。`react-transition-group` はこの時点では 4.4.2 のままとした。
- `CI=true npm test -- --watchAll=false` は 32 スイート・77 件、`npm run build` は成功した。
- 役職・行動・対象・死亡役職・色の選択 UI、陣営切替、自爆・道連れ、候補一覧の開閉・選択後のセル終了、popup をブラウザで確認済みである。
- `npm audit --omit=dev` は 80 件から 79 件へ減少した。gzip 後の JavaScript bundle は約 3.05 kB 増加したため、以後の UI ライブラリ更新でも build サイズを確認する。

#### 実施記録: `react-transition-group` 4.4.5（2026-09-13）

- `react-transition-group` を 4.4.2 から 4.4.5 へ更新した。ほかの直接依存は同時に更新していない。
- ブラウザ確認で、色列・名前列の編集メニューだけがテーブル外のクリックで閉じない回帰を検出した。両 editor に、既存の役職・死亡役職 editor と同じ `onMenuClose` によるセル編集終了処理を追加した。
- Root の end-to-end テストに、色列・名前列でフォーカスを失ったときにメニューが閉じるシナリオを追加した。`CI=true npm test -- --watchAll=false` は 32 スイート・79 件、`npm run build` は成功した。
- 色・名前のメニューをテーブル外クリックで閉じられること、および選択時に従来どおり値が反映されて閉じることをブラウザで確認済みである。`npm audit --omit=dev` の報告件数は 79 件のまま変化しない。

#### 実施記録: Sass 1.104.1（2026-09-13）

- Sass を 1.47.0 から 1.104.1 へ更新した。Node 24.14.0 は Sass 1.104.1 の要件（20.19.0 以上）を満たす。
- Sass が採用する `chokidar` 5、`immutable` 5、および任意依存の `@parcel/watcher`（OS 別バイナリを含む）が lockfile に加わった。これらは Sass の更新に伴う推移依存であり、ほかの直接依存は更新していない。
- `CI=true npm test -- --watchAll=false` は 32 スイート・79 件、`npm run build` は成功した。gzip 後の JavaScript / CSS bundle サイズに変化はなかった。
- 盤面、各セレクト、popup を含むスタイル表示をブラウザで確認済みである。`npm audit --omit=dev` の報告件数は 79 件から 78 件へ減少した。

#### 実施記録: React 17 向け Testing Library patch（2026-09-13）

- `@testing-library/jest-dom` を 5.16.1 から 5.17.0、`@testing-library/react` を 12.1.2 から 12.1.5 へ更新した。`@testing-library/user-event` 13.5.0 はすでに React 17 互換範囲の最終版であるため変更していない。
- `@testing-library/react` 12.1.5 の peer dependency は React / React DOM 18 未満であり、React 17.0.2 と整合する。lockfile では旧 `css` 系の推移依存が削除され、新しい CSS parser と React DOM 型定義が追加された。
- `CI=true npm test -- --watchAll=false` は 32 スイート・79 件、`npm run build` は成功した。bundle サイズに変化はない。テスト実行時のみの依存更新でアプリ実行コード・生成物に変更がないため、ブラウザ確認は追加していない。
- `npm audit --omit=dev` の報告件数は 78 件から 74 件へ減少した。

### 2. GitHub Pages リリース補助の更新

候補ブランチ: `chore/gh-pages-v6`

`gh-pages` 3 系から 6 系への更新は major update として単独で扱う。現在の `deploy` は `gh-pages -d build` であり、同ライブラリは既定で公開対象ブランチへ push する。そのため、保護済み `gh-pages` に PR 経由のみを許す現行方針と衝突する可能性がある。[gh-pages README](https://github.com/tschaub/gh-pages/blob/main/readme.md)

このブランチで先に決めること:

- 公開を GitHub Actions に集約するか、PR 用の release branch に build 成果物をコミットするか
- Vite の `base` を GitHub Pages の repository path の唯一の定義として維持する方法
- `gh-pages` package を残す必要があるか

実際に公開する検証は、`master` へ統合後、`gh-pages` の PR と GitHub Pages 実 URL で行う。GitHub Pages は branch を公開元にでき、外部 CI が `gh-pages` へ build 成果物を commit する運用も公式に案内されている。[GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### 3. React 18 とテスト基盤

候補ブランチ: `upgrade/react-18-test-stack`

React 18 を最初の React major update とする。React 19 を直接導入しない。

変更候補:

- `react` と `react-dom` を同じ React 18 minor へ更新する。
- `ReactDOM.render` を `createRoot` へ置換する。
- `@testing-library/react` を 13 以降、`@testing-library/user-event` を 14 へ更新し、非同期 API の `userEvent.setup()` / `await` 化を行う。
- `@testing-library/jest-dom` は対応する最新 major へ更新する。

React 18 の移行では root API を含む互換性変更があるため、公式 upgrade guide を基準にする。[React 18 upgrade guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)

完了条件は、全テストの更新、CI 成功、主要盤面操作と popup のブラウザ確認である。React 19 は React 18 で安定運用でき、依存ライブラリの peer dependency と build tool が対応した後の別タスクとする。

#### 実施記録: React 18 とテスト基盤（2026-09-14）

- React / React DOM を 17.0.2 から 18.3.1 へ更新し、起動処理を `ReactDOM.render` から `createRoot` へ置換した。起動テストは Testing Library の `act` を用いて concurrent root の描画完了を待つ形に修正した。
- `@testing-library/react` を 15.0.7、`@testing-library/user-event` を 14.6.7、`@testing-library/jest-dom` を 6.9.1 へ更新した。`jest-dom` 6.10.0 は破壊的変更を含む誤った minor release としてパッケージ自身が 6.9.1 の利用を案内しているため採用しなかった。既存テストに `userEvent` の直接利用はないため、`userEvent.setup()` / `await` への書き換えは不要だった。
- ブラウザ確認で死亡役職アニメーション時に `findDOMNode` 非推奨警告を検出した。`MoveItem` の `Transition` に `nodeRef` を渡し、対象の `<span>` へ同じ ref を設定してライブラリのフォールバックを除去した。アニメーション描画と警告非表示を検証するテストを追加した。
- `CI=true npm test -- --watchAll=false` は 32 スイート・80 件、`npm run build` は成功した。gzip 後の JavaScript bundle は React 17 時点から約 2.83 kB 増加した。主要盤面操作、各種セル編集、自爆・道連れ、popup、死亡役職アニメーションをブラウザで確認済みであり、React 関連・`findDOMNode` 警告は表示されない。
- `npm audit --omit=dev` の報告件数は 74 件のまま変化しない。`fs.F_OK` の非推奨警告は CRA 由来として残る。

### 4. CRA から Vite への移行

候補ブランチ: `refactor/vite-build-migration`

CRA 依存を Vite に置き換える変更は完了した。実施内容と確認結果は次のとおりである。

- `vite` 8.3.0、`@vitejs/plugin-react` 6.1.1、`vitest` 5.0.0、`jsdom` 29.1.1 を導入し、`react-scripts` を除去した。
- `dev`、`start`、`build`、`preview`、`test`、`test:run` を Vite / Vitest 用の script に置き換えた。deploy の build 出力先も `build` から `dist` に変更した。
- root の `index.html` を Vite entry document に移し、CRA 専用の `public/index.html`、`process.env.PUBLIC_URL`、CRA の ESLint 設定・互換 override、`homepage`、Browserslist 設定を除去した。
- GitHub Pages の repository path を `vite.config.mjs` の `base: "/feign-support-tool/"` で定義した。role 画像、`popup.html`、`popup.css`、`popup.js` を含む `public/` の静的ファイルが `dist/` に出力され、生成 HTML の asset URL も同じ base を持つことを確認した。
- JSX を含む実装・テストを `.jsx` に統一し、Jest の `jest.*` mock API を Vitest の `vi.*` へ置換した。`@testing-library/jest-dom/vitest` をテスト設定として読み込む。
- GitHub Actions のテスト手順を `npm run test:run` に変更した。
- `npm ci` 後に `npm run test:run`（32 ファイル・80 件）と `npm run build` が成功した。`http://127.0.0.1:5173/feign-support-tool/` で、盤面編集、自爆・道連れ、popup、リセット、翌日追加、メモ行、画像・スタイルをブラウザ確認済みである。
- `npm audit --omit=dev` は 0 vulnerabilities を報告した。

`gh-pages` package の更新や公開ブランチへの反映はこの変更に含めない。現行の `gh-pages` 3 系と保護済み release branch の整合は、次の GitHub Pages リリース補助更新で確認する。

## 着手判断

| 作業 | 着手条件 | 優先度 |
| --- | --- | --- |
| 直接依存の patch / minor | 完了（2026-09-13） | - |
| `gh-pages` 6 | リリース PR の作り方を合意済み | 中 |
| React 18 | 完了（2026-09-14） | - |
| Vite | 完了（2026-09-14） | - |
| React 19 | React 18 を安定運用後 | 低 |
| ブラウザ対応範囲の再定義 | Vite の既定 target 以外を必要とするとき | 低 |

## 非目標

- `npm audit fix --force` による一括更新
- Node 24.14.0 の変更
- 役職画像や盤面機能の変更
- `gh-pages` への直接 push
