import { withStyleX } from 'stylex-webpack/next';

export default withStyleX({
  stylexOption: {
    unstable_moduleResolution: { type: 'commonJS', rootDir: process.cwd() }
  }
})({
  reactCompiler: true,
  output: 'export'
});
