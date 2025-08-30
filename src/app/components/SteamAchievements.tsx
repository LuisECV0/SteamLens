"use client"

type Props = {
  achievements: any[]
}

export default function SteamAchievements({ achievements }: Props) {
  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.currentTarget
    target.onerror = null
    target.src = "/error.png"
  }

  if (achievements.length === 0) return <p className="text-gray-500">No hay logros para mostrar</p>

  return (
    <ul className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
      {achievements.map((ach) => (
        <li
          key={ach.name}
          className={`flex gap-3 items-center border rounded p-2 ${
            ach.achieved ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <img
            src={ach.icon}
            alt={ach.name}
            className="w-12 h-12"
            onError={handleImageError}
          />
          <div>
            <p className="font-medium">{ach.name}</p>
            <p className="text-sm text-gray-600">{ach.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
