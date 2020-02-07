// Copyright 2014-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const { spreadsheetId, sheet, keyFile }  = require('./conf-env.js')
const { google } = require('googleapis');
const path = require('path');



const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
});

const sheets = google.sheets('v4');
const RANGE_REGEX = /\!A([0-9]+):/g
/**
 * The JWT authorization is ideal for performing server-to-server
 * communication without asking for user consent.
 *
 * Suggested reading for Admin SDK users using service accounts:
 * https://developers.google.com/admin-sdk/directory/v1/guides/delegation
 *
 * See the defaultauth.js sample for an alternate way of fetching compute credentials.
 */

async function get(ranges) {
    const client = await auth.getClient();
    var request = {
       spreadsheetId,
       ranges,
       valueRenderOption: 'UNFORMATTED_VALUE',
       auth: client
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.batchGet(request, (err, response) => {
            if (err) {
                reject(err)
                return
            }

            resolve(response.data.valueRanges);
        })
    })
}

async function getStats() {
    var ranges = 'D2:E2';
    var values = await get(ranges);
    return {
        available: parseInt(values[0].values[0][0]),
        total: parseInt(values[0].values[0][1])
    }
}

async function getRows(indexes, sheet) {
    var ranges = indexes.map(i => {
        return (sheet) ? `${sheet}!A${i}:C${i}` : `A${i}:C${i}`
    })

    var valueRanges = await get(ranges);
    return valueRanges.map(r => {
       // can't make the godamn regex working, doing ugly splits
       var cell = r.range.split("!")[1].split(":")[0];
       var updateCell = cell.replace("A", "C");
       return {
           address: r.values[0][0],
           seed: r.values[0][1],
           spent: (r.values[0][2]) ? r.values[0][2] : null,
           available: !r.values[0][2],
           updateCell
       }
    })

}

async function updateSheet(cell, value, sheet) {
  // Create a new JWT client using the key file downloaded from the Google Developer Console

  const client = await auth.getClient();

  var range = (sheet) ? `${sheet}!${cell}` : cell;

  var request = {
      spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [
            [value]
        ]
      },
      auth: client,
  };


  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.update(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response)
        }

    });
  })

}

if (module === require.main) {
  // TODO: this should really be unit tests
  getStats().
    then((response) => console.log(JSON.stringify(response))).
    catch((err) => console.error(err));
  getRows([2332, 3, 34, 3, 5]).
    then((response) => console.log(JSON.stringify(response))).
    catch((err) => console.error(err));
  get(['fuck']).
    //then((response) => console.log(JSON.stringify(response))).
    catch((err) => console.error(err));
  //updateSheet('C143', 'test32432434').
  //    then((response) => console.log(response)).
  //    catch((err) => console.error(err));
}

module.exports = {
  updateSheet, getRows, get, getStats
};
