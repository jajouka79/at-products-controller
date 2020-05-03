exports.handler = async (event, context, callback) => {

console.log('FetchAllSfyProductHandles()');

  let products = null;

    try{
      const Shopify = require('shopify-api-node');

      const shopify = new Shopify({
        shopName: process.env.SHOPIFY_NAME,
        apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
        password: process.env.SHOPIFY_ADMIN_API_PASSWORD
      });
      products = await shopify.product.list();

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


    let ids = [];

    products.forEach((p)=>{
      ids.push(p.handle)
    });

    let obj = {
      statusCode: 200,
      body: JSON.stringify(ids),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };

    console.log(obj);
    return obj;

};
