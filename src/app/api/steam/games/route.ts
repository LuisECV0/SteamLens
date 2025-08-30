import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const steamId = searchParams.get("steamid")
  const apiKey = process.env.STEAM_API_KEY

  if (!steamId) {
    return NextResponse.json({ error: "Falta steamid" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&format=json`
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Error al consultar juegos" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error fetch juegos:", err)
    return NextResponse.json({ error: "Fallo en la petición a Steam" }, { status: 500 })
  }
}
