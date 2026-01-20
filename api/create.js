import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload error" });

    try {
      // subir imágenes a Replicate
      const upload = async (file) => {
        const r = await fetch("https://api.replicate.com/v1/files", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
          },
          body: fs.createReadStream(file.filepath)
        });
        const j = await r.json();
        return j.urls.get;
      };

      const userImage = await upload(files.user_image);
      const clothImage = await upload(files.cloth_image);

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "VERSION_ID_DE_IDM_VTON",
          input: {
            human_img: userImage,
            garm_img: clothImage
          }
        })
      });

      const data = await response.json();
      res.status(200).json({ id: data.id });

    } catch (e) {
      res.status(500).json({ error: "Prediction error" });
    }
  });
}

