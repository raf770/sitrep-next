import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

async function getGoogleToken() {
  const email = process.env.GA_CLIENT_EMAIL!;
  const key = process.env.GA_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const propertyId = process.env.GA_PROPERTY_ID!;

  // Create JWT
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const headerB64 = encode(header);
  const claimB64 = encode(claim);
  const unsigned = `${headerB64}.${claimB64}`;

  // Sign with private key using crypto
  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(key, "base64url");
  const jwt = `${unsigned}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });

  try {
    const token = await getGoogleToken();
    const propertyId = process.env.GA_PROPERTY_ID!;

    const body = {
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "averageSessionDuration" },
        { name: "activeUsers" },
      ],
      dimensions: [{ name: "pagePath" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 20,
    };

    const [reportRes, realtimeRes, timeseriesRes] = await Promise.all([
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: [{ name: "activeUsers" }],
        }),
      }),
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
          dimensions: [{ name: "date" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        }),
      }),
    ]);

    const [report, realtime, timeseries] = await Promise.all([
      reportRes.json(),
      realtimeRes.json(),
      timeseriesRes.json(),
    ]);

    return res.status(200).json({ report, realtime, timeseries });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
