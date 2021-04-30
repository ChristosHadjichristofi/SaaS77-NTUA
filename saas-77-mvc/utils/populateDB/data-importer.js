const fs = require('fs');
const csv = require('fast-csv');
const bcrypt = require('bcryptjs');

function data_importer(path, model, encrypt) {

    return new Promise(resolve => {
        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                if (encrypt) {
                    let data = [];
                    bcrypt.hash(row.password, 12)
                        .then(hashedPw => {
                            row.password = hashedPw;
                            data.push(row);
                            model.bulkCreate(data);
                            return resolve(true);
                        })
                        .catch(err => {
                            console.log('Internal server error.');
                        });
                } else {
                    let data = [];
                    data.push(row);
                    model.bulkCreate(data);
                    return resolve(true);
                }
            })
    })
}

module.exports = data_importer;