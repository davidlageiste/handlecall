require("dotenv").config();
const express = require('express');
const { CallAutomationClient } = require('@azure/communication-call-automation');

// Initialize Azure client
const callAutomationClient = new CallAutomationClient(process.env.AZURE_CONNECTION_STRING);

// Create Express app
const app = express();
app.use(express.json());

// Call handler route
app.post('/incomingCall', async (req, res) => {

if (req.body.validationCode) {
    return res.status(200).send(req.body.validationCode);
    }

  try {
    const { incomingCallContext } = req.body;
    
    const callConnection = await callAutomationClient.acceptCall(
      incomingCallContext.callConnectionId
    );

    await callAutomationClient.playMedia({
      callConnectionId: incomingCallContext.callConnectionId,
      content: {
        tts: {
          text: "Hello",
          voiceName: "en-US-JennyNeural"
        }
      }
    });

    res.status(200).json({ message: 'Call handled successfully' });
  } catch (error) {
    console.error('Error handling call:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res, next) => {
    res.json("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
