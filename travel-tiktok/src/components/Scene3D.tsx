import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Plane } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

interface Location {
  name: string;
  coordinates: [number, number];
  country: string;
}

interface Scene3DProps {
  location: Location;
}

// Floating island component for travel destination
function FloatingIsland({ position, location }: { position: [number, number, number], location: Location }) {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main island base */}
      <Box args={[3, 0.5, 3]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Grass top */}
      <Box args={[3.1, 0.1, 3.1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Box>
      
      {/* Palm trees */}
      <group position={[-1, 0.5, -1]}>
        <Box args={[0.2, 1.5, 0.2]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Sphere args={[0.5]} position={[0, 1.8, 0]}>
          <meshStandardMaterial color="#006400" />
        </Sphere>
      </group>
      
      <group position={[1.2, 0.5, 1.2]}>
        <Box args={[0.15, 1.2, 0.15]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Sphere args={[0.4]} position={[0, 1.4, 0]}>
          <meshStandardMaterial color="#006400" />
        </Sphere>
      </group>
      
      {/* Buildings/monuments based on location */}
      {location.name.includes('Greece') && (
        <group position={[0, 0.5, 0]}>
          {/* Greek temple */}
          <Box args={[1.5, 0.8, 1]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color="#F5F5DC" />
          </Box>
          {/* Columns */}
          {[-0.5, 0, 0.5].map((x, i) => (
            <Box key={i} args={[0.1, 0.8, 0.1]} position={[x, 0.4, -0.4]}>
              <meshStandardMaterial color="#F5F5DC" />
            </Box>
          ))}
        </group>
      )}
      
      {location.name.includes('Japan') && (
        <group position={[0, 0.5, 0]}>
          {/* Pagoda */}
          <Box args={[0.8, 0.2, 0.8]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#8B0000" />
          </Box>
          <Box args={[0.6, 0.2, 0.6]} position={[0, 0.35, 0]}>
            <meshStandardMaterial color="#8B0000" />
          </Box>
          <Box args={[0.4, 0.2, 0.4]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#8B0000" />
          </Box>
        </group>
      )}
      
      {location.name.includes('Peru') && (
        <group position={[0, 0.5, 0]}>
          {/* Mountain/pyramid structure */}
          <Box args={[1.2, 0.3, 1.2]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#696969" />
          </Box>
          <Box args={[0.8, 0.3, 0.8]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#696969" />
          </Box>
          <Box args={[0.4, 0.3, 0.4]} position={[0, 0.75, 0]}>
            <meshStandardMaterial color="#696969" />
          </Box>
        </group>
      )}
      
      {/* Location text */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {location.name}
      </Text>
    </group>
  );
}

// Floating particles for atmosphere
function FloatingParticles() {
  const particlesRef = useRef<Mesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        speed: Math.random() * 0.02 + 0.01
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      particle.position[1] += particle.speed;
      if (particle.position[1] > 5) {
        particle.position[1] = -5;
      }
    });
  });

  return (
    <group>
      {particles.map((particle, i) => (
        <Sphere key={i} args={[0.05]} position={particle.position}>
          <meshBasicMaterial color="white" transparent opacity={0.6} />
        </Sphere>
      ))}
    </group>
  );
}

// Ocean/water plane
function Ocean() {
  const oceanRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (oceanRef.current) {
      oceanRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 2;
    }
  });

  return (
    <Plane ref={oceanRef} args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial color="#006994" transparent opacity={0.8} />
    </Plane>
  );
}

export default function Scene3D({ location }: Scene3DProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff9500" />
      
      {/* Environment */}
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 10, 50]} />
      
      {/* Main island */}
      <FloatingIsland position={[0, 0, 0]} location={location} />
      
      {/* Additional smaller islands */}
      <FloatingIsland position={[-8, -1, -5]} location={{...location, name: 'Island View'}} />
      <FloatingIsland position={[8, -0.5, -8]} location={{...location, name: 'Remote Spot'}} />
      
      {/* Ocean */}
      <Ocean />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Clouds */}
      <group position={[-10, 8, -10]}>
        <Sphere args={[1.5]} position={[0, 0, 0]}>
          <meshBasicMaterial color="white" transparent opacity={0.8} />
        </Sphere>
        <Sphere args={[1.2]} position={[2, 0, 1]}>
          <meshBasicMaterial color="white" transparent opacity={0.7} />
        </Sphere>
        <Sphere args={[1]} position={[3.5, 0.2, 0.5]}>
          <meshBasicMaterial color="white" transparent opacity={0.6} />
        </Sphere>
      </group>
      
      <group position={[12, 6, -15]}>
        <Sphere args={[2]} position={[0, 0, 0]}>
          <meshBasicMaterial color="white" transparent opacity={0.7} />
        </Sphere>
        <Sphere args={[1.5]} position={[-2.5, 0.5, 1]}>
          <meshBasicMaterial color="white" transparent opacity={0.6} />
        </Sphere>
      </group>
    </>
  );
}