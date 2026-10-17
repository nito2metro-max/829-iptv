import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
};

/* 🏷 Fila horizontal de filtros */
export function Chips<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value || '_all'}
            onPress={() => onChange(o.value)}
            style={[styles.chip, active && styles.active]}>
            <Text style={[styles.text, active && styles.activeText]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
  },
  active: { backgroundColor: '#e50914' },
  text: { color: '#bbb', fontSize: 13, fontWeight: '600' },
  activeText: { color: '#fff' },
});
