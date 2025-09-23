"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Achievement {
  name: string
  description?: string
  icon: string
  achieved: boolean
}

type Props = {
  achievements: Achievement[] | null
}

export default function SteamAchievements({ achievements }: Props) {
  if (achievements === null) {
    return <p className="text-muted-foreground">Selecciona un juego para ver logros</p>
  }

  if (achievements.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🏆 Logros</CardTitle>
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🏆 Logros ({achievements.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <li
                key={ach.name}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-3 transition-colors",
                  ach.achieved
                    ? "bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800"
                    : "bg-muted hover:bg-accent/30 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                  <Badge
                    variant={ach.achieved ? "default" : "secondary"}
                    className="w-fit"
                  >
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
