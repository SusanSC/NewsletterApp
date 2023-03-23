const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

//this line is needed to load STATIC files on the server ( example: CSS (<link href="styles.css" rel="stylesheet">), images (cupcake.png) ) , which are local files on my computer
// here I'm providing the path of my static files on a STATIC folder, to refer them by a relative URL (in this case I have to change the URL of CSS and images as if I'm inside 'public' folder)
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/",function(req,res){

const firstName = req.body.FirstName;
const lastName = req.body.SecondName;
const email = req.body.Email;

//  {} = object  [] = array
//these are the key values in mailchimp API (parameter 'members', which is required for audience/list to create the list of subscribers)
const data = {
  members: [
    {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }
  ]
}

//converts the data (object inside the variable 'data') which is in a javascript format, to a JSON format.
const jsonData = JSON.stringify(data);

const url = "https://us21.api.mailchimp.com/3.0/lists/001a3c2abe"

const options = {
  //specifies the type of request, GET or POST
  method: "POST",
  //this is for authentication and its required for the POST request to be succesful, here I used HTTP Basic Authentication, as it says at mailchimp documentation (anystring:TOKEN)
  auth: "susan:9dfb6f0f38f8c8cb2cca5ec73891c2d2-us21"
}

//in order to send the data to the mailchimp server we need to save it in a variable
const request = https.request(url, options, function(response){
//when we get back a response, we need to check what data they sent us. Here we say that we're looking for any data that we get sent back from the mailchimp server
response.on("data", function(data){
  //console logs the data but first we need to parse it using JSON.parse
  console.log(JSON.parse(data));
});

//THIS IS THE RESPONSE THAT SHOWS TO THE USER DEPENDING ON SUCCESFUL OR FAILURE AFTER POSTING THE DATA
if (response.statusCode === 200) {
  res.sendFile(__dirname + "/success.html");
} else{
  res.sendFile(__dirname + "/failure.html");
}

});

//here we call request.write() and inside we're going to pass the jsonData to the mailchimp server
request.write(jsonData);
// specifies that we are done the request
request.end();

//res.send("Thanks for posting that");
});

//THIS IS THE POST REQUEST FOR THE BUTTON ON THE FAILURE PAGE, WHICH REDIRECTS THE USER TO THE HOME PAGE.
app.post("/failure", function(req, res){
res.redirect("/");
})

//since the app is being hosted on Heroku server and its not local anymore,  we have to add the 'process.env.PORT', this is a dynamic port that Heroku will define on the go.
// port 3000 will remain there with an OR, so we can test it locally as well as deploying to Heroku
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000");
});


//API key
//9dfb6f0f38f8c8cb2cca5ec73891c2d2-us21

//List id
//001a3c2abe
