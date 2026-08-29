# my-first-app — Shopify App (Learning Project)

My first Shopify embedded app, built while learning Shopify app development.
It runs inside the Shopify admin and uses the Admin GraphQL API to read and
write real store data.

This started from the official [React Router app template](https://github.com/Shopify/shopify-app-template-react-router).
The original template docs are kept in [TEMPLATE.md](TEMPLATE.md) for reference.

## What it does

The home page is a small **product browser** for the connected store:

- Lists the store's most recent products (title, status, inventory, price) via
  the Admin GraphQL API
- Search products by title from the app
- Create a sample product, to demonstrate a GraphQL mutation end to end

The point of the app is to practise the pieces every Shopify app needs: OAuth,
session storage, embedded UI, GraphQL queries and mutations, and webhooks.

![The app running in the Shopify admin, showing product search results](docs/screenshot.png)

## Stack

| Layer | Choice |
|---|---|
| Framework | [React Router 7](https://reactrouter.com/) (SSR) |
| UI | [Polaris web components](https://shopify.dev/docs/api/app-home/using-polaris-components) + [App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) |
| API | [Admin GraphQL](https://shopify.dev/docs/api/admin-graphql) |
| Database | [Prisma](https://www.prisma.io/) + SQLite (session storage) |
| Language | JavaScript (JSX) |

## Project layout

```
app/
  shopify.server.js              OAuth, sessions, API client setup
  db.server.js                   Prisma client singleton
  routes/
    _index/route.jsx             Public landing page
    app.jsx                      Auth gate + nav for all /app/* pages
    app._index.jsx               Product list, search, and create
    app.additional.jsx           Second page (nav demo)
    auth.login/route.jsx         Shop domain login form
    webhooks.app.uninstalled.jsx Clears sessions on uninstall
    webhooks.app.scopes_update.jsx  Keeps stored scopes in sync
prisma/schema.prisma             Session model
shopify.app.toml                 App config, scopes, webhooks
```

## Running locally

Requires Node 20.19+ and the [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started),
plus a [development store](https://shopify.dev/docs/apps/tools/development-stores).

```shell
npm install
npm run setup     # prisma generate + migrate
npm run dev       # shopify app dev — handles tunnel and env vars
```

Press `P` to open the app URL, then install it on your development store.

`shopify app dev` injects `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`,
`SHOPIFY_APP_URL` and `SCOPES` automatically, so no `.env` file is needed for
local development.

## Checks

```shell
npm run lint
npm run typecheck
npm run build
```

## Access scopes

`read_products`, `write_products` — see [shopify.app.toml](shopify.app.toml).

## Notes / next steps

- [ ] Pagination for the product list
- [ ] Move session storage off SQLite before any real deployment
- [ ] Add tests
