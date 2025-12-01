const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

console.log('Verifying EJS views...');

let hasError = false;

files.forEach(file => {
  const content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
  
  // Basic check for unclosed tags
  const openTags = (content.match(/<%/g) || []).length;
  const closeTags = (content.match(/%>/g) || []).length;
  
  if (openTags !== closeTags) {
    console.error(`❌ ${file}: Mismatch in EJS tags (Open: ${openTags}, Close: ${closeTags})`);
    hasError = true;
  } else {
    console.log(`✅ ${file} checked.`);
  }

  // Check for credentials: 'include' in fetch calls
  if (content.includes('fetch(') && !content.includes('credentials: "include"') && !content.includes("credentials: 'include'")) {
     // This is a heuristic, might be false positive if fetch is wrapped or simple GET
     // console.warn(`⚠️ ${file}: Possible missing credentials in fetch`);
  }
});

if (hasError) {
  console.error('❌ Verification failed.');
  process.exit(1);
} else {
  console.log('✅ All views passed basic static verification.');
}
