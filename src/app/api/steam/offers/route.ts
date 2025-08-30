// src/app/api/steam/offers/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch(
      "https://store.steampowered.com/api/featuredcategories/?cc=us&l=spanish",
      { cache: "no-store" } // evita que Next.js lo cachee
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al obtener ofertas" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error al obtener ofertas de Steam:", err)
    return NextResponse.json(
      { error: "Fallo en el proxy de ofertas" },
      { status: 500 }
    )
  }
}
