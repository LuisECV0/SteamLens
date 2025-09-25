import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const steamId = searchParams.get("steamid")
  const apiKey = process.env.STEAM_API_KEY

  console.log("🔑 API Key:", apiKey ? "Cargada ✅" : "NO definida ❌")
  console.log("🎮 SteamID recibido:", steamId)

  if (!steamId) {
    return NextResponse.json({ error: "Falta steamid" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 })
  }

  try {
    const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    console.log("🌍 URL llamada:", apiUrl)

    const res = await fetch(apiUrl)

    if (!res.ok) {
      console.error("❌ Steam devolvió error:", res.status, res.statusText)
      return NextResponse.json({ error: "Error al consultar Steam" }, { status: res.status })
    }

    const data = await res.json()
    console.log("✅ Respuesta Steam:", data)

    return NextResponse.json(data)
  } catch (err) {
    console.error("🔥 Error fetch Steam:", err)
    return NextResponse.json({ error: "Fallo en la petición a Steam" }, { status: 500 })
  }
}
