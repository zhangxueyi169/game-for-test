import {defineConfig} from 'vite';
export default defineConfig({
 base:'./',
 build:{outDir:'tmp/offline-build',assetsInlineLimit:64*1024*1024,cssCodeSplit:false,modulePreload:false,
  rollupOptions:{output:{inlineDynamicImports:true}}},
 worker:{format:'iife'},
});
