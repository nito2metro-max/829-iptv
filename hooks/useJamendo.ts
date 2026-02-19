import { JAMENDO_API, JAMENDO_CLIENT_ID } from '@/constants/jamendo';
import { useEffect, useState } from 'react';

export function useJamendo() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${JAMENDO_API}?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&audioformat=mp31&include=musicinfo`
    )
      .then(res => res.json())
      .then(json => {
        setTracks(json.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { tracks, loading };
}
