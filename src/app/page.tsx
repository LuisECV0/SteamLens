"use client"

import { Achievement } from "../types/achievemen"
import { useState } from "react"
import SteamOffers from "./components/SteamOffers"
import SteamProfile from "./components/SteamProfile"
import SteamSearchForm from "./components/SteamSearchForm"
import SteamGames from "./components/SteamGames"
import SteamAchievements from "./components/SteamAchievements"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Game = {
  appid: number
  name: string
  playtime_forever: number
  img: string
}

type Props = {
  achievements: Achievement[]
}

export default function HomePage() {
  const [steamId, setSteamId] = useState("")
  const [games, setGames] = useState<Game[]>([])
  const [achievements, setAchievements] = useState<Achievement[] | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
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
    setAchievements(null)
    setSelectedGame(null)

    try {
      const data = await safeFetch(`/api/steam/profile?steamid=${steamId}`)
      if (data.response?.players?.length > 0) {
        const dataGames = await safeFetch(`/api/steam/games?steamid=${steamId}`)
        setGames(dataGames.response?.games || [])
      } else {
        setError("Usuario no encontrado")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("No se pudo conectar con la API")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectGame(game: Game) {
    setSelectedGame(game)
    setAchievements(null)
    setError(null)

    try {
      const dataUser = await safeFetch(
        `/api/steam/profile?steamid=${steamId}&appid=${game.appid}`
      )
      const dataSchema = await safeFetch(`/api/steam/game-schema?appid=${game.appid}`)

      if (dataSchema.game?.availableGameStats?.achievements) {
        const schemaAchievements = dataSchema.game.availableGameStats.achievements
        const userAchievements = dataUser.playerstats?.achievements || []

        const merged: Achievement[] = schemaAchievements.map((ach: any) => {
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
        setAchievements([])
      }
    } catch (err) {
      console.error(err)
      setAchievements([])
    }
  }

  // 📊 Top Juegos
  const topGames = [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 10)
    .map((g) => ({
      name: g.name,
      hours: (g.playtime_forever / 60).toFixed(1),
    }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar perfil de Steam</h1>

      <SteamSearchForm
        steamId={steamId}
        setSteamId={setSteamId}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {steamId && !error && (
        <Tabs defaultValue="dashboard" className="w-full mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
            <TabsTrigger value="top">Top Juegos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <SteamProfile steamId={steamId} />
              </Card>

              <div className="md:col-span-2 grid grid-cols-1 gap-6">
                <CardContent>
                  <SteamGames
                    games={games}
                    selectedGame={selectedGame}
                    onSelectGame={handleSelectGame}
                  />
                </CardContent>

                <CardContent>
                  <SteamAchievements achievements={achievements} />
                </CardContent>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offers">
            <SteamOffers />
          </TabsContent>

          <TabsContent value="top">
            <Card>
              <CardHeader>
                <CardTitle>Top Juegos por horas jugadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topGames}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>

                <ul className="mt-4 space-y-2">
                  {topGames.map((g) => (
                    <li key={g.name} className="flex justify-between border-b pb-1">
                      <span>{g.name}</span>
                      <span className="text-muted-foreground">{g.hours} h</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
