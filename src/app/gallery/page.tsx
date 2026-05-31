"use client"

import { Image } from "lucide-react"

export default function GalleryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Image size={20} className="text-violet-600" /> Photo Gallery</h1>
        <p className="text-sm text-gray-500">Wedding photo collection — coming in Phase 3 complete</p>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Gallery Module</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">Upload and organize photos by function (Haldi, Mehendi, Sangeet, Wedding, Reception). Cloud storage integration with Cloudinary coming in Phase 5.</p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-sm mx-auto opacity-30">
          {["Haldi 🌿", "Mehendi 💚", "Sangeet 🎵", "Wedding 💒"].map(f => (
            <div key={f} className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center text-xs font-medium text-gray-500">{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
