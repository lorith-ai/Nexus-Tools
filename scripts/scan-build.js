
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
// Patterns to search for
const PATTERNS = [
    { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/ },
    { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
    { name: 'Firebase Service Account', regex: /"type": "service_account"/ },
    { name: 'Generic Secret', regex: /(api_key|access_token|secret)[\s=:"']{1,5}[A-Za-z0-9-_]{16,}/i }
];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    let hasError = false;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (scanDir(filePath)) hasError = true;
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json'))) {
            const content = fs.readFileSync(filePath, 'utf8');
            for (const pattern of PATTERNS) {
                if (pattern.regex.test(content)) {
                    console.error(`[SEC-FAIL] Found ${pattern.name} in build artifact: ${filePath}`);
                    // Print snippet (safely?)
                    // console.error(content.match(pattern.regex)[0]);
                    hasError = true;
                }
            }
        }
    }
    return hasError;
}

console.log('🔍 Scanning build directory for using secrets...');
if (scanDir(DIST_DIR)) {
    console.error('❌ Security check failed: Secrets detected in build artifacts!');
    process.exit(1);
} else {
    console.log('✅ Security check passed: No secrets found in verified file types.');
    process.exit(0);
}
