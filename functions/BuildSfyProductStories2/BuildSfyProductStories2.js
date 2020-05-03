async function buildSfyProducts(productData) {

  console.log('buildSfyProducts(): productData');
  console.log(productData);

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
      //cursor: product.cursor,
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
const axios = require('axios');

exports.handler = async (event, context) => {

  if (!event.queryStringParameters.id) {
    return {
      statusCode: 402,
      body: 'id param is needed',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
  }
  try {
    const Shopify = require('shopify-api-node');
    const shopify = new Shopify({
      shopName: process.env.SHOPIFY_NAME,
      apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
      password: process.env.SHOPIFY_ADMIN_API_PASSWORD
    });

    try{
      let productResponse = await axios.post('http://localhost:8888/.netlify/functions/GetProduct/?id=4550472564829');
      console.log('buildSfyProductStories() product:');

      let product = productResponse.data;


      let extendedProducts = [];


      console.log(product);


    } catch(e){
      console.log('error:');
      console.log(e);
    }

    //console.log(await buildSfyProducts(product));

  } catch(error) {
    console.log('error');
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
