# DESIGN SYSTEM: GTA5 Mechanic Calculator (Discord Aligned)

## Overview

GTA5 Mechanic Calculatorのデザインシステムは、Discordとの同時起動・通話・ゲームプレイ（GTA5 / FiveM）中の過酷なマルチタスク環境に最適化された、高エネルギーかつ視認性重視のゲーミングデザインです。
全体のベースにはDiscordの象徴的なディープ・インディゴキャンバス (`{colors.canvas}` — #0a0d3a) を採用し、静的なBlurpleからVioletへの美しいグラデーションと、ハイコントラストなサーフェスカード、大胆な角丸で構成されています。

ブランドの基軸となるのは **Blurple** (`{colors.primary}` — #5865f2)。主要なナビゲーション、選択状態のハイライト、ブランドバッジ、主要アクションを司ります。これを取り巻くアクセントとして、最も重要なアクション（「請求テキストコピー」「店舗開設」等）を瞬時に識別させるエレクトリック・**グリーン** (`{colors.green}` — #35ed7e)、そして特別モードやプロモを飾るビブラント・**マゼンタ** (`{colors.magenta}` — #ec48bd) が躍動します。さらに、メカニック業務における状態判別（自車割引、金庫、エラー、注意）を瞬時に把握できるよう、Discord公式のステータスカラー体系（Red, Yellow, Cyan）が自然に統合されています。

幾何学形状は柔らかく親しみやすい曲線を持ち、操作系コントロールは `{rounded.sm}` (12px) から `{rounded.lg}` (16px)、カードやメディアパネルは `{rounded.xl}` (24px〜40px)、バッジやトグルには `{rounded.pill}` (50px) を適用。一切の無駄な鋭角を排し、Discordと並べて使っても違和感のない、洗練されたゲーミングツール体験を提供します。

**Key Characteristics:**
- ディープ・インディゴキャンバス (`{colors.canvas}`) に静的Blurpleグラデーションを敷いた、フラットすぎない没入感のあるダークテーマ。
- ブランドカラー **Blurple** (`{colors.primary}`) を主軸とし、最重要アクションのみにエレクトリック・**グリーン** (`{colors.green}`) を配置。
- ビブラント・**マゼンタ** (`{colors.magenta}`) が特別な機能やハイライトバッジを際立たせる。
- 英字ディスプレイには **Inter** 800（All-Caps）、日本語には高い可読性を誇る **Noto Sans JP** を採用した、強烈なウェイト差（800 vs 400）のタイポグラフィ。
- ゲームプレイ・長時間作業の負荷をゼロにする、GPUに優しい静的CSSグラデーション設計。
- ページ構成のリズム: インディゴHero → Raised Indigo (`#1e2353`) のパーツ選択カード → Onyx/Blackの下部固定合計バー → Electric Greenの請求コピーCTA。

---

## Colors

### Brand & Accent
- **Blurple** (`{colors.primary}` — #5865f2): ブランドの象徴。主要ボタン、ヘッダーアクセント、選択中パーツのボーダー・グロー、ブランドロゴ。
- **Electric Green** (`{colors.green}` — #35ed7e): 最高優先度のアクション専用（「請求金額をコピー」「新しく店舗を作る」等）。常に黒字 (`{colors.ink-dark}`) と組み合わせて最大コントラストを確保。
- **Vibrant Magenta** (`{colors.magenta}` — #ec48bd): ハイライト、特別な機能バッジ、プロモタグ。
- **Discord Cyan** (`{colors.cyan}` — #00b0f4): 金庫機能（Vault）、情報リンク、補足インフォメーション。
- **Discord Yellow / Amber** (`{colors.yellow}` — #fee75c): 自車割引（Own Car）、出張モード、注意喚起、警告。
- **Discord Red** (`{colors.red}` — #ed4245): リセット、削除、エラー、危険操作。

### Surface
- **Indigo Canvas** (`{colors.canvas}` — #0a0d3a): ページ全体の最背面キャンバス。
- **Raised Indigo** (`{colors.surface-indigo}` — #1e2353): パーツ選択カード、設定パネル、計算ブロック、履歴カードのベースサーフェス。
- **Raised Indigo Hover** (`{colors.surface-indigo-hover}` — #2b3270): カードホバー時の強調サーフェス。
- **Onyx** (`{colors.surface-onyx}` — #23272a): モーダル、ドロップダウン、サブパネル、インプットの背景。
- **Surface Black** (`{colors.surface-black}` — #000000 / rgba(0,0,0,0.85)): 下部固定合計バー（Sticky Total Bar）およびオーバーレイ。

### Border
- **Subtle Indigo Border** (`{colors.border}` — #2b3270): 通常のカードやコンテナの境界線。
- **Active Blurple Border** (`{colors.border-active}` — #5865f2): 選択中パーツ、フォーカスされた入力フォームの境界線。

### Text
- **White** (`{colors.ink}` — #ffffff / #f8fafc): 全ての暗色サーフェス上の基本テキストおよび見出し。
- **Muted Indigo Text** (`{colors.muted}` — #949cf7 / #94a3b8): ラベル、補足説明、メタ情報。
- **Dark Ink** (`{colors.ink-dark}` — #000000): 明るい塗り（GreenボタンやWhiteボタン）上の文字色。

---

## Typography

### Font Family
- **Display & Numbers (Latin)**: `Inter`, system-ui, -apple-system, sans-serif — 700〜800の極太ウェイトで、力強く現代的な幾何学サンセリフ。
- **Body & Japanese**: `Noto Sans JP`, 'Hiragino Sans', 'Yu Gothic UI', sans-serif — 日本語パーツ名や説明文の瞬時判読性を担保するクリアな角ゴシック。

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 48px–64px | 800 | 1.1 | 0.5px | ポータルHero大見出し (All-Caps) |
| `{typography.display-lg}` | 32px–40px | 800 | 1.15 | 0.5px | 下部固定バーの合計金額数値 |
| `{typography.heading-lg}` | 24px–28px | 800 | 1.2 | 0 | セクション見出し、ブランドロゴタイトル |
| `{typography.heading-md}` | 18px–20px | 700 | 1.3 | 0 | パーツカテゴリ見出し、モーダルタイトル |
| `{typography.heading-sm}` | 15px–16px | 700 | 1.3 | 0 | パーツ名、設定項目ラベル |
| `{typography.body-lg}` | 16px–18px | 500 | 1.4 | 0 | リード文、大きめのボタンラベル |
| `{typography.body}` | 14px–15px | 400 | 1.5 | 0 | 通常の本文、パーツ説明、入力フォーム |
| `{typography.body-sm}` | 12px–13px | 500 | 1.4 | 0 | 補足、バッジ、金額の内訳、メタ情報 |

### Principles
- 英字見出し・金額数値は **Inter 800** で力強く配置し、一目で情報を認識可能にする。
- 本文・パーツ名は **Noto Sans JP 400/500** に落とし、見出しと本文の間で極端なジャンプ率を作ることで視線の誘導を最適化する。

---

## Layout & Spacing

### Spacing System
- **Base unit**: 8px
- **Tokens**:
  - `{spacing.xxs}`: 4px
  - `{spacing.xs}`: 8px
  - `{spacing.sm}`: 12px
  - `{spacing.md}`: 16px
  - `{spacing.lg}`: 20px
  - `{spacing.xl}`: 24px
  - `{spacing.xxl}`: 32px
  - `{spacing.section}`: 40px

### Container
- **App Container**: 最大幅 `1280px`（中央揃え、左右余白 `20px`）。
- **Sticky Total Bar**: 画面最下部に固定配置（`z-index: 1000`）、高さ約 `80px〜100px`、下部パディングを本体に `140px` 確保。

---

## Shapes & Border Radius

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | 小さなチップ、微細なインジケーター |
| `{rounded.sm}` | 10px–12px | 通常ボタン（Primary/Green）、入力フォーム、テーブルセル |
| `{rounded.lg}` | 16px | パーツ選択カード、設定カード、モーダルダイアログ |
| `{rounded.xl}` | 24px–40px | ポータルHeroバナー、ショウケースコンテナ |
| `{rounded.pill}` | 50px | モード切替トグル（自車割引/出張等）、カテゴリバッジ、ステータスタグ |
| `{rounded.full}` | 9999px | アイコンボタン、円形アバター |

---

## Components

### Buttons
- **`button-green` (High-Intent CTA)**
  - 背景 `{colors.green}` (`#35ed7e`)、文字 `{colors.ink-dark}` (`#000000`)、太さ 700–800、角丸 `{rounded.sm}` (12px)。
  - 「請求テキストをコピー」「新店舗作成」など最重要アクションに使用。
- **`button-primary` (Blurple Primary)**
  - 背景 `{colors.primary}` (`#5865f2`)、文字 `{colors.ink}` (`#ffffff`)、太さ 700、角丸 `{rounded.sm}` (12px)。
  - 一般的な確定アクション、リンクボタンに使用。
- **`button-ghost` (Translucent Indigo)**
  - 背景 `{colors.surface-indigo}`、ボーダー `{colors.border}`、文字 `{colors.ink}`、角丸 `{rounded.sm}`。
  - 「リセット」「キャンセル」「補助操作」に使用。

### Cards & Surfaces
- **`card-parts` (パーツ選択カード)**
  - 背景 `{colors.surface-indigo}` (`#1e2353`)、ボーダー `{colors.border}` (`#2b3270`)、角丸 `{rounded.lg}` (16px)。
  - 選択時（Checked / Active）: ボーダー `{colors.primary}` (`#5865f2`) ＋ 控えめなBlurpleグロー (`0 0 12px rgba(88,101,242,0.35)`)。
- **`sticky-total-bar` (下部固定計算バー)**
  - 背景 `rgba(10, 13, 58, 0.95)` ＋ Backdrop blur 16px、上部ボーダー `2px solid #2b3270`、シャドウ `0 -4px 20px rgba(0,0,0,0.5)`。
  - 合計金額は `{typography.display-lg}` (Inter 800) の鮮烈なWhite表示。
- **`badge` (ステータス・モードバッジ)**
  - 自車割引: 背景 `rgba(254, 231, 92, 0.15)`、文字 `#fee75c`、ボーダー `1px solid rgba(254, 231, 92, 0.4)`、角丸 `{rounded.pill}`。
  - 金庫: 背景 `rgba(0, 176, 244, 0.15)`、文字 `#00b0f4`、ボーダー `1px solid rgba(0, 176, 244, 0.4)`、角丸 `{rounded.pill}`。
  - 出張モード: 背景 `rgba(237, 66, 69, 0.15)`、文字 `#ed4245`、ボーダー `1px solid rgba(237, 66, 69, 0.4)`、角丸 `{rounded.pill}`。

---

## Do's and Don'ts

### Do
- Deep Indigo (`#0a0d3a`) をすべてのページの基盤色とし、Raised Indigo (`#1e2353`) でカードをリフトアップする。
- 最重要アクション（請求コピー）にのみ Electric Green (`#35ed7e`) を配置し、視線を迷わせない。
- 英字見出し・金額には `Inter 800` を使い、ゲーム用UIとしての力強さを担保する。
- コントロールには 12px〜16px の柔らかな角丸を与え、Discordの一貫したフレンドリーなトーンを維持する。
- 割引や金庫などの業務ステータスにはDiscord公式の Yellow / Cyan / Red を割り当て、瞬時の状況判断を助ける。

### Don't
- 背景をグレーや真っ黒に平坦化しない（Deep Indigo `#0a0d3a` の深みがブランドの核）。
- Electric Green を装飾用テキストや通常ボタンに乱用しない（最重要CTAの意味が薄れるため）。
- カードやボタンの角を尖らせない（最小でも 10px 以上の角丸を維持）。
- GPUに負荷をかける過剰な常時アニメーションを配置しない（ゲームプレイ中のバックグラウンド稼働を最優先）。
