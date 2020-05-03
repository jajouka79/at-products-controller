exports.handler = async (event, context, callback) => {

    let sbkOAuthToken = 'YkEVQ7epqQHdgEG86gbFlgtt-51416-WXnCsmTCmhxUPxkfKS-V';
    //let sbkOAuthToken = process.env.STORYBLOK_OAUTH_TOKEN;

    let sbAccessToken = 'rCxO2Y9nZMwM9owg0dQtFAtt';
    //let sbAccessToken = process.env.STORYBLOK_ACCESS_TOKEN;

    //console.log('process.env.STORYBLOK_OAUTH_TOKEN - ' + STORYBLOK_OAUTH_TOKEN);
    const StoryblokClient = require('storyblok-js-client');
    const spaceId = 56947;
    const productsSbkFolderId = 10683954;

    const version = 'draft';
    const story = JSON.parse(event.body);

    if(story) {

        /*console.log('story:');
        console.log(story);*/

        if(story){
            let colorAffix = story.color ? '--' + story.color.replace(' ', '-').toLowerCase() : '';
            const storySlug = story.slug + colorAffix;

            console.log('storySlug:');
            console.log(storySlug);
            try {

                let Storyblok = new StoryblokClient({
                    accessToken: sbAccessToken
                });

                let response = await Storyblok.get(`cdn/stories/products-sbk/${storySlug}`, {
                    version: version
                });

                let respStr = `story ${storySlug} already exists - EXITING`;
                //console.log(respStr);

                return {
                    statusCode: 200,
                    body: respStr,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                };

            }

            catch (error) {
                //console.log(error);

                console.log(storySlug + " doesn't exist - CREATING");

                let Storyblok2 = new StoryblokClient({
                    oauthToken: sbkOAuthToken
                });

                try {
                    let content = {
                        component: 'product',
                        slug: story.slug,
                        price: story.price,
                        color: story.color,
                        sizes: story.sizes,
                        created_at: story.created_at,
                        json: JSON.stringify(story.json),
                    };

                    /*console.log('content:');
                    console.log(content);*/

                    let response = await Storyblok2.post(`spaces/${spaceId}/stories`, {
                        story: {
                            name: storySlug,
                            slug: storySlug,
                            parent_id: productsSbkFolderId,
                            content: content
                        }
                    });

                } catch (error) {
                    console.log('error1');
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
                console.log(storySlug + ' CREATED');
                return {
                    statusCode: 200,
                    body: storySlug + ' CREATED',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                }
            }
        }

    }
    return {
        statusCode: 402,
        body: 'failed - no request body',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
    };

};
