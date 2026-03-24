const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let orig = content;

            // Simple line-by-line replace
            const lines = content.split('\n');
            const newLines = lines.map(line => {
                // Ignore lines tightly coupled with gradients where white text is needed
                if (line.includes('bg-gradient-to') || line.includes('bg-[#') || line.includes('bg-emerald-') || line.includes('bg-amber-') || line.includes('bg-red-')) {
                    // Though we could replace other things, let's leave lines with manual bg colors alone for safety 
                    // except if it's very specific text-slate
                }

                let l = line;
                
                // Only replace text-white if not in gradient line
                if (!line.includes('from-') && !line.includes('bg-blue-') && !line.includes('bg-violet-') && !line.includes('bg-emerald-') && !line.includes('bg-amber-') && !line.includes('bg-red-')) {
                   l = l.replace(/\btext-white\b/g, 'text-foreground');
                }

                l = l.replace(/\bbg-white\/5\b/g, 'bg-secondary/50 dark:bg-white/5');
                l = l.replace(/\bbg-white\/10\b/g, 'bg-secondary dark:bg-white/10');
                l = l.replace(/\bhover:bg-white\/5\b/g, 'hover:bg-accent hover:text-accent-foreground');
                l = l.replace(/\bhover:bg-white\/10\b/g, 'hover:bg-accent hover:text-accent-foreground');
                
                l = l.replace(/\bborder-white\/5\b/g, 'border-border dark:border-white/5');
                l = l.replace(/\bborder-white\/10\b/g, 'border-border dark:border-white/10');
                l = l.replace(/\bborder-white\/20\b/g, 'border-border dark:border-white/20');
                
                l = l.replace(/\btext-slate-300\b/g, 'text-foreground/90');
                l = l.replace(/\btext-slate-400\b/g, 'text-muted-foreground');
                l = l.replace(/\btext-slate-500\b/g, 'text-muted-foreground');
                // l = l.replace(/\btext-slate-600\b/g, 'text-muted-foreground/80'); // wait, slate-600 is usually darker, safe to leave or change to text-muted-foreground

                return l;
            });

            const newContent = newLines.join('\n');
            if (orig !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

// processDir(path.join(__dirname, 'app', 'dashboard', 'student'));

// Wait, the above script might be too generic. Let me test it on a specific file first.
let specificFiles = [
    'app/dashboard/student/interviews/practice/page.jsx',
    'app/dashboard/student/coding/page.jsx',
    'app/dashboard/student/interviews/result/page.jsx',
    'app/dashboard/student/interviews/available/page.jsx',
    'app/dashboard/student/interviews/live/page.jsx'
];

for (let file of specificFiles) {
    let p = path.join(__dirname, file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf8');
    let orig = content;
    
    let lines = content.split('\n');
    let newLines = lines.map(line => {
        let l = line;
        
        let hasHardBg = line.includes('from-') || line.includes('bg-blue-') || line.includes('bg-violet-') || line.includes('bg-emerald-') || line.includes('text-emerald-') || line.includes('text-amber-') || line.includes('text-red-');
        
        if (!hasHardBg) {
            l = l.replace(/\btext-white\b/g, 'text-foreground');
        }
        
        l = l.replace(/\bbg-white\/5\b/g, 'bg-secondary/50 dark:bg-white/5');
        l = l.replace(/\bbg-white\/10\b/g, 'bg-secondary dark:bg-white/10');
        l = l.replace(/\bhover:bg-white\/5\b/g, 'hover:bg-accent focus:bg-accent');
        l = l.replace(/\bhover:bg-white\/10\b/g, 'hover:bg-accent focus:bg-accent');
        
        l = l.replace(/\bborder-white\/5\b/g, 'border-border dark:border-white/5');
        l = l.replace(/\bborder-white\/10\b/g, 'border-border dark:border-white/10');
        l = l.replace(/\bborder-white\/20\b/g, 'border-border dark:border-white/20');
        
        l = l.replace(/\btext-slate-300\b/g, 'text-foreground/90 dark:text-slate-300');
        l = l.replace(/\btext-slate-400\b/g, 'text-muted-foreground dark:text-slate-400');
        l = l.replace(/\btext-slate-500\b/g, 'text-muted-foreground dark:text-slate-500');
        l = l.replace(/\btext-slate-600\b/g, 'text-muted-foreground dark:text-slate-600');
        
        return l;
    });
    
    let newContent = newLines.join('\n');
    if (orig !== newContent) {
        fs.writeFileSync(p, newContent, 'utf8');
        console.log('Updated: ' + p);
    }
}
