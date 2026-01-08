import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import { Float, Environment, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";

// --- REUSABLE WAVING MESH (For Borders, Main Note, and Stack Top) ---
function WavingLayer({ color, width, height, zOffset, active, speedMultiplier = 1.0, roughness = 0.4 }) {
  const meshRef = useRef();
  
  // High segment count for smooth curves
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height, 40, 40), [width, height]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const posAttribute = meshRef.current.geometry.attributes.position;
    
    // WAVE CONFIGURATION
    // Slower speed for elegance (approx 1.5 - 2.5)
    // Amplitude increases slightly when active
    const speed = 2.0 * speedMultiplier; 
    const amp = active ? 0.12 : 0.04; 
    
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      // Sine wave flowing across X axis
      const waveZ = Math.sin(x * 1.2 + time * speed) * amp;
      posAttribute.setZ(i, waveZ);
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, zOffset, 0]}>
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={0.1} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

// --- THE COMPOSITE NOTE (Border + Inner + Decor) ---
function DetailedNote({ active, hovered }) {
    return (
        <group>
            {/* 1. Dark Green Border Layer (Slightly Larger) */}
            <WavingLayer 
                color="#1a3311" // Dark Hunter Green
                width={4.3} 
                height={2.3} 
                zOffset={0} 
                active={active} 
            />

            {/* 2. Light Green Inner Layer (Slightly Smaller, sits on top) */}
            <WavingLayer 
                color="#98cf78" // Money Green
                width={4.0} 
                height={2.0} 
                zOffset={0.015} // Tiny offset to prevent Z-fighting
                active={active} 
                roughness={0.6}
            />

            {/* 3. The Dollar Sign (Static relative to group, floats above wave) */}
            {/* We position it slightly higher so the wave doesn't clip it */}
            <Text
                position={[0, 0.15, 0]} 
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                fontSize={1.2}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                fontWeight="bold"
                color="#1a3311"
                anchorX="center"
                anchorY="middle"
            >
                $
            </Text>
            
            {/* 4. Circular Corner Decorations (Simulated with text or small meshes) */}
            {/* Using simple dots to mimic 'circular vertices' design */}
            <mesh position={[-1.8, 0.03, -0.8]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial color="#1a3311" />
            </mesh>
            <mesh position={[1.8, 0.03, -0.8]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial color="#1a3311" />
            </mesh>
            <mesh position={[-1.8, 0.03, 0.8]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial color="#1a3311" />
            </mesh>
            <mesh position={[1.8, 0.03, 0.8]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[0.1, 16]} />
                <meshStandardMaterial color="#1a3311" />
            </mesh>
        </group>
    )
}

function SleepingBundle({ position, rotation }) {
  const bottomStackRef = useRef();
  const topBillGroupRef = useRef();
  
  const [active, setActive] = useState(false);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (!topBillGroupRef.current || !bottomStackRef.current) return;
    
    // Animate Lift: Smooth floating up
    const targetTopY = active ? 1.5 : 0.23;
    topBillGroupRef.current.position.y = THREE.MathUtils.lerp(topBillGroupRef.current.position.y, targetTopY, 0.08);

    // Animate Push Down: Gentle compression
    const targetBottomY = active ? -0.2 : 0;
    bottomStackRef.current.position.y = THREE.MathUtils.lerp(bottomStackRef.current.position.y, targetBottomY, 0.1);
  });

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); setActive(!active); }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* === BOTTOM STACK === */}
      <group ref={bottomStackRef}>
        {/* The Block (Bulk) */}
        <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[4.2, 0.7, 2.2]} /> 
            <meshStandardMaterial color="#6a9e4d" roughness={0.7} />
        </mesh>
        
        {/* The "False Top" Paper Layer */}
        {/* This creates the illusion that the stack underneath is also wavy paper */}
        <group position={[0, 0.15, 0]}>
            <WavingLayer 
                color="#6a9e4d" 
                width={4.2} 
                height={2.2} 
                zOffset={0} 
                active={false} // Always gentle wave
                speedMultiplier={0.8} // Slightly different speed for variation
            />
        </group>

        {/* The White Strap */}
        <mesh position={[0, -0.2, 0]} scale={[1.02, 1.05, 1.02]}>
            <boxGeometry args={[1, 0.8, 2.25]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* === TOP DETAILED BILL === */}
      <group ref={topBillGroupRef} position={[0, 0.23, 0]}>
        <DetailedNote active={active} hovered={hovered} />
      </group>
    </group>
  );
}

export default function ThreeCurrencyStack() {
  return (
    <div className="h-[600px] w-full">
      <Canvas camera={{ position: [0, 5, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[2, 8, 2]} angle={0.5} penumbra={0.5} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -2, -5]} intensity={0.5} color="#b4f500" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
           <SleepingBundle position={[0, 0, 0]} rotation={[0.1, -0.3, 0]} />
        </Float>
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={3} far={4} color="#000000" />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}