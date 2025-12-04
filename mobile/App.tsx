import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [city, setCity] = useState("京都");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [timeOfDay, setTimeOfDay] = useState("夕方");
  const [comment, setComment] = useState("");
  const [story, setStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedStories, setSavedStories] = useState<{ [key: string]: any }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ローカルストレージから保存済みストーリーとダークモード設定を読み込み
  useEffect(() => {
    const stored = localStorage.getItem('soundtrip_stories');
    if (stored) {
      setSavedStories(JSON.parse(stored));
    }

    const darkModeSetting = localStorage.getItem('soundtrip_darkmode');
    if (darkModeSetting) {
      setIsDarkMode(darkModeSetting === 'true');
    }
  }, []);

  // ダークモード設定を保存
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('soundtrip_darkmode', String(newMode));
  };

  const createStory = async () => {
    setLoading(true);
    setStory(null);
    const res = await fetch(`${API_BASE}/v1/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: { city, date, timeOfDay },
        userProfile: { ageRange: '30s', companions: 'solo', mood: ['quiet', 'nostalgic'], budget: 'mid' },
        audioStyle: { voice: 'ja-JP-NanamiNeural', bgm: 'jazz_ambient', sfx: ['temple_bell', 'river', 'alley'] },
        comment: comment
      })
    });
    const data = await res.json();
    setStory(data);
    setLoading(false);
  };

  const saveStory = () => {
    if (!story) return;

    const newSavedStories = {
      ...savedStories,
      [date]: {
        ...story,
        city,
        date,
        timeOfDay,
        comment,
        savedAt: new Date().toISOString()
      }
    };

    setSavedStories(newSavedStories);
    localStorage.setItem('soundtrip_stories', JSON.stringify(newSavedStories));
    alert('ストーリーを保存しました！');
  };

  const loadStory = (selectedDate: string) => {
    const savedStory = savedStories[selectedDate];
    if (savedStory) {
      setCity(savedStory.city);
      setDate(savedStory.date);
      setTimeOfDay(savedStory.timeOfDay);
      setComment(savedStory.comment || "");
      setStory(savedStory);
    }
  };



  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]} contentContainerStyle={styles.contentContainer}>
      {/* ヘッダー */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          style={styles.darkModeToggle}
          onPress={toggleDarkMode}
        >
          <Text style={styles.darkModeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>✈️</Text>
        <Text style={styles.headerTitle}>Soundtrip</Text>
        <Text style={styles.headerSubtitle}>🎧 旅の物語を音で届ける</Text>
      </View>

      {/* 入力フォーム */}
      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={styles.formTitle}>🗺️ 旅の目的地を選ぼう</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>🏙️ 都市</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="例: 京都、パリ、ニューヨーク"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📅 日付</Text>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              borderWidth: 2,
              borderColor: '#e0e0e0',
              padding: 14,
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: '#fafafa',
              color: '#333',
              width: '100%',
              border: '2px solid #e0e0e0'
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>🌅 時間帯</Text>
          <TextInput
            value={timeOfDay}
            onChangeText={setTimeOfDay}
            placeholder="例: 朝、昼、夕方、夜"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>💭 一言コメント</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="例: のんびり散歩したい、美味しいものを食べたい"
            style={[styles.input, styles.commentInput]}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createStory}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "🎨 生成中..." : "🎬 旅の物語を作る"}
          </Text>
        </TouchableOpacity>

        {story && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveStory}
          >
            <Text style={styles.saveButtonText}>
              💾 この日のストーリーを保存
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* カレンダー表示 */}
      {Object.keys(savedStories).length > 0 && (
        <View style={[styles.calendarCard, isDarkMode && styles.calendarCardDark]}>
          <Text style={[styles.calendarTitle, isDarkMode && styles.textDark]}>📆 保存済みストーリー</Text>
          <View style={styles.calendarGrid}>
            {Object.keys(savedStories).sort().reverse().map((savedDate) => (
              <TouchableOpacity
                key={savedDate}
                style={[styles.calendarItem, isDarkMode && styles.calendarItemDark]}
                onPress={() => loadStory(savedDate)}
              >
                <Text style={styles.calendarDate}>{savedDate}</Text>
                <Text style={styles.calendarCity}>{savedStories[savedDate].city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ストーリー表示 */}
      {story && (
        <View style={[styles.storyCard, isDarkMode && styles.storyCardDark]}>
          <Text style={[styles.storyTitle, isDarkMode && styles.textDark]}>📖 {story.title}</Text>

          {/* 音声プレイヤー */}
          {story.audioUrl && (
            <View style={[styles.audioCard, isDarkMode && styles.audioCardDark]}>
              <Text style={styles.audioTitle}>🎧 音声で聴く</Text>
              <audio
                controls
                style={{ width: '100%', marginTop: 12 }}
                src={`${API_BASE}${story.audioUrl}`}
              >
                お使いのブラウザは音声再生に対応していません。
              </audio>
            </View>
          )}

          {story.chapters?.map((c: any, i: number) => (
            <View key={i} style={[styles.chapterCard, isDarkMode && styles.chapterCardDark]}>
              <Text style={styles.chapterName}>✨ {c.name}</Text>
              <Text style={styles.chapterText}>{c.text}</Text>
            </View>
          ))}

          {/* Suno歌詞 */}
          {story.sunoLyrics && (
            <View style={[styles.lyricsCard, isDarkMode && styles.lyricsCardDark]}>
              <Text style={styles.lyricsTitle}>🎵 Suno 歌詞</Text>
              <Text style={styles.lyricsText}>{story.sunoLyrics}</Text>
            </View>
          )}
        </View>
      )}

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🌏 Hear the Journey</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#667eea',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    opacity: 0.95,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  commentInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  chapterCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  chapterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 8,
  },
  chapterText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  lyricsCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#ffd54f',
  },
  lyricsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f57c00',
    marginBottom: 12,
    textAlign: 'center',
  },
  lyricsText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  audioCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#42a5f5',
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  calendarItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  calendarDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  calendarCity: {
    fontSize: 12,
    color: '#666',
  },
  // ダークモードスタイル
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  headerDark: {
    backgroundColor: '#2d2d2d',
  },
  formCardDark: {
    backgroundColor: '#2d2d2d',
  },
  darkModeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  darkModeIcon: {
    fontSize: 24,
  },
  // ダークモード用コンポーネントスタイル
  textDark: {
    color: '#e0e0e0',
  },
  calendarCardDark: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  calendarItemDark: {
    backgroundColor: '#444',
    borderColor: '#666',
  },
  storyCardDark: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  audioCardDark: {
    backgroundColor: '#2c3e50',
    borderColor: '#455a64',
  },
  chapterCardDark: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  lyricsCardDark: {
    backgroundColor: '#3e2723',
    borderColor: '#5d4037',
  },
});
