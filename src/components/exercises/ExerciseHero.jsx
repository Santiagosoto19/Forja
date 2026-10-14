import { useEffect, useState } from 'react'
import { isVideoUrl } from './exerciseMedia.js'
import ExerciseThumb from './ExerciseThumb.jsx'

const mediaClass = 'h-56 w-full rounded-xl bg-surface-2 object-cover'

function GifMedia({ url }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [url])

  if (!url || failed) return null

  if (isVideoUrl(url)) {
    return (
      <video
        src={url}
        className={mediaClass}
        muted
        loop
        autoPlay
        playsInline
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <img
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      className={mediaClass}
      onError={() => setFailed(true)}
    />
  )
}

export default function ExerciseHero({ imageUrl, gifUrl, name = '' }) {
  return (
    <div className="space-y-2">
      <ExerciseThumb src={imageUrl} alt={name} className="h-56 w-full rounded-xl" />
      {gifUrl ? <GifMedia url={gifUrl} /> : null}
    </div>
  )
}
