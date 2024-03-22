import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';

interface ThreeProps {
  audioElement: HTMLAudioElement | null;
}

const Three: React.FC<ThreeProps> = ({ audioElement }) => {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.03);
  const [listener, setListener] = useState<THREE.AudioListener | null>(null);
  const [audio, setAudio] = useState<THREE.Audio | null>(null);
  const [analyser, setAnalyser] = useState<THREE.AudioAnalyser | null>(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null); // State for the canvas element
  const mousePosition = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

  const randomDirection = () => {
    const randomVector = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    randomVector.normalize();
    return randomVector;
  };

  const [rotationAxis, setRotationAxis] = useState(randomDirection());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotationAxis(randomDirection());
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (audioElement) {
      const newListener = new THREE.AudioListener();
      const newAudio = new THREE.Audio(newListener);
      newAudio.setMediaElementSource(audioElement);

      const newAnalyser = new THREE.AudioAnalyser(newAudio, 256);

      setListener(newListener);
      setAudio(newAudio);
      setAnalyser(newAnalyser);
    }

    return () => {
      if (audio) {
        audio.disconnect();
        setAudio(null);
      }
      if (listener) {
        setListener(null);
      }
      if (analyser) {
        setAnalyser(null);
      }
    };
  }, [audioElement]);

  const update = () => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationAxis.x * rotationSpeed;
      meshRef.current.rotation.y += rotationAxis.y * rotationSpeed;
      meshRef.current.rotation.z += rotationAxis.z * rotationSpeed;
    }

    if (analyser) {
      try {
        const dataArray = analyser.getFrequencyData();
        setAudioData(dataArray);
        console.log("Audio data:", dataArray);
      } catch (error) {
        console.error("Error during audio analysis:", error);
      }
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    setIsMouseDown(true);
    mousePosition.current = { clientX: event.clientX, clientY: event.clientY };
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown || !meshRef.current || !canvas) return;

    const { clientX: currentX, clientY: currentY } = event;
    const { clientX: startX, clientY: startY } = mousePosition.current;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Calculate the rotation direction based on mouse movement
    const rotationDirection = new THREE.Vector3(deltaY, -deltaX, 0).normalize();

    // Adjust the rotation speed based on the distance dragged by the mouse
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDragDistance = Math.min(canvas.clientWidth, canvas.clientHeight);
    const maxRotationSpeed = 0.2; // Maximum rotation speed
    const minRotationSpeed = 0.03; // Minimum rotation speed
    const dragRatio = Math.min(dragDistance / maxDragDistance, 1); // Normalize drag distance

    // Calculate the new rotation speed based on drag distance
    const newRotationSpeed = minRotationSpeed + (maxRotationSpeed - minRotationSpeed) * dragRatio;

    setRotationSpeed(newRotationSpeed);

    // Apply rotation to the mesh
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationDirection.x * rotationSpeed;
      meshRef.current.rotation.y += rotationDirection.y * rotationSpeed;
      meshRef.current.rotation.z += rotationDirection.z * rotationSpeed;
    }

    // Update mouse position for the next move
    mousePosition.current = { clientX: currentX, clientY: currentY };
  };

  useEffect(() => {
    const canvasElement = canvas;
    if (!canvasElement) return;

    console.log("Added Mouse Listeners")

    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('mouseup', handleMouseUp);
    canvasElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      canvasElement.removeEventListener('mouseup', handleMouseUp);
      canvasElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, handleMouseDown, handleMouseUp, handleMouseMove]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Pass a custom setter function to update the canvas state */}
      <Canvas
        style={{ background: 'black' }}
        shadows={true}
        camera={{
          position: [-6, 7, 7],
        }}
        onCreated={({ gl }) => {
          // Set the canvas reference using the setter function
          if (gl.domElement) {
            setCanvas(gl.domElement);
          }

          gl.setAnimationLoop(() => {
            update();
          });
        }}
      >
        <ambientLight intensity={1.0} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <mesh position={[0, 0, 0]} ref={meshRef}>
          <icosahedronGeometry args={[5, 10]} />
          <meshStandardMaterial wireframe={true} color="white" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Three;
