// api/status.js

export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    service: "BROKEN LORD Nexray Bot",
    status: "online",
    timestamp: Date.now()
  });
}
