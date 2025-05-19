"use client"

import { useEffect, useRef } from "react"

export function TechBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    // Grid settings
    const gridSize = 40
    const gridColor = "rgba(74, 222, 128, 0.07)"

    // Dots settings
    const dots = []
    const dotsCount = 50
    const dotSize = 1
    const dotColor = "rgba(74, 222, 128, 0.3)"
    const connectionDistance = 150
    const connectionColor = "rgba(74, 222, 128, 0.1)"

    // Create dots
    for (let i = 0; i < dotsCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    function drawGrid() {
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      // Draw vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    function drawDots() {
      // Update dots position
      dots.forEach((dot) => {
        dot.x += dot.vx
        dot.y += dot.vy

        // Bounce off edges
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy

        // Draw dot
        ctx.fillStyle = dotColor
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connections
      ctx.strokeStyle = connectionColor
      dots.forEach((dot, i) => {
        for (let j = i + 1; j < dots.length; j++) {
          const otherDot = dots[j]
          const dx = dot.x - otherDot.x
          const dy = dot.y - otherDot.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            ctx.lineWidth = 1 - distance / connectionDistance
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(otherDot.x, otherDot.y)
            ctx.stroke()
          }
        }
      })
    }

    function animate() {
      ctx.clearRect(0, 0, width, height)
      drawGrid()
      drawDots()
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-40" />
}
