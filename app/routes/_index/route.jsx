import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Product Browser for Shopify</h1>
        <p className={styles.text}>
          Browse, search, and create products in your store without leaving the
          Shopify admin.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>See your catalog at a glance</strong>. Recent products with
            status, inventory, and price in one list.
          </li>
          <li>
            <strong>Find products fast</strong>. Search your catalog by title
            straight from the app.
          </li>
          <li>
            <strong>Built in the admin</strong>. Runs embedded in Shopify, so
            there is no second tool to learn.
          </li>
        </ul>
      </div>
    </div>
  );
}
