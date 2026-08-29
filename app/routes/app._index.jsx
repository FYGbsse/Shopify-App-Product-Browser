import { useEffect } from "react";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

const PRODUCTS_QUERY = `#graphql
  query BrowseProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          status
          totalInventory
          updatedAt
          featuredMedia {
            preview {
              image {
                url
                altText
              }
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }`;

const CREATE_PRODUCT_MUTATION = `#graphql
  mutation CreateSampleProduct($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const search = new URL(request.url).searchParams.get("search")?.trim() ?? "";

  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: {
      first: 20,
      query: search ? `title:*${search}*` : null,
    },
  });

  const { data } = await response.json();

  return {
    search,
    products: data.products.edges.map(({ node }) => node),
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];

  const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
    variables: {
      product: { title: `${color} Snowboard` },
    },
  });

  const { data } = await response.json();
  const { product, userErrors } = data.productCreate;

  if (userErrors?.length) {
    return { error: userErrors[0].message, product: null };
  }

  return { error: null, product };
};

function formatPrice({ amount, currencyCode }) {
  return `${currencyCode} ${Number(amount).toFixed(2)}`;
}

function statusTone(status) {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT") return "info";
  return "neutral";
}

export default function Index() {
  const { products, search } = useLoaderData();
  const [, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isCreating =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.title) {
      shopify.toast.show(`Created ${fetcher.data.product.title}`);
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const createSampleProduct = () => fetcher.submit({}, { method: "POST" });

  const handleSearch = (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("search")?.trim();

    setSearchParams(value ? { search: value } : {});
  };

  return (
    <s-page heading="Product browser">
      <s-button
        slot="primary-action"
        onClick={createSampleProduct}
        {...(isCreating ? { loading: true } : {})}
      >
        Create sample product
      </s-button>

      <s-section heading="Search">
        <form onSubmit={handleSearch}>
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-text-field
              name="search"
              label="Product title"
              placeholder="e.g. snowboard"
              defaultValue={search}
            ></s-text-field>
            <s-button type="submit" variant="secondary">
              Search
            </s-button>
          </s-stack>
        </form>
      </s-section>

      <s-section
        heading={
          search ? `Results for "${search}"` : "Recently updated products"
        }
      >
        {products.length === 0 ? (
          <s-paragraph>
            No products found
            {search ? ` matching "${search}"` : ""}. Use the button above to
            create a sample product.
          </s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {products.map((product) => (
              <s-box
                key={product.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  gap="base"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <s-stack direction="block" gap="small-500">
                    <s-heading>{product.title}</s-heading>
                    <s-stack direction="inline" gap="small-300">
                      <s-badge tone={statusTone(product.status)}>
                        {product.status}
                      </s-badge>
                      <s-text tone="subdued">
                        {formatPrice(product.priceRangeV2.minVariantPrice)}
                      </s-text>
                      <s-text tone="subdued">
                        {product.totalInventory ?? 0} in stock
                      </s-text>
                    </s-stack>
                  </s-stack>

                  <s-button
                    variant="tertiary"
                    onClick={() => {
                      shopify.intents.invoke?.("edit:shopify/Product", {
                        value: product.id,
                      });
                    }}
                  >
                    Edit
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>

      <s-section slot="aside" heading="About this app">
        <s-paragraph>
          A learning project built on the Shopify React Router template. It
          reads the store catalog with an Admin{" "}
          <s-link href="https://shopify.dev/docs/api/admin-graphql" target="_blank">
            GraphQL
          </s-link>{" "}
          query and creates products with a mutation.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-unordered-list>
          <s-list-item>Add pagination for large catalogs</s-list-item>
          <s-list-item>Filter by product status</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
