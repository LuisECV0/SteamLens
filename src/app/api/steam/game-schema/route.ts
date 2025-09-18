import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const appId = searchParams.get("appid")
  const apiKey = process.env.STEAM_API_KEY

  if (!appId) {
    return NextResponse.json({ error: "Falta parámetro appid" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${appId}`
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al consultar schema" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error fetch schema:", err)
    return NextResponse.json(
      { error: "Fallo en la petición a Steam" },
      { status: 500 }
    )
  }
}
