"use client"

type Props = {
  steamId: string
  setSteamId: (id: string) => void
  handleSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export default function SteamSearchForm({ steamId, setSteamId, handleSubmit, loading }: Props) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        placeholder="Ingresa tu SteamID64"
        value={steamId}
        onChange={(e) => setSteamId(e.target.value)}
        className="flex-1 px-3 py-2 border rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  )
}
