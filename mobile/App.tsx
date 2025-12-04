import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [city, setCity] = useState("京都");
  const [season, setSeason] = useState("秋");
  const [timeOfDay, setTimeOfDay] = useState("夕方");
  const [comment, setComment] = useState("");
  const [story, setStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const createStory = async () => {
    setLoading(true);
    setStory(null);
    const res = await fetch(`${API_BASE}/v1/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: { city, season, timeOfDay },
        userProfile: { ageRange: '30s', companions: 'solo', mood: ['quiet', 'nostalgic'], budget: 'mid' },
        audioStyle: { voice: 'ja-JP-NanamiNeural', bgm: 'jazz_ambient', sfx: ['temple_bell', 'river', 'alley'] },
        comment: comment
      })
    });
    const data = await res.json();
    setStory(data);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>✈️</Text>
        <Text style={styles.headerTitle}>Soundtrip</Text>
        <Text style={styles.headerSubtitle}>🎧 旅の物語を音で届ける</Text>
      </View>

      {/* 入力フォーム */}
      <View style={styles.formCard}>
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
          <Text style={styles.inputLabel}>🍂 季節</Text>
          <TextInput
            value={season}
            onChangeText={setSeason}
            placeholder="例: 春、夏、秋、冬"
            style={styles.input}
            placeholderTextColor="#999"
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
      </View>

      {/* ストーリー表示 */}
      {story && (
        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>📖 {story.title}</Text>
          {story.chapters?.map((c: any, i: number) => (
            <View key={i} style={styles.chapterCard}>
              <Text style={styles.chapterName}>✨ {c.name}</Text>
              <Text style={styles.chapterText}>{c.text}</Text>
            </View>
          ))}

          {/* Suno歌詞 */}
          {story.sunoLyrics && (
            <View style={styles.lyricsCard}>
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
});
