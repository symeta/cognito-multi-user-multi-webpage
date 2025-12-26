const http = require('http');
const url = require('url');
const { execSync } = require('child_process');

const CONFIG = { clientId: '<specific client id>',
domain: '<specific domain id>',
redirectUri: 'http://localhost:3000/callback', bucket: '<specific bucket name>' };

const userImages = { 'wsy1': '1.png', 'wsy2': '2.png' };

function exchangeCodeForTokens(code) {
  const body = `grant_type=authorization_code&client_id=${CONFIG.clientId}&code=${code}&redirect_uri=${encodeURIComponent(CONFIG.redirectUri)}`;
  const result = execSync(`curl -s -X POST "https://${CONFIG.domain}/oauth2/token" -H "Content-Type: application/x-www-form-urlencoded" -d '${body}'`);
  return JSON.parse(result.toString());
}

function getPresignedUrl(key) {
  return execSync(`aws s3 presign s3://${CONFIG.bucket}/${key} --expires-in 3600 --region us-east-1`).toString().trim();
}

function decodeJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);

  if (parsed.pathname === '/') {
    res.writeHead(302, { Location: `https://${CONFIG.domain}/login?client_id=${CONFIG.clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(CONFIG.redirectUri)}` });
    res.end();
  } else if (parsed.pathname === '/callback') {
    try {
      const tokens = exchangeCodeForTokens(parsed.searchParams.get('code'));
      if (tokens.error) throw new Error(tokens.error);
      const claims = decodeJwt(tokens.id_token);
      const username = claims['cognito:username'];
      const imageKey = userImages[username];
      if (!imageKey) { res.writeHead(403); res.end('Access denied'); return; }
      const imageUrl = getPresignedUrl(imageKey);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0"><img src="${imageUrl}" style="max-width:90%;max-height:90%"></body></html>`);
    } catch (e) { res.writeHead(500); res.end('Auth error: ' + e.message); }
  } else { res.writeHead(404); res.end('Not found'); }
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
