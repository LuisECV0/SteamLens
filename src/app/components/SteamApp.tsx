"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ExternalLink, Gamepad2, Percent, Star, Trophy, Clock } from "lucide-react"

import { Achievement } from "@/src/types/achievement"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
function SteamSearchForm({
  steamIdInput,
  setSteamIdInput,
  handleSubmit,
  loading
}: {
  steamIdInput: string
  setSteamIdInput: (v: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}) {
  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row sm:items-center mb-6">
        <input
          type="text"
          placeholder="Tu SteamID64"
          value={steamIdInput}
          onChange={(e) => setSteamIdInput(e.target.value)}
          className="flex-1 px-4 py-2.5 border rounded-xl"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </form>
    </div>
  )
}
type Game = {
  appid: number
  name: string
  playtime_forever: number
  img: string
}

type Profile = {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  lastlogoff: number
}

type Offer = {
  id: number
  name: string
  header_image: string
  final_price: number
  discount_percent: number
  currency: string
}

type GetPlayerSummariesResponse = {
  response?: {
    players?: Profile[]
  }
}

type GetSteamLevelResponse = {
  response?: {
    player_level?: number
  }
}

type GetOwnedGamesResponse = {
  response?: {
    games?: Game[]
  }
}

type SteamAchievementProgress = {
  apiname: string
  achieved: number
}

type GetPlayerAchievementsResponse = {
  playerstats?: {
    achievements?: SteamAchievementProgress[]
  }
}

type SchemaAchievement = {
  name: string
  displayName: string
  description?: string
  icon: string
  icongray: string
}

type GetSchemaForGameResponse = {
  game?: {
    availableGameStats?: {
      achievements?: SchemaAchievement[]
    }
  }
}

