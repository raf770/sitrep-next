import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });

  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID || "";

  try {
    // Get project ID first
    const projectRes = await fetch(
      `https://api.vercel.com/v9/projects/sitrep-next${teamId ? `?teamId=${teamId}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const project = await projectRes.json();
    const projectId = project.id;

    // Get analytics data - last 30 days
    const end = Date.now();
    const start = end - 30 * 24 * 60 * 60 * 1000;

    const [webRes, pageRes] = await Promise.all([
      fetch(
        `https://api.vercel.com/v1/web-analytics/timeseries?projectId=${projectId}&from=${start}&to=${end}&granularity=day${teamId ? `&teamId=${teamId}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `https://api.vercel.com/v1/web-analytics/pages?projectId=${projectId}&from=${start}&to=${end}&limit=10${teamId ? `&teamId=${teamId}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ]);

    const [timeseries, pages] = await Promise.all([webRes.json(), pageRes.json()]);

    return res.status(200).json({ timeseries, pages, projectId });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
