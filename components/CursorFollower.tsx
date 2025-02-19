"use client"

import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

function FollowerSphere() {
  const mesh = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0))
  const previousPosition = useRef(new THREE.Vector3(0, 0, 0))
  const velocity = useRef(0)
  const [zoom, setZoom] = useState(1)

  // Custom color management
  const color = useRef(new THREE.Color("#4a90e2"))
  const targetColor = useRef(new THREE.Color("#4a90e2"))

  useFrame((state, delta) => {
    if (mesh.current) {
      // Calculate mouse velocity
      const currentPosition = mesh.current.position.clone()
      velocity.current = previousPosition.current.distanceTo(currentPosition) / delta
      previousPosition.current.copy(currentPosition)

      // Smooth movement
      mesh.current.position.lerp(targetPosition.current, 0.1)

      // Rotation
      mesh.current.rotation.x += delta * 0.5
      mesh.current.rotation.y += delta * 0.3

      // Scale
      const distance = mesh.current.position.distanceTo(targetPosition.current)
      const scaleMultiplier = THREE.MathUtils.lerp(1, 1.5, Math.min(distance / 2, 1))
      mesh.current.scale.setScalar(zoom * scaleMultiplier)

      // Color transition
      targetColor.current.setHSL((Math.sin(state.clock.elapsedTime * 0.5) + 1) / 2, 0.8, 0.5)
      color.current.lerp(targetColor.current, 0.1)
      ;(mesh.current.material as THREE.MeshBasicMaterial).color.copy(color.current)
    }
  })

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      targetPosition.current.set((x * viewport.width) / 2, (y * viewport.height) / 2, 0)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((prev) => {
        const newZoom = prev + event.deltaY * -0.001
        return Math.min(Math.max(newZoom, 0.5), 2)
      })
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [viewport])

  return (
    <Sphere ref={mesh} args={[0.5, 32, 16]}>
      <meshBasicMaterial wireframe color={color.current} />
    </Sphere>
  )
}

export default function CursorFollower() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <FollowerSphere />
      </Canvas>
    </div>
  )
}

