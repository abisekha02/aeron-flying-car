"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Eye, 
  Info, 
  Maximize2, 
  Sparkles,
  Plane,
  Car,
  Shield,
  Zap,
  Compass
} from "lucide-react";
import { sound } from "../utils/audio";

interface Hotspot {
  id: string;
  name: string;
  desc: string;
  pos: [number, number, number];
  category: "aero" | "propulsion" | "cockpit" | "structure";
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "canopy",
    name: "Electrochromic Smart Canopy",
    desc: "Single-piece curved aerospace polycarbonate with dynamic variable tint and heads-up telemetry projection.",
    pos: [0, 0.95, 0.2],
    category: "cockpit"
  },
  {
    id: "wing-left",
    name: "Morphing Aero Winglet (Port)",
    desc: "Variable-camber carbon composite wing capable of 35° sweep transition from high-downforce ground mode to flight lift.",
    pos: [-2.1, 0.45, -0.6],
    category: "aero"
  },
  {
    id: "wing-right",
    name: "Morphing Aero Winglet (Starboard)",
    desc: "Active vortex-shedding winglet with integrated ion-plasma boundary layer control actuators.",
    pos: [2.1, 0.45, -0.6],
    category: "aero"
  },
  {
    id: "thruster-rear",
    name: "Dual Vector-Ion Thruster",
    desc: "Twin ceramic core magnetic induction thrusters delivering 12,000 N instantaneous directional thrust vectoring.",
    pos: [0, 0.4, -2.4],
    category: "propulsion"
  },
  {
    id: "nose-lidar",
    name: "Optical Fly-by-Wire LiDAR Array",
    desc: "360-degree pulsed nanosecond optical array providing corridor mapping up to 4.2 km at Mach 0.4.",
    pos: [0, 0.35, 2.3],
    category: "structure"
  }
];

