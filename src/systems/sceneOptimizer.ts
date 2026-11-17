import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface OptimizeStats {
  meshesBefore: number;
  meshesAfter: number;
  mergedMeshes: number;
  removedMeshes: number;
}

interface Bucket {
  material: THREE.Material;
  castShadow: boolean;
  receiveShadow: boolean;
  geometries: THREE.BufferGeometry[];
}

/**
 * Stable value signature for a material. Prop builders often instantiate dozens
 * of visually identical MeshStandardMaterials; bucketing by uuid would leave
 * every one as a separate draw call, so compare the parameters that actually
 * affect the rendered result instead.
 */
function materialSignature(material: THREE.Material): string {
  const m = material as THREE.MeshStandardMaterial & {
    clearcoat?: number;
    transmission?: number;
    ior?: number;
    thickness?: number;
    sheen?: number;
  };
  const tex = (t: THREE.Texture | null | undefined) =>
    t ? `${t.uuid}:${t.repeat.x.toFixed(3)}:${t.repeat.y.toFixed(3)}` : 'none';
  const map = tex(m.map);
  const color = m.color ? m.color.getHexString() : 'no-color';
  const emissive = m.emissive ? m.emissive.getHexString() : 'no-emissive';
  return [
    material.type,
    color,
    map,
    tex(m.normalMap),
    tex(m.roughnessMap),
    tex(m.metalnessMap),
    tex(m.alphaMap),
    tex(m.emissiveMap),
    tex(m.aoMap),
    m.roughness,
    m.metalness,
    emissive,
    m.emissiveIntensity,
    m.transparent,
    m.opacity,
    m.alphaTest,
    m.side,
    m.depthWrite,
    m.vertexColors,
    m.clearcoat ?? '',
    m.transmission ?? '',
    m.ior ?? '',
    m.thickness ?? '',
    m.sheen ?? '',
  ].join('|');
}

/**
 * Collapse static scenery into one mesh per material.
 *
 * Levels are built from hundreds of small prop meshes. Merging everything that
 * never animates cuts draw calls dramatically, which is the main bottleneck on
 * mid-range Android phones. Animated nodes (ceiling fan, boss shadows, etc.) are
 * passed in as `animatedRoots` and left untouched.
 */
export function mergeStaticEnvironment(
  root: THREE.Object3D,
  animatedRoots: Array<THREE.Object3D | undefined | null> = []
): OptimizeStats {
  root.updateMatrixWorld(true);

  const skip = new Set<THREE.Object3D>();
  for (const animated of animatedRoots) {
    if (!animated) continue;
    animated.traverse((child) => skip.add(child));
  }

  // Bucket by material, vertex-attribute layout and shadow flags so
  // mergeGeometries never receives incompatible geometry (e.g. missing UVs)
  // and shadow settings survive the merge.
  const buckets = new Map<string, Bucket>();
  const originalMeshes: Array<{ mesh: THREE.Mesh; key: string }> = [];

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || skip.has(mesh)) return;
    if ((mesh as unknown as { isInstancedMesh?: boolean }).isInstancedMesh) return;
    if ((mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh) return;
    if (Array.isArray(mesh.material)) return;
    if (!mesh.geometry?.getAttribute('position')) return;

    const attrs = Object.keys(mesh.geometry.attributes).sort().join(',');
    const key = `${materialSignature(mesh.material)}|${attrs}|${mesh.castShadow ? 1 : 0}${mesh.receiveShadow ? 1 : 0}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        material: mesh.material,
        castShadow: mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
        geometries: [],
      };
      buckets.set(key, bucket);
    }

    const cloned = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    cloned.applyMatrix4(mesh.matrixWorld);
    bucket.geometries.push(cloned);
    originalMeshes.push({ mesh, key });
  });

  const mergedKeys = new Set<string>();
  let mergedMeshes = 0;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.geometries.length < 2) {
      for (const geo of bucket.geometries) geo.dispose();
      continue;
    }

    const mergedGeometry = mergeGeometries(bucket.geometries, false);
    for (const geo of bucket.geometries) geo.dispose();

    if (!mergedGeometry) {
      console.warn('[SceneOptimizer] Skipped incompatible material bucket');
      continue;
    }

    mergedGeometry.computeBoundingSphere();
    const mergedMesh = new THREE.Mesh(mergedGeometry, bucket.material);
    mergedMesh.castShadow = bucket.castShadow;
    mergedMesh.receiveShadow = bucket.receiveShadow;
    mergedMesh.matrixAutoUpdate = false;
    mergedMesh.name = 'merged-static-scenery';
    root.add(mergedMesh);
    mergedKeys.add(key);
    mergedMeshes += 1;
  }

  let removedMeshes = 0;
  for (const { mesh, key } of originalMeshes) {
    if (!mergedKeys.has(key)) continue;
    mesh.parent?.remove(mesh);
    removedMeshes += 1;
  }

  return {
    meshesBefore: originalMeshes.length,
    meshesAfter: originalMeshes.length - removedMeshes + mergedMeshes,
    mergedMeshes,
    removedMeshes,
  };
}
