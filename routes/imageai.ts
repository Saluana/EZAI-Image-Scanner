import express from "express"
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

import multer from "multer"
const tesseract = require("node-tesseract-ocr")
const upload = multer({ storage: multer.memoryStorage() })

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

const serverUrl = process.env.SERVER_URL;

  const openai = new OpenAIApi(configuration);

  
  //Get notes from an image
  router.post("/notes", async (req, res) => {
    const text: string = req.body.text ? req.body.text : "";

    if (text === "") {
      res.status(400).json({status: "failure", message: "No text provided"});
    }

    async function getNotes (imgText: string): Promise<string | null> {
      try {
      var response = await openai.createCompletion("text-curie-001", {
          prompt: `
          create a bullet point list of short notes from key topics in articles using "->" as the bullet point for each note:
          Text:Bob is a boy who loves grasshoppers. He is 11 years old, has blonde hair, and likes to play fortnite 12 hours per day.
          Notes: ->Bob is a boy. ->Bob is 11 years old. ->Bob has blonde hair. ->Bob likes playing fortnite 12 hours a day.\n
          Text:${imgText}
          Notes: ->`,
          temperature: 0.9,
          max_tokens: 700,
          top_p: 1.0,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
        });
  
        console.log(response.data.choices[0])
      } catch (error) {
      console.log(error);
      return null
      }
        
        return response.data.choices[0].text
      }

    const notes = await getNotes(text);

    const parsedNotes: string[] = notes.split("->")

    const removeNewLine = (str: string) => {
        return str.replace(/\n/g, "");
    }
    
    //Parse the notes into an array
    const completeNotes: string[] = [];
    parsedNotes.forEach((note) => {
            completeNotes.push(removeNewLine(note).trim());
    })

    if (completeNotes.includes("")) {
        completeNotes.splice(completeNotes.indexOf(""), 1);
    }
    
    if (completeNotes) {
      return res.status(200).json({status: "success", message: "Notes created.", notes: completeNotes});
      } else {
      return res.status(200).json({status: "failure", message: "Notes not corrected.", response: null});
      }
  });

  //Summarize text from an image
  router.post("/summarize", async (req, res) => {
    const text: string = req.body.text ? req.body.text : "";

    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `summarize this in 200 words or less:  \n ${req.body.text}`,
      temperature: 0.7,
      max_tokens: 700,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    
    if (response.data) {
      return res.status(200).json({status: "success", message: "Grammar corrected.", response: response.data.choices[0].text});
      } else {
      return res.status(200).json({status: "failure", message: "Grammar not corrected.", response: null});
      }
  });

  //correct grammar from an image
  router.post("/correct", async (req, res) => {
    const text: string = req.body.text ? req.body.text : "";

    if (text === "") {
      res.status(400).json({status: "failure", message: "No text provided"});
    }

    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `${req.body.text} \n Correct the grammar, remove unexpected characters and add paragraph spaces where needed.`,
      temperature: 0.7,
      max_tokens: 700,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    if (response.data.choices[0].text.includes("!!error")) {
      console.log("error" + response.data.choices[0].text)
      return res.status(200).json({status: "failure", message: "Error reading image text."});
    }
 
    if (response.data) {
    res.status(200).json({status: "success", message: "Grammar corrected.", response: response.data.choices[0].text});
    } else {
    res.status(200).json({status: "failure", message: "Grammar not corrected.", response: null});
    }
  });


  router.post("/scan", [upload.single("file")] ,async (req: any, res: any) => {
    const config = {
      lang: "eng",
      oem: 1,
      psm: 3,
    }

    if (!req.file.mimetype.includes("image")){
      return res.json({status: "failure", message: "Wrong file format. Please try uploading an image."})
    }

    tesseract
      .recognize(req.file.buffer, config)
      .then((text) => {
        console.log("Result:", text)
        return res.json({status: "success", text: text})
      })
      .catch((error) => {
        console.log(error.message)
        return res.json({status: "failure", message: "Error getting text from image."})
      })
  })

export = router;
