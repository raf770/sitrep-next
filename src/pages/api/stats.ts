import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });

  const token = process.env.VERCEL_TOKEN;

  try {
    // Get project
    const projectRes = await fetch(
      `https://api.vercel.com/v9/projects/sitrep-next`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const project = await projectRes.json();
    const projectId = project.id;

    const end = Date.now();
    const start = end - 30 * 24 * 60 * 60 * 1000;

    const [timeseriesRes, pagesRes, durationRes] = await Promise.all([
      fetch(
        `https://api.vercel.com/v1/web-analytics/timeseries?projectId=${projectId}&from=${start}&to=${end}&granularity=day`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `https://api.vercel.com/v1/web-analytics/pages?projectId=${projectId}&from=${start}&to=${end}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `https://api.vercel.com/v1/web-analytics/pages?projectId=${projectId}&from=${start}&to=${end}&limit=20&metric=duration`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ]);

    const [timeseries, pages, duration] = await Promise.all([
      timeseriesRes.json(),
      pagesRes.json(),
      durationRes.json(),
    ]);

    // Merge pages with duration
    const pagesData = (pages.data || []).map((p: any) => {
      const dur = (duration.data || []).find((d: any) => d.key === p.key);
      return {
        ...p,
        avgDuration: dur?.avg || dur?.duration || null,
      };
    });

    return res.status(200).json({ timeseries, pages: { data: pagesData }, projectId });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
