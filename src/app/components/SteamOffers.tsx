"use client"
import { useEffect, useState } from "react"

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

  if (loading) return <p>Cargando ofertas...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">🔥 Ofertas destacadas en Steam</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border rounded-lg p-3 bg-white shadow hover:shadow-md transition"
          >
            <img
              src={offer.header_image}
              alt={offer.name}
              className="w-full h-40 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/error.png"
              }}
            />
            <h3 className="mt-2 font-semibold">{offer.name}</h3>
            <p className="text-sm text-gray-500 line-through">
              {(offer.final_price / 100 / (1 - offer.discount_percent / 100)).toFixed(2)} {offer.currency}
            </p>
            <p className="text-lg font-bold text-green-600">
              {(offer.final_price / 100).toFixed(2)} {offer.currency}
            </p>
            <span className="text-red-500 font-bold">
              -{offer.discount_percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