export default function VehicleViewer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<"road" | "flight">("flight");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [colorTheme, setColorTheme] = useState<string>("#DCE1E8"); // Liquid Silver default
  const [showWireframe, setShowWireframe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // References for Three.js state manipulation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const leftWingRef = useRef<THREE.Group | null>(null);
  const rightWingRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const thrusterPlumesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetRotationY = useRef(0);
  const targetRotationX = useRef(0.2);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.2, 6.8);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLightBlue = new THREE.DirectionalLight(0x56c8ff, 3.2);
    rimLightBlue.position.set(-6, 3, -5);
    scene.add(rimLightBlue);

    const rimLightRed = new THREE.DirectionalLight(0xff2638, 2.8);
    rimLightRed.position.set(6, -1, -4);
    scene.add(rimLightRed);

    // 3. Circular Tech Stage / Ground Ring
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const stageGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.15, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      metalness: 0.9,
      roughness: 0.2,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.y = -0.075;
    stageMesh.receiveShadow = true;
    stageGroup.add(stageMesh);

    // Glowing stage rings
    const ringGeo = new THREE.RingGeometry(3.6, 3.65, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x56c8ff, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;
    stageGroup.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(4.1, 4.14, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0xff2638, side: THREE.DoubleSide });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.x = -Math.PI / 2;
    outerRingMesh.position.y = 0.005;
    stageGroup.add(outerRingMesh);

    // 4. Procedural High-Detail AERON Vehicle Geometry
    const carGroup = new THREE.Group();
    carGroup.position.y = 0.35;
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorTheme),
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const darkCarbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      metalness: 0.8,
      roughness: 0.35,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x05080c,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.75,
      transparent: true,
      opacity: 0.9,
    });

    const emissiveBlueMat = new THREE.MeshBasicMaterial({ color: 0x56c8ff });
    const emissiveRedMat = new THREE.MeshBasicMaterial({ color: 0xff2638 });

    // Chassis Main Central Body
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.9, -1.8);
    bodyShape.lineTo(0.9, -1.8);
    bodyShape.lineTo(0.98, -0.6);
    bodyShape.lineTo(1.1, 0.4);
    bodyShape.lineTo(0.85, 1.8);
    bodyShape.lineTo(0.3, 2.3);
    bodyShape.lineTo(-0.3, 2.3);
    bodyShape.lineTo(-0.85, 1.8);
    bodyShape.lineTo(-1.1, 0.4);
    bodyShape.lineTo(-0.98, -0.6);
    bodyShape.closePath();

    const extrudeSettings = {
      steps: 3,
      depth: 0.52,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.2,
      bevelSegments: 5,
    };

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeometry.rotateX(-Math.PI / 2);
    bodyGeometry.center();
    const mainFuselage = new THREE.Mesh(bodyGeometry, bodyMaterial);
    mainFuselage.castShadow = true;
    mainFuselage.receiveShadow = true;
    carGroup.add(mainFuselage);

    // Panoramic Teardrop Glass Cockpit Canopy
    const canopyGeo = new THREE.SphereGeometry(0.85, 32, 24);
    canopyGeo.scale(0.85, 0.55, 1.8);
    const canopyMesh = new THREE.Mesh(canopyGeo, glassMaterial);
    canopyMesh.position.set(0, 0.42, 0.15);
    canopyMesh.castShadow = true;
    carGroup.add(canopyMesh);

    // Front Aerodynamic Hood Slits & Headlights
    const headlightGeo = new THREE.BoxGeometry(0.55, 0.04, 0.08);
    const headlightLeft = new THREE.Mesh(headlightGeo, emissiveBlueMat);
    headlightLeft.position.set(-0.55, 0.15, 2.05);
    headlightLeft.rotation.y = -0.25;
    carGroup.add(headlightLeft);

    const headlightRight = new THREE.Mesh(headlightGeo, emissiveBlueMat);
    headlightRight.position.set(0.55, 0.15, 2.05);
    headlightRight.rotation.y = 0.25;
    carGroup.add(headlightRight);

    // Rear Lightblade (Neon Red)
    const lightbladeGeo = new THREE.BoxGeometry(1.65, 0.03, 0.05);
    const lightbladeMesh = new THREE.Mesh(lightbladeGeo, emissiveRedMat);
    lightbladeMesh.position.set(0, 0.32, -1.95);
    carGroup.add(lightbladeMesh);

    // Active Morphing Wings (Port & Starboard)
    const createWing = (isLeft: boolean) => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(isLeft ? -0.95 : 0.95, 0.15, -0.3);

      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, -0.4);
      wingShape.lineTo(isLeft ? -1.4 : 1.4, -0.9);
      wingShape.lineTo(isLeft ? -1.35 : 1.35, 0.2);
      wingShape.lineTo(0, 0.5);
      wingShape.closePath();

      const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });
      wingExtrude.rotateX(-Math.PI / 2);
      const wingMesh = new THREE.Mesh(wingExtrude, bodyMaterial);
      wingMesh.castShadow = true;
      wingPivot.add(wingMesh);

      // Winglet tip vertical stabilizer
      const tipGeo = new THREE.BoxGeometry(0.04, 0.45, 0.5);
      const tipMesh = new THREE.Mesh(tipGeo, darkCarbonMaterial);
      tipMesh.position.set(isLeft ? -1.38 : 1.38, 0.2, -0.35);
      wingPivot.add(tipMesh);

      // Edge glow light
      const edgeGlowGeo = new THREE.BoxGeometry(0.02, 0.02, 0.8);
      const edgeGlow = new THREE.Mesh(edgeGlowGeo, emissiveBlueMat);
      edgeGlow.position.set(isLeft ? -1.37 : 1.37, 0.05, -0.35);
      wingPivot.add(edgeGlow);

      return wingPivot;
    };

    const leftWing = createWing(true);
    const rightWing = createWing(false);
    carGroup.add(leftWing);
    carGroup.add(rightWing);
    leftWingRef.current = leftWing;
    rightWingRef.current = rightWing;

    // Dual Rear Ion Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.7, 32);
    thrusterGeo.rotateX(Math.PI / 2);
    
    const thrusterLeft = new THREE.Mesh(thrusterGeo, darkCarbonMaterial);
    thrusterLeft.position.set(-0.45, 0.18, -2.1);
    carGroup.add(thrusterLeft);

    const thrusterRight = new THREE.Mesh(thrusterGeo, darkCarbonMaterial);
    thrusterRight.position.set(0.45, 0.18, -2.1);
    carGroup.add(thrusterRight);

    // Glowing Thruster Plumes
    const plumeGeo = new THREE.ConeGeometry(0.2, 0.8, 32);
    plumeGeo.rotateX(-Math.PI / 2);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x56c8ff,
      transparent: true,
      opacity: 0.85,
    });

    const plumeLeft = new THREE.Mesh(plumeGeo, plumeMat);
    plumeLeft.position.set(-0.45, 0.18, -2.7);
    carGroup.add(plumeLeft);

    const plumeRight = new THREE.Mesh(plumeGeo, plumeMat);
    plumeRight.position.set(0.45, 0.18, -2.7);
    carGroup.add(plumeRight);
    thrusterPlumesRef.current = [plumeLeft, plumeRight];

    // Retractable Aero Wheels (Ground mode)
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 32);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.25, 12);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelPositions: [number, number, number][] = [
      [-0.92, -0.05, 1.3],
      [0.92, -0.05, 1.3],
      [-0.95, -0.05, -1.2],
      [0.95, -0.05, -1.2],
    ];

    const wheels: THREE.Group[] = [];
    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(...pos);

      const tire = new THREE.Mesh(wheelGeo, darkCarbonMaterial);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.9, roughness: 0.2 }));
      wheelGroup.add(rim);

      // Cyber illuminated ring on wheel
      const neonRing = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.21, 24),
        emissiveBlueMat
      );
      neonRing.position.x = pos[0] > 0 ? 0.13 : -0.13;
      neonRing.rotation.y = pos[0] > 0 ? Math.PI / 2 : -Math.PI / 2;
      wheelGroup.add(neonRing);

      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });
    wheelsRef.current = wheels;

    setIsLoaded(true);

    // 5. Interaction Event Listeners (Drag / Orbit / Zoom)
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      setIsRotating(false);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotationY.current += deltaX * 0.007;
      targetRotationX.current = Math.max(
        -0.2,
        Math.min(0.8, targetRotationX.current + deltaY * 0.005)
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomSpeed = 0.003;
      const newZ = cameraRef.current.position.z + e.deltaY * zoomSpeed;
      cameraRef.current.position.z = Math.max(3.8, Math.min(10.5, newZ));
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        setIsRotating(false);
        previousMousePosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      targetRotationY.current += deltaX * 0.009;
      targetRotationX.current = Math.max(
        -0.2,
        Math.min(0.8, targetRotationX.current + deltaY * 0.007)
      );

      previousMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth inertia rotation
      if (isRotating && !isDragging.current) {
        targetRotationY.current += 0.004;
      }

      if (carGroupRef.current) {
        carGroupRef.current.rotation.y += (targetRotationY.current - carGroupRef.current.rotation.y) * 0.08;
        carGroupRef.current.rotation.x += (targetRotationX.current - carGroupRef.current.rotation.x) * 0.08;

        // Subtle 60fps hovering levitation in flight mode
        if (activeMode === "flight") {
          carGroupRef.current.position.y = 0.42 + Math.sin(elapsedTime * 2.2) * 0.06;
          carGroupRef.current.rotation.z = Math.sin(elapsedTime * 1.5) * 0.02;
        } else {
          carGroupRef.current.position.y = 0.12;
          carGroupRef.current.rotation.z = 0;
        }
      }

      // Thruster plume pulsing
      if (thrusterPlumesRef.current.length > 0) {
        const plumeScale = activeMode === "flight" 
          ? 1.0 + Math.sin(elapsedTime * 18) * 0.18 
          : 0.15;
        thrusterPlumesRef.current.forEach((plume) => {
          plume.scale.set(plumeScale, plumeScale * 1.2, plumeScale);
          (plume.material as THREE.MeshBasicMaterial).opacity = activeMode === "flight" ? 0.85 : 0.2;
        });
      }

      // Wing sweep angle interpolation
      const targetWingAngle = activeMode === "flight" ? 0.28 : -0.12;
      if (leftWingRef.current && rightWingRef.current) {
        leftWingRef.current.rotation.z += (targetWingAngle - leftWingRef.current.rotation.z) * 0.08;
        rightWingRef.current.rotation.z += (-targetWingAngle - rightWingRef.current.rotation.z) * 0.08;
      }

      // Wheels retract upward into body during flight mode
      const targetWheelY = activeMode === "flight" ? 0.22 : -0.05;
      wheelsRef.current.forEach((wheel) => {
        wheel.position.y += (targetWheelY - wheel.position.y) * 0.08;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateLoop);
    };

    animateLoop();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [activeMode, isRotating, colorTheme]);

  // Mode Toggle helper
  const handleModeSwitch = (mode: "road" | "flight") => {
    sound.playChime(mode === "flight" ? 820 : 540, "triangle", 0.2);
    setActiveMode(mode);
  };

  // Zoom controls
  const handleZoom = (direction: "in" | "out") => {
    sound.playClick();
    if (!cameraRef.current) return;
    const delta = direction === "in" ? -0.8 : 0.8;
    cameraRef.current.position.z = Math.max(3.8, Math.min(10.5, cameraRef.current.position.z + delta));
  };

  // Reset view orientation
  const resetCameraView = () => {
    sound.playClick();
    targetRotationY.current = 0;
    targetRotationX.current = 0.2;
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 2.2, 6.8);
    }
  };

  return (
    <section id="vehicle-3d" className="relative py-24 md:py-32 bg-[#040507] text-silver overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-electricBlue/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-crimson/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Real-Time 3D Laboratory</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              360° CRAFT <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                INSPECTION.
              </span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-silver/75 max-w-md font-light">
            Manipulate the spatial 3D model in real time. Switch between high-downforce ground aerodynamics and active flight geometry.
          </p>
        </div>

        {/* 3D Canvas Viewport Box */}
        <div className="relative w-full h-[580px] md:h-[680px] glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          {/* Three.js Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Top Left: Configuration Mode Switcher */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <div className="p-1 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center gap-1 shadow-2xl">
              <button
                onClick={() => handleModeSwitch("road")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeMode === "road"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Road Mode</span>
              </button>

              <button
                onClick={() => handleModeSwitch("flight")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeMode === "flight"
                    ? "bg-gradient-to-r from-crimson to-neonRed text-white font-bold shadow-[0_0_15px_rgba(255,38,56,0.5)]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Flight Mode</span>
              </button>
            </div>

            {/* Status Pill */}
            <div className="px-3.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 font-mono text-[10px] text-neutral-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeMode === "flight" ? "bg-electricBlue animate-pulse" : "bg-neutral-500"}`} />
              <span>GEOMETRY: {activeMode === "flight" ? "WINGS DEPLOYED // LEVITATION ON" : "GROUND SQUAT // WHEELS ENGAGED"}</span>
            </div>
          </div>

          {/* Top Right: View Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsRotating(!isRotating);
              }}
              title={isRotating ? "Pause Auto-Rotation" : "Enable Auto-Rotation"}
              className={`p-2.5 rounded-xl border backdrop-blur-xl transition-all ${
                isRotating
                  ? "bg-electricBlue/20 border-electricBlue/40 text-electricBlue"
                  : "bg-black/60 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleZoom("in")}
              title="Zoom In"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleZoom("out")}
              title="Zoom Out"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={resetCameraView}
              title="Reset View Orientation"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Left: Hotspot Inspector Tabs */}
          <div className="absolute bottom-6 left-6 z-20 max-w-sm sm:max-w-md">
            <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-electricBlue flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Component Telemetry Hotspots</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">5 SENSORS ACTIVE</span>
              </div>

              {/* Hotspot buttons */}
              <div className="flex flex-wrap gap-1.5">
                {HOTSPOTS.map((spot) => {
                  const isSelected = selectedHotspot?.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedHotspot(isSelected ? null : spot);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                        isSelected
                          ? "bg-electricBlue text-black font-bold shadow-[0_0_12px_rgba(86,200,255,0.7)]"
                          : "bg-white/5 text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {spot.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {/* Selected Hotspot Description Banner */}
              {selectedHotspot && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-electricBlue/30 text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="font-bold text-white font-mono uppercase text-[11px]">{selectedHotspot.name}</p>
                  <p className="text-silver/80 text-[11px] leading-relaxed">{selectedHotspot.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right: Color Finish Palettes for 3D Mesh */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
            <div className="p-2.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-2xl">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest px-2">FINISH:</span>
              {[
                { hex: "#DCE1E8", name: "Silver" },
                { hex: "#0D0E12", name: "Obsidian" },
                { hex: "#8B0000", name: "Crimson" },
                { hex: "#F5F7FA", name: "White" },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    sound.playClick();
                    setColorTheme(c.hex);
                  }}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    colorTheme === c.hex
                      ? "border-electricBlue scale-110 shadow-[0_0_10px_#56C8FF]"
                      : "border-white/20 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              CLICK & DRAG TO ROTATE // SCROLL TO ZOOM
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
