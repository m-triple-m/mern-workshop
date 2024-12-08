import React, { useState } from 'react';
import {
  GoogleGenerativeAI, HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GOOGLE_API_KEY,
);

const exMarkdown = `The baked good in the top right corner of the image is **naan**.  It's a leavened, oven-baked flatbread popular in many parts of Asia, especially in Indian, Pakistani, and Afghani cuisines.

Here's a recipe for making naan at home:

**Ingredients:**

* 1 cup warm water (105-115°F)
* 2 teaspoons active dry yeast
* 1 teaspoon sugar
* 2 tablespoons plain yogurt
* 1 large egg, lightly beaten
* 4 cups all-purpose flour, plus more for dusting
* 1 teaspoon salt
* 2 tablespoons melted butter or ghee (clarified butter)
* Optional: 1/4 cup chopped fresh cilantro or garlic


**Instructions:**

1. **Activate Yeast:** In a large bowl, combine warm water, yeast, and sugar. Let stand for 5-10 minutes until foamy.
2. **Combine Wet Ingredients:** Add yogurt and beaten egg to the yeast mixture. Whisk to combine.
3. **Add Dry Ingredients:**  In a separate bowl, whisk together flour and salt. Gradually add the dry ingredients to the wet ingredients, mixing with a wooden spoon or your hands until a shaggy dough forms.
4. **Knead Dough:** Turn the dough out onto a lightly floured surface and knead for 5-7 minutes until smooth and elastic.  If the dough is too sticky, add more flour a tablespoon at a time.
5. **First Rise:** Place the dough in a lightly oiled bowl, turning to coat. Cover with plastic wrap and let rise in a warm place for 1-1.5 hours, or until doubled in size.
6. **Divide and Shape:** Punch down the dough and divide it into 6-8 equal pieces. Roll each piece into an oval or teardrop shape, about 1/8 inch thick.  If using cilantro or garlic, sprinkle it over the dough before rolling.
7. **Cook Naan:**  Heat a large cast-iron skillet or griddle over medium-high heat. You can also use a large frying pan.  Cook each naan for 2-3 minutes per side, or until lightly browned and puffed up. Brush with melted butter or ghee while still warm.
8. **Serve:** Serve immediately with your favorite Indian dishes, like the Saag Paneer pictured!

**Tips for Success:**

* **Warm Water is Key:** Make sure your water is the correct temperature to activate the yeast. Too hot and it will kill the yeast, too cold and it won't activate properly.
* **Don't Overknead:** Overkneading can result in tough naan.
* **High Heat:** Cooking naan over high heat helps it puff up and gives it those characteristic charred spots.
* **Butter/Ghee:**  Brushing with melted butter or ghee adds flavor and keeps the naan soft.


Enjoy your homemade naan!`

// import { GoogleAIFileManager } from "@google/generative-ai/server";
// const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GOOGLE_API_KEY);
// console.log(import.meta.env.VITE_GOOGLE_API_KEY);


const App = () => {

  const [topic, setTopic] = useState('');
  const [promptResponses, setpromptResponses] = useState([]);
  const [markdownResponse, setMarkdownResponse] = useState([]);
  const [imageData, setImageData] = useState(null);


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
          const { file } = data;
          setImageData(file);
          run(file);
        });
      }
    });
  };

  const run = async ({uri, mimeType}) => {
  

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
                mimeType,
                fileUri: uri,
              },
            },
            { text: "Accurately identify the baked good in the image and provide an appropriate recipe consistent with your analysis. " },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    console.log(result.response.text());
    setMarkdownResponse(result.response.text());
  }

  return (
    <div className='h-screen'>
      <div className='h-[50vh] flex '>
        <h1 className='text-2xl font-bold'>PPT Generator</h1>
        <input type="file" onChange={uploadFile} />
        <input value={topic} onChange={e => setTopic(e.target.value)} type="text" className='my-5 px-3 py-1 border border-gray-300 rounded-md w-full'
          placeholder='Write prompt here...'
        />


        <button className='bg-black text-white block w-100 rounded-md p-3 mt-4' onClick={run}>Generate Presentation</button>
      </div>
      <div>

      </div>
    </div>
  )
}

export default App;