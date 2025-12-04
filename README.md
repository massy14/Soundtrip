# Soundtrip

**"Hear the Journey"** – あなたの選んだ目的地とプロフィールから、架空の旅のラジオ番組を生成し、音声でお届けします。

## 🌟 機能

- 🗺️ 旅の目的地（都市、季節、時間帯）を選択
- 💭 一言コメントで旅の気分を伝える
- 📖 ChatGPTが詩的な旅のストーリーを5つのチャプターで生成
- 🎵 Sunoで使える日本語の歌詞を自動生成
- 🎨 旅をテーマにしたポップなUIデザイン

## 🚀 セットアップ

### 1. 必要な環境

- Python 3.10+
- Node.js 18+
- OpenAI APIキー

### 2. サーバーのセットアップ

```bash
cd server

# 依存関係をインストール
pip install -r requirements.txt

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集してOpenAI APIキーを設定
# OPENAI_API_KEY=sk-your-actual-api-key-here
nano .env

# サーバーを起動
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. モバイルアプリのセットアップ

```bash
cd mobile

# 依存関係をインストール
npm install

# アプリを起動
npm start

# Webブラウザで開く場合は 'w' を押す
```

## 🔑 OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keysセクションで新しいキーを作成
4. 作成したキーを`server/.env`ファイルに設定

## 📝 使い方

1. ブラウザで http://localhost:8081 を開く
2. 旅の目的地を入力（都市、季節、時間帯）
3. 一言コメントを追加（任意）
4. 「🎬 旅の物語を作る」ボタンをクリック
5. ChatGPTが生成したストーリーとSuno歌詞を楽しむ

## 🛡️ セキュリティ

- `.env`ファイルは`.gitignore`に含まれており、GitHubにアップロードされません
- APIキーは絶対に公開リポジトリにコミットしないでください
- `.env.example`はサンプルファイルとして提供されています

## 🏗️ プロジェクト構成

```
Soundtrip/
├── server/          # FastAPI バックエンド
│   ├── main.py      # APIエンドポイント
│   ├── .env         # 環境変数（Git管理外）
│   └── .env.example # 環境変数のサンプル
├── mobile/          # React Native (Expo) フロントエンド
│   └── App.tsx      # メインアプリ
└── .gitignore       # Git除外設定
```

## 🎨 技術スタック

- **バックエンド**: FastAPI, OpenAI API (GPT-4o-mini)
- **フロントエンド**: React Native, Expo
- **スタイリング**: React Native StyleSheet
