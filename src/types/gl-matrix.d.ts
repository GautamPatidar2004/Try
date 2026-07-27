// Temporary local typings shim for gl-matrix.
//
// Reason: The upstream package's .d.ts currently triggers TS1540 under our TypeScript version.
// This shim prevents TypeScript from loading/parsing node_modules/gl-matrix typings.
//
// If you later need strict typing for gl-matrix, we can replace these `any` exports with real types.

declare module "gl-matrix" {
  export const glMatrix: any;
  export const mat2: any;
  export const mat2d: any;
  export const mat3: any;
  export const mat4: any;
  export const quat: any;
  export const quat2: any;
  export const vec2: any;
  export const vec3: any;
  export const vec4: any;
}
