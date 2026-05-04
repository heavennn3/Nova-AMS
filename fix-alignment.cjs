const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'settings' && file !== 'auth' && file !== 'components') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Remove justify-center items-center from Card
            if (content.includes('justify-center')) {
                content = content.replace(/justify-center/g, 'justify-start');
                modified = true;
            }
            if (content.includes('items-center justify-start')) {
                content = content.replace(/items-center justify-start/g, 'items-start justify-start p-8');
                modified = true;
            }

            if (content.includes('text-center')) {
                content = content.replace(/text-center/g, 'text-left');
                modified = true;
            }

            if (content.includes('mx-auto')) {
                // If it's a layout mx-auto (like p-8 max-w-7xl mx-auto) keep it, but remove from icons inside card
                content = content.replace(/mx-auto mb/g, 'mb');
                // The icon has mx-auto
                content = content.replace(/w-16 text-muted-foreground\/30 mx-auto/g, 'w-16 text-muted-foreground/30');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated layout for ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'resources/js/pages'));
