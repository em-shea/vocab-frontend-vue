// https://stackoverflow.com/questions/35045119/how-can-i-share-a-method-between-components-in-vue-js

// import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

export default {
  async getSignedInUser () {
    let userPoolData = {
      UserPoolId: process.env.VUE_APP_USER_POOL_ID,
      ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
      Storage: localStorage
    }
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
    let cognitoUser = userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        // console.log(cognitoUser)
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log(err)
            console.log('Error getting user session.')
            reject(err)
          } else if (!session.isValid()) {
            console.log('Invalid session.')
            reject(Error('Invalid session.'))
          } else {
            // console.log(cognitoUser)
            resolve(cognitoUser)
          }
        })
      } else {
        console.log('User not found.')
        // resolve(null)
        reject(Error('User not found.'))
      }
    })
  },
  async getUserData () {
    let userPoolData = {
      UserPoolId: process.env.VUE_APP_USER_POOL_ID,
      ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
      Storage: localStorage
    }
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
    let cognitoUser = userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log(err)
            console.log('Error getting user session.')
            reject(err)
          } else if (!session.isValid()) {
            console.log('Invalid session.')
            reject(Error('Invalid session.'))
          } else {
            // console.log('IdToken: ' + session.getIdToken().getJwtToken())
            return axios
              .get(process.env.VUE_APP_API_URL + 'user', {
                headers: {
                  'Authorization': session.getIdToken().getJwtToken()
                }
              }
              )
              .then((response) => {
                resolve(response.data)
              })
          }
        })
      } else {
        console.log('User not found.')
        reject(Error('User not found.'))
      }
    })
  },
  signOut () {
    let userPoolData = {
      UserPoolId: process.env.VUE_APP_USER_POOL_ID,
      ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
      Storage: localStorage
    }
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
    let cognitoUser = userPool.getCurrentUser()
    cognitoUser.signOut()
  }
}
