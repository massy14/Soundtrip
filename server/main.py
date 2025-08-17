from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime as dt

app = FastAPI(title="Soundtrip API", version="0.2.0")

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
    season: str
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

# ---- ヘルスチェック ----
@app.get("/health")
def health():
    return {"ok": True, "ts": dt.datetime.utcnow().isoformat()}

# ---- ダミー生成器（MVP）----
def generate_dummy_story(payload: StoryInput) -> dict:
    d = payload.destination
    u = payload.userProfile
    title = f"{d.city}、{d.season}の{d.timeOfDay}に"
    mood = "・".join(u.mood) if u.mood else "気まま"
    chapters = [
        {"name":"導入","text": f"{d.city}の空気は、{d.season}の匂い。{u.ageRange}のあなたは、{mood}な気分で歩きはじめる。"},
        {"name":"街歩き","text": f"路地に入ると足音が柔らかくなる。{d.timeOfDay}の光が壁を薄く染める。"},
        {"name":"出会い","text": "店先で湯気に誘われ、言葉少なな会釈を交わす。"},
        {"name":"体験","text": "一椀の温かさが胸に広がり、遠い記憶がそっと起き上がる。"},
        {"name":"余韻","text": "帰り道、風が頬を撫でる。今日の静けさが、明日を少しだけ優しくする。"}
    ]
    return {
        "title": title,
        "chapters": chapters,
        "affiliateContext": {"themes": ["町家宿","夕暮れ散歩ガイド","和菓子体験"]},
        "audioUrl": None  # 後でTTS導入時にURLを入れる
    }

# ---- エンドポイント ----
@app.post("/v1/stories")
def create_story(spec: StoryInput):
    story = generate_dummy_story(spec)
    return story
