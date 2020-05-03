const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const shopifyConfig = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token':
  process.env.SHOPIFY_ACCESS_TOKEN,
};

exports.handler = async (event, context) => {

  console.log('QueryShopify');

  let body = JSON.parse(event.body);

  /*console.log('body:');
  console.log(body);*/


  /*if (event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: '',
    })
  }*/

  //if (event.body[0] === '{') {

 /* let data = JSON.parse(event.body);

  console.log('data:');
  console.log(data);
*/
  const payload = {
      query: body.query,
      variables: body.variables
    };
  //}

  /*console.log('payload:');
  console.log(payload);*/

  /*return {
    statusCode: 200,
    body: 'test finished',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
  };*/


/*  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
  };
  */

  let token;
  try {

    token = await axios({
      url: 'https://another-tomorrow.myshopify.com/api/2020-04/graphql.json',
      method: 'POST',
      headers: shopifyConfig,
      data: payload
      ,
    });

    let data = null;
    ///@TODO - temporary for productByHandle & collectionByHandle
    if(token.data){

      /*console.log('2token.data.data:');
      console.log(token.data.data);*/

      if(token.data.data.productByHandle){
        data = token.data.data.productByHandle;
      }else if(token.data.data.shop.collectionByHandle){
        /*console.log('token.data.data.shop.collectionByHandle:');
        console.log(token.data.data.shop.collectionByHandle);*/

        data = token.data.data.shop.collectionByHandle;
      }
    }

    /*console.log('2data:');
    console.log(data);*/

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };


  } catch (err) {
    console.log('!!!!!!!!!!!!!!!!!!');
    console.log(err[0]);
    let response = {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err[0],
      }),
    };
    return(response)
  }

};
