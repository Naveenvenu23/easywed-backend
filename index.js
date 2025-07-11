const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection failed"));


const itemSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: Number,
  category: String,
  description: String,
});
const Item = mongoose.model("Item", itemSchema);


const bookingSchema = new mongoose.Schema({
  userName: String,
  email: String,
  eventDate: String,
  location: String,
  packageName: String,
  price: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
const Booking = mongoose.model("Booking", bookingSchema);




app.get("/categories", (req, res) => {
  const categories = [
    "Venue", "Dress", "Photography", "Makeup",
    "catering", "Decoration", "Invitation", "Mehndi"
  ];
  res.json(categories);
});


app.get("/items/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const items = await Item.find({ category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});


app.post("/bookings", async (req, res) => {
  const { userName, email, eventDate, location, packageName, price } = req.body;

  if (!userName || !email || !eventDate || !location || !packageName || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }


  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"EasyWed Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: "New Booking Received",
      html: `
        <h2>New Booking Details</h2>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Package:</strong> ${packageName}</p>
        <p><strong>Price:</strong> ₹${price}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Booking Email Sent:", info.messageId);
    res.status(200).json({ success: true, message: "Booking email sent successfully" });

  } catch (error) {
    console.error(" Booking email error:", error);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "naveenvenu23@gmail.com",
      subject: "New  Feedback from EasyWed",
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error(" Email sending failed:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


app.listen(3000, () => {
  console.log(" Server started...");
});
