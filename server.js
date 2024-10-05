const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const escpos = require('escpos');

// Initialize Express app
const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit if needed

// Set up the USB printer
escpos.USB = require('escpos-usb');

app.post('/print', async (req, res) => {
  try {
    const { patientName, service, ticketCode, date, time, pplBefore } = req.body;

    if (!ticketCode) {
      return res.status(400).send({ error: 'No ticket code provided' });
    }

    console.log('Received Ticket Code:', ticketCode); // Log the received ticket code

    // Create a new printer instance
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(() => {
      // First print job with large text size for ticketCode
      printer
        .align('CT')
        .drawLine()
        .size(1,1)
        .text('TICKET - TURNO')

        .size(2, 2) // Set text size to the largest possible
        .style('B') // Bold text
        .text(ticketCode)
        .drawLine()
        .close(() => {
          console.log('First print job completed');

          // Second print job with normal text size for other details
          device.open(() => {
            printer
              .align('LT')
              .style('NORMAL') // Normal text
              .size(0, 0)
              .text(`Paciente: ${patientName}`)
              .size(0, 0)
              .text(`Servicio: ${service}`)
              
              .text('') // Add a blank line
              .align('CT')
              .text(`Personas antes que usted: (${pplBefore})`)
              .drawLine()
              .text('') // Add another blank line
              .text(`Fecha: ${date} - Hora: ${time}`)
              .text('')
              .text('')
              .cut()
              .close(() => {
                console.log('Second print job completed');
                res.status(200).send('Print job completed');
              });
          });
        });
    });
  } catch (error) {
    console.error('Error processing print job:', error);
    res.status(500).send({ error: 'Error processing print job', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});