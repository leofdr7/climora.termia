"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  ocean.addColorStop(0, "#001427");
  ocean.addColorStop(0.45, "#003f66");
  ocean.addColorStop(1, "#001f3a");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.9;
  const land = ctx.createLinearGradient(0, 0, canvas.width, 0);
  land.addColorStop(0, "#00ff88");
  land.addColorStop(0.48, "#77c36f");
  land.addColorStop(1, "#009f88");
  ctx.fillStyle = land;

  const continents = [
    [150, 145, 95, 58],
    [245, 218, 62, 96],
    [410, 145, 120, 48],
    [550, 226, 102, 78],
    [705, 138, 82, 44],
    [780, 270, 115, 56],
    [320, 350, 88, 42],
  ];

  continents.forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, -0.25, 0, Math.PI * 2);
    ctx.ellipse(x + rx * 0.45, y + ry * 0.4, rx * 0.48, ry * 0.6, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#d7fff1";
  ctx.lineWidth = 2;
  for (let y = 32; y < canvas.height; y += 34) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 18) {
      const wave = Math.sin((x + y) / 42) * 7;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 70, canvas.height);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export function SpaceEarth() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const texture = createEarthTexture();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.62, 96, 96),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color("#002240"),
        emissiveIntensity: 0.45,
        map: texture ?? undefined,
        metalness: 0.06,
        roughness: 0.72,
      }),
    );
    scene.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.66, 64, 64),
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        opacity: 0.12,
        transparent: true,
        wireframe: true,
      }),
    );
    scene.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.82, 96, 96),
      new THREE.MeshBasicMaterial({
        color: "#00aaff",
        opacity: 0.18,
        side: THREE.BackSide,
        transparent: true,
      }),
    );
    scene.add(atmosphere);

    const orbitGroup = new THREE.Group();
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: "#00ff88",
      opacity: 0.33,
      transparent: true,
    });
    [0, Math.PI / 3, -Math.PI / 4].forEach((rotation, index) => {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(2.18 + index * 0.08, 0.004, 8, 160),
        orbitMaterial,
      );
      orbit.rotation.x = Math.PI / 2.2;
      orbit.rotation.y = rotation;
      orbitGroup.add(orbit);
    });
    scene.add(orbitGroup);

    const satellite = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.12),
      new THREE.MeshBasicMaterial({ color: "#eaffff" }),
    );
    satellite.position.set(2.18, 0.02, 0);
    orbitGroup.add(satellite);

    scene.add(new THREE.AmbientLight("#7dd3fc", 0.7));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(3.4, 2.2, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight("#00ff88", 1.2);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    function resize() {
      if (!mount) return;
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 640;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let animationId = 0;
    const animate = () => {
      if (!prefersReducedMotion) {
        earth.rotation.y += 0.0022;
        earth.rotation.x = -0.12;
        clouds.rotation.y += 0.0012;
        orbitGroup.rotation.z += 0.003;
        orbitGroup.rotation.y += 0.0008;
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      texture?.dispose();
      earth.geometry.dispose();
      clouds.geometry.dispose();
      atmosphere.geometry.dispose();
      orbitGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[42rem]">
      <div className="absolute inset-8 rounded-full bg-cyan-400/15 blur-3xl" />
      <div ref={mountRef} className="relative h-full w-full" aria-hidden="true" />
    </div>
  );
}
