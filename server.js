require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const rimraf = require("rimraf");
const builder = require("xmlbuilder");
const { get, set, find } = require("lodash");
const FormData = require("form-data");

const activitesFolder = "activities";
const dow = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const nikeEndpoints = {
    getActivitiesByTime: time => 'https://api.nike.com/sport/v3/me/activities/after_time/${time}',
    getActivitiesById: uuid => `https://api.nike.com/sport/v3/me/activities/after_id/${uuid}`,
    getActivityById: uuid => `https://api.nike.com/sport/v3/me/activity/${uuid}?metrics=ALL`
};

const nikeFetch = url => 
fetch(url, {
    headers: {
        Authorization: `Bearer ${process.env.NIKE_BEARER}`
    }
});

const getNikeActivitiesIds = async () => {
   let ids = [];
   let timeOffset = 0;

   while (timeOffset !== undefined) {
     await nikeFetch(nikeEndpoints.getActivitiesByTime(timeOffset))
       .then(res => {
         if (res.status === 401) {
           return Promise.reject("Nike token is not valid");
         }

         if (res.ok) return res.json();

         return Promise.reject("Something went wrong");
       })
       .then(data => {
         const { activities, paging } = data;

         if (activities === undefined) {
           timeOffset = undefined;

           return Promise.reject("Something went wrong. no activities found");
         }

         activities.forEach(a => ids.push(a.id));
         timeOffset = paging.after_time;

         return Promise.resolve(
           `Successfully retrieved ${activities.length} ids`
         );
       })
       .then(msg => console.log(msg))
       .catch(err => console.log(err));
   }

  console.log(`Total ${ids.length} ids retrieved`);
   return ids;
 };