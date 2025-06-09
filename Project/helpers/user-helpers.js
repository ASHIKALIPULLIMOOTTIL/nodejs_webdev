const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');

module.exports = {
    doSignup: async (userData) => {
        try {
            if (!userData.password) {
                throw new Error("Password is required");
            }

            // Hash the password
            userData.password = await bcrypt.hash(userData.password, 10);

            // Insert user data into the collection
            const result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

            return result.insertedId;
        } catch (err) {
            throw err;
        }
    },
    doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log('succes login')
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('login failed')
                        resolve({status:false})
                    }
                })
            }
            else{
                console.log('no user permision')
                resolve({status:false})
            }
        })
    }
};
