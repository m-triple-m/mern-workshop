import React, { useState } from 'react';
import {
  GoogleGenerativeAI, HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GOOGLE_API_KEY,
);

import { GoogleAIFileManager } from "@google/generative-ai/server";
// const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GOOGLE_API_KEY);
console.log(import.meta.env.VITE_GOOGLE_API_KEY);


const App = () => {

  const [topic, setTopic] = useState('');
  const [promptResponses, setpromptResponses] = useState([]);

  const getResponseForGivenPrompt = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent();
      console.log(result);

      const response = result.response;
      const text = response.text();
      setpromptResponses([
        ...promptResponses,
        text
      ]);
      console.log(response);
      console.log(text);

    }
    catch (error) {
      console.log("Something Went Wrong");
    }
  };

  async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const uploadFile = (e) => {
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append("myfile", file);
    fetch("https://mern-workshop.onrender.com/uploadfile", {
      method: "POST",
      body: fd,
    }).then((res) => {
      if (res.status === 200) {
        console.log("file uploaded");
        res.json().then((data) => {
          console.log(data);
        });
      }
    });
  };

  const run = async (imageData) => {
    const {
      uri,
      mimeType,
    } = imageData;
    // TODO Make these files available on the local file system
    // You may need to update the file paths
    // const files = [
    //   await uploadToGemini("cake.jpg", "image/jpeg"),
    // ];

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: "image/jpg",
                fileUri: 'https://sallysbakingaddiction.com/wp-content/uploads/2013/04/triple-chocolate-cake-4.jpg',
              },
            },
            { text: "Accurately identify the baked good in the image and provide an appropriate recipe consistent with your analysis. " },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    console.log(result.response.text());
  }

  return (
    <div className='h-screen'>
      <div className='h-[50vh]'>
        <h1 className='text-2xl font-bold'>PPT Generator</h1>
        <input type="file" onChange={uploadFile} />
        <input value={topic} onChange={e => setTopic(e.target.value)} type="text" className='my-5 px-3 py-1 border border-gray-300 rounded-md w-full'
          placeholder='Write prompt here...'
        />

        <button className='bg-black text-white block w-100 rounded-md p-3 mt-4' onClick={run}>Generate Presentation</button>
      </div>
    </div>
  )
}

export default App;