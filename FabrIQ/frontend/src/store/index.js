import { proxy } from 'valtio';

const state=proxy({
  intro: true,
  color: '#6F6256',
  isLogoTexture: true,
  isFullTexture: true,
  logoDecal:'./logo.webp',
  fullDecal:'./fullTexture.png',
});
export default state;