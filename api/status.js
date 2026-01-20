import fetch from "node-fetch";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing id" });

  const response = await fetch(
    `https://api.replicate.com/v1/predictions/${id}`,
    {
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}

