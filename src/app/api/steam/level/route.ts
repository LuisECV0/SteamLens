import { NextResponse } from "next/server"

const API_KEY = process.env.STEAM_API_KEY

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const steamid = searchParams.get("steamid")

  if (!steamid) {
    return NextResponse.json({ error: "Falta el steamid" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${API_KEY}&steamid=${steamid}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Error al obtener nivel" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Error interno al obtener nivel" }, { status: 500 })
  }
}
