const config = require('../config/config');
const axios = require('axios');
const path = require("path");
const fs = require("fs");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const accessToken = process.env.ACCESS_TOKEN;
const logo_api_key = process.env.LOGO_API_KEY;

const fetchPhoto = async (companyName) => {
    // fetch company logo from https://api.api-ninjas.com/v1/logo?name=Microsoft
    try {
        const response = await axios.get(`https://api.api-ninjas.com/v1/logo?name=${companyName}`, {
            headers: {
                'X-Api-Key': `${logo_api_key}`
            }
        });

        return response;
    } catch (error) {
        console.error("fetchPhoto error is:", error);
    }
}

const downloadPhotoToLocal = async (photoUrl, companyName) => {
    try {
        // get the file type based on the photoUrl
        let fileType = photoUrl.split('.').pop();
        console.log("fileType is:", fileType);

        const response = await axios.get(photoUrl, {
            responseType: 'stream'
        });

        // store the image in current directory
        let filePath = path.resolve(__dirname, `../resource/company/${companyName}.${fileType}`);
        response.data.pipe(fs.createWriteStream(filePath));

        return filePath;
    } catch (error) {
        console.error("downloadPhotoToLocal error is:", error);
    }
}


const fetchCompanyLogoAndDownload = async (companyName) => {
    try {
        const responses = await fetchPhoto(companyName);
        console.log("response is:", responses.data);

        // since response is a list
        // if the list is empty, then the company logo is not found
        const fetched_photos = responses.data;
        if (fetched_photos.length === 0) {
            console.log("Company logo is not found!");
            return null;
        } else {
            // the first element in the list is the company logo (only one element)
            let photoUrl = fetched_photos[0].image;
            console.log("1)photoUrl is:", photoUrl);
            let filePath = await downloadPhotoToLocal(photoUrl, companyName);
            console.log("1)Downloaded image is stored in:", filePath);
            return photoUrl;
        }
    } catch (error) {
        console.error("fetchCompanyLogoAndDownload error is:", error);
    }
}

module.exports = {
    fetchCompanyLogoAndDownload
};
