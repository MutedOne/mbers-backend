var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    host:'smtp.gmail.com',
    auth: {
      user: "delikado2023@gmail.com",
      pass: 'oblfcsysasyabxmj'
    }
  });

  export{
    transporter
  }