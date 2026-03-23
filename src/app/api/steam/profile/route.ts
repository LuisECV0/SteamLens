import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const steamId = searchParams.get("steamid")
  const appid = searchParams.get("appid")
  const apiKey = process.env.STEAM_API_KEY

  if (!steamId) {
    return NextResponse.json({ error: "Falta steamid" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 })
  }

  try {
    const apiUrl = appid
      ? `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${apiKey}&appid=${appid}&steamid=${steamId}`
      : `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`

    const res = await fetch(apiUrl, { cache: "no-store" })

    if (!res.ok) {
      return NextResponse.json(
        { error: appid ? "Error al consultar logros" : "Error al consultar Steam" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Fallo en la petición a Steam" }, { status: 500 })
  }
}
