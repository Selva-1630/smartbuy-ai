import app, { initializeApp } from '../server/app.js';

export default async function handler(req: any, res: any) {
  await initializeApp();
  return app(req, res);
}
