import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";

function DeathStarModel() {
  const meshRef = useRef();

  // Rotate the Death Star
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Main Death Star sphere */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </Sphere>

      {/* Superlaser dish (concave circle) */}
      <mesh position={[0, 0, 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Equatorial trench */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2.05, 0.08, 16, 100]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Polar trench */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.06, 16, 100]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Exhaust port (critical weakness) - glowing red */}
      <mesh position={[1.2, -0.8, 1.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Targeting reticle around exhaust port */}
      <mesh position={[1.2, -0.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial
          color="#00ff00"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Surface details - panels and lights */}
      {[...Array(20)].map((_, i) => {
        const theta = (i / 20) * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const x = 2.1 * Math.sin(phi) * Math.cos(theta);
        const y = 2.1 * Math.sin(phi) * Math.sin(theta);
        const z = 2.1 * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial
              color={Math.random() > 0.7 ? "#00ff00" : "#444444"}
              emissive={Math.random() > 0.7 ? "#00ff00" : "#000000"}
              emissiveIntensity={Math.random() > 0.7 ? 0.5 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function DeathStar3D() {
  return (
    <Canvas
      camera={{ position: [5, 2, 5], fov: 50 }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00b4d8" />

      {/* Death Star model */}
      <DeathStarModel />

      {/* Stars in background */}
      <Stars />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        autoRotate={false}
      />
    </Canvas>
  );
}

function Stars() {
  const starsRef = useRef();

  const starPositions = new Float32Array(1000 * 3);
  for (let i = 0; i < 1000; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 50 + Math.random() * 50;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
}

export default DeathStar3D;
