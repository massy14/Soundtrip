from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import datetime as dt
import os
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path

# 環境変数を読み込み
load_dotenv()

app = FastAPI(title="Soundtrip API", version="0.4.0")

# OpenAIクライアント初期化
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 音声ファイル保存ディレクトリ
AUDIO_DIR = Path("audio_files")
AUDIO_DIR.mkdir(exist_ok=True)

# ---- CORS（開発用。公開時はオリジンを絞る）----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番は["https://your.app"]などへ限定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- モデル ----
class Destination(BaseModel):
    city: str
    date: str  # YYYY-MM-DD format
    timeOfDay: str

class UserProfile(BaseModel):
    ageRange: str
    companions: str
    mood: List[str]
    budget: str

class AudioStyle(BaseModel):
    voice: str
    bgm: str
    sfx: List[str]

class StoryInput(BaseModel):
    destination: Destination
    userProfile: UserProfile
    audioStyle: AudioStyle
    comment: Optional[str] = ""

# ---- ヘルスチェック ----
@app.get("/health")
def health():
    return {"ok": True, "ts": dt.datetime.utcnow().isoformat()}

# ---- ChatGPTでストーリー生成 ----
def generate_story_with_chatgpt(payload: StoryInput) -> dict:
    d = payload.destination
    u = payload.userProfile
    comment = payload.comment or "特になし"
    
    # ストーリー生成用プロンプト
    story_prompt = f"""あなたは旅のラジオ番組のナレーターです。以下の情報をもとに、詩的で情緒的な旅のストーリーを5つのチャプターで作成してください。

【旅の情報】
- 目的地: {d.city}
- 日付: {d.date}
- 時間帯: {d.timeOfDay}
- 年齢層: {u.ageRange}
- 同行者: {u.companions}
- 気分: {', '.join(u.mood)}
- 予算: {u.budget}
- コメント: {comment}

【出力形式】
以下のJSON形式で出力してください：
{{
  "title": "タイトル（20文字以内）",
  "chapters": [
    {{"name": "導入", "text": "導入部分のテキスト（80-120文字）"}},
    {{"name": "街歩き", "text": "街歩きのテキスト（80-120文字）"}},
    {{"name": "出会い", "text": "出会いのテキスト（80-120文字）"}},
    {{"name": "体験", "text": "体験のテキスト（80-120文字）"}},
    {{"name": "余韻", "text": "余韻のテキスト（80-120文字）"}}
  ]
}}

【注意事項】
- 文体は詩的で情緒的に
- 五感を刺激する表現を使う
- ユーザーのコメントを自然に反映させる
- JSON形式のみを出力し、他の説明は不要"""

    # Suno歌詞生成用プロンプト
    lyrics_prompt = f"""あなたは作詞家です。以下の旅の情報をもとに、Sunoで使える日本語の歌詞を作成してください。

【旅の情報】
- 目的地: {d.city}
- 日付: {d.date}
- 時間帯: {d.timeOfDay}
- 気分: {', '.join(u.mood)}
- コメント: {comment}

【出力形式】
[Verse 1]
（4行の歌詞）

[Chorus]
（4行の歌詞、コメントを自然に組み込む）

[Verse 2]
（4行の歌詞）

[Bridge]
（4行の歌詞）

[Chorus]
（4行の歌詞）

【注意事項】
- 旅の情緒を大切に
- リズム感のある言葉選び
- ユーザーのコメントをコーラスに組み込む
- 歌詞のみを出力し、他の説明は不要"""

    try:
        print(f"[DEBUG] Starting story generation for {d.city}, {d.date}, {d.timeOfDay}")
        print(f"[DEBUG] Comment: {comment}")
        
        # ストーリー生成
        print("[DEBUG] Calling OpenAI API for story generation...")
        story_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは旅のストーリーテラーです。"},
                {"role": "user", "content": story_prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"},
            timeout=30.0  # 30秒のタイムアウト
        )
        
        print("[DEBUG] Story generation completed")
        import json
        story_data = json.loads(story_response.choices[0].message.content)
        print(f"[DEBUG] Story title: {story_data.get('title', 'N/A')}")
        
        # 歌詞生成
        print("[DEBUG] Calling OpenAI API for lyrics generation...")
        lyrics_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは作詞家です。"},
                {"role": "user", "content": lyrics_prompt}
            ],
            temperature=0.9,
            timeout=30.0  # 30秒のタイムアウト
        )
        
        print("[DEBUG] Lyrics generation completed")
        suno_lyrics = lyrics_response.choices[0].message.content.strip()
        
        # ストーリーIDを生成（タイムスタンプベース）
        import time
        story_id = f"story_{int(time.time())}"
        
        result = {
            "id": story_id,
            "title": story_data.get("title", f"{d.city}、{d.date}の{d.timeOfDay}に"),
            "chapters": story_data.get("chapters", []),
            "sunoLyrics": suno_lyrics,
            "affiliateContext": {"themes": ["旅行ガイド", "宿泊施設", "グルメ体験"]},
            "audioUrl": None
        }
        
        # 音声を生成
        print("[DEBUG] Generating audio narration...")
        audio_url = generate_audio_from_story(result, story_id)
        if audio_url:
            result["audioUrl"] = audio_url
            print(f"[DEBUG] Audio URL: {audio_url}")
        
        print("[DEBUG] Story generation successful")
        return result
        
    except Exception as e:
        # エラー時はフォールバック
        print(f"[ERROR] OpenAI API Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        print("[DEBUG] Using fallback story generator")
        return generate_fallback_story(payload)

# ---- フォールバック用ダミー生成器 ----
def generate_fallback_story(payload: StoryInput) -> dict:
    d = payload.destination
    u = payload.userProfile
    comment_text = f"「{payload.comment}」という思いを胸に、" if payload.comment else ""
    
    return {
        "title": f"{d.city}、{d.date}の{d.timeOfDay}に",
        "chapters": [
            {"name":"導入","text": f"{d.city}の空気。{d.date}、{u.ageRange}のあなたは、{comment_text}歩きはじめる。"},
            {"name":"街歩き","text": f"路地に入ると足音が柔らかくなる。{d.timeOfDay}の光が壁を薄く染める。"},
            {"name":"出会い","text": "店先で湯気に誘われ、言葉少なな会釈を交わす。"},
            {"name":"体験","text": "一椀の温かさが胸に広がり、遠い記憶がそっと起き上がる。"},
            {"name":"余韻","text": "帰り道、風が頬を撫でる。今日の静けさが、明日を少しだけ優しくする。"}
        ],
        "sunoLyrics": f"[Verse 1]\n{d.city}の街角\n{d.date}の思い出\n{d.timeOfDay}の光の中\n新しい物語が始まる\n\n[Chorus]\n旅は続く、心のままに\n{payload.comment or '旅の思い出'}\nこの瞬間を忘れない\n永遠に響く旅の歌",
        "affiliateContext": {"themes": ["町家宿","夕暮れ散歩ガイド","和菓子体験"]},
        "audioUrl": None
    }

# ---- エンドポイント ----
@app.post("/v1/stories")
def create_story(spec: StoryInput):
    story = generate_story_with_chatgpt(spec)
    return story

# ---- 音声生成 ----
def generate_audio_from_story(story: dict, story_id: str) -> str:
    """ストーリーから音声を生成"""
    try:
        # ストーリー全体のテキストを結合
        full_text = f"{story['title']}。\n\n"
        for chapter in story['chapters']:
            full_text += f"{chapter['name']}。{chapter['text']}\n\n"
        
        print(f"[DEBUG] Generating audio for story: {story_id}")
        print(f"[DEBUG] Text length: {len(full_text)} characters")
        
        # OpenAI TTS APIで音声生成
        response = client.audio.speech.create(
            model="tts-1",
            voice="nova",  # alloy, echo, fable, onyx, nova, shimmer
            input=full_text,
            speed=1.0
        )
        
        # 音声ファイルを保存
        audio_path = AUDIO_DIR / f"{story_id}.mp3"
        response.stream_to_file(str(audio_path))
        
        print(f"[DEBUG] Audio file saved: {audio_path}")
        return f"/audio/{story_id}.mp3"
        
    except Exception as e:
        print(f"[ERROR] Audio generation error: {type(e).__name__}: {str(e)}")
        return None

@app.post("/v1/stories/{story_id}/audio")
def generate_story_audio(story_id: str, story: dict):
    """ストーリーの音声を生成"""
    audio_url = generate_audio_from_story(story, story_id)
    if audio_url:
        return {"audioUrl": audio_url, "status": "success"}
    else:
        return {"audioUrl": None, "status": "error"}

@app.get("/audio/{story_id}.mp3")
def get_audio(story_id: str):
    """音声ファイルを配信"""
    audio_path = AUDIO_DIR / f"{story_id}.mp3"
    if audio_path.exists():
        return FileResponse(
            str(audio_path),
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"inline; filename={story_id}.mp3"}
        )
    return {"error": "Audio file not found"}
