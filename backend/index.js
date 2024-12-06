require("dotenv").config();
// Make sure to include these imports:
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const express = require("express");
const multer = require("multer");
const cors = require('cors');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const myStorage = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post("/uploadfile", myStorage.single("myfile"), (req, res) => {
    // res.status(200).json({ status: "success" });
    console.log(req.file);
    // return;

    fileManager.uploadFile(
        `./uploads/${req.file.originalname}`,
        {
            mimeType: req.file.mimetype,
            displayName: "Uploaded Image",
        },
    ).then((uploadResult) => {
        // View the response.
        console.log(
            `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
        );

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log(uploadResult);
        return res.status(200).json(uploadResult);
        // model.generateContent([
        //     "Tell me about this image.",
        //     {
        //         fileData: {
        //             fileUri: 'https://bestrecipesuk.com/wp-content/uploads/2020/01/Chocolate-Cake-800x840.jpg?crop=1',
        //             mimeType: 'image/jpeg',
        //         },
        //     },
        // ])
        //     .then((result) => {
        //         console.log(result.response.text());
        //     }).catch((err) => {
        //         console.log(err);

        //     });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ message: "Error uploading file" });
    });
});


app.listen(port, () => {
    console.log(`server started`);
});