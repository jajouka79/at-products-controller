async function buildSfyProducts(productData) {

  console.log('buildSfyProducts(): productData');
  //console.log(productData);

  let builtProducts = [];

  productData.forEach(product => {

    let p =  {
      colors: product.options.reduce(function (newArr, option) {
        if (option.name === 'Color') {
          return newArr.concat(option.values);
        } else {
          return newArr;
        }
      }, []),
      id: product.id,
      title: product.title,
      handle: product.handle,
      cursor: product.cursor,
      availableForSale: product.availableForSale,
      createdAt: product.createdAt,
      priceFrom: product.variants.edges[0].node.priceV2.amount,
      variants: product.variants.edges.map(v => {
        return {
          id: v.node.id,
          title: v.node.title,
          metafields: v.node.metafields,
          price: v.node.priceV2.amount,
          available: v.node.availableForSale,
          selectedOptions: v.node.selectedOptions.map(x => {
            return {
              name: x.name,
              value: x.value
            };
          }),
          presentmentPrices: v.node.presentmentPrices.edges.map(x => {
            return {
              currencyCode: x.node.price.currencyCode,
              amount: x.node.price.amount
            };
          })
        };
      }),
      options: product.options.map(o => {
        return {
          key: o.name,
          values: o.values.map(v => {
            return v.replace(/\s+/g, '-').toLowerCase();
          })
        };
      }),
      thumbnails: product.images.edges.map( i => {
        return {
          src: i.node.transformedSrc,
          altText: i.node.altText,
          originalSrc: i.node.originalSrc
        };
      })
    };

    builtProducts.push(p);
  });

  return builtProducts;
}

async function createSfyProductVariants(productData){

  let newProductsArray = [];
  productData.forEach(function (p) {

    /*console.log('p:');
    console.log(p);*/

    if (p.colors === undefined || p.colors.length === 0) {
      newProductsArray.push(p);
    } else {
      p.colors.forEach(function(colorVariation) {
        let variants = [];

        p.variants.forEach(variant => {
          if(variant.title.includes(colorVariation)){

            /*console.log('variant:');
            console.log(variant);*/

            variants.push(variant);
          }
        });
/*
        component: 'product',
        slug: eventBody.slug,
        price: eventBody.price,
        color: eventBody.color,
        sizes: eventBody.sizes,
        created_at: eventBody.created_at,
        json: JSON.stringify(eventBody.json),
 */

        let prodObj = {
          slug: p.handle,
          price: p.priceFrom,
          color: colorVariation,
          sizes: p.sizes,
          created_at: p.createdAt,
          json: {
            id: p.id,
            title: p.title,
            color: colorVariation,
            handle: p.handle,
            availableForSale: p.availableForSale,
            createdAt: p.createdAt,
            priceFrom: p.priceFrom,
            variants: variants,
            options: p.options,
            thumbnails: p.thumbnails,
            cursor: p.cursor,
          }
        };

        /*console.log('p:');
        console.log(p);
*/

        /*console.log('prodObj:');
        console.log(prodObj);*/

        /*console.log('p.options:');
        console.log(p.options);*/

        newProductsArray.push(prodObj);
      });
    }
  });

  /*console.log('newProductsArray:');
  console.log(newProductsArray);*/

  return newProductsArray;

  //return buildSfyFilteredProducts(newProductsArray, qParams);
}

const axios = require('axios');

/*const qryProductByHandle = `query productByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    ${productNode}
  }
}`;*/

const qryProductByHandle = `query productByHandle($handle: String!) {
  productByHandle(handle: $handle) {
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
          handle
        }
      }
    }
    images(first: 100) {
      edges {
        node {
          id
          altText
          transformedSrc(maxWidth: 1200)
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
    variants(first: 100) {
      edges {
        node {
          availableForSale
          selectedOptions{
            name
            value
          }
          id
          title
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
  }
}`;



exports.handler = async (event, context) => {

  //let sfyQryUrl = 'https://at-products-netlify.netlify.app/.netlify/functions/QueryShopify';
  //let sbkQryUrl = 'https://at-products-netlify.netlify.app/.netlify/functions/CreateStory';

  let sfyQryUrl = 'http://localhost:8888/.netlify/functions/QueryShopify';
  let sbkQryUrl = 'http://localhost:8888/.netlify/functions/CreateStory';

 /* return {
    statusCode: 200,
    body: JSON.stringify(process.env.SHOPIFY_DOMAIN),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
  };*/

  /*if(!event.queryStringParameters.id){
    return {
      statusCode: 402,
      body: 'id param is needed',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
  }*/
  let body = JSON.parse(event.body);

  try{
    let handle = body.handle;

    console.log('handle:');
    console.log(handle);

    let q = {
      query: qryProductByHandle,
      variables: {
        handle: handle
      }
    };

    console.log('q:');
    console.log(q);


    console.log('JSON.stringify(q):');
    console.log(JSON.stringify(q));


    let data = await axios.post(sfyQryUrl, JSON.stringify(q));
    let product = data.data;

    /*return {
      statusCode: 200,
      body: 'stopped',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
*/





    /*console.log('product:');
    console.log(product);*/

    let formattedProducts = await buildSfyProducts([product]);

    let variantProducts = await createSfyProductVariants(formattedProducts);

    variantProducts.forEach(async (vp) => {
      /*console.log('vp:');
      console.log(vp);*/

      let createdStory = await axios.post(sbkQryUrl, JSON.stringify(vp));

      console.log(createdStory.data);

    });

    return {
      statusCode: 200,
      body: JSON.stringify(variantProducts),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
  } catch(error) {
    console.log('402 error!!!');
    console.log(error);
    return {
      statusCode: 402,
      body: 'failed',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
  }
  return {
    statusCode: 200,
    body: ' CREATED',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
  }

  /*catch (err) {
     return { statusCode: 500, body: err.toString() }
   }*/
};
