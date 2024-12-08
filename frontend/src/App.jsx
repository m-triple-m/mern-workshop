import React, { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import {
  GoogleGenerativeAI, HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GOOGLE_API_KEY,
);

const exMarkdown = `The image shows Palak Paneer, a popular North Indian dish of spinach and Indian cheese (paneer).


**Ingredients:**

* **For the Palak Puree:**
    * 1 pound fresh spinach, washed and chopped roughly
    * 1-2 green chilies, slit (optional, for heat)
    * 1/2 inch ginger, peeled and chopped
    * 2 cloves garlic, peeled
    * 1/4 cup water
* **For the Palak Paneer:**
    * 2 tablespoons oil or ghee
    * 1 medium onion, finely chopped
    * 1 teaspoon ginger-garlic paste
    * 1 teaspoon cumin seeds
    * 1/2 teaspoon turmeric powder
    * 1/2 teaspoon coriander powder
    * 1/4 teaspoon red chili powder (or to taste)
    * 1/4 teaspoon garam masala
    * 1/2 cup chopped tomatoes
    * Salt to taste
    * 1 cup water or as needed
    * 8 ounces paneer, cubed 
    * 1 tablespoon heavy cream or cashew cream (optional)
    * Fresh cilantro, chopped (for garnish)


**Instructions:**

1. **Blanch the Spinach:** Bring a pot of water to a boil. Add the spinach, green chilies (if using), ginger, and garlic. Blanch for 2-3 minutes, or until the spinach wilts. Drain immediately and transfer to a bowl of ice water to stop cooking.
2. **Make Spinach Puree:**  Drain the spinach mixture well and blend it with 1/4 cup of water into a smooth puree. Set aside.
3. **Sauté Aromatics:** Heat the oil/ghee in a large pan or pot over medium heat. Add cumin seeds and let them splutter. Add the chopped onions and sauté until golden brown.
4. **Add Spices:** Stir in the ginger-garlic paste and sauté for 30 seconds. Add turmeric powder, coriander powder, red chili powder, and garam masala. Sauté for another 30 seconds until fragrant. 
5. **Add Tomatoes:** Add the chopped tomatoes and salt. Cook until the tomatoes soften, about 5-7 minutes.
6. **Add Spinach Puree:** Pour in the spinach puree and 1 cup of water. Bring to a simmer and cook for 5-7 minutes, allowing the flavors to meld. Adjust the consistency with more water if needed.
7. **Add Paneer:** Gently add the paneer cubes to the gravy. Simmer for 2-3 minutes, being careful not to overcook the paneer.
8. **Finish:** Stir in the heavy cream/cashew cream (if using). Garnish with fresh cilantro.
9. **Serve:** Serve hot with roti, naan, paratha, or rice.



**Tips and Variations:**

* **Paneer:** You can lightly pan-fry the paneer cubes before adding them to the gravy for a slightly different texture.
* **Spice Level:** Adjust the amount of green chilies and red chili powder to your preference.
* **Cream:**  Adding cream is optional but gives the dish a richer flavor and texture. Cashew cream can be used for a vegan alternative.
* **Other Vegetables:** You can add other vegetables like green peas or potatoes to this dish.


Enjoy your homemade Palak Paneer! `

// import { GoogleAIFileManager } from "@google/generative-ai/server";
// const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GOOGLE_API_KEY);
// console.log(import.meta.env.VITE_GOOGLE_API_KEY);


const App = () => {

  const [topic, setTopic] = useState('');
  const [promptResponses, setpromptResponses] = useState([]);
  const [markdownResponse, setMarkdownResponse] = useState(exMarkdown);
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
            { text: "Accurately identify the food in the image and provide an appropriate recipe consistent with your analysis. " },
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
      <div className='h-[50vh] flex flex-col justify-center max-w-[80%] mx-auto'>
        <h1 className='text-2xl font-bold'>PPT Generator</h1>
        <input type="file" onChange={uploadFile} />
        <input value={topic} onChange={e => setTopic(e.target.value)} type="text" className='my-5 px-3 py-1 border border-gray-300 rounded-md w-full'
          placeholder='Write prompt here...'
        />


        <button className='bg-black text-white block w-100 rounded-md p-3 mt-4' onClick={run}>Generate Presentation</button>
      </div>
      <div className='max-w-[80%] mx-auto'>
        {
          markdownResponse && (
            <MarkdownPreview source={markdownResponse} style={{ padding: 16 }} />
          )
        }
      </div>
    </div>
  )
}

export default App;