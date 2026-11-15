const fs = require('fs');

const ipcRaw = JSON.parse(
  fs.readFileSync('C:/Users/bhara/.gemini/antigravity/brain/ecd8dbf1-a24f-4a17-94c6-b35f10a2a4a8/scratch/ipc_channels.json', 'utf8')
);

module.exports = {
  handles: ipcRaw.handles,
  ons: ipcRaw.ons
};
