import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chips } from '@/components/media/chips';
import {
  categoryLabel,
  FEATURED_CATEGORIES,
  IPTV_ALL_URL,
  iptvCategoryUrl,
  iptvCountryUrl,
} from '@/constants/iptv';
import {
  Category,
  Channel,
  Country,
  fetchCategories,
  fetchCountries,
  fetchPlaylist,
} from '@/hooks/iptv';

type Mode = 'country' | 'news' | 'movies' | 'sports' | 'category' | 'world' | 'custom';

const MODES: { label: string; value: Mode }[] = [
  { label: '🌎 País', value: 'country' },
  { label: '📰 Noticias', value: 'news' },
  { label: '🎬 Películas', value: 'movies' },
  { label: '⚽ Deportes', value: 'sports' },
  { label: '🗂 Más categorías', value: 'category' },
  { label: '🌐 Todo el mundo', value: 'world' },
  { label: '➕ Mi lista M3U', value: 'custom' },
];

/* 📺 TV en vivo */
export default function TvScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('country');
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [country, setCountry] = useState<Country>({ name: 'República Dominicana', code: 'DO', flag: '🇩🇴' });
  const [category, setCategory] = useState<Category>({ id: 'kids', name: 'Kids' });
  // País opcional para filtrar dentro de una categoría (null = todos los países)
  const [categoryCountry, setCategoryCountry] = useState<Country | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customDraft, setCustomDraft] = useState('');
  const [picker, setPicker] = useState<'country' | 'category' | null>(null);
  const [pickerFilter, setPickerFilter] = useState('');

  const [result, setResult] = useState<{ url: string; channels: Channel[]; error: boolean }>({
    url: '',
    channels: [],
    error: false,
  });
  const [groupState, setGroupState] = useState({ url: '', group: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const isCategoryMode = mode === 'news' || mode === 'movies' || mode === 'sports' || mode === 'category';

  const playlistUrl =
    mode === 'country'
      ? iptvCountryUrl(country.code)
      : mode === 'category'
        ? iptvCategoryUrl(category.id)
        : isCategoryMode
          ? iptvCategoryUrl(mode)
          : mode === 'world'
            ? IPTV_ALL_URL
            : customUrl;

  useEffect(() => {
    if (!playlistUrl) return;
    let alive = true;
    fetchPlaylist(playlistUrl)
      .then(list => alive && setResult({ url: playlistUrl, channels: list, error: false }))
      .catch(() => alive && setResult({ url: playlistUrl, channels: [], error: true }));
    return () => {
      alive = false;
    };
  }, [playlistUrl]);

  // El resultado y el grupo elegido solo valen para la lista que se está mostrando
  const current = result.url === playlistUrl;
  const channels = useMemo(() => (current ? result.channels : []), [current, result.channels]);
  const error = current && result.error;
  const loading = !!playlistUrl && !current;
  const group = groupState.url === playlistUrl ? groupState.group : '';
  const setGroup = (g: string) => setGroupState({ url: playlistUrl, group: g });

  // Grupos del país/lista: Noticias, Películas y Deportes primero, el resto alfabético
  const groups = useMemo(() => {
    const rank = (g: string) => {
      const i = FEATURED_CATEGORIES.indexOf(g.toLowerCase());
      return i === -1 ? FEATURED_CATEGORIES.length : i;
    };
    const list = [...new Set(channels.map(c => c.group))].sort(
      (a, b) => rank(a) - rank(b) || categoryLabel(a).localeCompare(categoryLabel(b))
    );
    return [{ label: 'Todos', value: '' }, ...list.map(g => ({ label: categoryLabel(g), value: g }))];
  }, [channels]);

  const countryFilter = isCategoryMode ? categoryCountry?.code.toLowerCase() : undefined;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return channels.filter(
      c =>
        (!group || c.group === group) &&
        (!countryFilter || c.country === countryFilter) &&
        (!q || c.name.toLowerCase().includes(q))
    );
  }, [channels, group, search, countryFilter]);

  const pickerItems = useMemo(() => {
    const q = pickerFilter.trim().toLowerCase();
    const list: { key: string; label: string; raw: Country | Category | null }[] =
      picker === 'country'
        ? [
            ...(isCategoryMode ? [{ key: '_all', label: '🌐  Todos los países', raw: null }] : []),
            ...countries.map(c => ({ key: c.code, label: `${c.flag}  ${c.name}`, raw: c })),
          ]
        : categories.map(c => ({ key: c.id, label: categoryLabel(c.id), raw: c }));
    return list.filter(i => !q || i.label.toLowerCase().includes(q));
  }, [picker, pickerFilter, countries, categories, isCategoryMode]);

  const play = (c: Channel) =>
    router.push({
      pathname: '/player',
      params: { uri: c.url, title: c.name, referrer: c.referrer ?? '', userAgent: c.userAgent ?? '' },
    });

  const renderItem = ({ item }: { item: Channel }) => (
    <TouchableOpacity style={styles.channel} onPress={() => play(item)}>
      <View style={styles.logoBox}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.logo} contentFit="contain" />
        ) : (
          <Text style={styles.logoFallback}>{item.name.slice(0, 2).toUpperCase()}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.channelName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.channelGroup} numberOfLines={1}>
          {categoryLabel(item.group)}
        </Text>
      </View>
      <Text style={styles.live}>● EN VIVO</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>TV en vivo</Text>
      <Chips options={MODES} value={mode} onChange={setMode} />

      {mode === 'country' && (
        <TouchableOpacity style={styles.selector} onPress={() => setPicker('country')}>
          <Text style={styles.selectorText}>
            {country.flag}  {country.name}
          </Text>
          <Text style={styles.selectorArrow}>▾</Text>
        </TouchableOpacity>
      )}
      {mode === 'category' && (
        <TouchableOpacity style={styles.selector} onPress={() => setPicker('category')}>
          <Text style={styles.selectorText}>{categoryLabel(category.id)}</Text>
          <Text style={styles.selectorArrow}>▾</Text>
        </TouchableOpacity>
      )}
      {isCategoryMode && (
        <TouchableOpacity style={styles.selector} onPress={() => setPicker('country')}>
          <Text style={styles.selectorText}>
            {categoryCountry ? `${categoryCountry.flag}  ${categoryCountry.name}` : '🌐  Todos los países'}
          </Text>
          <Text style={styles.selectorArrow}>▾</Text>
        </TouchableOpacity>
      )}
      {mode === 'custom' && (
        <View style={styles.customRow}>
          <TextInput
            placeholder="https://tu-proveedor.com/lista.m3u"
            placeholderTextColor="#666"
            value={customDraft}
            onChangeText={setCustomDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onSubmitEditing={() => setCustomUrl(customDraft.trim())}
            style={[styles.input, styles.customInput]}
          />
          <TouchableOpacity style={styles.loadBtn} onPress={() => setCustomUrl(customDraft.trim())}>
            <Text style={styles.loadText}>Cargar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchBox}>
        <TextInput
          placeholder={`Buscar entre ${visible.length} canales`}
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>
      {!isCategoryMode && groups.length > 2 && (
        <Chips options={groups} value={group} onChange={setGroup} />
      )}

      {loading && <ActivityIndicator color="#e50914" style={{ margin: 20 }} />}
      {error && <Text style={styles.status}>No se pudo cargar la lista de canales.</Text>}
      {!loading && !error && channels.length > 0 && visible.length === 0 && (
        <Text style={styles.status}>No hay canales con ese filtro.</Text>
      )}
      {mode === 'custom' && !customUrl && (
        <Text style={styles.status}>
          Pega la URL de una lista M3U de tu proveedor IPTV para ver sus canales aquí.
        </Text>
      )}

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        initialNumToRender={20}
        windowSize={10}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Modal visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.heading}>{picker === 'country' ? 'Elige un país' : 'Elige una categoría'}</Text>
            <TouchableOpacity onPress={() => setPicker(null)} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Filtrar"
              placeholderTextColor="#888"
              value={pickerFilter}
              onChangeText={setPickerFilter}
              style={styles.input}
            />
          </View>
          <FlatList
            data={pickerItems}
            keyExtractor={i => i.key}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  if (picker === 'category') setCategory(item.raw as Category);
                  else if (isCategoryMode) setCategoryCountry(item.raw as Country | null);
                  else setCountry(item.raw as Country);
                  setPicker(null);
                  setPickerFilter('');
                }}>
                <Text style={styles.pickerText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800', marginHorizontal: 16, marginVertical: 8 },
  selector: {
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  selectorArrow: { color: '#888', fontSize: 15 },
  customRow: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 4 },
  customInput: { flex: 1, backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 12 },
  loadBtn: { backgroundColor: '#e50914', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  loadText: { color: '#fff', fontWeight: '700' },
  searchBox: {
    margin: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: { height: 44, color: '#fff', fontSize: 16 },
  channel: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  logoBox: {
    width: 64,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: { width: 56, height: 36 },
  logoFallback: { color: '#666', fontWeight: '800' },
  channelName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  channelGroup: { color: '#888', fontSize: 12 },
  live: { color: '#e50914', fontSize: 10, fontWeight: '800' },
  status: { color: '#888', textAlign: 'center', margin: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  close: { color: '#fff', fontSize: 22 },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: '#111', borderBottomWidth: 1 },
  pickerText: { color: '#fff', fontSize: 16 },
});
