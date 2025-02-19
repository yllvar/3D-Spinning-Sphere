"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"
import { createNoise3D } from "simplex-noise"

function InteractiveParticleField() {
  const ref = useRef<THREE.Points>(null!)
  const { viewport } = useThree()
  const mousePosition = useRef(new THREE.Vector3(0, 0, 0))

  const noise3D = useMemo(() => createNoise3D(), [])
  const particleCount = 5000
  const [particles, velocities] = useMemo(() => {
    const p = new Float32Array(particleCount * 3)
    const v = new Float32Array(particleCount * 3)
    for (let i = 0; i < p.length; i += 3) {
      p[i] = (Math.random() - 0.5) * viewport.width
      p[i + 1] = (Math.random() - 0.5) * viewport.height
      p[i + 2] = (Math.random() - 0.5) * 2
      v[i] = v[i + 1] = v[i + 2] = 0
    }
    return [p, v]
  }, [viewport])

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      mousePosition.current.set((x * viewport.width) / 2, (y * viewport.height) / 2, 0)
    }

    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [viewport])

  useFrame((state, delta) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      const time = state.clock.elapsedTime * 0.1

      for (let i = 0; i < positions.length; i += 3) {
        const ix = i,
          iy = i + 1,
          iz = i + 2

        // Noise-based movement
        const noise = noise3D(positions[ix] * 0.01, positions[iy] * 0.01, time)
        velocities[ix] += noise * 0.0002
        velocities[iy] += noise * 0.0002
        velocities[iz] += noise * 0.0001

        // Mouse attraction
        const particlePosition = new THREE.Vector3(positions[ix], positions[iy], positions[iz])
        const distanceToMouse = particlePosition.distanceTo(mousePosition.current)
        const force = Math.max(0, 1 - distanceToMouse / (viewport.width * 0.1)) * 0.01
        velocities[ix] += (mousePosition.current.x - positions[ix]) * force
        velocities[iy] += (mousePosition.current.y - positions[iy]) * force

        // Update positions
        positions[ix] += velocities[ix]
        positions[iy] += velocities[iy]
        positions[iz] += velocities[iz]

        // Boundary check and wrap-around
        if (Math.abs(positions[ix]) > viewport.width / 2) {
          positions[ix] = -positions[ix]
        }
        if (Math.abs(positions[iy]) > viewport.height / 2) {
          positions[iy] = -positions[iy]
        }
        if (Math.abs(positions[iz]) > 1) {
          positions[iz] = -positions[iz]
        }

        // Damping
        velocities[ix] *= 0.99
        velocities[iy] *= 0.99
        velocities[iz] *= 0.99
      }

      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#1E90FF" size={0.005} sizeAttenuation={true} depthWrite={false} />
    </Points>
  )
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <InteractiveParticleField />
      </Canvas>
    </div>
  )
}

