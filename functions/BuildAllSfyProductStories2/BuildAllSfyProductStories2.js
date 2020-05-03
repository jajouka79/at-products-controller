const qryAllProducts = `
{
  products(first: 50) {
    edges {
      node {
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
    }
  }
}
`;

//@TODO - make functions common - lambda layers?
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

exports.handler = async (event, context) => {
  console.log('BuildSfyProductStoriesForCollection():');

  /*return {
    statusCode: 200,
    body: "BuildSfyProductStoriesForCollection()",
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
  };*/
  //let sfyQryUrl = 'https://at-products-netlify.netlify.app/.netlify/functions/QueryShopify';
  let sfyQryUrl = 'http://localhost:8888/.netlify/functions/QueryShopify';

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

  //let body = JSON.parse(event.body);

  /*console.log('body:');
  console.log(body);*/
  try{
    let q = {
      query: qryAllProducts,
      variables: {

      }
    };

    console.log('q:');
    console.log(q);

    console.log('JSON.stringify(q):');
    console.log(JSON.stringify(q));

    let data = await axios.post(sfyQryUrl, JSON.stringify(q));
    let products = data.data;

    /*return {
      statusCode: 200,
      body: 'stopped',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    };*/

    /*console.log('products:');
    console.log(products);*/

    let formattedProducts = await buildSfyProducts([products]);

    let variantProducts = await createSfyProductVariants(formattedProducts);



    variantProducts.forEach(async (vp) => {
      console.log('vp:');
      console.log(vp);

      console.log();

      /*let createdStory = await axios.post(sbkQryUrl, JSON.stringify(vp));

      console.log(createdStory.data);*/

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
    console.log('402 error!!! sb');
    console.log(error);
    return {
      statusCode: 402,
      body: '402 error!!! sb',
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
