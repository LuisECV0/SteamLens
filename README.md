# SteamLens

**SteamLens** — Un dashboard ligero para visualizar perfiles de Steam: nivel, progreso, juegos, tiempo jugado, logros y ofertas destacadas.
Construido con **Next.js (App Router)** + **TypeScript** + **Tailwind**.
Este README te guía desde clonar el repo hasta ejecutar y desplegar, con ejemplos de endpoints y depuración.

---

## Tabla de contenidos

* [Características](#-características)
* [Demo local (rápido)](#-demo-local-rápido)
* [Requisitos](#-requisitos)
* [Instalación y setup](#-instalación-y-setup)
* [Variables de entorno](#-variables-de-entorno)
* [Estructura principal del proyecto](#-estructura-principal-del-proyecto)
* [API proxy (endpoints que debes tener)](#-api-proxy-endpoints-que-debes-tener)
* [Consumo desde el frontend (ejemplos)](#-consumo-desde-el-frontend-ejemplos)
* [Errores comunes y solución (CORS, 403, imágenes)](#-errores-comunes-y-solución-cors-403-imágenes)
* [Despliegue](#-despliegue)
* [Contribuir / To-Do / Licencia](#-contribuir--to-do--licencia)

---

## Características

* Buscar por **SteamID64** y mostrar perfil (avatar, nombre, última conexión).
* Mostrar **logros** combinando `GetSchemaForGame` + `GetPlayerAchievements`.
* Listar **juegos** con horas jugadas y portadas.
* Mostrar **nivel** del usuario (bar progress) usando `GetSteamLevel`.
* Panel de **ofertas** utilizando proxy a `store.steampowered.com`.
* Todas las llamadas a Steam pasan por **API routes (proxy)** en Next.js para evitar CORS y proteger la API key.

---

## ▶ Demo local (rápido)

```bash
# clona el repo
git clone <tu-repo-url> steamlens
cd steamlens

# instala dependencias
npm install

# crea .env.local y agrega tu Steam API Key (ver abajo)
# luego arranca dev server
npm run dev
```

Abre `http://localhost:3000` y prueba un SteamID.

---

## Requisitos

* Node.js >= 18
* npm (o pnpm/yarn si prefieres)
* Cuenta de Steam y una **Steam Web API Key** ([https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey))

---

## Instalación y setup detallado

```bash
# crear proyecto (si partes de 0)
npx create-next-app@latest steamlens --typescript --tailwind

# entrar al proyecto
cd steamlens

# instalar utilidades (si no están)
npm install class-variance-authority @radix-ui/react-avatar @radix-ui/react-tabs
```

Crea el archivo `.env.local` en la raíz:

```env
# .env.local
STEAM_API_KEY=TU_API_KEY_DE_STEAM
```

Reinicia el servidor si ya estaba corriendo:

```bash
npm run dev
```

---

## Estructura principal (recomendada)

```
/app
  /api
    /steam
      profile/route.ts        # proxy -> GetPlayerSummaries
      games/route.ts          # proxy -> GetOwnedGames
      achievements/route.ts   # proxy -> GetPlayerAchievements
      game-schema/route.ts    # proxy -> GetSchemaForGame
      level/route.ts          # proxy -> GetSteamLevel
      offers/route.ts         # proxy -> store.featuredcategories
  page.tsx                  # landing / orchestration
/components
  SteamProfile.tsx
  SteamGames.tsx
  SteamAchievements.tsx
  SteamOffers.tsx
  SteamSearchForm.tsx
/public
  error.png                 # fallback images
```

---

## API proxy — Endpoints importantes

> Todos estos endpoints son *server-side* (Next.js API Routes) y deben residir en `app/api/steam/*/route.ts`.

* **GET** `/api/steam/profile?steamid=STEAMID`
  Proxy a: `ISteamUser/GetPlayerSummaries/v0002`
  Respuesta principal: `data.response.players[0]`

* **GET** `/api/steam/games?steamid=STEAMID`
  Proxy a: `IPlayerService/GetOwnedGames/v0001?include_appinfo=true&format=json`
  Respuesta: `data.response.games`

* **GET** `/api/steam/achievements?steamid=STEAMID&appid=APPID`
  Proxy a: `ISteamUserStats/GetPlayerAchievements/v0001`
  Respuesta: `data.playerstats`

* **GET** `/api/steam/game-schema?appid=APPID`
  Proxy a: `ISteamUserStats/GetSchemaForGame/v2`
  Respuesta: `data.game.availableGameStats.achievements`

* **GET** `/api/steam/level?steamid=STEAMID`
  Proxy a: `IPlayerService/GetSteamLevel/v1`
  Respuesta: `data.response.player_level`

* **GET** `/api/steam/offers`
  Proxy a: `https://store.steampowered.com/api/featuredcategories/?cc=us&l=spanish`
  Respuesta: `data.specials.items`

---

## Consumo desde el frontend — Ejemplos

```ts
async function safeFetch(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error API (${res.status})`)
  return res.json()
}

const profile = await safeFetch(`/api/steam/profile?steamid=${steamId}`)
```

**Combinar achievements**:

1. `/api/steam/game-schema?appid=APPID` → todos los logros del juego.
2. `/api/steam/achievements?steamid=STEAMID&appid=APPID` → logros desbloqueados.
3. Merge por `apiname` para marcar `achieved: true/false`.

---

## Errores comunes y cómo solucionarlos

* **CORS en llamadas directas**: usar siempre proxy (API routes).
* **403 Forbidden**: perfil privado o nunca abrió el juego.
* **Imágenes bloqueadas**: usar `onError` en `<img>` → fallback `/error.png`.
* **Key leak**: no exponer `STEAM_API_KEY` en frontend, usar solo en server.

---

## Despliegue

* **Vercel** (recomendado).
* Configura `STEAM_API_KEY` en **Environment Variables**.
* Mantén el proxy (API routes) activo.

---