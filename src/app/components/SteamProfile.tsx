"use client"
import { useEffect, useState } from "react"

export default function SteamProfile({ steamId }: { steamId: string }) {
  const [profile, setProfile] = useState<any>(null)
  const [level, setLevel] = useState<number>(0)
  const [gamesCount, setGamesCount] = useState<number>(0)

  useEffect(() => {
    if (!steamId) return

    async function fetchData() {
      try {
        // Perfil
        const resProfile = await fetch(`/api/steam/profile?steamid=${steamId}`)
        const dataProfile = await resProfile.json()
        setProfile(dataProfile.response.players[0])

        // Nivel
        const resLevel = await fetch(`/api/steam/level?steamid=${steamId}`)
        const dataLevel = await resLevel.json()
        setLevel(dataLevel.response.player_level || 0)

        // Juegos (solo para contar)
        const resGames = await fetch(`/api/steam/games?steamid=${steamId}`)
        const dataGames = await resGames.json()
        setGamesCount(dataGames.response?.games?.length || 0)
      } catch (err) {
        console.error("Error cargando perfil:", err)
      }
    }

    fetchData()
  }, [steamId])

  if (!profile) return null

  const lastOnline = new Date(profile.lastlogoff * 1000).toLocaleString()
  const progress = (level % 10) * 10

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow">
      <div className="flex items-center gap-4 mb-4">
        <img src={profile.avatarfull} alt="avatar" className="w-20 h-20 rounded-full" />
        <div>
          <h2 className="text-2xl font-bold">{profile.personaname}</h2>
          <a href={profile.profileurl} target="_blank" className="text-blue-500 underline text-sm">
            Ver en Steam
          </a>
          <p className="text-sm text-gray-500">Última conexión: {lastOnline}</p>
          <p className="text-sm text-gray-500">Juegos en total: {gamesCount}</p>
        </div>
      </div>

      <div>
        <p className="font-semibold">Nivel {level}</p>
        <div className="w-full h-4 bg-gray-200 rounded">
          <div className="h-4 bg-green-500 rounded" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500">{progress}% hacia el siguiente nivel</p>
      </div>
    </div>
  )
}
