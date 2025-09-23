"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Percent } from "lucide-react"
import Image from "next/image"

interface Offer {
  id: number
  name: string
  header_image: string
  final_price: number
  discount_percent: number
  currency: string
}

export default function SteamOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch("/api/steam/offers")
        const data = await res.json()

        if (res.ok && data.specials?.items) {
          setOffers(data.specials.items)
        } else {
          setError(data.error || "No hay ofertas disponibles en este momento")
        }
      } catch {
        setError("Error al conectar con el servidor")
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    return <p className="text-muted-foreground">Cargando ofertas...</p>
  }
  if (error) {
    return <p className="text-red-500">{error}</p>
  }
  if (offers.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">😔 No se encontraron ofertas activas</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-green-600" />
            🔥 Ofertas destacadas en Steam
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Descubre los descuentos más recientes y ahorra en tus juegos favoritos.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const originalPrice =
            offer.discount_percent > 0
              ? offer.final_price / 100 / (1 - offer.discount_percent / 100)
              : offer.final_price / 100

          return (
            <Card
              key={offer.id}
              className="group hover:scale-[1.02] transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-300"
            >
              <div className="relative">
                <Image
                  src={offer.header_image || "/error.png"}
                  alt={offer.name}
                  width={600}
                  height={200}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {offer.discount_percent > 0 && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive">-{offer.discount_percent}%</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-card-foreground line-clamp-2">
                  {offer.name}
                </h3>

                {offer.discount_percent > 0 && (
                  <p className="text-sm text-muted-foreground line-through">
                    {originalPrice.toFixed(2)} {offer.currency}
                  </p>
                )}

                <p className="text-lg font-bold text-green-600">
                  {(offer.final_price / 100).toFixed(2)} {offer.currency}
                </p>

                <div className="flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-green-600 group-hover:text-white transition-colors"
                  >
                    <a
                      href={`https://store.steampowered.com/app/${offer.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver en Steam
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="hover:bg-green-600 hover:text-white transition-colors"
        >
          <a
            href="https://store.steampowered.com/specials/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Percent className="h-4 w-4 mr-2" />
            Ver todas las ofertas
          </a>
        </Button>
      </div>
    </div>
  )
}
