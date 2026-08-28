import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
interface SceneProps {
    progress?: number;
    exploded?: number;
    interactive?: boolean;
    compact?: boolean;
}
function HourMarkers({ z = 0.45 }: {
    z?: number;
}) {
    return <>{Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <mesh key={i} position={[Math.sin(a) * 1.28, Math.cos(a) * 1.28, z]} rotation={[0, 0, -a]}>
      <boxGeometry args={[i % 3 === 0 ? .07 : .035, i % 3 === 0 ? .25 : .16, .035]}/>
      <meshStandardMaterial color="#d9b86d" metalness={1} roughness={.2}/>
    </mesh>;
        })}</>;
}
function Gear({ position, scale = 1 }: {
    position: [
        number,
        number,
        number
    ];
    scale?: number;
}) {
    return <group position={position} scale={scale}>
    <mesh><torusGeometry args={[.38, .055, 8, 24]}/><meshStandardMaterial color="#b58c45" metalness={1} roughness={.28}/></mesh>
    <mesh><cylinderGeometry args={[.1, .1, .08, 24]}/><meshStandardMaterial color="#d3b267" metalness={1} roughness={.24}/></mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} rotation={[0, 0, i * Math.PI / 2]}><boxGeometry args={[.7, .035, .045]}/><meshStandardMaterial color="#8c713f" metalness={1}/></mesh>)}
  </group>;
}
function Watch({ progress = 0, exploded = 0, interactive = false }: SceneProps) {
    const root = useRef<THREE.Group>(null);
    const dial = useRef<THREE.Group>(null);
    const glass = useRef<THREE.Mesh>(null);
    const movement = useRef<THREE.Group>(null);
    const crown = useRef<THREE.Group>(null);
    const pointer = useRef({ x: 0, y: 0 });
    const { viewport } = useThree();
    const small = viewport.width < 6;
    useFrame((state, delta) => {
        if (!root.current)
            return;
        pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, delta * 3);
        pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, delta * 3);
        const p = progress;
        root.current.rotation.y = p * Math.PI * 1.35 + (interactive ? pointer.current.x * .22 : 0);
        root.current.rotation.x = -.12 + Math.sin(p * Math.PI) * .38 + (interactive ? pointer.current.y * .12 : 0);
        root.current.position.x = small ? 0 : Math.sin(p * Math.PI * 2) * .52;
        root.current.position.y = Math.sin(state.clock.elapsedTime * .35) * .04;
        root.current.scale.setScalar((small ? .76 : 1) * (.86 + Math.min(p * 2, 1) * .14));
        if (dial.current)
            dial.current.position.z = .27 + exploded * 1.02;
        if (glass.current)
            glass.current.position.z = .52 + exploded * 1.65;
        if (movement.current)
            movement.current.position.z = -.25 - exploded * 1.16;
        if (crown.current)
            crown.current.position.x = 1.92 + exploded * .88;
    });
    return <group ref={root} rotation={[0, -.5, 0]}>
    <group position={[0, 2.65, -.1]}>
      <mesh><boxGeometry args={[1.52, 3.2, .34]}/><meshStandardMaterial color="#080806" metalness={.7} roughness={.5}/></mesh>
      {[...Array(7)].map((_, i) => <mesh key={i} position={[0, -1.2 + i * .4, .18]}><boxGeometry args={[1.47, .025, .03]}/><meshStandardMaterial color="#5f5137" metalness={1}/></mesh>)}
    </group>
    <group position={[0, -2.65, -.1]}>
      <mesh><boxGeometry args={[1.52, 3.2, .34]}/><meshStandardMaterial color="#080806" metalness={.7} roughness={.5}/></mesh>
      {[...Array(7)].map((_, i) => <mesh key={i} position={[0, -1.2 + i * .4, .18]}><boxGeometry args={[1.47, .025, .03]}/><meshStandardMaterial color="#5f5137" metalness={1}/></mesh>)}
    </group>
    <mesh><torusGeometry args={[1.68, .22, 24, 96]}/><meshStandardMaterial color="#b7914d" metalness={1} roughness={.19}/></mesh>
    <mesh position={[0, 0, -.22]}><cylinderGeometry args={[1.68, 1.68, .42, 96]}/><meshStandardMaterial color="#181713" metalness={.85} roughness={.25}/></mesh>
    <group ref={movement} position={[0, 0, -.25]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.38, 1.38, .13, 64]}/><meshStandardMaterial color="#191813" metalness={.85} roughness={.32}/></mesh>
      <Gear position={[-.43, .34, .12]} scale={1.1}/><Gear position={[.52, -.4, .14]} scale={.82}/><Gear position={[.48, .55, .13]} scale={.55}/>
    </group>
    <group ref={dial} position={[0, 0, .27]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.45, 1.45, .12, 96]}/><meshStandardMaterial color="#070706" metalness={.45} roughness={.22}/></mesh>
      <HourMarkers />
      <mesh position={[0, .19, .53]} rotation={[0, 0, -.6]}><boxGeometry args={[.055, 1.18, .04]}/><meshStandardMaterial color="#e0bf73" metalness={1}/></mesh>
      <mesh position={[.27, .11, .55]} rotation={[0, 0, 1.05]}><boxGeometry args={[.045, .82, .035]}/><meshStandardMaterial color="#d2d0c9" metalness={1}/></mesh>
      <mesh position={[0, 0, .58]}><sphereGeometry args={[.1, 20, 20]}/><meshStandardMaterial color="#c49e58" metalness={1}/></mesh>
    </group>
    <mesh ref={glass} position={[0, 0, .52]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.48, 1.48, .08, 96]}/>
      <meshPhysicalMaterial color="#b7c9c6" transparent opacity={.14} roughness={.02} metalness={0} transmission={.88} thickness={.28}/>
    </mesh>
    <group ref={crown} position={[1.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[.29, .29, .44, 24]}/><meshStandardMaterial color="#b99450" metalness={1} roughness={.23}/></mesh>
      {[...Array(8)].map((_, i) => <mesh key={i} rotation={[0, i * Math.PI / 4, 0]} position={[0, 0, .02]}><boxGeometry args={[.48, .5, .025]}/><meshStandardMaterial color="#93723d" metalness={1}/></mesh>)}
    </group>
  </group>;
}
function Lighting({ interactive = false }: {
    interactive?: boolean;
}) {
    const key = useRef<THREE.SpotLight>(null);
    useFrame(state => {
        if (key.current && interactive) {
            key.current.position.x = 3 + state.pointer.x * 4;
            key.current.position.y = 5 + state.pointer.y * 2;
        }
    });
    return <>
    <ambientLight intensity={.12}/>
    <spotLight ref={key} position={[4, 6, 7]} color="#f3d28a" intensity={90} angle={.3} penumbra={1}/>
    <pointLight position={[-5, -2, 3]} color="#48606e" intensity={24}/>
    <pointLight position={[1, 1, -5]} color="#b27a30" intensity={22}/>
  </>;
}
export function WatchScene(props: SceneProps) {
    const dpr = useMemo(() => Math.min(window.devicePixelRatio, 1.7), []);
    return <div className={props.compact ? 'watch-canvas compact' : 'watch-canvas'} aria-hidden="true" data-buildez-id="be-1c0f18dbc77ed2" data-buildez-kind="element" data-buildez-source-file="src/components/WatchScene.tsx" data-buildez-source-anchor="6400" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
    <Canvas dpr={dpr} camera={{ position: [0, 0, 8.4], fov: 36 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <Suspense fallback={null}>
        <Lighting interactive={props.interactive}/>
        <Float speed={props.interactive ? .8 : .3} rotationIntensity={.05} floatIntensity={.15}>
          <Watch {...props}/>
        </Float>
        <Sparkles count={42} scale={[10, 8, 5]} size={1.4} speed={.16} opacity={.32} color="#d8b66c"/>
      </Suspense>
    </Canvas>
  </div>;
}
