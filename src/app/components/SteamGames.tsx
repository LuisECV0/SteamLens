"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Props = {
  games: any[]
  selectedGame: any
  onSelectGame: (game: any) => void
}

export default function SteamGames({ games, selectedGame, onSelectGame }: Props) {
  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.currentTarget
    target.onerror = null
    target.src = "/error.png"
  }

  if (games.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🎮 Juegos ({games.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] rounded-md pr-3">
          <ul className="space-y-3">
            {games.map((game) => (
              <li
                key={game.appid}
                onClick={() => onSelectGame(game)}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedGame?.appid === game.appid ? "bg-accent text-accent-foreground" : ""
                )}
              >
                <img
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
                  alt={game.name}
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
