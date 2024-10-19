import React from "react";
import classes from "./Payment.module.css";
import LayOut from "../../Components/LayOut/LayOut";
import { DataContext } from "../../Components/DataProvider/DataProvider";
import { useContext } from "react";
import ProductCard from "../../Components/Product/ProductCard";
import CurrencyFormat from "../../Components/CurrencyFormat/CurrencyFormat";
import { useElements, useStripe, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { axiosInstance } from "../../Api/axios";
import { db } from "../../Utility/firebase";
import { Type } from "../../Utility/action.type";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
function Payment() {
  const [{ basket, user }, dispatch] = useContext(DataContext);
  //   // console.log(user);
  const totalItems = basket?.reduce((amount, item) => {
    return item.amount + amount;
  }, 0);

  const stripe = useStripe(); //process.env.STRIPE_KEY
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    // console.log( event);
    event?.error?.message
      ? setCardError(event?.error?.message)
      : setCardError("");
  };

  const total = parseInt(
    basket.reduce((amount, item) => {
      return item.price * item.amount + amount;
    }, 0)
  );

  const handlePayment = async (event) => {
    event.preventDefault();

    try {
      setProcessing(true);
      // backend|| function---> contact to the client secret
      const response = await axiosInstance({
        method: "POST",
        url: `/payment/create?total=${total * 100}`,
      });
      console.log(response.data);

      const clientSecret = response.data?.clientSecret;
      // console.log(clientSecret);
      // const paymentIntent = confirmation.paymentIntent;
      // client side(react side conformation)
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      console.log(paymentIntent);
      console.log(user);

      // save items to the database
      await db
        .collection("users")
        .doc(user.uid)
        .collection("orders")
        .doc(paymentIntent.id)
        .set({
          basket: basket,
          amount: paymentIntent.amount,
          created: paymentIntent.created,
          // status: paymentIntent.status,
          // paymentIntentId: paymentIntent.id,
          // user: user.uid,
        });
      // await setDoc(doc(db, "users", user.uid, "orders", paymentIntent.id), {
      //   basket: basket, // order details
      //   amount: paymentIntent.amount, // amount in cents
      //   created: paymentIntent.created, // timestamp
      // });
      // clear the basket
      dispatch({ type: Type.EMPTY_BASKET });

      // send email to the user
      // await sendEmail(
      //   user.email,
      //   "Your order has been placed",
      //   `Thank you for your order. Your order details are: ${JSON.stringify(
      //     basket
      //   )}`
      // );

      setProcessing(false);
      navigate("/orders", { state: { msg: "you have placed new order" } });
    } catch (error) {
      console.error("Error:", error);
      setProcessing(false);
    }
  };
  return (
    <LayOut>
      {/* header */}
      <div className={classes.payment__header}>
        check out({totalItems}) items
      </div>
      {/* payment method */}
      <section className={classes.payment}>
        <div className={classes.flex}>
          <h3>Delivery Address</h3>
          <div>
            <div>{user?.email}</div>

            <div>123 Delivery Street</div>
            <div>Seattle, WA</div>
          </div>
        </div>
        <hr />
        {/* product */}
        <div className={classes.flex}>
          <h3>Review items and delivery</h3>
          <div>
            {basket?.map((item, i) => (
              <ProductCard key={i} product={item} flex={true} />
            ))}
          </div>
        </div>
        <hr />
        {/* card form */}
        <div className={classes.flex}>
          <h3>Payment methodes</h3>
          <div className={classes.payment__card__container}>
            <div className={classes.payment__details}>
              <form onSubmit={handlePayment}>
                {/* error handling */}
                {cardError && (
                  <small style={{ color: "red" }}>{cardError}</small>
                )}
                <CardElement onChange={handleChange} />

                <div className={classes.payment__price}>
                  <div>
                    <span style={{ display: "flex", gap: "10px" }}>
                      Total Order | <CurrencyFormat amount={total} />
                    </span>
                  </div>
                  <button type="submit">
                    {processing ? (
                      <div className={classes.loading} role="status">
                        <BeatLoader color="gray" size={12} />
                        <p>Please Wait ...</p>
                      </div>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </LayOut>
  );
}

export default Payment;

// //http://127.0.0.1:5001/clone-kemaw/us-central1/api
// await setDoc(doc(db, 'users', user.uid, 'orders', paymentIntent.id), {
//   basket: basket, // order details
//   amount: paymentIntent.amount, // amount in cents
//   created: paymentIntent.created, // timestamp
// });
