const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

app.use(cors({ origin: true }));
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});

app.post("/payment/create", async (req, res) => {
  const total = req.query.total;
  
  if (total > 0) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
    });
    // console.log("payment received", total);
    // const paymentIntent = await stripe.PaymentIntents.create({
    //   amount: total,
    //   currency: "usd",
    //   // payment_method_types: ["card"],
    // });
    console.log(paymentIntent);

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } else {
    res.status(403).json({ message: "total must be greaterthan zero" });
  }
});

app.listen(9999, (err) => {
  if (err) throw err;
  console.log("Amazon Server is running on port: 9999, http://localhost:9999");
});
