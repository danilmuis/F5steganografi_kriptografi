const path = require('path')
const express = require('express')
const hbs = require('hbs')
const f5stego = require('f5stegojs');
const app = express()
const multer = require('multer')
const upload = multer()
const imageDataURI = require('image-data-uri')
const fs = require('fs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('SomethingSpicyDude');
const Blowfish = require('javascript-blowfish');
const bf = new Blowfish("WhatIsThishhhh?")
const sharp = require('sharp'); 
//const bodyParser = require('body-parser')
//const fs = require('fs')
const stegKey = [1,2,113,24,5,63,73,8,9,611]
var stegger = new f5stego(stegKey)
var sizeOf = require('image-size');

var calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    
    return {
      width: srcWidth * ratio,
      height: srcHeight * ratio
    };
  };

app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')
app.use(express.static('public'))

app.get('/',(req,res) =>{
    res.render('index',{
        nama:'MUIS',
        umur:'10'})
})

app.get('/a/:name',(req,res) =>{
    res.send({data : mdm(parseInt(req.params.name)) })
})
app.post('/send',upload.any(),(req,res) =>{
    //console.log("A")
    //console.log(req.files)
    if(req.files.length == 2){
        var fileName = Date.now()
        var dimensions = sizeOf(req.files[0].buffer)
        var aspectRatio = calculateAspectRatioFit(dimensions.width,dimensions.height,800,600)
        sharp(req.files[0].buffer).resize(aspectRatio.width,aspectRatio.height).jpeg({quality : 100, force:false}).toBuffer().then(function(output){
            
            var image = new Uint8Array(output)
            var encryptedData = null;
            var txtData = req.files[1].buffer.toString()
            var encrypt = aes_256_gcm_encrypt(txtData)
            encrypt = blowFish_encrypt(encrypt)
            
            fs.writeFileSync('temp/'+fileName+'.txt',encrypt)
            var encryptedData = fs.readFileSync('temp/'+fileName+'.txt')
            //res.send(typeof(encrypt)+"\n\n"+encrypt)
            
            //res.send(req.files+"\n\n"+typeof(image) + "\n\n" + typeof(data))
            //res.send(req.files)
            try{
                var secretImage = stegger.embed(image,encryptedData)

            }catch(e){
                res.send(e)
            }
            
            
            fs.writeFileSync('temp/'+fileName+'.jpeg', secretImage)
            res.download('temp/'+fileName+'.jpeg',fileName+'.jpeg')
        })
        
        
    }else if(req.files.length == 1){
        var image = new Uint8Array(req.files[0].buffer)
        var data = stegger.extract(image)
        var fileName = Date.now()
        fs.writeFileSync("temp/"+fileName+".txt",data)
        var encryptedMessage = fs.readFileSync("temp/"+fileName+".txt").toString()
        encryptedMessage = blowFish_decrypt(encryptedMessage)
        var message = aes_256_gcm_decrypt(encryptedMessage)
        fs.writeFileSync("temp/"+fileName+".txt",message)
        res.download("temp/"+fileName+".txt")
                //res.render("index"
        
    }else{
        res.send("FILE UNDEFINED")
    }
    
    //var newImage = (imageDataURI.encode(secretImage,"JPG"))
    
    
})

app.listen(8000,() =>{
    console.log('server listening on port 8000 X')
})



function aes_256_gcm_encrypt(data){
    
    const encryptedString = cryptr.encrypt(data);
    
    
    //console.log(encryptedString); // e7b75a472b65bc4a42e7b3f78833a4d00040beba796062bf7c13d9533b149e5ec3784813dc20348fdf248d28a2982df85b83d1109623bce45f08238f6ea9bd9bb5f406427b2a40f969802635b8907a0a57944f2c12f334bd081d5143a357c173a611e1b64a
     // bacon
     return encryptedString;
}

function aes_256_gcm_decrypt(data){
    const decryptedString = cryptr.decrypt(data);
    //console.log(decryptedString);
    return decryptedString;
}
function blowFish_encrypt(data){
    
    // const encrypted = bf.encrypt(data);
    // let encryptedMime = bf.base64Encode(encrypted);
    // return encryptedMime
    return bf.base64Encode(bf.encrypt(data))
}
function blowFish_decrypt(data){
    return bf.decrypt(bf.base64Decode(data))
}