export const product = `node {
  title
  tags
  availableForSale
  id
  handle
  descriptionHtml
  createdAt
  collections(first: 1) {
    edges {
      node {
        title
        handle
      }
    }
  }
  images(first: 99) {
    edges {
      node {
        id
        altText
        transformedSrc(maxWidth: 600, maxHeight: 1200)
        originalSrc
      }
    }
  }
    metafield(namespace: "custom_fields", key: "grouped_products") {
      id
      value
      key
      description
    }
  metafields(first: 99) {
    edges {
      node {
  	      id
          description
          key
          namespace
          value
          valueType
      }
    }
  }
  options {
    id
    name
    values
  }
  variants(first: 99) {
    edges {
      node {
        id
        title
        availableForSale
        selectedOptions{
           name
           value
        }
        metafields(first: 5) {
          edges {
            node {
               id
                key
                namespace
                value
            }
          }
        }
        priceV2 {
          amount
          currencyCode
        }
        image {
          id
          altText
          transformedSrc(maxWidth: 600, maxHeight: 1200)
          originalSrc
        }
        presentmentPrices(first: 20) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}`;
