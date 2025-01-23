require("dotenv").config();
const express = require('express');
const { CallAutomationClient } = require('@azure/communication-call-automation');

// Initialize Azure client
const callAutomationClient = new CallAutomationClient(process.env.AZURE_CONNECTION_STRING);

// Create Express app
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log('Incoming request:');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Call handler route
app.post('/incomingCall', async (req, res) => {
    if (req.body[0] && req.body[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
        const validationCode = req.body[0].data.validationCode;
        return res.status(200).json({
          validationResponse: validationCode
        });
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
    console.error('Detailed error handling call:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

app.get("/", (req, res, next) => {
    res.json("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
