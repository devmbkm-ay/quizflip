import { networkInterfaces } from 'os';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// 1. Récupérer l'adresse IP locale
const nets = networkInterfaces();
let localIp = 'localhost';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // On cherche une adresse IPv4 qui n'est pas interne (127.0.0.1)
    if (net.family === 'IPv4' && !net.internal) {
      localIp = net.address;
      break;
    }
  }
}

// 2. Mettre à jour le fichier .env
const envPath = join(process.cwd(), '.env');
const apiUrl = `http://${localIp}:5000/api`;
const envContent = `VITE_API_URL=${apiUrl}\n`;

try {
  writeFileSync(envPath, envContent);
  console.log(`✅ Fichier .env mis à jour !`);
  console.log(`📱 Adresse API pour mobile : ${apiUrl}`);
} catch (err) {
  console.error(`❌ Erreur lors de l'écriture du .env :`, err);
}
