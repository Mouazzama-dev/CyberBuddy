import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PinataSDK } from "pinata";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

app.post("/upload-json", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: "No JSON data provided",
      });
    }

    const upload = await pinata.upload.public.json(data);

    res.json({
      success: true,
      cid: upload.cid,
      url: `https://${process.env.GATEWAY_URL}/ipfs/${upload.cid}`,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Upload failed",
    });
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
