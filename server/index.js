const express = require('express');
const https = require('https');
const path = require('path');
const _ = require('lodash');
const app = express()

const port = 3011;

const baseUrl = "https://collectionapi.metmuseum.org/public/collection/v1/";//base url for the met museum api
const objectDisplayLimit = 7;//sets the limit of how many objects data we fetch/display from the search results. number can be very big

//list of paired down parameters from artpeice object data
let objectDataSubset = ({objectID, primaryImageSmall, title, artistDisplayName, medium, department}) => ({objectID, primaryImageSmall, title, artistDisplayName, medium, department});

app.get("/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.js'));
});

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
 
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//department data endpoint, gets the list of departments and their ids
app.get('/api-departments/', (req, res) => {
  let http_promise = apiCall("departments")
  http_promise.then(results => 
    {
      res.send({"success": true, data: results})
    });
})

//search query endpoint
app.get('/api-query/', (req, res) => {
  let queryParams = constructQueryParameters(req.query)
  let http_promise = apiCall("search", queryParams)
  http_promise.then(results => 
    {
 
      if(results.total > 0){
        results = results.objectIDs.slice(0, objectDisplayLimit)//get subset of results since we can get a ton
        //loop through returned object ids and fetch the first fews data so we can display the results
        let resultsProcessedPromise = processQueryResults(results)
        resultsProcessedPromise.then(resultsProcessed => {
          res.send({"success": true, data: resultsProcessed});
        })
      } else {//we did not get any results
        res.send({"success": true, data:false});
      }
      
    });
})

//loops through the object ids returned and fetches the objects data
const processQueryResults = async function(results){
  return await Promise.all(_.map(results, async function(objectId){
    let http_objectPromise = getObjectData(objectId)
    return http_objectPromise.then(objectData => 
      {
        let objectReduced = objectDataSubset(objectData)
        return objectReduced;
      })
  }))
}

//fetches individual object/art peices data from the api
const getObjectData = function (objectId){
  return new Promise((resolve) => {
    let http_promise = apiCall(`objects/${objectId}`)
    http_promise.then(results => 
      {
        //console.log(results)
        resolve(results);
      });
    });
}

//builds the parameters for the query url
//the Met Meseum of Art requires the q parameter for all search requests
//the q parameter seems to just match the text with anything in the metadata for the object
const constructQueryParameters = function(request){
  let queryParams = `?q=${encodeURIComponent(request.text)}`;

  if(request.dept != "*"){
    queryParams += `&departmentId=${encodeURIComponent(request.dept)}`
  }
  if(request.artist != ""){
      queryParams += `&artistOrCulture=${encodeURIComponent(request.artist)}`
  }
  if(request.medium != ""){
      queryParams += `&medium=${encodeURIComponent(request.medium)}`
  }
  return queryParams;
}


const apiCall = function (endPoint, parameters = "") {
  //console.log("requestURL: ", baseUrl + endPoint + parameters)
  let data = '';
  return new Promise((resolve, reject) => {
    https.get(baseUrl + endPoint + parameters, (resp) => {
      
      const { statusCode } = resp;
      const contentType = resp.headers['content-type'];

      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. 
      resp.on('end', () => {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      });

    }).on("error", (err) => {
      reject("Error: " + err.message);
    })
  })
}

