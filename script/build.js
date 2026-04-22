const fs = require('fs')
const path = require('path')

const IGNORE = ['build', 'node_modules', '.git', 'script']

// copio la directory
function copyDir(src, dest) {
    // uso il modulo fs
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach(file => {
        if (IGNORE.includes(file)) return;

        const srcPath = path.join(src, file)
        const destPath = path.join(dest, file)

        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    })
}

// chrome - usa manifest.json
copyDir('.', './build/chrome')
fs.copyFileSync('manifest.json', './build/chrome/manifest.json')

// freifox merge manifest base + il manifest per firefox
const base = JSON.parse(fs.readFileSync('manifest.json'))
const ff = JSON.parse(fs.readFileSync('manifest.firefox.json'))
const ffManifest = { ...base, ...ff };

copyDir('.', './build/firefox')
fs.writeFileSync(
    './build/firefox/manifest.json',
    JSON.stringify(ffManifest, null, 2)
)

// log
console.log('Build completed -> build/chrome e build/firefox')
