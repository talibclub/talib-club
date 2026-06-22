import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react"
import toast from "react-hot-toast"

const AppAudioContext = createContext(null)

export function AudioProvider({ children }) {
  const [playingAudio, setPlayingAudio] = useState(null) // { sura, aya, suraName }
  const [audioState, setAudioState] = useState("stopped") // "playing" | "paused" | "stopped"
  const [autoplayNext, setAutoplayNext] = useState(false)
  const autoplayNextRef = useRef(false)
  const audioRef = useRef(null)
  const playlistRef = useRef([]) // List of verses in current surah for autoplay

  useEffect(() => {
    autoplayNextRef.current = autoplayNext
  }, [autoplayNext])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current = null
    }
    setAudioState("stopped")
    setPlayingAudio(null)
  }, [])

  const handleNext = useCallback((sura, aya, suraName) => {
    const list = playlistRef.current
    const currentIndex = list.findIndex(item => Number(item.sura) === Number(sura) && Number(item.aya) === Number(aya))
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      const nextVerse = list[currentIndex + 1]
      // eslint-disable-next-line no-use-before-define
      play(nextVerse.sura, nextVerse.aya, suraName, list)
    } else {
      stop()
    }
  }, [stop]) // play is hoisted

  const play = useCallback((sura, aya, suraName, playlist = []) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
    }

    playlistRef.current = playlist
    const suraStr = String(sura).padStart(3, "0")
    const ayaStr = String(aya).padStart(3, "0")
    const url = `https://www.everyayah.com/data/Alafasy_128kbps/${suraStr}${ayaStr}.mp3`

    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingAudio({ sura: Number(sura), aya: Number(aya), suraName })
    setAudioState("playing")

    audio.play().catch(err => {
      console.error("Audio playback failed", err)
      toast.error("ไม่สามารถเล่นเสียงอายะฮ์นี้ได้ชั่วคราว")
      stop()
    })

    audio.onerror = (e) => {
      console.error("Audio failed to load", e)
      toast.error("การโหลดเสียงอ่านล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต")
      
      if (autoplayNextRef.current) {
        handleNext(sura, aya, suraName)
      } else {
        stop()
      }
    }

    audio.onended = () => {
      if (autoplayNextRef.current) {
        handleNext(sura, aya, suraName)
      } else {
        stop()
      }
    }
  }, [handleNext, stop])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setAudioState("paused")
    }
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current && audioState === "paused") {
      audioRef.current.play().catch(err => {
        console.error("Audio resume failed", err)
        stop()
      })
      setAudioState("playing")
    }
  }, [audioState, stop])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
        audioRef.current.onerror = null
        audioRef.current = null
      }
    }
  }, [])

  const contextValue = useMemo(() => ({
    playingAudio,
    audioState,
    autoplayNext,
    setAutoplayNext,
    play,
    pause,
    resume,
    stop
  }), [playingAudio, audioState, autoplayNext, play, pause, resume, stop])

  return (
    <AppAudioContext.Provider value={contextValue}>
      {children}
    </AppAudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AppAudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
