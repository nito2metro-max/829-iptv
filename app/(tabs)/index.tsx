import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 🌐 IP DE TU BACKEND */
const API_URL = 'https://829-music-api.onrender.com:3000';

type Track = {
  id: number;
  title: string;
  artwork_url: string | null;
  user: { username: string };
};

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const player = useAudioPlayer();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
  }, []);

  /* 🔍 SEARCH */
  const searchMusic = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setTracks([]);

    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setTracks(json || []);
    } catch {
      setTracks([]);
    }
    setLoading(false);
  };

  /* ▶️ PLAY */
  const playTrack = async (track: Track) => {
    try {
      player.pause();

      const res = await fetch(`${API_URL}/stream/${track.id}`);
      const json = await res.json();

      player.replace({ uri: json.streamUrl });
      player.play();
      setCurrent(track);
    } catch (e) {
      console.log(e);
    }
  };

  /* ⏸ STOP */
  const stop = () => {
    player.pause();
    setCurrent(null);
  };

  const renderItem = ({ item }: { item: Track }) => (
    <TouchableOpacity style={styles.track} onPress={() => playTrack(item)}>
      <Image
        source={{
          uri:
            item.artwork_url?.replace('-large', '-t300x300') ||
            'https://via.placeholder.com/300/111/999?text=🎵',
        }}
        style={styles.cover}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.user.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Buscar música"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMusic}
          style={styles.input}
        />
      </View>

      {loading && <Text style={styles.loading}>Buscando…</Text>}

      <FlatList
        data={tracks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {current && (
        <View style={styles.player}>
          <Image
            source={{
              uri:
                current.artwork_url?.replace('-large', '-t100x100') ||
                'https://via.placeholder.com/100/111/999?text=🎵',
            }}
            style={styles.playerCover}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.playerTitle} numberOfLines={1}>
              {current.title}
            </Text>
            <Text style={styles.playerArtist} numberOfLines={1}>
              {current.user.username}
            </Text>
          </View>
          <TouchableOpacity onPress={stop}>
            <Text style={styles.pause}>⏸</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/* 🎨 UI */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchBox: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: { height: 44, color: '#fff', fontSize: 16 },
  loading: { color: '#888', textAlign: 'center', marginBottom: 10 },
  track: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  artist: { color: '#888', fontSize: 13 },
  player: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopColor: '#222',
    borderTopWidth: 1,
  },
  playerCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  playerTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  playerArtist: { color: '#888', fontSize: 12 },
  pause: { color: '#fff', fontSize: 22, paddingHorizontal: 10 },
});
