import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

const GH_TOKEN = process.env.GH_TOKEN;
const GH_USER = "raf770";
const GH_REPO = "sitrep-next";

async function getFileSha(path: string) {
  const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${path}`, {
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" }
  });
  if (r.ok) { const d = await r.json(); return d.sha; }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });
  if (req.method !== "POST") return res.status(405).end();

  const { path, content, message } = req.body;
  const sha = await getFileSha(path);

  const body: any = {
    message: message || "Update content",
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `token ${GH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (r.ok) return res.status(200).json({ ok: true });
  return res.status(500).json({ error: "Erreur GitHub" });
}
