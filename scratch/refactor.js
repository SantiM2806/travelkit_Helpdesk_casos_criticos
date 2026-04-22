const fs = require('fs');
const path = require('path');

// 1. Create directories
const dirs = [
  'src/features/tickets/components',
  'src/features/tickets/actions',
  'src/features/tickets/types',
  'src/features/tickets/utils',
  'src/components/common',
  'src/components/layout'
];
dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// 2. Move files
const moves = [
  ['src/components/KanbanBoard.tsx', 'src/features/tickets/components/KanbanBoard.tsx'],
  ['src/components/TicketTable.tsx', 'src/features/tickets/components/TicketTable.tsx'],
  ['src/components/StatsBar.tsx', 'src/features/tickets/components/StatsBar.tsx'],
  ['src/components/FiltersRow.tsx', 'src/features/tickets/components/FiltersRow.tsx'],
  ['src/components/NuevaSolicitudModal.tsx', 'src/features/tickets/components/NuevaSolicitudModal.tsx'],
  
  ['src/lib/validation.ts', 'src/features/tickets/utils/validations.ts'],
  ['src/lib/types.ts', 'src/features/tickets/types/index.ts'],
  ['src/lib/data.ts', 'src/features/tickets/actions/ticket.actions.ts'],
  
  ['src/components/Modal.tsx', 'src/components/common/Modal.tsx'],
  ['src/components/ToastContainer.tsx', 'src/components/common/ToastContainer.tsx'],
  
  ['src/components/Header.tsx', 'src/components/layout/Header.tsx'],
  ['src/components/ConfigBanner.tsx', 'src/components/layout/ConfigBanner.tsx']
];

moves.forEach(([src, dest]) => {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} to ${dest}`);
  }
});

// 3. Extract formatters from utils.ts to formatters.ts
const utilsPath = 'src/lib/utils.ts';
if (fs.existsSync(utilsPath)) {
  const content = fs.readFileSync(utilsPath, 'utf8');
  const cnMatch = content.match(/import { clsx, type ClassValue } from "clsx"[\s\S]*?twMerge\(clsx\(inputs\)\)\n}/);
  if (cnMatch) {
    const cnCode = cnMatch[0] + '\n';
    fs.writeFileSync(utilsPath, cnCode);
    const formattersCode = content.replace(cnMatch[0], '').trim();
    fs.writeFileSync('src/features/tickets/utils/formatters.ts', formattersCode);
    console.log('Extracted formatters.ts');
  }
}

// 4. Global Import Updates
const importMap = {
  '@/components/KanbanBoard': '@/features/tickets/components/KanbanBoard',
  '@/components/TicketTable': '@/features/tickets/components/TicketTable',
  '@/components/StatsBar': '@/features/tickets/components/StatsBar',
  '@/components/FiltersRow': '@/features/tickets/components/FiltersRow',
  '@/components/NuevaSolicitudModal': '@/features/tickets/components/NuevaSolicitudModal',
  
  '@/lib/validation': '@/features/tickets/utils/validations',
  '@/lib/types': '@/features/tickets/types',
  '@/lib/data': '@/features/tickets/actions/ticket.actions',
  
  '@/components/Modal': '@/components/common/Modal',
  '@/components/ToastContainer': '@/components/common/ToastContainer',
  
  '@/components/Header': '@/components/layout/Header',
  '@/components/ConfigBanner': '@/components/layout/ConfigBanner',
};

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  });
}

walk('src', (p) => {
  if (p.endsWith('.tsx') || p.endsWith('.ts')) {
    let code = fs.readFileSync(p, 'utf8');
    let original = code;

    // A. Replace mapped imports
    Object.entries(importMap).forEach(([oldPath, newPath]) => {
      const regex = new RegExp(`['"]${oldPath}['"]`, 'g');
      code = code.replace(regex, `'${newPath}'`);
    });

    // B. Fix Formatters Import
    // Files that used to import formatters from @/lib/utils
    const formatters = ['normalizeEstado', 'formatDate', 'getSyncTimeStr', 'badgePrioridad', 'badgeEstado', 'badgeCat'];
    const hasFormatters = formatters.some(f => code.includes(f));
    
    if (hasFormatters && p.replace(/\\/g, '/') !== 'src/features/tickets/utils/formatters.ts') {
      // If it imports from @/lib/utils, we need to split it or replace it
      // Let's see if it also imports cn
      if (code.includes('import { cn } from "@/lib/utils"')) {
        // Just add the new import for formatters
        code = `import {\n  normalizeEstado,\n  formatDate,\n  getSyncTimeStr,\n  badgePrioridad,\n  badgeEstado,\n  badgeCat\n} from "@/features/tickets/utils/formatters";\n` + code;
      } else {
        // It might be import { normalizeEstado, badgePrioridad } from "@/lib/utils"
        // Let's replace the whole path for these. 
        code = code.replace(/['"]@\/lib\/utils['"]/g, `'@/features/tickets/utils/formatters'`);
      }
    }

    if (code !== original) {
      fs.writeFileSync(p, code);
      console.log(`Updated imports in ${p}`);
    }
  }
});
