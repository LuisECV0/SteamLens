"use client"

type Props = {
  steamId: string
  setSteamId: (id: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}

export default function SteamSearchForm({ steamId, setSteamId, handleSubmit, loading }: Props) {
  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Ingresa tu SteamID64"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>
    </div>
  )
}
