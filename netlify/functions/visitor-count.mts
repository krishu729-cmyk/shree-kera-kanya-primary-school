import { getStore, getDeployStore } from "@netlify/blobs";

function storeForContext() {
  const production = Netlify.context?.deploy?.context === "production";
  return production
    ? getStore("site-stats", { consistency: "strong" })
    : getDeployStore("site-stats", { consistency: "strong" });
}

export default async (req: Request) => {
  const store = storeForContext();
  const key = "visitor-count";
  let count = Number((await store.get(key)) || 0);

  if (req.method === "POST") {
    count += 1;
    await store.set(key, String(count));
  } else if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  return Response.json({ count }, {
    headers: { "Cache-Control": "no-store" }
  });
};

export const config = { path: "/api/visitor-count" };
