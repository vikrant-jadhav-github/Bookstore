const express = require("express");
const route = require("./routes/bookroute");
const { connectDb } = require("./config/connectDb");
const { connectWithCloudinary } = require("./config/connectCloudinary");
const express_fileupload = require("express-fileupload");
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(express_fileupload({
    useTempFiles : true,
    tempFileDir : "/tmp/",
}));

app.use("/", route);

app.listen(PORT, () => {
    console.log("Server is running on port 3000");
})

connectDb();
connectWithCloudinary();