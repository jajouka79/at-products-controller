exports.handler = async (event, context, callback) => {

  if(!event.queryStringParameters.id){
    return {
      statusCode: 402,
      body: 'id param is needed',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };
  }

  let product = null;

    try{
      const Shopify = require('shopify-api-node');

      const shopify = new Shopify({
        shopName: process.env.SHOPIFY_NAME,
        apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
        password: process.env.SHOPIFY_ADMIN_API_PASSWORD
      });
      product = await shopify.product.get(event.queryStringParameters.id);

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
    let obj = {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };

    //console.log(obj);
    return obj;

};
