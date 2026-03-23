import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const steamid = searchParams.get("steamid")
  const apiKey = process.env.STEAM_API_KEY

  if (!steamid) {
    return NextResponse.json({ error: "Falta el steamid" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamid}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Error al obtener nivel" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error interno al obtener nivel" }, { status: 500 })
  }
}
