import Contact from "../models/Contact.js";

export async function submitContact(req, res) {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }

  const contact = await Contact.create({ name, email, phone: phone || "", message });
  res.status(201).json({ contact });
}
