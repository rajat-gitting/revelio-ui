import { Generator, getConfig } from '@tanstack/router-generator';
const config = await getConfig({ target: 'react', autoCodeSplitting: true });
await new Generator({ config, root: process.cwd() }).run();
console.log('routeTree.gen.ts generated');
