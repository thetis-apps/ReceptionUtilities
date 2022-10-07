/**
 * Copyright 2021 Thetis Apps Aps
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * 
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const axios = require('axios');

var AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});

var cachedIMS = null;

async function getIMS() {
	
	if (cachedIMS == null) {
		
	    const authUrl = "https://auth.thetis-ims.com/oauth2/";
	    const apiUrl = "https://api.thetis-ims.com/2/";
	
		let clientId = process.env.ClientId;   
		let clientSecret = process.env.ClientSecret; 
		let apiKey = process.env.ApiKey;  
		
	    let data = clientId + ":" + clientSecret;
		let base64data = Buffer.from(data, 'UTF-8').toString('base64');	
		
		let imsAuth = axios.create({
				baseURL: authUrl,
				headers: { Authorization: "Basic " + base64data, 'Content-Type': "application/x-www-form-urlencoded" },
				responseType: 'json'
			});
	    
	    let response = await imsAuth.post("token", 'grant_type=client_credentials');
	    let token = response.data.token_type + " " + response.data.access_token;
	    
	    let ims = axios.create({
	    		baseURL: apiUrl,
	    		headers: { "Authorization": token, "x-api-key": apiKey, "Content-Type": "application/json" }
	    	});
		
	
		ims.interceptors.response.use(function (response) {
				console.log("SUCCESS " + JSON.stringify(response.data));
	 	    	return response;
			}, function (error) {
				console.log(JSON.stringify(error));
				if (error.response) {
					console.log("FAILURE " + error.response.status + " - " + JSON.stringify(error.response.data));
				}
		    	return Promise.reject(error);
			});

		cachedIMS = ims;
	}
	
	return cachedIMS;
}

exports.assignLocation = async (event, context) => {
 
    let ims = await getIMS();
    
    let detail = event.detail;
    
    let response = await ims.get('globalTradeItems/'+ detail.globalTradeItemId);
    let globalTradeItem = response.data;
    
    if (globalTradeItem.locationNumber == null) {
        response = await ims.get('inventoryTransactions/' + detail.transactionId);
        let transaction = response.data;
        let patch = { locationId: transaction.locationId };
        response = await ims.patch('globalTradeItems/' + detail.globalTradeItemId, patch);
    }
    
};
