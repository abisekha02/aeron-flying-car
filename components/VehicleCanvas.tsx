
"use client";

/**
 * VehicleCanvas.tsx
 * AERON Project Stratos
 *
 * Features:
 * - Tesla Roadster GLB model
 * - Road / Flight modes
 * - Smooth levitation animation
 * - 360-degree rotation
 * - Zoom and reset controls
 * - Dynamic vehicle colours
 * - Propulsion glow effects
 * - Circular technology platform
 * - GLB mesh diagnostics
 */

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */

interface VehicleCanvasProps {
  mode: "road" | "flight";
  colorHex: string;
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}

/* ─────────────────────────────────────
   CAR MODEL
───────────────────────────────────── */

function CarModel({
  mode,
  colorHex,
}: {
  mode: "road" | "flight";
  colorHex: string;
}) {
  const { scene } = useGLTF("/models/tesla_roadster.glb");

  const groupRef = useRef<THREE.Group>(null);
  const hoverTime = useRef(0);

  const targetY = useRef(mode === "flight" ? 0.5 : 0);

  /* Diagnose model geometry */

  useEffect(() => {
    scene.updateMatrixWorld(true);

    const meshDetails: {
      name: string;
      width: number;
      height: number;
      depth: number;
      material: string;
    }[] = [];

    console.group("AERON - Tesla GLB Mesh Diagnostics");

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const bounds = new THREE.Box3().setFromObject(child);
      const size = new THREE.Vector3();

      bounds.getSize(size);

      const material = Array.isArray(child.material)
        ? child.material.map((m) => m.name).join(", ")
        : child.material.name;

      meshDetails.push({
        name: child.name || "Unnamed mesh",
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
        material: material || "Unnamed material",
      });
    });

    console.table(meshDetails);

    console.log(
      "Potentially unusual tall meshes:",
      meshDetails.filter(
        (mesh) =>
          mesh.height > 3 &&
          mesh.height > mesh.width * 3 &&
          mesh.height > mesh.depth * 3
      )
    );

    console.groupEnd();
  }, [scene]);

  /* Update flight position */

  useEffect(() => {
    targetY.current = mode === "flight" ? 0.5 : 0;
  }, [mode]);

  /* Apply selected body colour */

  useEffect(() => {
    const color = new THREE.Color(colorHex);

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        const materialName = material.name?.toLowerCase() ?? "";

        const isPaint =
          materialName.includes("paint") ||
          materialName.includes("body") ||
          materialName.includes("bodyshell") ||
          materialName.includes("exterior");

        if (
          isPaint &&
          material instanceof THREE.MeshStandardMaterial
        ) {
          material.color.copy(color);
          material.needsUpdate = true;
        }
      });
    });
  }, [colorHex, scene]);

  /* Enable model shadows */

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  /* Smooth road / flight animation */

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    hoverTime.current += delta;

    const hover =
      mode === "flight"
        ? Math.sin(hoverTime.current * 2) * 0.07
        : 0;

    const targetPositionY = targetY.current + hover;

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetPositionY,
      3,
      delta
    );

    const targetRotationZ =
      mode === "flight"
        ? Math.sin(hoverTime.current * 1.3) * 0.015
        : 0;

    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotationZ,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Original Tesla Roadster GLB */}

      <primitive
        object={scene}
        scale={1.2}
        rotation={[0, Math.PI / 6, 0]}
      />

      {/* Flight propulsion effects */}

      <PropulsionRings mode={mode} />
    </group>
  );
}

/* ─────────────────────────────────────
   PROPULSION EFFECTS
───────────────────────────────────── */

function PropulsionRings({
  mode,
}: {
  mode: "road" | "flight";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;

    if (matRef.current) {
      const targetOpacity =
        mode === "flight"
          ? 0.7 + Math.sin(time.current * 10) * 0.2
          : 0;

      matRef.current.opacity = THREE.MathUtils.damp(
        matRef.current.opacity,
        targetOpacity,
        4,
        delta
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.6, 0.65, 64]} />

        <meshBasicMaterial
          ref={matRef}
          color="#56C8FF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        position={[0, -0.4, 0]}
        color="#56C8FF"
        intensity={mode === "flight" ? 3 : 0}
        distance={3}
      />
    </group>
  );
}

/* ─────────────────────────────────────
   CIRCULAR PLATFORM
───────────────────────────────────── */

function Stage() {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Main platform */}

      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[4.2, 4.4, 0.12, 64]} />

        <meshStandardMaterial
          color="#0a0c10"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Blue inner ring */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.07, 0]}
      >
        <ringGeometry args={[3.5, 3.56, 64]} />

        <meshBasicMaterial
          color="#56C8FF"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Red outer ring */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.07, 0]}
      >
        <ringGeometry args={[4.0, 4.05, 64]} />

        <meshBasicMaterial
          color="#FF2638"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground contact shadows */}

      <ContactShadows
        position={[0, 0.08, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
        resolution={256}
        color="#000000"
      />
    </group>
  );
}

/* ─────────────────────────────────────
   CAMERA CONTROLS
───────────────────────────────────── */

function CameraRig({
  autoRotate,
  zoomSignal,
  resetSignal,
}: {
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}) {
  const orbitRef = useRef<any>(null);

  const { camera } = useThree();

  const previousZoom = useRef(zoomSignal);
  const previousReset = useRef(resetSignal);

  useFrame(() => {
    /* Zoom */

    if (zoomSignal !== previousZoom.current) {
      const difference = zoomSignal - previousZoom.current;

      const direction = new THREE.Vector3()
        .subVectors(
          new THREE.Vector3(0, 0.5, 0),
          camera.position
        )
        .normalize();

      camera.position.addScaledVector(
        direction,
        difference * 0.8
      );

      previousZoom.current = zoomSignal;
    }

    /* Reset camera */

    if (resetSignal !== previousReset.current) {
      if (orbitRef.current) {
        orbitRef.current.reset();
      } else {
        camera.position.set(0, 1.8, 6.5);
        camera.lookAt(0, 0.5, 0);
      }

      previousReset.current = resetSignal;
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.65}
      target={[0, 0.2, 0]}
    />
  );
}

/* ─────────────────────────────────────
   ROOT CANVAS
───────────────────────────────────── */

export default function VehicleCanvas({
  mode,
  colorHex,
  autoRotate,
  zoomSignal,
  resetSignal,
}: VehicleCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 1.8, 6.5],
        fov: 42,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        powerPreference: "high-performance",
      }}
      style={{
        background: "transparent",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Main lighting */}

      <ambientLight intensity={0.6} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Blue rim lighting */}

      <directionalLight
        position={[-6, 3, -5]}
        intensity={3}
        color="#56C8FF"
      />

      {/* Red rim lighting */}

      <directionalLight
        position={[6, -1, -4]}
        intensity={2.5}
        color="#FF2638"
      />

      {/* Environment reflections */}

      <Environment preset="night" />

      {/* Technology platform */}

      <Stage />

      {/* Tesla Roadster */}

      <React.Suspense fallback={null}>
        <CarModel
          mode={mode}
          colorHex={colorHex}
        />
      </React.Suspense>

      {/* Camera */}

      <CameraRig
        autoRotate={autoRotate}
        zoomSignal={zoomSignal}
        resetSignal={resetSignal}
      />
    </Canvas>
  );
}

/* Preload the Tesla model */

useGLTF.preload("/models/tesla_roadster.glb");
