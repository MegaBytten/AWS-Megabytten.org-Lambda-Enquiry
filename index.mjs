import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: "eu-west-2" });


// Defining a function to send emails
const createSendEmailCommand = (toAddress, fromAddress, subjectText, bodyText, htmlText) => {
    return new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: htmlText,
          },
          Text: {
            Charset: "UTF-8",
            Data: bodyText,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subjectText,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
  };

//event Handler --> Entry point
export const handler = async(event) => {
    console.log(event) // this is the JSON-formatted DATA from HTML web page containing: fname, lname, email, enquiry
    console.log("SESCLIENT:" + sesClient);
    
    var emailIntro = [event.fname, event.lname ,"sent you an Enquiry!\n"].join(' ')
    var emailMessage = [emailIntro,event.enquiry, "\n\nPlease respond to their email address provided below:\n",event.email].join(' ')
    
    console.log("Sending Email via SES. Email Content: ", emailMessage)

    var sendEnquiryEmail = createSendEmailCommand(
        "omegabytten@gmail.com",
        "do.not.reply.megabytten@gmail.com",
        "NEW MEGABYTTEN ENQUIRY",
        emailMessage,
        emailMessage
    );

    console.log("Attempting Enquiry email send to Omegabytten@gmail.com");

    try {
        await sesClient.send(sendEnquiryEmail);
        console.log("Successfully sent Enquiry email.");
      } catch (e) {
        console.error("Failed to send enquiry email: " + e);
    }

    var htmlResponse = `<span style="font-size:20px">Dear ${event.fname},</span><br />` +
    '<br /> Thank you for your enquiry:<br /><br />' +
    `${event.enquiry}<br /><br />` +
    'You can be sure to expect a response to this email address within 1-3 working days.&nbsp;In the meantime, be sure to check out our packages, services and any promotions on <a href="http://megabytten.org">Megabytten.org</a>.<br />' +
    '<br />We look forward to contacting you soon!<br /><br />Kind regards,<br />Ethan de Villiers,<br />Founder | Megabytten.org'

    var textResponse = `Dear ${event.fname},` +
    `Thank you for your enquiry: ${event.enquiry}` +
    "You can be sure to expect a response to this email address within 1-3 working days. In the meantime, be sure to check out our packages, services and any promotions on Megabytten.org." +
    'We look forward to contacting you soon!' +
    'Kind regards,' +
    'Ethan de Villiers,' +
    'Founder | Megabytten.org'

    var sendResponseEmail = createSendEmailCommand(
        event.email,
        "do.not.reply.megabytten@gmail.com",
        "Your MegaBytten Enquiry!",
        textResponse,
        htmlResponse
    );

    try {
        await sesClient.send(sendResponseEmail);
        console.log("Successfully sent Response email.");
      } catch (e) {
        console.error("Failed to send response email: " + e);
    }
    
    const response = {
        statusCode: 200,
        body: "Enquiry recevied and referred successfully!",
    };
    return response;
};