import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 550
    const height = container.clientHeight || 500

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5.9)

    // 2. High-performance WebGL Renderer with Alpha
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.appendChild(renderer.domElement)

    // 3. Main Central Monolith Group (QR Matrix System)
    const masterGroup = new THREE.Group()
    masterGroup.scale.setScalar(1.12)
    scene.add(masterGroup)

    // Materials - Japanese Vermilion Hanko Theme
    const darkSlabMaterial = new THREE.MeshStandardMaterial({
      color: 0x14151a,
      metalness: 0.65,
      roughness: 0.25,
    })

    const vermilionGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xe14d2a,
      emissive: 0xe14d2a,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    })

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.9,
    })

    const whiteDataMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x222222,
      roughness: 0.3,
      metalness: 0.4,
    })

    // A. Main 3D QR Code Slab (Base Monolith)
    const slabGeo = new THREE.BoxGeometry(2.35, 2.35, 0.18)
    const qrSlab = new THREE.Mesh(slabGeo, darkSlabMaterial)
    masterGroup.add(qrSlab)

    // B. Decorative Gold Corner Border Ring
    const borderGeo = new THREE.BoxGeometry(2.48, 2.48, 0.06)
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const borderMesh = new THREE.Mesh(borderGeo, borderMat)
    masterGroup.add(borderMesh)

    // C. 3 Corner Finder Patterns (Signature QR Markers)
    const cornerPositions = [
      { x: -0.72, y: 0.72 }, // Top-Left
      { x: 0.72, y: 0.72 },  // Top-Right
      { x: -0.72, y: -0.72 },// Bottom-Left
    ]

    cornerPositions.forEach((pos) => {
      const cornerGroup = new THREE.Group()
      cornerGroup.position.set(pos.x, pos.y, 0.11)

      // Outer Box Ring
      const outerSize = 0.46
      const barThick = 0.08
      const barH = outerSize
      const barW = barThick

      const barGeoV = new THREE.BoxGeometry(barW, barH, 0.08)
      const barGeoH = new THREE.BoxGeometry(barH, barW, 0.08)

      const leftBar = new THREE.Mesh(barGeoV, vermilionGlowMaterial)
      leftBar.position.x = -outerSize / 2 + barThick / 2
      const rightBar = new THREE.Mesh(barGeoV, vermilionGlowMaterial)
      rightBar.position.x = outerSize / 2 - barThick / 2
      const topBar = new THREE.Mesh(barGeoH, vermilionGlowMaterial)
      topBar.position.y = outerSize / 2 - barThick / 2
      const bottomBar = new THREE.Mesh(barGeoH, vermilionGlowMaterial)
      bottomBar.position.y = -outerSize / 2 + barThick / 2

      cornerGroup.add(leftBar, rightBar, topBar, bottomBar)

      // Center Solid Dot
      const centerDotGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1)
      const centerDot = new THREE.Mesh(centerDotGeo, goldAccentMaterial)
      cornerGroup.add(centerDot)

      masterGroup.add(cornerGroup)
    })

    // D. 3D Procedural Matrix Data Cubes (Grid of QR modules)
    const dataModulesGroup = new THREE.Group()
    masterGroup.add(dataModulesGroup)

    const gridSize = 11
    const step = 0.17
    const startX = -((gridSize - 1) * step) / 2
    const startY = ((gridSize - 1) * step) / 2

    const moduleGeo = new THREE.BoxGeometry(0.12, 0.12, 1)

    // Deterministic module pattern representing QR data blocks
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finder areas
        const isTL = r < 4 && c < 4
        const isTR = r < 4 && c > gridSize - 5
        const isBL = r > gridSize - 5 && c < 4
        const isCenter = r >= 4 && r <= 6 && c >= 4 && c <= 6

        if (isTL || isTR || isBL || isCenter) continue

        // Pseudo-random data distribution
        const isFilled = ((r * 7 + c * 13 + (r ^ c)) % 3) !== 0
        if (!isFilled) continue

        const h = 0.05 + Math.random() * 0.06
        const isVermilion = ((r + c) % 5) === 0
        const cubeMat = isVermilion ? vermilionGlowMaterial : whiteDataMaterial

        const cube = new THREE.Mesh(moduleGeo, cubeMat)
        cube.scale.z = h
        cube.position.set(startX + c * step, startY - r * step, 0.1 + h / 2)
        dataModulesGroup.add(cube)
      }
    }

    // E. Center Hanko Seal (Embossed Vermilion Cylinder with "K")
    const sealGroup = new THREE.Group()
    sealGroup.position.set(0, 0, 0.12)

    const sealCylGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32)
    sealCylGeo.rotateX(Math.PI / 2)
    const sealMesh = new THREE.Mesh(sealCylGeo, vermilionGlowMaterial)
    sealGroup.add(sealMesh)

    // Center Gold Ring
    const goldRingGeo = new THREE.TorusGeometry(0.24, 0.02, 16, 32)
    const goldRing = new THREE.Mesh(goldRingGeo, goldAccentMaterial)
    goldRing.position.z = 0.045
    sealGroup.add(goldRing)

    // Center Letter "K" (Constructed using 3D bars)
    const kStemGeo = new THREE.BoxGeometry(0.04, 0.22, 0.03)
    const kStem = new THREE.Mesh(kStemGeo, whiteDataMaterial)
    kStem.position.set(-0.06, 0, 0.05)

    const kArm1Geo = new THREE.BoxGeometry(0.14, 0.035, 0.03)
    const kArm1 = new THREE.Mesh(kArm1Geo, whiteDataMaterial)
    kArm1.rotation.z = Math.PI / 4
    kArm1.position.set(0.04, 0.045, 0.05)

    const kArm2Geo = new THREE.BoxGeometry(0.14, 0.035, 0.03)
    const kArm2 = new THREE.Mesh(kArm2Geo, whiteDataMaterial)
    kArm2.rotation.z = -Math.PI / 4
    kArm2.position.set(0.04, -0.045, 0.05)

    sealGroup.add(kStem, kArm1, kArm2)
    masterGroup.add(sealGroup)

    // F. Dynamic Laser Scanning Light Bar (Sweeps Up and Down)
    const laserGeo = new THREE.CylinderGeometry(0.018, 0.018, 2.3, 16)
    laserGeo.rotateZ(Math.PI / 2)
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.9,
    })
    const laserMesh = new THREE.Mesh(laserGeo, laserMat)
    laserMesh.position.set(0, 0, 0.18)
    masterGroup.add(laserMesh)

    // Light emitting from laser
    const laserLight = new THREE.PointLight(0x00ffcc, 2.5, 3.5)
    laserLight.position.set(0, 0, 0.25)
    laserMesh.add(laserLight)

    // G. 4 Orbiting Satellite Tool Nodes (Representing Kitto's Core Tool Suite)
    const satellitesGroup = new THREE.Group()
    scene.add(satellitesGroup)

    // 1. Security / Cryptographic Password (Golden Shield / Octahedron)
    const sat1Geo = new THREE.OctahedronGeometry(0.2, 0)
    const sat1Mesh = new THREE.Mesh(sat1Geo, goldAccentMaterial)
    satellitesGroup.add(sat1Mesh)

    // 2. Visual / Image Compressor (Icosahedron Crystal)
    const sat2Geo = new THREE.IcosahedronGeometry(0.18, 0)
    const sat2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
    })
    const sat2Mesh = new THREE.Mesh(sat2Geo, sat2Mat)
    satellitesGroup.add(sat2Mesh)

    // 3. Finance & Invoices (Folded Prism)
    const sat3Geo = new THREE.BoxGeometry(0.22, 0.28, 0.04)
    const sat3Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.6,
    })
    const sat3Mesh = new THREE.Mesh(sat3Geo, sat3Mat)
    satellitesGroup.add(sat3Mesh)

    // 4. Developer & Regex (Toroidal Ring)
    const sat4Geo = new THREE.TorusGeometry(0.18, 0.04, 16, 32)
    const sat4Mesh = new THREE.Mesh(sat4Geo, vermilionGlowMaterial)
    satellitesGroup.add(sat4Mesh)

    // Orbital Rings
    const orbitRingGeo1 = new THREE.TorusGeometry(1.85, 0.006, 16, 100)
    orbitRingGeo1.rotateX(Math.PI / 3)
    const orbitRingMat1 = new THREE.MeshBasicMaterial({ color: 0xe14d2a, transparent: true, opacity: 0.25 })
    const orbitRing1 = new THREE.Mesh(orbitRingGeo1, orbitRingMat1)
    scene.add(orbitRing1)

    const orbitRingGeo2 = new THREE.TorusGeometry(2.05, 0.006, 16, 100)
    orbitRingGeo2.rotateX(-Math.PI / 4)
    const orbitRingMat2 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.2 })
    const orbitRing2 = new THREE.Mesh(orbitRingGeo2, orbitRingMat2)
    scene.add(orbitRing2)

    // H. Ambient Matrix Star Dust Cloud
    const particleCount = 90
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.8 + Math.random() * 1.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      particlePos[i] = radius * Math.sin(phi) * Math.cos(theta)
      particlePos[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePos[i + 2] = radius * Math.cos(phi)
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xe14d2a,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
    })
    const particleCloud = new THREE.Points(particleGeo, particleMat)
    scene.add(particleCloud)

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)

    const vermilionRimLight = new THREE.PointLight(0xe14d2a, 3.5, 10)
    vermilionRimLight.position.set(-3, -2, 2)
    scene.add(vermilionRimLight)



    // 5. Mouse Interaction Tracking with Smooth Damping
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }

    container.addEventListener('mousemove', handleMouseMove)

    // 6. Animation Loop (30fps, paused when offscreen)
    let animationFrameId: number
    let lastFrame = 0
    let isVisible = true
    const clock = new THREE.Clock()

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0.05 }
    )
    visibilityObserver.observe(container)

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate)
      if (now - lastFrame < 1000 / 30) return
      lastFrame = now
      if (!isVisible || document.hidden) return
      const elapsedTime = clock.getElapsedTime()

      // Smooth laser scanning animation along QR plate
      const scanY = Math.sin(elapsedTime * 2.2) * 1.05
      laserMesh.position.y = scanY

      // Pulse color of laser between cyan and vermilion as it hits center
      if (Math.abs(scanY) < 0.15) {
        laserMat.color.setHex(0xe14d2a)
        laserLight.color.setHex(0xe14d2a)
      } else {
        laserMat.color.setHex(0x00ffcc)
        laserLight.color.setHex(0x00ffcc)
      }

      // Gentle floating bob for the main QR monolith
      masterGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.08

      // Autonomous gentle rotation + mouse follow
      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      masterGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.18 + targetX * 0.65
      masterGroup.rotation.x = 0.1 + Math.cos(elapsedTime * 0.3) * 0.08 - targetY * 0.5

      // Satellite Orbital Motion
      const r1 = 1.85
      const angle1 = elapsedTime * 0.8
      sat1Mesh.position.set(Math.cos(angle1) * r1, Math.sin(angle1 * 0.9) * 0.7, Math.sin(angle1) * r1 * 0.6)
      sat1Mesh.rotation.x += 0.02
      sat1Mesh.rotation.y += 0.03

      const r2 = 2.0
      const angle2 = elapsedTime * 0.7 + Math.PI / 2
      sat2Mesh.position.set(Math.sin(angle2) * r2 * 0.7, Math.cos(angle2) * r2, Math.cos(angle2 * 1.2) * 0.8)
      sat2Mesh.rotation.y += 0.02

      const r3 = 1.8
      const angle3 = elapsedTime * 0.65 + Math.PI
      sat3Mesh.position.set(Math.cos(angle3) * r3, -Math.sin(angle3) * 0.6, Math.sin(angle3) * r3 * 0.7)
      sat3Mesh.rotation.z += 0.015

      const r4 = 2.0
      const angle4 = elapsedTime * 0.75 + (Math.PI * 3) / 2
      sat4Mesh.position.set(-Math.cos(angle4) * r4 * 0.8, Math.sin(angle4 * 0.8) * 0.9, Math.sin(angle4) * r4 * 0.5)
      sat4Mesh.rotation.x += 0.03

      // Particles slow drift
      particleCloud.rotation.y = elapsedTime * 0.06

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH
          camera.updateProjectionMatrix()
          renderer.setSize(newW, newH)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      visibilityObserver.disconnect()
      container.removeEventListener('mousemove', handleMouseMove)
      resizeObserver.disconnect()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      slabGeo.dispose()
      moduleGeo.dispose()
      borderGeo.dispose()
      darkSlabMaterial.dispose()
      vermilionGlowMaterial.dispose()
      goldAccentMaterial.dispose()
      whiteDataMaterial.dispose()
      particleGeo.dispose()
      particleMat.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-[420px] sm:h-[540px] lg:h-[640px] xl:h-[680px] flex items-center justify-center select-none">
      {/* ThreeJS WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      />

    </div>
  )
}
