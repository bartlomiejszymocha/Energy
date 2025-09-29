#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const actionsFile = path.join(__dirname, '../constants/actions.ts');
let lastModified = 0;

console.log('🔍 Monitoring actions.ts for changes...');

fs.watchFile(actionsFile, (curr, prev) => {
  if (curr.mtime > lastModified) {
    lastModified = curr.mtime;
    console.log('📝 actions.ts changed! Restarting dev server...');
    
    // Restart dev server
    const { spawn } = require('child_process');
    spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
  }
});

console.log('✅ Watcher started. Press Ctrl+C to stop.');



