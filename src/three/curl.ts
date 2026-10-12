import * as THREE from 'three'
import { PAGE_W, PAGE_H } from './constants'

/**
 * Real paper does not rotate like a rigid plate — it bends. The curl is injected
 * straight into the vertex shader of the page material (and into a matching
 * depth material so the page's *shadow* bends with it).
 *
 * The page lies in the XZ plane, hinged along Z at x = 0, with the free edge at
 * x = PAGE_W. `uTurn` runs 0 → 1 across a single turn.
 */

export type CurlUniforms = {
  uTurn: { value: number }
  uCurl: { value: number }
  uWidth: { value: number }
  uRipple: { value: number }
}

export function createCurlUniforms(curl = 0.17): CurlUniforms {
  return {
    uTurn: { value: 0 },
    uCurl: { value: curl },
    uWidth: { value: PAGE_W },
    uRipple: { value: 1 },
  }
}

const CURL_COMMON = /* glsl */ `
uniform float uTurn;
uniform float uCurl;
uniform float uWidth;
uniform float uRipple;

float curlProgress() { return clamp( uTurn, 0.0, 1.0 ); }

// Displacement of the sheet along its own normal, as a function of how far
// from the binding it sits (u) and how far through the turn it is.
float curlBend( float u ) {
  float p  = curlProgress();
  float s  = sin( p * 3.14159265 );
  float s2 = sin( p * 6.28318531 );
  // second harmonic makes the sheet bow one way as it lifts, and the other as
  // it settles — the little "wave" real paper does.
  float amp = uCurl * ( s - 0.25 * s2 );
  float ripple = 0.018 * uRipple * u * u * u * sin( u * 9.4247 + p * 9.0 ) * s;
  return ( -u * u * amp ) + ripple;
}
`

const CURL_NORMAL = /* glsl */ `
  float curlU = curlProgress() > 0.0 ? clamp( position.x / uWidth, 0.0, 1.0 ) : 0.0;
  {
    float p  = curlProgress();
    float s  = sin( p * 3.14159265 );
    float s2 = sin( p * 6.28318531 );
    float amp = uCurl * ( s - 0.25 * s2 );
    float dBend = ( -2.0 * curlU * amp ) / uWidth;
    objectNormal = normalize( vec3( -dBend, 1.0, 0.0 ) );
  }
`

const CURL_POSITION = /* glsl */ `
  {
    float curlU2 = curlProgress() > 0.0 ? clamp( position.x / uWidth, 0.0, 1.0 ) : 0.0;
    transformed.y += curlBend( curlU2 );
  }
`

function injectCurl(shader: { uniforms: Record<string, unknown>; vertexShader: string }, uniforms: CurlUniforms) {
  Object.assign(shader.uniforms, uniforms)
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${CURL_COMMON}`)
    .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${CURL_NORMAL}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n${CURL_POSITION}`)
}

type Params = THREE.MeshStandardMaterialParameters & { curl?: number; uniforms?: CurlUniforms }

/** A page material that bends. Exposes its curl uniforms on `userData.curl`. */
export function createPageMaterial({ curl = 0.17, uniforms, ...params }: Params = {}) {
  const shared = uniforms ?? createCurlUniforms(curl)
  const material = new THREE.MeshStandardMaterial(params)
  material.userData.curl = shared
  material.onBeforeCompile = (shader) => injectCurl(shader as never, shared)
  material.customProgramCacheKey = () => 'page-curl'
  return material
}

/** Depth-only twin of the page material, so shadows follow the bend. */
export function createPageDepthMaterial(curl = 0.17, uniforms?: CurlUniforms) {
  const shared = uniforms ?? createCurlUniforms(curl)
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    // a sheet must cast from whichever of its two sides happens to face the key light
    side: THREE.DoubleSide,
  })
  material.userData.curl = shared
  material.onBeforeCompile = (shader) => injectCurl(shader as never, shared)
  material.customProgramCacheKey = () => 'page-curl-depth'
  return material
}

/**
 * A single page face: a plane lying flat in XZ, hinged at x = 0.
 * 32 segments across the width is plenty for a smooth bend.
 */
export function createLeafGeometry(segX = 32, segZ = 4, width = PAGE_W, height = PAGE_H) {
  const geo = new THREE.PlaneGeometry(width, height, segX, segZ)
  geo.rotateX(-Math.PI / 2)
  geo.translate(width / 2, 0, 0)
  return geo
}
