//import gql from 'graphql-tag'

export const query = `query productByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    title
    availableForSale
    id
    tags
    descriptionHtml
    images(first: 100) {
      edges {
        node {
          id
          altText
          transformedSrc(maxWidth: 1920, maxHeight: 1920)
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
    metafields(first: 10) {
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
    variants(first: 100) {
      edges {
        node {
          availableForSale
          id
          title
          metafields(first: 100) {
            edges {
              node {
                id
                value
              }
            }
          }
          priceV2 {
            amount
            currencyCode
          }
          presentmentPrices(first: 100) {
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
  }
}`;
