async function buildSfyProducts(productData) {

  console.log('buildSfyProducts(): productData');
  console.log(productData);

    let builtProducts = [];

    productData.forEach(product => {

        let p =  {
            colors: product.node.options.reduce(function (newArr, option) {
                if (option.name === 'Color') {
                    return newArr.concat(option.values);
                } else {
                    return newArr;
                }
            }, []),
            id: product.node.id,
            title: product.node.title,
            handle: product.node.handle,
            cursor: product.cursor,
            availableForSale: product.node.availableForSale,
            createdAt: product.node.createdAt,
            priceFrom: product.node.variants.edges[0].node.priceV2.amount,
            variants: product.node.variants.edges.map(v => {
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
            options: product.node.options.map(o => {
                return {
                    key: o.name,
                    values: o.values.map(v => {
                        return v.replace(/\s+/g, '-').toLowerCase();
                    })
                };
            }),
            thumbnails: product.node.images.edges.map( i => {
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

exports.handler = async (event, context) => {

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
  try{
    const Shopify = require('shopify-api-node');
    const shopify = new Shopify({
      shopName: process.env.SHOPIFY_NAME,
      apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
      password: process.env.SHOPIFY_ADMIN_API_PASSWORD
    });
    console.log('event.queryStringParameters.id:');
    console.log(event.queryStringParameters.id);


    let product = await shopify.product.get(event.queryStringParameters.id);

    //console.log('product:');
    //console.log(product);

    console.log(await buildSfyProducts(product));

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
