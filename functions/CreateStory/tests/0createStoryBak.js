exports.handler = async (event, context, callback) => {
    const validate = require("validate.js");
    const postmark = require("postmark");

    let response = null;

    const body = JSON.parse(event.body);

    console.log( body);

    let from = 'development@madebysix.com';
    let to = 'simon@madebysix.com';


    /*return {
        statusCode: 200,
        body: JSON.stringify({
            result: event.body
        })
    }*/

    // Define validation methods
    const constraints = {
        FirstName: {
            presence: true,
            type: "string",
            length: {
                maximum: 20,
                message: "cannot be more than 20 characters"
            }
        },
        LastName: {
            presence: true,
            type: "string",
            length: {
                maximum: 20,
                message: "cannot be more than 20 characters"
            }
        },
        EmailAddress: {
            email: true,
            type: "string"
        },
        Comments: {
            type: "string"
        },
        Newsletter: {
            type: "boolean"
        }
    };

    // Validate the data
    // const validationErrors = validate({
    //     FirstName: body.FirstName,
    //     LastName: body.LastName,
    //     EmailAddress: body.EmailAddress,
    //     Comments: body.Comments,
    //     Newsletter: body.Newsletter,
    // }, constraints);

    // console.log(validationErrors);

    let validationErrors = null;//tmp

    if (validationErrors === null) {

        console.log('validation passed!!');
            const TextBody = `
            Name: ${body.firstName.value} ${body.lastName.value}
            Email Address: ${body.email.value}
            Comments: ${body.comment.value}
        `;

        let email = {
            From: from,
            To: to,
            Subject: 'Test',//body.Subject,
            TextBody: TextBody
        };

        console.log('email:');
        console.log(email);

        const client = new postmark.ServerClient("2fc6ac90-31d3-41c8-81e6-41c5c78a2ff1");

        let response = await client.sendEmailWithTemplate({
            TemplateAlias: 'evt_comments',
            From: from,
            To: to,
            TemplateModel: {
                FirstName: body.firstName.value,
                LastName: body.lastName.value,
                EmailAddress: body.email.value,
                Country: body.country.value,
                Comments: body.comment.value,
                Newsletter: body.newsletter.value,
                Subject: 'EVT Comment Form'
            }
        });

        return {
            statusCode: 200,
            body: 'success'
        }

    } else {
        response = validationErrors;
        console.log('validation FAILED!!');

        return {
            statusCode: 402,
            body: 'this is the response'
        };
    }

};