async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Error en la API (${res.status}): ${res.statusText}`)
  return res.json() as Promise<T>
}

export default function SteamApp() {
  const [steamIdInput, setSteamIdInput] = useState("")
  const [steamId, setSteamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [level, setLevel] = useState<number>(0)
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [achievements, setAchievements] = useState<Achievement[] | null>(null)

  const [offers, setOffers] = useState<Offer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offersError, setOffersError] = useState<string | null>(null)
  const offersLoadedOnceRef = useRef(false)

  useEffect(() => {
    if (!steamId || offersLoadedOnceRef.current) return
    offersLoadedOnceRef.current = true

    setOffersLoading(true)
    setOffersError(null)

    safeFetch<{ specials?: { items?: Offer[] } }>(`/api/steam/offers`)
      .then((data) => {
        setOffers(data.specials?.items ?? [])
      })
      .catch(() => {
        setOffersError("Error al conectar con el servidor")
      })
      .finally(() => {
        setOffersLoading(false)
      })
  }, [steamId])

  const selectRequestIdRef = useRef(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const input = steamIdInput.trim()
    if (!input) {
      setError("Ingresa un SteamID64")
      return
    }

    setLoading(true)
    setError(null)

    setSteamId(null)
    setProfile(null)
    setLevel(0)
    setGames([])
    setSelectedGame(null)
    setAchievements(null)

    try {
      const dataProfile = await safeFetch<GetPlayerSummariesResponse>(
        `/api/steam/profile?steamid=${encodeURIComponent(input)}`
      )

      const player: Profile | undefined = dataProfile.response?.players?.[0]
      if (!player) {
        setError("Usuario no encontrado")
        return
      }

      const [dataLevel, dataGames] = await Promise.all([
        safeFetch<GetSteamLevelResponse>(`/api/steam/level?steamid=${encodeURIComponent(input)}`),
        safeFetch<GetOwnedGamesResponse>(`/api/steam/games?steamid=${encodeURIComponent(input)}`),
      ])

      const playerLevel = dataLevel?.response?.player_level ?? 0
      const ownedGames: Game[] = dataGames.response?.games ?? []

      setSteamId(input)
      setProfile(player)
      setLevel(playerLevel)
      setGames(ownedGames)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con la API")
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectGame(game: Game) {
    if (!steamId) return

    const requestId = ++selectRequestIdRef.current
    setSelectedGame(game)
    setAchievements(null)

    try {
      const [dataUser, dataSchema] = await Promise.all([
        safeFetch<GetPlayerAchievementsResponse>(
          `/api/steam/profile?steamid=${encodeURIComponent(
            steamId
          )}&appid=${encodeURIComponent(String(game.appid))}`
        ),
        safeFetch<GetSchemaForGameResponse>(
          `/api/steam/game-schema?appid=${encodeURIComponent(String(game.appid))}`
        ),
      ])

      if (requestId !== selectRequestIdRef.current) return

      const schemaAchievements =
        dataSchema.game?.availableGameStats?.achievements ?? null
      const userAchievements = dataUser.playerstats?.achievements ?? []

      if (schemaAchievements) {
        const merged: Achievement[] = schemaAchievements.map((ach) => {
          const userAch = userAchievements.find((ua) => ua.apiname === ach.name)
          return {
            name: ach.displayName ?? ach.name,
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
    } catch {
      if (requestId === selectRequestIdRef.current) setAchievements([])
    }
  }

  const topGames = useMemo(() => {
    return [...games]
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 10)
      .map((g) => ({
        name: g.name,
        hours: (g.playtime_forever / 60).toFixed(1),
      }))
  }, [games])

  const gamesCount = games.length
  const totalPlaytimeHours = useMemo(() => {
    const minutes = games.reduce((sum, g) => sum + g.playtime_forever, 0)
    return Math.round(minutes / 60)
  }, [games])

  const achievementsCountApprox = Math.round(gamesCount * 20)
  const perfectGamesApprox = Math.round(gamesCount * 0.1)

  function ProfilePanel() {
    if (!profile) return null

    const lastOnline = new Date(profile.lastlogoff * 1000).toLocaleString()
    const nextLevelProgress = ((level % 10) / 10) * 100

    return (
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/12 via-fuchsia-500/10 to-emerald-500/10 border border-primary/15 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_center,theme(colors.primary)/20_0%,transparent_60%)]" />
        <CardContent className="p-6 relative z-10">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-fit">
              <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
                <AvatarImage src={profile.avatarfull} alt={profile.personaname} />
                <AvatarFallback>
                  {profile.personaname.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {profile.personaname}
              </h3>
              <a
                href={profile.profileurl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-300 dark:text-indigo-200 hover:underline transition-colors"
              >
                Ver perfil en Steam
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                Última conexión: {lastOnline}
              </p>
              <Badge
                variant="outline"
                className="mt-2 border-primary/20 bg-background/40"
              >
                <Star className="w-3 h-3 mr-1" /> Nivel {level}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progreso al nivel {level + 1}</span>
                <span>{Math.round(nextLevelProgress)}%</span>
              </div>
              <Progress value={nextLevelProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Gamepad2 className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">{gamesCount}</div>
                <div className="text-xs text-muted-foreground">Juegos</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
                <div className="text-lg font-bold">{totalPlaytimeHours}</div>
                <div className="text-xs text-muted-foreground">Horas</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                <div className="text-lg font-bold">{achievementsCountApprox}</div>
                <div className="text-xs text-muted-foreground">Logros</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{perfectGamesApprox}</div>
                <div className="text-xs text-muted-foreground">100%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function GamesPanel() {
    if (games.length === 0) return null

    function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
      const target = e.currentTarget
      target.onerror = null
      target.src = "/error.png"
    }

    return (
      <Card className="rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">
            🎮 Juegos ({games.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[380px] rounded-md pr-3">
            <ul className="space-y-3">
              {games.map((game) => (
                <li
                  key={game.appid}
                  onClick={() => handleSelectGame(game)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    selectedGame?.appid === game.appid
                      ? "bg-accent text-accent-foreground border-primary/25 shadow-sm"
                      : ""
                  )}
                >
                  <Image
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
                    alt={game.name}
                    width={96}
                    height={48}
                    className="w-24 h-12 object-cover rounded"
                    onError={handleImageError}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">{game.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Tiempo jugado: {(game.playtime_forever / 60).toFixed(1)} h
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  function AchievementsPanel() {
    if (achievements === null) {
      return (
        <Card className="rounded-2xl bg-muted/20 border border-primary/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">🏆 Logros</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Selecciona un juego para ver tus logros
          </CardContent>
        </Card>
      )
    }

    if (achievements.length === 0) {
      return (
        <Card className="rounded-2xl bg-muted/20 border border-primary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">🏆 Logros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Image
              src="/error.png"
              alt="Sin logros"
              width={96}
              height={96}
              className="mb-3 opacity-70"
            />
            <p className="text-muted-foreground">Este juego no tiene logros disponibles</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">🏆 Logros ({achievements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <li
                  key={ach.name}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-3 transition-all duration-200",
                    ach.achieved
                      ? "bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-900/35 dark:hover:bg-emerald-900/50 border-emerald-300/40"
                      : "bg-muted/40 hover:bg-accent/30 dark:bg-gray-800/40 dark:hover:bg-gray-800 border-border/70"
                  )}
                >
                  <Image
                    src={ach.icon || "/error.png"}
                    alt={ach.name}
                    width={56}
                    height={56}
                    className="rounded object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold leading-tight">{ach.name}</span>
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {ach.description || "Sin descripción"}
                    </span>
                    <Badge variant={ach.achieved ? "default" : "secondary"} className="w-fit">
                      {ach.achieved ? "Desbloqueado" : "Bloqueado"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  function OffersPanel() {
    if (offersLoading) return <p className="text-muted-foreground">Cargando ofertas...</p>
    if (offersError) return <p className="text-red-500">{offersError}</p>
    if (offers.length === 0) {
      return (
        <Card className="p-6 text-center rounded-2xl border-primary/10 bg-muted/20 shadow-none">
          <p className="text-muted-foreground">No se encontraron ofertas activas en este momento</p>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-primary/10 bg-gradient-to-r from-emerald-500/10 via-fuchsia-500/10 to-indigo-500/10 shadow-none transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Percent className="h-5 w-5 text-green-600" />
              🔥 Ofertas destacadas en Steam
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Descubre los descuentos más recientes y ahorra en tus juegos favoritos.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const originalPrice =
              offer.discount_percent > 0
                ? offer.final_price / 100 / (1 - offer.discount_percent / 100)
                : offer.final_price / 100

            return (
              <Card
                key={offer.id}
                className="group rounded-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-300 hover:shadow-xl"
              >
                <div className="relative">
                  <Image
                    src={offer.header_image || "/error.png"}
                    alt={offer.name}
                    width={600}
                    height={200}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {offer.discount_percent > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="destructive">-{offer.discount_percent}%</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-card-foreground line-clamp-2">
                    {offer.name}
                  </h3>

                  {offer.discount_percent > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {originalPrice.toFixed(2)} {offer.currency}
                    </p>
                  )}

                  <p className="text-lg font-bold text-green-600">
                    {(offer.final_price / 100).toFixed(2)} {offer.currency}
                  </p>

                  <div className="flex justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-green-600 group-hover:text-white transition-colors"
                    >
                      <a
                        href={`https://store.steampowered.com/app/${offer.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver en Steam
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:bg-green-600 hover:text-white transition-colors"
          >
            <a
              href="https://store.steampowered.com/specials/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Percent className="h-4 w-4 mr-2" />
              Ver todas las ofertas
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_60%)]" />

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent mb-6">
        Busca tu perfil de Steam
      </h1>

      <SteamSearchForm
        steamIdInput={steamIdInput}
        setSteamIdInput={setSteamIdInput}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && !error && (
        <p className="text-muted-foreground mt-2">Cargando datos de Steam...</p>
      )}

      {steamId && !error && (
        <Tabs defaultValue="dashboard" className="w-full mt-6">
          <TabsList className="mb-6 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/25">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
            <TabsTrigger value="top">Top juegos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <ProfilePanel />
              </div>

              <div className="md:col-span-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <GamesPanel />
                </div>
                <div className="lg:col-span-6">
                  <AchievementsPanel />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offers">
            <OffersPanel />
          </TabsContent>

          <TabsContent value="top">
            <Card className="rounded-2xl border-primary/10 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10 shadow-none transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">
                  Top juegos por horas jugadas
                </CardTitle>
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
                    <li
                      key={g.name}
                      className="flex justify-between items-center border-b pb-2 transition-colors hover:bg-accent/20 rounded-xl px-2"
                    >
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

