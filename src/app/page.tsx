"use client"
import { useState } from "react"
import SteamOffers from "./components/SteamOffers"
import SteamProfile from "./components/SteamProfile"
import SteamSearchForm from "./components/SteamSearchForm"
import SteamGames from "./components/SteamGames"
import SteamAchievements from "./components/SteamAchievements"

export default function HomePage() {
  const [steamId, setSteamId] = useState("")
  const [games, setGames] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function safeFetch(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error en la API (${res.status}): ${res.statusText}`)
    return res.json()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGames([])
    setAchievements([])
    setSelectedGame(null)

    try {
      const data = await safeFetch(`/api/steam/profile?steamid=${steamId}`)
      if (data.response?.players?.length > 0) {
        const dataGames = await safeFetch(`/api/steam/games?steamid=${steamId}`)
        setGames(dataGames.response?.games || [])
      } else {
        setError("Usuario no encontrado")
      }
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con la API")
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectGame(game: any) {
    setSelectedGame(game)
    setAchievements([])
    setError(null)

    try {
      const dataUser = await safeFetch(`/api/steam/profile?steamid=${steamId}&appid=${game.appid}`)
      const dataSchema = await safeFetch(`/api/steam/game-schema?appid=${game.appid}`)

      if (dataSchema.game?.availableGameStats?.achievements) {
        const schemaAchievements = dataSchema.game.availableGameStats.achievements
        const userAchievements = dataUser.playerstats?.achievements || []

        const merged = schemaAchievements.map((ach: any) => {
          const userAch = userAchievements.find((ua: any) => ua.apiname === ach.name)
          return {
            name: ach.displayName,
            description: ach.description,
            icon: ach.icon,
            icongray: ach.icongray,
            achieved: userAch?.achieved === 1,
          }
        })
        setAchievements(merged)
      } else {
        setError("Este juego no tiene logros disponibles")
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar logros")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar perfil de Steam</h1>

      {/* Formulario */}
      <SteamSearchForm
        steamId={steamId}
        setSteamId={setSteamId}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Perfil */}
      {steamId && !error && <SteamProfile steamId={steamId} />}

      {/* Juegos */}
      <SteamGames games={games} selectedGame={selectedGame} onSelectGame={handleSelectGame} />

      {/* Logros */}
      <SteamAchievements achievements={achievements} />

      {/* Ofertas */}
      <SteamOffers />
    </div>
  )
}
