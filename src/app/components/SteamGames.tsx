"use client"

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
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Juegos ({games.length})</h2>
      <ul className="space-y-2 max-h-[300px] overflow-y-auto border rounded p-2">
        {games.map((game) => (
          <li
            key={game.appid}
            className={`flex items-center gap-3 border-b pb-2 cursor-pointer hover:bg-gray-100 rounded ${
              selectedGame?.appid === game.appid ? "bg-gray-200" : ""
            }`}
            onClick={() => onSelectGame(game)}
          >
            <img
              src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
              alt={game.name}
              className="w-20 h-10 object-cover rounded"
              onError={handleImageError}
            />
            <div>
              <p className="font-medium">{game.name}</p>
              <p className="text-sm text-gray-500">
                Tiempo jugado: {(game.playtime_forever / 60).toFixed(1)} h
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
