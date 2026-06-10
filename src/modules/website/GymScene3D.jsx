import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

const LIME = '#b6ff3b';
const PURPLE = '#7d5bff';
const BLUE = '#3b82f6';
const DARK = '#05070f';

function GlowMat({ intensity = 0.35 }) {
  return (
    <meshStandardMaterial color="#12182a" metalness={0.92} roughness={0.1} emissive={LIME} emissiveIntensity={intensity} />
  );
}

function AnalyticsMonitor({ position }) {
  const ref = useRef();
  useFrame((s) => { ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.08 + 0.2; });
  return (
    <Float speed={1.4} floatIntensity={0.5} rotationIntensity={0.08}>
      <group ref={ref} position={position}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 1, 0.08]} />
          <meshStandardMaterial color={DARK} emissive={LIME} emissiveIntensity={0.45} metalness={0.9} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.4, 0.8]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.25} transparent opacity={0.3} />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
          <mesh key={x} position={[x, -0.15 + i * 0.1, 0.06]}>
            <boxGeometry args={[0.14, 0.12 + i * 0.1, 0.02]} />
            <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.55} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function StatsScreen({ position }) {
  return (
    <Float speed={1.8} floatIntensity={0.6} rotationIntensity={0.12}>
      <group position={position} rotation={[0.1, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[1.3, 0.85, 0.06]} />
          <meshStandardMaterial color={DARK} emissive={BLUE} emissiveIntensity={0.35} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.1, 0.65]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.2} transparent opacity={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

function BenchPress({ position }) {
  const ref = useRef();
  useFrame((s) => { ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.28) * 0.06; });
  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <group ref={ref} position={position} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[2, 0.12, 0.7]} />
          <GlowMat intensity={0.22} />
        </mesh>
        {[[-0.85, -0.1, 0.28], [0.85, -0.1, 0.28], [-0.85, -0.1, -0.28], [0.85, -0.1, -0.28]].map((p, i) => (
          <mesh key={i} position={p}><boxGeometry args={[0.08, 0.28, 0.08]} /><GlowMat intensity={0.1} /></mesh>
        ))}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.1, 12]} />
          <meshStandardMaterial color="#999" metalness={0.98} roughness={0.04} emissive={LIME} emissiveIntensity={0.18} />
        </mesh>
        {[-0.95, 0.95].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}><cylinderGeometry args={[0.12, 0.12, 0.18, 10]} /><GlowMat intensity={0.28} /></mesh>
        ))}
      </group>
    </Float>
  );
}

function SquatRack({ position }) {
  return (
    <Float speed={1.1} floatIntensity={0.35}>
      <group position={position} rotation={[0, -0.25, 0]}>
        {[[-0.5, 0.75, 0], [0.5, 0.75, 0]].map((p, i) => (
          <mesh key={i} position={p}><boxGeometry args={[0.06, 1.5, 0.06]} /><GlowMat intensity={0.2} /></mesh>
        ))}
        <mesh position={[0, 1.48, 0]}><boxGeometry args={[1.1, 0.06, 0.06]} /><GlowMat intensity={0.15} /></mesh>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 1.1, 10]} />
          <meshStandardMaterial color="#888" metalness={0.9} emissive={LIME} emissiveIntensity={0.12} />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingCube({ position, size = 0.2 }) {
  const ref = useRef();
  useFrame((s) => { ref.current.rotation.x = s.clock.elapsedTime * 0.4; ref.current.rotation.y = s.clock.elapsedTime * 0.3; });
  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.35} transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

function LeftHeroScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[-2, 3, 4]} intensity={0.9} color={LIME} />
      <pointLight position={[2, 1, 2]} intensity={0.4} color={PURPLE} />
      <pointLight position={[0, -1, 3]} intensity={0.35} color={BLUE} />
      <AnalyticsMonitor position={[0.2, 1.2, 0]} />
      <BenchPress position={[0, -1.1, 0.3]} />
    </>
  );
}

function RightHeroScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 3, 4]} intensity={0.9} color={LIME} />
      <pointLight position={[-2, 1, 2]} intensity={0.4} color={PURPLE} />
      <pointLight position={[0, -1, 3]} intensity={0.35} color={BLUE} />
      <StatsScreen position={[-0.1, 1.1, 0]} />
      <SquatRack position={[0, -1, 0.2]} />
    </>
  );
}

function FeatureCubesScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 3]} intensity={0.6} color={LIME} />
      <pointLight position={[-4, 2, 0]} intensity={0.3} color={PURPLE} />
      <FloatingCube position={[-2.5, 0.5, -1]} size={0.18} />
      <FloatingCube position={[2.8, 0.8, 0.5]} size={0.14} />
      <FloatingCube position={[0.5, -0.2, -2]} size={0.12} />
      <FloatingCube position={[-1.2, 1.2, 1]} size={0.1} />
      <FloatingCube position={[1.8, -0.5, -1.5]} size={0.16} />
    </>
  );
}

function ControlPanelScene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[2, 3, 4]} intensity={0.55} color={LIME} />
      <pointLight position={[-3, 1, 2]} intensity={0.25} color={PURPLE} />
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[5, 0.25, 2.5]} />
        <GlowMat intensity={0.06} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
        <group key={x} position={[x, 0.1, 0]}>
          <mesh><boxGeometry args={[0.12, 0.4, 0.12]} /><GlowMat intensity={0.12} /></mesh>
          <mesh position={[0, 0.15 + i * 0.05, 0]}>
            <boxGeometry args={[0.2, 0.06, 0.15]} />
            <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function SceneCanvas({ children, camera }) {
  return (
    <Canvas camera={camera} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

export function HeroSceneLeft() {
  return (
    <div className="hero-3d hero-3d--left" aria-hidden="true">
      <SceneCanvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
        <LeftHeroScene />
      </SceneCanvas>
    </div>
  );
}

export function HeroSceneRight() {
  return (
    <div className="hero-3d hero-3d--right" aria-hidden="true">
      <SceneCanvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
        <RightHeroScene />
      </SceneCanvas>
    </div>
  );
}

export function FeaturesCubes3D() {
  return (
    <div className="features-cubes-3d" aria-hidden="true">
      <SceneCanvas camera={{ position: [0, 1, 6], fov: 50 }}>
        <FeatureCubesScene />
      </SceneCanvas>
    </div>
  );
}

export function BottomScene3D() {
  return (
    <div className="bottom-section__canvas" aria-hidden="true">
      <SceneCanvas camera={{ position: [0, 1.5, 5.5], fov: 48 }}>
        <ControlPanelScene />
      </SceneCanvas>
    </div>
  );
}
