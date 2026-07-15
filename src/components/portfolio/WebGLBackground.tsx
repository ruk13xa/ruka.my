'use client';

import { useEffect, useRef } from 'react';

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;

      const lowPower =
        window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !lowPower,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 22;

      const NODE_COUNT = lowPower ? 22 : 46;
      const spread = 16;
      const nodes: { pos: InstanceType<typeof THREE.Vector3>; vel: InstanceType<typeof THREE.Vector3> }[] = [];
      const positions = new Float32Array(NODE_COUNT * 3);
      for (let i = 0; i < NODE_COUNT; i++) {
        const p = new THREE.Vector3(
          (Math.random() - 0.5) * spread * 2,
          (Math.random() - 0.5) * spread * 1.2,
          (Math.random() - 0.5) * spread
        );
        nodes.push({
          pos: p,
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.006),
        });
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
      const ptsGeo = new THREE.BufferGeometry();
      ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const ptsMat = new THREE.PointsMaterial({
        color: 0x7fe8ff,
        size: 0.16,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(ptsGeo, ptsMat);
      scene.add(points);

      const maxLines = NODE_COUNT * 8;
      const linePositions = new Float32Array(maxLines * 2 * 3);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x5ee7ff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);

      const linkDist = 6.2;
      const shapes: InstanceType<typeof THREE.Mesh>[] = [];
      const shapeGeo = new THREE.IcosahedronGeometry(2.4, 0);
      const shapeDefs: [number, number, number, number][] = lowPower
        ? [
            [-9, 3, -4, 0x5ee7ff],
            [10, -4, -8, 0x9a7bff],
          ]
        : [
            [-9, 3, -4, 0x5ee7ff],
            [10, -4, -8, 0x9a7bff],
            [4, 6, -10, 0x5ee7ff],
          ];
      shapeDefs.forEach(([x, y, z, color]) => {
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.28 });
        const mesh = new THREE.Mesh(shapeGeo, mat);
        mesh.position.set(x, y, z);
        const spin = new THREE.Vector3(
          (Math.random() - 0.5) * 0.0015,
          (Math.random() - 0.5) * 0.0018,
          (Math.random() - 0.5) * 0.0012
        );
        mesh.userData.spin = spin;
        scene.add(mesh);
        shapes.push(mesh);
      });

      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);

      let raf = 0;
      const onVisibilityChange = () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else animate();
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const animate = () => {
        if (document.hidden) return;
        raf = requestAnimationFrame(animate);
        nodes.forEach((n, i) => {
          n.pos.add(n.vel);
          (['x', 'y', 'z'] as const).forEach((ax) => {
            if (Math.abs(n.pos[ax]) > spread) n.vel[ax] *= -1;
          });
          positions[i * 3] = n.pos.x;
          positions[i * 3 + 1] = n.pos.y;
          positions[i * 3 + 2] = n.pos.z;
        });
        ptsGeo.attributes.position.needsUpdate = true;

        let vi = 0;
        for (let i = 0; i < NODE_COUNT && vi < maxLines; i++) {
          for (let j = i + 1; j < NODE_COUNT && vi < maxLines; j++) {
            const d = nodes[i].pos.distanceTo(nodes[j].pos);
            if (d < linkDist) {
              linePositions[vi * 6] = nodes[i].pos.x;
              linePositions[vi * 6 + 1] = nodes[i].pos.y;
              linePositions[vi * 6 + 2] = nodes[i].pos.z;
              linePositions[vi * 6 + 3] = nodes[j].pos.x;
              linePositions[vi * 6 + 4] = nodes[j].pos.y;
              linePositions[vi * 6 + 5] = nodes[j].pos.z;
              vi++;
            }
          }
        }
        lineGeo.setDrawRange(0, vi * 2);
        lineGeo.attributes.position.needsUpdate = true;

        shapes.forEach((m) => {
          const spin = m.userData.spin as InstanceType<typeof THREE.Vector3>;
          m.rotation.x += spin.x;
          m.rotation.y += spin.y;
          m.rotation.z += spin.z;
        });

        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
        camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        renderer.dispose();
        ptsGeo.dispose();
        lineGeo.dispose();
        shapeGeo.dispose();
        ptsMat.dispose();
        lineMat.dispose();
        shapes.forEach((m) => (m.material as InstanceType<typeof THREE.Material>).dispose());
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.9 }}
    />
  );
}
