import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';

interface ThreeProps {
  audioElement: HTMLAudioElement | null;
}

const Three: React.FC<ThreeProps> = ({ audioElement }) => {
  const vertexShader = `
  varying vec3 vNormal;
uniform float audioData[128];
float displacementScale = 0.01; // Scale factor for displacement

void main() {
    vNormal = normal;
    
    // Get the index within the valid range of the audio data array
    int index = int(mod(float(gl_VertexID), 128.0));
    
    // Retrieve the audio data for the current vertex
    float audioValue = audioData[index];
    
    // Calculate displacement amount based on audio data
    float displacementAmount = audioValue * displacementScale;
    
    // Displace the vertex position along all axes based on its normal
    vec3 newPosition = position + vNormal * displacementAmount;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
  `;

  const fragmentShader = `
  varying vec3 vNormal;

void main() {
    // Get the height (y-coordinate) of the vertex
    float height = vNormal.y;

    // Map the height to a color
    vec3 color = vec3(height, 0.0, 1.0 - height); // Blue to red gradient

    // Output the color
    gl_FragColor = vec4(color, 1.0);
}

`;
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.03);
  const [listener, setListener] = useState<THREE.AudioListener | null>(null);
  const [audio, setAudio] = useState<THREE.Audio | null>(null);
  const [analyser, setAnalyser] = useState<THREE.AudioAnalyser | null>(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null); // State for the canvas element
  const mousePosition = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const newMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        audioData: { value: audioData ? audioData : new Float32Array(256).fill(0) },
        colorA: { value: new THREE.Color(0xff0000) },
        colorB: { value: new THREE.Color(0x0000ff) },
      },
    });

    setMaterial(newMaterial);

    return () => {
      newMaterial.dispose();
    };
  }, [audioData, vertexShader, fragmentShader]);

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
        const float32Array = new Float32Array(dataArray); // Convert Uint8Array to Float32Array
        setAudioData(float32Array);

        // Update the audioData uniform
        if (material) {
          material.uniforms.audioData.value = float32Array;
        }

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
          <icosahedronGeometry args={[4, 10]} />
          {material && <primitive object={material} />}
        </mesh>
      </Canvas>
    </div>
  );
};

export default Three;
