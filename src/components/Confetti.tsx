import React, { useEffect, useRef } from 'react'

export default function Confetti({ burst = true }: { burst?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const colors = ['#ff477e', '#ffb86b', '#ffd36b', '#6ee7b7', '#60a5fa', '#a78bfa']

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number }
    const particles: Particle[] = []

    const count = burst ? 120 : 40
    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + rand(-100, 100),
        y: height / 3 + rand(-50, 50),
        vx: rand(-6, 6),
        vy: rand(-10, -2),
        size: Math.round(rand(6, 12)),
        color: colors[Math.floor(rand(0, colors.length))],
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2)
      })
    }

    let animationId = 0
    let frame = 0

    function onResize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', onResize)

    function draw() {
      frame++
      ctx.clearRect(0, 0, width, height)
      for (let p of particles) {
        p.vy += 0.2 // gravity
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }

      // Remove off-screen particles after some frames
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].y - particles[i].size > height + 100) particles.splice(i, 1)
      }

      if (particles.length > 0) animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    // Stop after 6s if still running
    const timeout = setTimeout(() => {
      cancelAnimationFrame(animationId)
    }, 6000)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
    }
  }, [burst])

  return <canvas ref={canvasRef} style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 60 }} />
}
