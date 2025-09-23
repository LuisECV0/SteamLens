"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Star, Trophy, Gamepad2, Clock } from "lucide-react"

interface SteamProfileProps {
  steamId: string
}

interface Profile {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  lastlogoff: number
}

interface Game {
  appid: number
  name: string
  playtime_forever: number
}

export default function SteamProfile({ steamId }: SteamProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [level, setLevel] = useState<number>(0)
  const [gamesCount, setGamesCount] = useState<number>(0)
  const [totalPlaytime, setTotalPlaytime] = useState<number>(0)
  const [achievementsCount, setAchievementsCount] = useState<number>(0)
  const [perfectGames, setPerfectGames] = useState<number>(0)

  useEffect(() => {
    if (!steamId) return

    async function fetchData() {
      try {
        // 📌 Perfil
        const resProfile = await fetch(`/api/steam/profile?steamid=${steamId}`)
        const dataProfile = await resProfile.json()
        const player: Profile | undefined = dataProfile.response.players?.[0]
        if (player) setProfile(player)

        // 📌 Nivel
        const resLevel = await fetch(`/api/steam/level?steamid=${steamId}`)
        const dataLevel = await resLevel.json()
        setLevel(dataLevel.response.player_level || 0)

        // 📌 Juegos
        const resGames = await fetch(`/api/steam/games?steamid=${steamId}`)
        const dataGames = await resGames.json()
        const games: Game[] = dataGames.response?.games || []
        setGamesCount(games.length)

        const totalMinutes = games.reduce((sum, g) => sum + g.playtime_forever, 0)
        setTotalPlaytime(totalMinutes)

        // 📌 Stats aproximados (placeholder, puedes mejorar con datos reales)
        setAchievementsCount(Math.round(games.length * 20))
        setPerfectGames(Math.round(games.length * 0.1))
      } catch (err) {
        console.error("Error cargando perfil:", err)
      }
    }

    fetchData()
  }, [steamId])

  if (!profile) return null

  const lastOnline = new Date(profile.lastlogoff * 1000).toLocaleString()
  const nextLevelProgress = ((level % 10) / 10) * 100

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/90 to-card/70 border border-primary/20 shadow-lg">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,theme(colors.primary)_0%,transparent_70%)]" />
      <CardContent className="p-6 relative z-10">
        <div className="text-center space-y-4">
          {/* Avatar */}
          <div className="relative mx-auto w-fit">
            <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
              <AvatarImage src={profile.avatarfull} alt={profile.personaname} />
              <AvatarFallback>
                {profile.personaname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Nombre y enlace */}
          <div>
            <h3 className="text-xl font-bold">{profile.personaname}</h3>
            <a
              href={profile.profileurl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              Ver perfil en Steam
            </a>
            <p className="text-xs text-muted-foreground mt-1">Última conexión: {lastOnline}</p>
            <Badge variant="outline" className="mt-2">
              <Star className="w-3 h-3 mr-1" /> Nivel {level}
            </Badge>
          </div>

          {/* Progreso nivel */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso al nivel {level + 1}</span>
              <span>{Math.round(nextLevelProgress)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Gamepad2 className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{gamesCount}</div>
              <div className="text-xs text-muted-foreground">Juegos</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
              <div className="text-lg font-bold">{Math.round(totalPlaytime / 60)}</div>
              <div className="text-xs text-muted-foreground">Horas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
              <div className="text-lg font-bold">{achievementsCount}</div>
              <div className="text-xs text-muted-foreground">Logros</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{perfectGames}</div>
              <div className="text-xs text-muted-foreground">100%</div>
            </div>
          </div>

          {/* Distinción */}
          <div className="pt-4">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1">
              🎮 Gamer Elite
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
