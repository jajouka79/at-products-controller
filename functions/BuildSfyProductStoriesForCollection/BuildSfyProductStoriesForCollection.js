async function buildSfyProducts(productData) {

  console.log('buildSfyProducts(): productData');
  console.log(productData);

  let builtProducts = [];

  productData.forEach(product => {

    /*console.log('product:');
    console.log(product);*/

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
const productCount = 37;
const qryCollectionByHandle = `{
  shop {
    collectionByHandle(handle: "shop") {
        products(first: ${productCount}){
            edges {
    node {
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
  images(first: 10) {
    edges {
      node {
        id
        altText
        transformedSrc(maxWidth: 600, maxHeight: 1200)
        originalSrc
      }
    }
  }
  metafields(first: 5) {
    edges {
      node {
        key
        value
      }
    }
  }
  options {
    id
    name
    values
  }
  variants(first: 50) {
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
              key
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
}
}
}
    }
  }
}
`;

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
  //let sbkQryUrl = 'https://at-products-netlify.netlify.app/.netlify/functions/CreateStory';

  let sfyQryUrl = 'http://localhost:8888/.netlify/functions/QueryShopify';
  let sbkQryUrl = 'http://localhost:8888/.netlify/functions/CreateStory';


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

  console.log('body:');
  console.log(body);
  try{

    let handle = body.handle;
    let cursor = '';
    let productsPerRequest = 2;

    console.log('handle:');
    console.log(handle);

    let q = {
      query: qryCollectionByHandle,
      variables: {
        handle: handle,
        cursor: cursor,
        productsPerRequest: productsPerRequest,
        reverse: false,
        sortKey: "CREATED",
      }
    };

    let data = await axios.post(sfyQryUrl, JSON.stringify(q));

    /*console.log('data:');
    console.log(data);*/
    let productEdges = data.data.products.edges;
    let products = [];
    productEdges.forEach((p)=>{

          products.push(p.node);
        }
    );

    /*console.log('products:');
    console.log(products);*/

    let formattedProducts = await buildSfyProducts(products);

    let variantProducts = await createSfyProductVariants(formattedProducts);



    variantProducts.forEach(async (vp) => {
      /*console.log('vp:');
      console.log(vp);*/


      let createdStory = await axios.post(sbkQryUrl, JSON.stringify(vp));

      /*console.log(createdStory);*/

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
