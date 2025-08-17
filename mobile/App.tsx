import React, { useState } from 'react';
import { View, Text, Button, Platform, TextInput, ScrollView } from 'react-native';

const API_BASE = "http://localhost:8000"; // ←あなたのPCのIPに変更

export default function App() {
  const [city, setCity] = useState("Kyoto");
  const [season, setSeason] = useState("Autumn");
  const [timeOfDay, setTimeOfDay] = useState("Evening");
  const [story, setStory] = useState<any|null>(null);
  const [loading, setLoading] = useState(false);

  const createStory = async () => {
    setLoading(true);
    setStory(null);
    const res = await fetch(`${API_BASE}/v1/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: { city, season, timeOfDay },
        userProfile: { ageRange: '30s', companions: 'solo', mood: ['quiet','nostalgic'], budget: 'mid' },
        audioStyle: { voice: 'ja-JP-NanamiNeural', bgm: 'jazz_ambient', sfx: ['temple_bell','river','alley'] }
      })
    });
    const data = await res.json();
    setStory(data);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Soundtrip</Text>
      <Text>API: {API_BASE} (Platform: {Platform.OS})</Text>

      <TextInput value={city} onChangeText={setCity} placeholder="City" style={{ borderWidth:1, padding:8, borderRadius:6 }} />
      <TextInput value={season} onChangeText={setSeason} placeholder="Season" style={{ borderWidth:1, padding:8, borderRadius:6 }} />
      <TextInput value={timeOfDay} onChangeText={setTimeOfDay} placeholder="Time of Day" style={{ borderWidth:1, padding:8, borderRadius:6 }} />

      <Button title={loading ? "Generating..." : "Create Story"} onPress={createStory} />

      {story && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{story.title}</Text>
          {story.chapters?.map((c: any, i: number) => (
            <View key={i} style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: '600' }}>■ {c.name}</Text>
              <Text>{c.text}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
