import ParcelBundler from 'parcel-bundler';

const [, , target, inputFile, outFilePath] = process.argv
const [outDir, outFile] = outFilePath.split('/')

const minify = process.env.DEV ? false : true;

if (!(target === "node" || target === "browser")) {
  throw new Error(`invalid target parameter: ${target}`)
}

const bundler = new ParcelBundler(inputFile, {
  target,
  outFile,
  outDir,
  minify,
  watch: false
})

bundler.bundle()