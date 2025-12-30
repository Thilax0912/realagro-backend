import Listing from "../models/Listing.js";

// GET /api/listings?status=ongoing|sold (optional)
export async function list(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const items = await Listing.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ items });
}

// POST /api/listings  (admin)
export async function create(req, res) {
  try {
    const {
      title,
      location,
      priceLKR,
      imageUrl,
      description,
      features,
      status,
    } = req.body;
    if (!title || !location || !priceLKR) {
      return res
        .status(400)
        .json({ error: "title, location, priceLKR are required" });
    }
    const item = await Listing.create({
      title,
      location,
      priceLKR,
      imageUrl,
      description,
      features,
      status: status || "ongoing",
      createdBy: req.user?.id,
    });
    res.status(201).json({ item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// PATCH /api/listings/:id
export async function update(req, res) {
  const { id } = req.params;
  const fields = (({
    title,
    location,
    priceLKR,
    imageUrl,
    description,
    features,
    status,
  }) => ({
    title,
    location,
    priceLKR,
    imageUrl,
    description,
    features,
    status,
  }))(req.body);
  const item = await Listing.findByIdAndUpdate(id, fields, { new: true });
  if (!item) return res.status(404).json({ error: "Listing not found" });
  res.json({ item });
}

// DELETE /api/listings/:id
export async function remove(req, res) {
  const { id } = req.params;
  const item = await Listing.findByIdAndDelete(id);
  if (!item) return res.status(404).json({ error: "Listing not found" });
  res.json({ ok: true });
}

// PATCH /api/listings/:id/sold
export async function markSold(req, res) {
  const { id } = req.params;
  const item = await Listing.findByIdAndUpdate(
    id,
    { status: "sold" },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Listing not found" });
  res.json({ item });
}
