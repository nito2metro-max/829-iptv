import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Episode, fetchTitle, posterUrl, TitleDetail } from '@/hooks/archive';

/* 📄 Ficha de película o serie con su lista de episodios */
export default function TitleScreen() {
  const router = useRouter();
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: 'movie' | 'series' }>();
  const [detail, setDetail] = useState<TitleDetail | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchTitle(id)
      .then(d => alive && setDetail(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [id]);

  const play = (ep: Episode) =>
    router.push({
      pathname: '/player',
      params: {
        uri: ep.url,
        title: detail && detail.episodes.length > 1 ? `${detail.title} · ${ep.title}` : detail?.title,
      },
    });

  const isSeries = kind === 'series' || (detail?.episodes.length ?? 0) > 1;

  const header = (
    <View>
      <View style={styles.hero}>
        <Image source={{ uri: posterUrl(id) }} style={styles.poster} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{detail?.title ?? ''}</Text>
          {detail?.year ? <Text style={styles.meta}>{detail.year}</Text> : null}
          {detail && (
            <Text style={styles.meta}>
              {isSeries ? `${detail.episodes.length} episodios` : 'Película'} · Dominio público
            </Text>
          )}
        </View>
      </View>

      {detail && detail.episodes.length > 0 && (
        <TouchableOpacity style={styles.playBtn} onPress={() => play(detail.episodes[0])}>
          <Text style={styles.playText}>▶ {isSeries ? 'Ver episodio 1' : 'Ver ahora'}</Text>
        </TouchableOpacity>
      )}

      {detail?.description ? (
        <TouchableOpacity onPress={() => setExpanded(e => !e)}>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 4}>
            {detail.description}
          </Text>
        </TouchableOpacity>
      ) : null}

      {isSeries && detail && <Text style={styles.section}>Episodios</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: '#fff' }} />
      {!detail && !error && <ActivityIndicator color="#e50914" style={{ marginTop: 140 }} />}
      {error && <Text style={styles.status}>No se pudo cargar el título.</Text>}
      {detail && (
        <FlatList
          data={isSeries ? detail.episodes : []}
          keyExtractor={ep => ep.name}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            detail.episodes.length === 0 ? (
              <Text style={styles.status}>Este título no tiene video disponible.</Text>
            ) : undefined
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.episode} onPress={() => play(item)}>
              <Text style={styles.epNumber}>{index + 1}</Text>
              <Text style={styles.epTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.epPlay}>▶</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, paddingTop: 100, paddingBottom: 40 },
  hero: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  poster: { width: 120, height: 175, borderRadius: 10, backgroundColor: '#1a1a1a' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  meta: { color: '#999', fontSize: 13, marginBottom: 2 },
  playBtn: {
    backgroundColor: '#e50914',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  playText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  description: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  section: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  episode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
    gap: 12,
  },
  epNumber: { color: '#666', width: 28, fontSize: 15, fontWeight: '700' },
  epTitle: { color: '#fff', flex: 1, fontSize: 14 },
  epPlay: { color: '#e50914', fontSize: 16 },
  status: { color: '#888', textAlign: 'center', margin: 20 },
});
