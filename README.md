# 829 — TV, Películas, Series y Música

## Secciones

| Pestaña | Fuente | Qué incluye |
| --- | --- | --- |
| **TV** | [iptv-org](https://github.com/iptv-org/iptv) | Más de 10.000 canales gratuitos y públicos de todo el mundo: por país, por categoría o la lista mundial completa. También puedes cargar tu propia lista **M3U** de tu proveedor IPTV. |
| **Películas** | [Internet Archive · Feature Films](https://archive.org/details/feature_films) | Miles de películas de **dominio público**, con buscador y géneros. |
| **Series** | [Internet Archive · Classic TV](https://archive.org/details/classic_tv) | Series clásicas de **dominio público** con lista de episodios. |
| **Música** | Backend propio (`829-music-backend/`) | Buscador y reproductor de música. |

## Abrir la app en el iPhone (Expo Go)

El proyecto usa **Expo SDK 57**, la versión que abre hoy Expo Go en la App Store
(Expo Go para SDK 58 todavía no llega a la App Store).

1. Instala **Expo Go** en el iPhone.
2. En la Mac (mismo Wi‑Fi que el iPhone):
   ```bash
   npm install
   npx expo start --go
   ```
3. Escanea el código QR con la cámara del iPhone.

## Archivos principales

- `app/(tabs)/tv.tsx`, `app/(tabs)/movies.tsx`, `app/(tabs)/series.tsx`
- `app/title/[id].tsx` — ficha de película/serie con episodios
- `app/player.tsx` — reproductor `expo-video` (HLS `.m3u8` y MP4) con soporte de `Referer`/`User-Agent`
- `hooks/iptv.ts` — parser M3U y catálogo de países/categorías
- `hooks/archive.ts` — búsqueda y archivos de video del Internet Archive

> Solo se usan fuentes legales y gratuitas. Muchas señales de TV son HTTP, por eso
> `app.json` habilita tráfico sin cifrar (Android `usesCleartextTraffic`, iOS ATS).
> Esa configuración solo aplica a la app compilada (`npx expo run:ios` / `eas build`);
> en Expo Go algunos canales `http` pueden no reproducirse.

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
