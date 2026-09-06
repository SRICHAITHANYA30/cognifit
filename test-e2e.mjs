import http from 'node:http';

const endpoints = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/services/db.ts',
  '/src/services/audioEngine.ts',
  '/src/services/adaptiveEngine.ts',
  '/src/locales/translations.ts',
  '/src/components/common/Navbar.tsx',
  '/src/components/common/DisplaySettingsModal.tsx',
  '/src/components/kiosk/ElderlyHome.tsx',
  '/src/components/reminders/ReminderManager.tsx',
  '/src/components/games/SmritiRongGame.tsx',
  '/src/components/games/MemoryMatrixGame.tsx',
  '/src/components/games/TaalXurGame.tsx',
  '/src/components/games/MugaMotifGame.tsx',
  '/src/components/games/WordScrambleGame.tsx',
  '/src/components/games/MathMazeGame.tsx',
  '/src/components/caregiver/CaregiverDashboard.tsx',
];

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, statusCode: res.statusCode, size: data.length });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing Brainactiver endpoints on http://localhost:5173...');
  let hasFailure = false;
  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    if (res.statusCode === 200) {
      console.log(`✓ ${ep.padEnd(50)} -> 200 OK (${res.size} bytes)`);
    } else {
      console.error(`✗ ${ep.padEnd(50)} -> FAILED:`, res.statusCode || res.error);
      hasFailure = true;
    }
  }
  if (!hasFailure) {
    console.log('\n🌟 ALL 18 ENDPOINTS ARE 100% HEALTHY AND SERVING 200 OK!');
  } else {
    process.exit(1);
  }
}

run();
